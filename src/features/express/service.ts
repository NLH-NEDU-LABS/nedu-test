import { intakeClient } from '@/lib/nedu-intake/client';
import { notifyTelegram } from '@/lib/telegram/client';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import type { Lead } from '@/features/email-sequence/types';

export async function completeExpressFlow(token: string, consent: boolean): Promise<{ success: boolean }> {
  // 1. Fetch lead info via intake API
  const report = await intakeClient.getReport(token).catch(() => null);

  if (!report) {
    console.error('[ExpressComplete] Lead not found for token:', token);
    throw new Error('Lead not found');
  }

  const email = report.email || '';
  const fullName = report.fullName || 'bạn';

  if (!email) {
    console.error('[ExpressComplete] No email found for lead:', report.id);
    throw new Error('No email found for lead');
  }

  const maxdiff = report.quiz_submissions.find((s) => s.quizType === 'maxdiff')?.payload ?? {};
  const mbtiSub = report.quiz_submissions.find((s) => s.quizType === 'mbti')?.payload ?? {};
  const enneagramSub = report.quiz_submissions.find((s) => s.quizType === 'enneagram')?.payload ?? {};

  const reportUrl = `${BASE_URLS.landing}report/${token}`;

  // 2. Send email
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

  // 3. Notify Telegram if consented
  if (consent) {
    const tgLead: Lead = {
      id: report.id,
      email,
      full_name: fullName,
      day_number: 16,
      report_token: token,
      persona_label: (maxdiff.persona_label as string) || null,
      primary_course_name: (maxdiff.primary_course_name as string) || null,
      primary_course_url: (maxdiff.primary_course_url as string) || null,
      why_fits: (maxdiff.why_fits as string) || null,
      mbti_type: (mbtiSub.type as string) || (report.personalProfile?.mbtiType ?? null),
      enneagram_type: (enneagramSub.type as string) || (report.personalProfile?.enneagramType?.toString() ?? null),
      job: report.occupation || null,
      goal: report.goal || null,
    };

    await notifyTelegram(tgLead);
  }

  return { success: true };
}
