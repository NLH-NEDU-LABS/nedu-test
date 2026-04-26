import { intakeClient } from '@/lib/nedu-intake/client';

// ---------------------------------------------------------------------------
// Quiz Report
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
  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) return null;

  const p = report.personalProfile;

  return {
    name: report.fullName ?? null,
    persona_label: p?.personaLabel ?? null,
    top_problem_1: p?.topProblem1 ?? null,
    top_problem_2: p?.topProblem2 ?? null,
    primary_course_name: p?.primaryCourseName ?? null,
    primary_course_url: p?.primaryCourseUrl ?? null,
    why_fits: p?.whyFits ?? null,
    maxdiff_scores: (p?.maxdiffScores as unknown[]) ?? [],
    ai_recommendation: p?.aiRecommendation ?? null,
    mbti_type: p?.mbtiType ?? null,
    mbti_desc: p?.mbtiDesc ?? null,
    enneagram_type: p?.enneagramType ?? null,
    enneagram_desc: p?.enneagramDesc ?? null,
    has_bazi: !!p?.bazi,
    bazi_data: p?.bazi ?? null,
    numerology_data: p?.numerology ?? null,
    bazi_interp: p?.baziInterp ?? null,
    numerology_interp: p?.numerologyInterp ?? null,
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
  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) return null;

  const p = report.personalProfile;

  return {
    has_bazi: !!p?.bazi,
    bazi_data: p?.bazi ?? null,
    numerology_data: p?.numerology ?? null,
    bazi_interp: p?.baziInterp ?? null,
    numerology_interp: p?.numerologyInterp ?? null,
  };
}
