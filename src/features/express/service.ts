/**
 * Express complete flow — final step of test.nhi.sg quiz.
 *
 * 1. Fetch report data from nedu (data store).
 * 2. Send day-16 email via SES (FE owns email delivery).
 * 3. POST /complete to nedu — BE chỉ set completedAt + aiProfileConsent.
 * 4. If consent=true → notify Telegram (FE owns Telegram delivery).
 *
 * BE là data store, mọi external side effect (email, Telegram) ở FE.
 */
import { neduApi } from '@/lib/nedu-api/client';
import { notifyTelegram } from '@/lib/telegram/client';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import type { Lead } from '@/lib/email-sequence/types';

export async function completeExpressFlow(token: string, consent: boolean): Promise<{ success: boolean }> {
  // 1. Fetch report from nedu.
  const report = await neduApi.getReport(token).catch((err: any) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) {
    console.error('[ExpressComplete] Report not found for token:', token);
    throw new Error('Lead not found');
  }

  const email = report.lead.email || '';
  const fullName = report.lead.full_name || 'bạn';
  const a = report.assessment;
  const aMeta = (a.metadata ?? {}) as Record<string, unknown>;

  if (!email) {
    console.error('[ExpressComplete] No email found for lead:', report.lead.id);
    throw new Error('No email found for lead');
  }

  const reportUrl = `${BASE_URLS.reportBase}/report/${token}`;

  // 2. Send day-16 email.
  const emailSubject = 'Kết quả phân tích chuyên sâu của bạn từ N-Education';
  const emailBody = `Chào ${fullName},

Bản báo cáo phân tích chuyên sâu bạn vừa thực hiện trên hệ thống N-Education đã sẵn sàng.

Thay vì để bạn phải đối chiếu nhiều tài liệu rời rạc, chúng tôi đã tổng hợp dữ liệu từ 4 công cụ đo lường (MaxDiff, MBTI, Enneagram, Thần Số - Bát Tự) thành một hồ sơ duy nhất. Hy vọng bạn sẽ tìm thấy ở đây những góc nhìn rõ ràng hơn về thế mạnh tự nhiên, phong cách làm việc và những tiềm năng thực sự của mình.

Bạn hãy truy cập vào liên kết bên dưới để xem báo cáo chi tiết (bạn có thể lưu lại link này để xem lại bất cứ lúc nào):
${reportUrl}

Hành trình phát triển bản thân hiếm khi dễ dàng nếu đi một mình. Nếu bạn cần thảo luận thêm về kết quả của mình hay có định hướng riêng cần chia sẻ, đừng ngần ngại phản hồi trực tiếp email này nhé. Luôn có những người thật ở N-Education sẵn sàng lắng nghe và đồng hành cùng bạn.

Trân trọng,
Đội ngũ N-Education.`;

  const html = buildHtml(emailBody, 'Xem Báo Cáo Ngay', reportUrl);
  await sendEmail({ to: email, subject: emailSubject, html });

  // 3. Mark complete on nedu (data only).
  await neduApi.completeAssessment(token, consent);

  // 4. Notify Telegram if consented (FE side effect, fire-and-forget).
  if (consent) {
    const tgLead: Lead = {
      id: report.lead.id,
      email,
      full_name: fullName,
      day_number: 16,
      report_token: token,
      persona_label: a.persona_label ?? 'Chưa xác định',
      primary_course_name: a.recommended_course_name ?? 'Chưa xác định',
      primary_course_url: a.recommended_course_url ?? null,
      why_fits: a.why_fits ?? null,
      mbti_type: a.mbti_type ?? null,
      enneagram_type: a.enneagram_type?.toString() ?? null,
      job: report.lead.occupation ?? null,
      goal: report.lead.goal ?? null,
    };
    await notifyTelegram(tgLead).catch((err) =>
      console.error('[ExpressComplete] Telegram notify failed:', err),
    );
  }

  return { success: true };
}
