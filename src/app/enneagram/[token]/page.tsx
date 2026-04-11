import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EnneagramQuizClient from './EnneagramQuizClient';
import EnneagramResultView from './EnneagramResultView';

export default async function EnneagramPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  // Query leads theo report_token để lấy profile_data
  const { data: lead } = await supabase
    .from('leads')
    .select('id, personal_profiles ( profile_data )')
    .eq('metadata->>report_token', token)
    .single();

  if (!lead) {
    notFound();
  }

  const profileDataArray = lead.personal_profiles as { profile_data?: any }[] | undefined;
  const pData = Array.isArray(profileDataArray) ? profileDataArray[0]?.profile_data : (lead.personal_profiles as any)?.profile_data;
  const profileData = (pData || {}) as Record<string, any>;

  const enneagramType = profileData.enneagram_type;
  const enneagramDesc = profileData.enneagram_desc;

  // Nếu đã có enneagram_type -> render EnneagramResultView (không cho làm lại)
  if (enneagramType) {
    return <EnneagramResultView enneagramType={enneagramType} enneagramDesc={enneagramDesc} />;
  }

  // Nếu chưa có -> render bài test
  return <EnneagramQuizClient token={token} />;
}
