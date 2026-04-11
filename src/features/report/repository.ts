/**
 * Report repository — 2 focused queries, 1 shared lead lookup.
 *
 * getQuizReport()       → MaxDiff + MBTI + Enneagram (leads + quiz_submissions)
 * getBaziNumerology()   → Bazi + Numerology (leads + personal_profiles)
 *
 * Both share findLeadByToken() to avoid code duplication.
 */
import { supabase } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Shared internal helper
// ---------------------------------------------------------------------------

async function findLeadByToken(token: string) {
  const { data } = await supabase
    .from('leads')
    .select('id, metadata, personal_profiles ( profile_data )')
    .eq('metadata->>report_token', token)
    .single();
  return data;
}

// ---------------------------------------------------------------------------
// Quiz Report (MaxDiff + MBTI + Enneagram)
// ---------------------------------------------------------------------------

export interface QuizReportPayload {
  name: string | null;
  persona_label: string | null;
  top_problem_1: string | null;
  top_problem_2: string | null;
  primary_course_name: string | null;
  primary_course_url: string | null;
  why_fits: string | null;
  maxdiff_scores: unknown[];
  ai_recommendation: unknown | null;
  mbti_type: string | null;
  mbti_desc: string | null;
  enneagram_type: string | null;
  enneagram_desc: string | null;
  // Bazi + Numerology (from personal_profiles)
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}

export async function getQuizReport(token: string): Promise<QuizReportPayload | null> {
  const lead = await findLeadByToken(token);
  if (!lead) return null;

  const metadata = (lead.metadata || {}) as Record<string, unknown>;

  // Profile data (bazi + numerology)
  const profileData = Array.isArray(lead.personal_profiles)
    ? (lead.personal_profiles as { profile_data?: unknown }[])[0]?.profile_data
    : (lead.personal_profiles as { profile_data?: unknown })?.profile_data;
  const p = (profileData || {}) as Record<string, unknown>;

  const { data: quizSub } = await supabase
    .from('quiz_submissions')
    .select('result_json, visitor_name')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const resultJson = (quizSub?.result_json || {}) as Record<string, unknown>;

  return {
    name: (quizSub?.visitor_name as string | null) ?? (metadata.name as string | null) ?? null,
    persona_label: (p.persona_label as string | null) ?? null,
    top_problem_1: (metadata.top_problem_1 as string | null) ?? null,
    top_problem_2: (metadata.top_problem_2 as string | null) ?? null,
    primary_course_name: (p.primary_course_name as string | null) ?? null,
    primary_course_url: (p.primary_course_url as string | null) ?? null,
    why_fits: (p.why_fits as string | null) ?? null,
    maxdiff_scores: (p.maxdiff_scores as unknown[]) ?? (resultJson.scores as unknown[]) ?? [],
    ai_recommendation: p.ai_recommendation ?? null,
    mbti_type: (p.mbti_type as string | null) ?? null,
    mbti_desc: (p.mbti_desc as string | null) ?? null,
    enneagram_type: (p.enneagram_type as string | null) ?? null,
    enneagram_desc: (p.enneagram_desc as string | null) ?? null,
    has_bazi: !!p.bazi,
    bazi_data: p.bazi ?? null,
    numerology_data: p.numerology ?? null,
    bazi_interp: (p.bazi_interp as string | null) ?? null,
    numerology_interp: (p.numerology_interp as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Bazi + Numerology Report (from personal_profiles)
// ---------------------------------------------------------------------------

export interface BaziNumerologyPayload {
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}

export async function getBaziNumerology(token: string): Promise<BaziNumerologyPayload | null> {
  const lead = await findLeadByToken(token);
  if (!lead) return null;

  const profileData = Array.isArray(lead.personal_profiles)
    ? (lead.personal_profiles as { profile_data?: unknown }[])[0]?.profile_data
    : (lead.personal_profiles as { profile_data?: unknown })?.profile_data;

  const p = (profileData || {}) as Record<string, unknown>;

  return {
    has_bazi: !!p.bazi,
    bazi_data: p.bazi ?? null,
    numerology_data: p.numerology ?? null,
    bazi_interp: (p.bazi_interp as string | null) ?? null,
    numerology_interp: (p.numerology_interp as string | null) ?? null,
  };
}
