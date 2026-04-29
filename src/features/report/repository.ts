/**
 * Report repository — fetches data from api.nedu.vn (single source of truth).
 *
 * getQuizReport()       → MaxDiff + MBTI + Enneagram + Bazi/Numerology
 * getBaziNumerology()   → subset focused on Bazi/Numerology
 *
 * Migrated from Supabase 2026-04 — quiz data lives in nedu's
 * `lead_quiz_assessments` (assessment data) + `leads` (profile data).
 */
import { neduApi, type QuizReportResponse } from '@/lib/nedu-api/client';

async function fetchReport(token: string): Promise<QuizReportResponse | null> {
  try {
    return await neduApi.getReport(token);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Quiz Report (MaxDiff + MBTI + Enneagram + Bazi/Numerology)
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
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}

export async function getQuizReport(token: string): Promise<QuizReportPayload | null> {
  const report = await fetchReport(token);
  if (!report) return null;

  const a = report.assessment;
  const leadMeta = (report.lead.metadata ?? {}) as Record<string, unknown>;
  const aMeta = (a.metadata ?? {}) as Record<string, unknown>;
  const topProblems = Array.isArray(a.top_problems) ? a.top_problems : [];

  return {
    name: report.lead.full_name ?? null,
    persona_label: a.persona_label ?? null,
    top_problem_1: (topProblems[0] as string | undefined) ?? (leadMeta.top_problem_1 as string | null) ?? null,
    top_problem_2: (topProblems[1] as string | undefined) ?? (leadMeta.top_problem_2 as string | null) ?? null,
    primary_course_name: a.recommended_course_name ?? null,
    primary_course_url: a.recommended_course_url ?? null,
    why_fits: a.why_fits ?? null,
    maxdiff_scores: Array.isArray(a.maxdiff_scores) ? a.maxdiff_scores : [],
    ai_recommendation: a.full_recommendation ?? null,
    mbti_type: a.mbti_type ?? null,
    mbti_desc: (aMeta.mbti_desc as string | null) ?? null,
    enneagram_type: a.enneagram_type ?? null,
    enneagram_desc: (aMeta.enneagram_desc as string | null) ?? null,
    has_bazi: !!a.bazi_data,
    bazi_data: a.bazi_data ?? null,
    numerology_data: a.numerology_data ?? null,
    bazi_interp: (aMeta.bazi_interp as string | null) ?? null,
    numerology_interp: (aMeta.numerology_interp as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Bazi + Numerology Report
// ---------------------------------------------------------------------------

export interface BaziNumerologyPayload {
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}

export async function getBaziNumerology(token: string): Promise<BaziNumerologyPayload | null> {
  const report = await fetchReport(token);
  if (!report) return null;

  const a = report.assessment;
  const aMeta = (a.metadata ?? {}) as Record<string, unknown>;

  return {
    has_bazi: !!a.bazi_data,
    bazi_data: a.bazi_data ?? null,
    numerology_data: a.numerology_data ?? null,
    bazi_interp: (aMeta.bazi_interp as string | null) ?? null,
    numerology_interp: (aMeta.numerology_interp as string | null) ?? null,
  };
}
