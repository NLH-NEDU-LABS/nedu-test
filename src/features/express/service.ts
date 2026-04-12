import { supabase } from '@/lib/supabase';
import { notifyTelegram } from '@/lib/telegram/client';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import type { Lead } from '@/features/email-sequence/types';

export async function completeExpressFlow(token: string, consent: boolean): Promise<{ success: boolean }> {
  // 1. Fetch lead info and personal profiles
  // 1a. Fetch lead
  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, job, goal, metadata, personal_profiles ( profile_data )')
    .eq('metadata->>report_token', token)
    .single();

  if (error || !lead) {
    console.error('[ExpressComplete] Lead not found for token:', token, error);
    throw new Error('Lead not found');
  }

  const metadata = (lead.metadata as Record<string, any>) || {};

  // 1b. Fetch quiz_submission separately (same pattern as report/repository.ts)
  const { data: quizSub } = await supabase
    .from('quiz_submissions')
    .select('visitor_email, visitor_name')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const email: string = quizSub?.visitor_email || (metadata.email as string) || '';
  const fullName: string = quizSub?.visitor_name || (metadata.name as string) || 'bạn';

  if (!email) {
    console.error('[ExpressComplete] No email found for lead:', lead.id);
    throw new Error('No email found for lead');
  }

  // Update metadata with consent
  await supabase
    .from('leads')
    .update({ metadata: { ...metadata, consent } })
    .eq('id', lead.id);

  const profilesArray = lead.personal_profiles as any[];
  const profileRow = Array.isArray(profilesArray) ? profilesArray[0] : (lead.personal_profiles as any);
  const profile = (profileRow?.profile_data as Record<string, any>) || {};

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
    const pLabel = profile.persona_label || 'Chưa xác định';
    const cName = profile.primary_course_name || 'Chưa xác định';

    const tgLead: Lead = {
      id: lead.id,
      email,
      full_name: fullName,
      day_number: 16, // using 16 as an arbitrary end-of-flow number
      report_token: token,
      persona_label: pLabel,
      primary_course_name: cName,
      primary_course_url: profile.primary_course_url || null,
      why_fits: profile.why_fits || null,
      mbti_type: profile.mbti_type || null,
      enneagram_type: profile.enneagram_type?.toString() || null,
      job: lead.job || null,
      goal: lead.goal || null
    };

    await notifyTelegram(tgLead);
  }

  return { success: true };
}
