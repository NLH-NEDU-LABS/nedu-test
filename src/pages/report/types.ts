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

export interface BaziNumerologyPayload {
  has_bazi: boolean;
  bazi_data: unknown | null;
  numerology_data: unknown | null;
  bazi_interp: string | null;
  numerology_interp: string | null;
}
