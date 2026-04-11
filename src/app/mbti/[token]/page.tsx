import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MbtiQuizClient from './MbtiQuizClient';
import MbtiResultView from './MbtiResultView';

export default async function MbtiPage({ params }: { params: Promise<{ token: string }> }) {
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

  const mbtiType = profileData.mbti_type;
  const mbtiDesc = profileData.mbti_desc;

  // Nếu đã có mbti_type -> render MbtiResultView (không cho làm lại)
  if (mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} />;
  }

  // Nếu chưa có -> render bài test
  return <MbtiQuizClient token={token} />;
}
