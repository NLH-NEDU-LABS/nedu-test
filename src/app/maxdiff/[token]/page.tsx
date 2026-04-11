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

  // 1. Tìm lead theo report_token (kèm theo profile data)
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, quiz_persona, personal_profiles ( profile_data )')
    .eq('metadata->>report_token', token)
    .single();

  if (leadError) {
    console.error('Lead fetch error:', leadError);
  }

  if (!lead) {
    notFound();
  }

  const profileDataArray = lead.personal_profiles as { profile_data?: any }[] | undefined;
  const pData = Array.isArray(profileDataArray) ? profileDataArray[0]?.profile_data : (lead.personal_profiles as any)?.profile_data;
  const profileData = (pData || {}) as Record<string, any>;

  // 2. Tìm quiz_submission theo lead_id (dùng cho analytics raw hoặc top_problems)
  const { data: quizSub, error: quizError } = await supabase
    .from('quiz_submissions')
    .select('result_json, persona_id')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (quizError) {
    console.error('Quiz fetch error:', quizError);
  }

  const resultJson = (quizSub?.result_json || {}) as Record<string, any>;

  return (
    <MaxDiffReportClient
      scores={profileData.maxdiff_scores || resultJson.scores || []}
      aiRecommendation={profileData.ai_recommendation || resultJson.ai_recommendation || null}
      personaLabel={profileData.persona_label || ''}
      topProblem1={resultJson.top_problem_1 || ''}
      topProblem2={resultJson.top_problem_2 || ''}
    />
  );
}

