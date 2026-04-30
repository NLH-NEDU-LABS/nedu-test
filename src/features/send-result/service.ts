/**
 * SendResult service — orchestrates Day 0 email flow.
 *
 * Steps:
 *  1. Generate AI email via Gemini
 *  2. Send email via SES
 *  3. Persist lead + quiz_assessment to api.nedu.vn (single source of truth)
 *
 * Migrated from Supabase 2026-04 — quiz data now lives in nedu's
 * `lead_quiz_assessments` table.
 */
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini/client';
import { SEND_RESULT_EMAIL_PROMPT } from '@/lib/gemini/prompts';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import { neduApi } from '@/lib/nedu-api/client';

export interface SendResultInput {
  name: string | null;
  email: string;
  phone: string;
  telegram_username: string;
  persona_label: string;
  persona_id: string;
  top_problem_1: string;
  top_problem_2: string;
  scores: any[];
  ai_recommendation: any;
  source: string | null;
  occupation: string | null;
  feeling: string | null;
  dob: string | null;
  birthTime: string | null;
  birthPlace?: string;        // timezone offset or legacy key
  birthPlaceName?: string;    // display label, e.g. "Nha Trang, Khánh Hòa, Vietnam"
  birthPlaceLat?: number;
  birthPlaceLng?: number;
  gender?: 0 | 1;
  mode?: 'drip' | 'express';
}

export async function processSendResult(input: SendResultInput): Promise<{ report_token: string }> {
  const {
    name, email, phone, telegram_username,
    persona_label, persona_id,
    top_problem_1, top_problem_2,
    scores, ai_recommendation,
    source, occupation, feeling, dob, birthTime,
    birthPlace, birthPlaceName, birthPlaceLat, birthPlaceLng,
    gender = 1,
    mode = 'drip',
  } = input;

  const primary_course_name = ai_recommendation?.primary_course_name || '';
  const primary_course_url = ai_recommendation?.primary_course_url || '';
  const why_fits = ai_recommendation?.why_fits || '';

  const crypto = await import('crypto');
  const report_token = crypto.randomUUID();
  const source_ref = crypto.randomUUID();

  // 1. Generate AI email content
  let emailSubject = 'Kết quả bài phân tích của bạn';
  let emailBody = `Chào ${name || 'bạn'},\n\nNhi thấy bạn đang trong giai đoạn ${persona_label}...\n\nNhi`;

  if (mode !== 'express') {
    const prompt = `
--- THÔNG TIN NGƯỜI NHẬN ---
Tên                  : ${name || 'bạn'}
Email                : ${email}
Persona              : ${persona_label}
Vấn đề ưu tiên #1   : ${top_problem_1}
Vấn đề ưu tiên #2   : ${top_problem_2}
Khoá được gợi ý     : ${primary_course_name}
Why it fits (từ P01) : ${why_fits}
Nguồn traffic        : ${source}

--- GHI CHÚ ---
Email này là email đầu tiên trong chuỗi 14 ngày.
Mục tiêu duy nhất: Khiến họ đồng cảm và tò mò về kết quả.
Chưa bán gì cả. KHÔNG ĐƯỢC CHÈN BẤT CỨ LINK NÀO.
    `;

    try {
      const ai = getGeminiModel({
        responseJson: true,
        systemInstruction: SEND_RESULT_EMAIL_PROMPT,
      });
      const parsed = await geminiGenerateJSON<{ subject: string; body: string }>(ai, prompt);
      if (parsed.subject) emailSubject = parsed.subject;
      if (parsed.body) {
        const bodyLower = parsed.body.toLowerCase();
        emailBody =
          bodyLower.startsWith('chào') || bodyLower.startsWith('gửi')
            ? parsed.body
            : `Chào ${name || 'bạn'},\n\n` + parsed.body;
      }
    } catch (err) {
      console.error('[SendResult] Gemini email gen error:', err);
    }

    // 2. Send email via SES
    const html = buildHtml(emailBody, 'Xem kết quả đầy đủ', `${BASE_URLS.reportBase}/maxdiff/${report_token}`);
    await sendEmail({ to: email, subject: emailSubject, html });
  }

  // 3. Auto-calculate Bazi & Numerology since we have the birth details
  let bazi_data: Record<string, unknown> | null = null;
  let numerology_data: Record<string, unknown> | null = null;
  if (dob) {
    try {
      const { calculate } = await import('@/features/bazi-numerology/service');
      const calcRes = calculate({
        dob,
        birthTime: birthTime || '12:00',
        birthPlace: birthPlaceName || birthPlace || 'vietnam',
        gender: (gender as 0 | 1) ?? 0,
        fullName: name || undefined,
      });
      bazi_data = calcRes.bazi as Record<string, unknown>;
      numerology_data = calcRes.numerology as Record<string, unknown>;
    } catch (calcErr) {
      console.error('[SendResult] Bazi/Numerology auto-calc error:', calcErr);
    }
  }

  // 4. Create lead + quiz assessment on nedu backend (single source of truth).
  // Failure here MUST surface — nedu is primary storage now, no silent swallow.
  await neduApi.startQuiz({
    full_name: name || 'bạn',
    phone,
    report_token,
    source_ref,
    source: 'inbound',
    source_channel: 'test.nhi.sg',
    email,
    birth_date: dob || undefined,
    birth_time: birthTime || undefined,
    occupation: occupation || undefined,
    goal: feeling || undefined,
    assessment_mode: mode,
    utm_source: source || undefined,
    metadata: {
      telegram_username,
      gender,
      birth_place: birthPlaceName || birthPlace || 'vietnam',
      birth_place_lat: birthPlaceLat,
      birth_place_lng: birthPlaceLng,
      persona_id,
      top_problem_1,
      top_problem_2,
    },
  });

  // 5. Send quiz result data via PATCH (separate call — keeps start payload focused).
  await neduApi.updateAssessment(report_token, {
    persona_label,
    recommended_course_name: primary_course_name || undefined,
    recommended_course_url: primary_course_url || undefined,
    why_fits: why_fits || undefined,
    maxdiff_scores: scores,
    full_recommendation: ai_recommendation,
    bazi_data: bazi_data ?? undefined,
    numerology_data: numerology_data ?? undefined,
    top_problems: [top_problem_1, top_problem_2].filter(Boolean),
  });

  return { report_token };
}
