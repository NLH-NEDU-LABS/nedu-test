import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MaxDiffReportClient } from './MaxDiffReportClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kết quả MaxDiff — Nedu',
  description: 'Xem kết quả phân tích nhu cầu cá nhân của bạn từ Nedu AI.',
};

export default async function MaxDiffReportPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  // 1. Tìm lead theo report_token
  const { data: lead } = await supabase
    .from('leads')
    .select('id, quiz_persona, metadata')
    .eq('metadata->>report_token', token)
    .single();

  if (!lead) {
    notFound();
  }

  const leadMetadata = (lead.metadata || {}) as Record<string, any>;

  // 2. Tìm quiz_submission theo lead_id
  const { data: quizSub } = await supabase
    .from('quiz_submissions')
    .select('result_json, persona_id')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const resultJson = (quizSub?.result_json || {}) as Record<string, any>;

  return (
    <MaxDiffReportClient
      scores={resultJson.scores || []}
      aiRecommendation={resultJson.ai_recommendation || leadMetadata.ai_recommendation || null}
      personaLabel={leadMetadata.persona_label || ''}
      topProblem1={resultJson.top_problem_1 || ''}
      topProblem2={resultJson.top_problem_2 || ''}
    />
  );
}

