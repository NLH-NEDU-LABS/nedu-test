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
import { createSubmission, updateLeadId } from '@/features/maxdiff/repository';
import { createLead } from '@/features/lead/repository';

export interface SendResultInput {
  name: string | null;
  email: string;
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
}

/**
 * Process the send-result flow:
 *  - Generate + send Day 0 AI email
 *  - Persist quiz_submission + lead to DB
 * Returns { success: true } — email already sent even if DB fails.
 */
export async function processSendResult(input: SendResultInput): Promise<void> {
  const {
    name, email, persona_label, persona_id,
    top_problem_1, top_problem_2,
    scores, ai_recommendation,
    source, occupation, feeling, dob, birthTime,
  } = input;

  const primary_course_name = ai_recommendation?.primary_course_name || '';
  const primary_course_id = ai_recommendation?.primary_course_id || '';
  const primary_course_url = ai_recommendation?.primary_course_url || '';
  const why_fits = ai_recommendation?.why_fits || '';

  const crypto = await import('crypto');
  const report_token = crypto.randomUUID();

  // 1. Generate AI email content
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

  let emailSubject = 'Kết quả bài phân tích của bạn';
  let emailBody = `Chào ${name || 'bạn'},\n\nNhi thấy bạn đang trong giai đoạn ${persona_label}...\n\nNhi`;

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

  // 3. Persist to DB (best-effort — email already sent)
  try {
    const submissionId = await createSubmission({
      visitor_email: email,
      visitor_name: name,
      persona_id,
      result_json: { primary_course_name, why_fits, top_problem_1, top_problem_2 },
      answers: { occupation, feeling },
      utm_source: source,
    });

    const leadId = await createLead({
      quiz_persona: persona_id,
      job: occupation,
      goal: feeling,
      dob,
      birth_time: birthTime,
      courses: primary_course_id ? [primary_course_id] : [],
      metadata: {
        report_token,
        ai_recommendation,
        scores,
        primary_course_name,
        primary_course_url,
        why_fits,
        has_advanced: false,
        persona_label,
      },
    });

    await updateLeadId(submissionId, leadId);
  } catch (dbError) {
    // DB failure doesn't fail the request — email was already sent
    console.error('[SendResult] DB error (email already sent):', dbError);
  }
}
