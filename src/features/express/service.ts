/**
 * Express complete flow — final step of test.nhi.sg quiz.
 *
 * 1. Fetch report data from nedu (for email rendering).
 * 2. Send day-16 email via SES.
 * 3. POST /complete to nedu with consent flag.
 *    BE handles: set aiProfileConsent + completedAt. If consent=true,
 *    BE emits lead.ingested → nedu's TelegramListener pings consultant.
 *    test.nhi.sg no longer fires Telegram directly.
 *
 * Migrated from Supabase 2026-04.
 */
import { neduApi } from '@/lib/nedu-api/client';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';

export async function completeExpressFlow(token: string, consent: boolean): Promise<{ success: boolean }> {
  // 1. Fetch report from nedu.
  const report = await neduApi.getReport(token).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) {
    console.error('[ExpressComplete] Report not found for token:', token);
    throw new Error('Lead not found');
  }

  const email = report.lead.email || '';
  const fullName = report.lead.full_name || 'bạn';

  if (!email) {
    console.error('[ExpressComplete] No email found for lead:', report.lead.id);
    throw new Error('No email found for lead');
  }

  const reportUrl = `${BASE_URLS.landing}report/${token}`;

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

  // 3. Mark complete on nedu — BE handles consent → Telegram fan-out.
  await neduApi.completeAssessment(token, consent);

  return { success: true };
}
