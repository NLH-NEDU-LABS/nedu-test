import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EnneagramQuizClient from './EnneagramQuizClient';
import EnneagramResultView from './EnneagramResultView';

export default async function EnneagramPage({ params }: { params: Promise<{ token: string }> }) {
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
  const enneagramType = metadata.enneagram_type;
  const enneagramDesc = metadata.enneagram_desc;

  // Nếu đã có enneagram_type -> render EnneagramResultView (không cho làm lại)
  if (enneagramType) {
    return <EnneagramResultView enneagramType={enneagramType} enneagramDesc={enneagramDesc} />;
  }

  // Nếu chưa có -> render bài test
  return <EnneagramQuizClient token={token} />;
}
