import { intakeClient } from '@/lib/nedu-intake/client';

// ---------------------------------------------------------------------------
// Quiz Report (MaxDiff + MBTI + Enneagram + Bazi)
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
  // Bazi + Numerology
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}

export async function getQuizReport(token: string): Promise<QuizReportPayload | null> {
  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) return null;

  const sub = (type: string) => report.quiz_submissions.find((s) => s.quizType === type);
  const maxdiff = sub('maxdiff')?.payload ?? {};
  const mbti = sub('mbti')?.payload ?? {};
  const enneagram = sub('enneagram')?.payload ?? {};
  const bazi = sub('bazi')?.payload ?? {};

  return {
    name: report.fullName ?? null,
    persona_label: (maxdiff.persona_label as string) ?? null,
    top_problem_1: (maxdiff.top_problem_1 as string) ?? null,
    top_problem_2: (maxdiff.top_problem_2 as string) ?? null,
    primary_course_name: (maxdiff.primary_course_name as string) ?? null,
    primary_course_url: (maxdiff.primary_course_url as string) ?? null,
    why_fits: (maxdiff.why_fits as string) ?? null,
    maxdiff_scores: (maxdiff.scores as unknown[]) ?? [],
    ai_recommendation: maxdiff.ai_recommendation ?? null,
    mbti_type: (mbti.type as string) ?? (report.personalProfile?.mbtiType ?? null),
    mbti_desc: (mbti.description as string) ?? null,
    enneagram_type: (enneagram.type as string) ?? (report.personalProfile?.enneagramType ?? null),
    enneagram_desc: (enneagram.description as string) ?? null,
    has_bazi: !!sub('bazi'),
    bazi_data: bazi.bazi ?? null,
    numerology_data: bazi.numerology ?? null,
    bazi_interp: (bazi.bazi_interp as string) ?? null,
    numerology_interp: (bazi.numerology_interp as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Bazi + Numerology Report (subset of the above)
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

  const baziSub = report.quiz_submissions.find((s) => s.quizType === 'bazi');
  const p = baziSub?.payload ?? {};

  return {
    has_bazi: !!baziSub,
    bazi_data: p.bazi ?? null,
    numerology_data: p.numerology ?? null,
    bazi_interp: (p.bazi_interp as string) ?? null,
    numerology_interp: (p.numerology_interp as string) ?? null,
  };
}
