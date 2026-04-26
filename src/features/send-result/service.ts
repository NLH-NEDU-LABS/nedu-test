/**
 * SendResult service — orchestrates Day 0 email flow.
 *
 * Steps:
 *  1. Generate AI email via Gemini
 *  2. Send email via SES
 *  3. DB triple-insert: quiz_submission → lead → link
 */
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini/client';
import { SEND_RESULT_EMAIL_PROMPT } from '@/lib/gemini/prompts';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import { intakeClient } from '@/lib/nedu-intake/client';

export interface SendResultInput {
  name: string | null;
  email: string;
  phone?: string | null;
  telegramUsername?: string | null;
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

/**
 * Process the send-result flow:
 *  - Generate + send Day 0 AI email (skipped in express mode)
 *  - Persist quiz_submission + lead to DB
 * Returns { report_token } — email already sent even if DB fails.
 */
export async function processSendResult(input: SendResultInput): Promise<{ report_token: string }> {
  const {
    name, email, phone, telegramUsername,
    persona_label, persona_id,
    top_problem_1, top_problem_2,
    scores, ai_recommendation,
    source, occupation, feeling, dob, birthTime,
    birthPlace, birthPlaceName, birthPlaceLat, birthPlaceLng,
    gender = 1,
    mode = 'drip',
  } = input;

  const primary_course_name = ai_recommendation?.primary_course_name || '';
  const primary_course_id = ai_recommendation?.primary_course_id || '';
  const primary_course_url = ai_recommendation?.primary_course_url || '';
  const why_fits = ai_recommendation?.why_fits || '';

  // Normalize dob to YYYY-MM-DD (HTML date input always returns this, but guard against locale quirks)
  const normalizedDob = (() => {
    if (!dob) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
    const parsed = new Date(dob);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString().split('T')[0];
  })();

  // Normalize birth_time to HH:mm (strip AM/PM if browser returns 12-hour format)
  const normalizedBirthTime = (() => {
    if (!birthTime) return undefined;
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(birthTime)) return birthTime;
    const match = birthTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return undefined;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  })();

  const crypto = await import('crypto');
  const report_token = crypto.randomUUID();

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

  // 3. Create lead — must succeed for the token to be usable
  const testDesc = `Persona: ${persona_label} | Problems: ${top_problem_1}, ${top_problem_2}`;

  await intakeClient.submitLead({
    source_ref: report_token,
    source_channel: 'test.nhi.sg',
    full_name: name || 'Ẩn danh',
    email,
    phone: phone || undefined,
    telegram_username: telegramUsername || undefined,
    birth_date: normalizedDob,
    birth_time: normalizedBirthTime,
    occupation: occupation || undefined,
    goal: feeling || undefined,
    test_desc: testDesc,
    interested_courses: primary_course_id ? [primary_course_id] : [],
    ai_profile_consent: true,
    utm_source: source || undefined,
    metadata: {
      assessment_mode: mode,
      gender,
      birth_place: birthPlaceName || birthPlace || 'vietnam',
      birth_place_lat: birthPlaceLat,
      birth_place_lng: birthPlaceLng,
    },
  });

  // 4. Profile upserts are best-effort — lead already exists, report page still works
  try {
    await intakeClient.upsertProfile(report_token, {
      persona_label,
      top_problem_1,
      top_problem_2,
      primary_course_code: primary_course_id,
      primary_course_name,
      primary_course_url,
      why_fits,
      ai_recommendation,
      maxdiff_scores: scores,
    });
  } catch (profileErr) {
    console.error('[SendResult] Profile upsert error:', profileErr);
  }

  // 5. Auto-calculate Bazi & Numerology
  if (normalizedDob) {
    try {
      const { calculate } = await import('@/features/bazi-numerology/service');
      const calcRes = calculate({
        dob: normalizedDob,
        birthTime: normalizedBirthTime || '12:00',
        birthPlace: birthPlaceName || birthPlace || 'vietnam',
        gender: (gender as 0 | 1) ?? 0,
        fullName: name || undefined,
      });

      await intakeClient.upsertProfile(report_token, {
        bazi: calcRes.bazi,
        numerology: calcRes.numerology,
      });
    } catch (calcErr) {
      console.error('[SendResult] Bazi/Numerology auto-calc error:', calcErr);
    }
  }

  return { report_token };
}
