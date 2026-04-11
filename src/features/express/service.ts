import { supabase } from '@/lib/supabase';
import { notifyTelegram } from '@/lib/telegram/client';
import { buildHtml, sendEmail } from '@/lib/email/templates';
import { BASE_URLS } from '@/config/constants';
import type { Lead } from '@/features/email-sequence/types';

export async function completeExpressFlow(token: string, consent: boolean): Promise<{ success: boolean }> {
  // 1. Fetch lead info and personal profiles
  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      id, full_name, email, job, goal, metadata,
      personal_profiles ( 
        persona_label, primary_course_name, primary_course_url, why_fits, 
        mbti_type, enneagram_type
      )
    `)
    .eq('metadata->>report_token', token)
    .single();

  if (error || !lead) {
    console.error('[ExpressComplete] Failed to find lead for token:', token, error);
    throw new Error('Lead not found');
  }

  // Update metadata with consent
  const currentMetadata = (lead.metadata as Record<string, any>) || {};
  const newMetadata = { ...currentMetadata, consent };

  await supabase
    .from('leads')
    .update({ metadata: newMetadata })
    .eq('id', lead.id);

  const profilesArray = lead.personal_profiles as any[];
  const profile = Array.isArray(profilesArray) ? profilesArray[0] : (lead.personal_profiles as any) || {};
  
  const reportUrl = `${BASE_URLS.landing}report/${token}`;

  // 2. Send email
  const emailSubject = 'Báo cáo tính cách chuyên sâu - N-Education';
  const emailBody = `Chào ${lead.full_name || 'bạn'},

Bạn vừa hoàn thành quy trình phân tích tính cách chuyên sâu (Express Mode) của hệ sinh thái N-Education. 
Hồ sơ hoàn chỉnh của bạn, kết hợp 4 hệ thống phân tích (MaxDiff, MBTI, Enneagram, Bazi/Numerology) đã sẵn sàng!

Báo cáo này được thiết kế để giúp bạn hiểu sâu sắc về thế mạnh, nhược điểm, hành vi làm việc, cũng như khám phá tiềm năng bản thân.

Hãy kiểm tra báo cáo tại đường liên kết bên dưới. Bạn có thể lưu lại liên kết này để xem lại bất cứ lúc nào:
${reportUrl}

(Nếu cần tư vấn thêm, hãy liên hệ trực tiếp với Nedu nhé!)

Trân trọng,
Đội ngũ N-Education.`;

  const html = buildHtml(emailBody, 'Xem Báo Cáo Ngay', reportUrl);
  await sendEmail({ to: lead.email, subject: emailSubject, html });

  // 3. Notify Telegram if consented
  if (consent) {
    const pLabel = profile.persona_label || 'Chưa xác định';
    const cName = profile.primary_course_name || 'Chưa xác định';
    
    const tgLead: Lead = {
      id: lead.id,
      email: lead.email,
      full_name: lead.full_name || 'Ẩn danh',
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
