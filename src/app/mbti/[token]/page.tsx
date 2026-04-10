import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MbtiQuizClient from './MbtiQuizClient';
import MbtiResultView from './MbtiResultView';

export default async function MbtiPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  // Query leads theo report_token để lấy metadata
  const { data: lead } = await supabase
    .from('leads')
    .select('id, metadata')
    .eq('metadata->>report_token', token)
    .single();

  if (!lead) {
    notFound();
  }

  const metadata = (lead.metadata || {}) as any;
  const mbtiType = metadata.mbti_type;
  const mbtiDesc = metadata.mbti_desc;

  // Nếu đã có mbti_type -> render MbtiResultView (không cho làm lại)
  if (mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} />;
  }

  // Nếu chưa có -> render bài test
  return <MbtiQuizClient token={token} />;
}
