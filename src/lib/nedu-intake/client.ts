/**
 * nedu-intake client — server-side only (API routes, not components).
 * Gọi nedu-backend POST /api/intake/* với X-Intake-Api-Key.
 * Không bao giờ expose key ra browser.
 */

const BASE = process.env.NEDU_BACKEND_URL;
const KEY = process.env.NEDU_INTAKE_API_KEY;

function getBase(): string {
  if (!BASE) throw new Error('[nedu-intake] NEDU_BACKEND_URL is not set');
  return BASE;
}

function getKey(): string {
  if (!KEY) throw new Error('[nedu-intake] NEDU_INTAKE_API_KEY is not set');
  return KEY;
}

async function intakeFetch<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const res = await fetch(`${getBase()}/api/intake${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Intake-Api-Key': getKey(),
      ...(init.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[nedu-intake] ${init.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface SubmitLeadInput {
  source_ref: string;
  source_channel: string;
  full_name: string;
  email: string;
  phone?: string;
  telegram_username?: string;
  birth_date?: string;
  birth_time?: string;
  occupation?: string;
  goal?: string;
  main_concern?: string;
  test_score?: number;
  test_desc?: string;
  interested_courses?: string[];
  ai_profile_consent?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_url?: string;
  landing_url?: string;
  metadata?: Record<string, unknown>;
}

export interface SubmitLeadResult {
  lead_id: string;
  is_new: boolean;
}

export type QuizType = 'maxdiff' | 'mbti' | 'enneagram' | 'bazi';

export interface SubmitQuizInput {
  source_ref: string;
  quiz_type: QuizType;
  payload: Record<string, unknown>;
  score?: number;
}

export interface SubmitQuizResult {
  submission_id: string;
  lead_id: string;
}

export interface IntakeReportResult {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  telegramUsername: string | null;
  birthDate: string | null;
  birthTime: string | null;
  occupation: string | null;
  goal: string | null;
  testScore: number | null;
  testDesc: string | null;
  interestedCourses: string[];
  metadata: Record<string, unknown> | null;
  personalProfile: {
    mbtiType: string | null;
    enneagramType: string | null;
    lifePathNumber: number | null;
    nineStar: string | null;
    nhutChu: string | null;
    sunSign: string | null;
    menhCuc: string | null;
  } | null;
  quiz_submissions: Array<{
    id: string;
    quizType: string;
    payload: Record<string, unknown>;
    score: number | null;
    createdAt: string;
  }>;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const intakeClient = {
  submitLead: (body: SubmitLeadInput) =>
    intakeFetch<SubmitLeadResult>('/leads', { method: 'POST', body: JSON.stringify(body) }),

  submitQuiz: (body: SubmitQuizInput) =>
    intakeFetch<SubmitQuizResult>('/quiz-submissions', { method: 'POST', body: JSON.stringify(body) }),

  getReport: (sourceRef: string) =>
    intakeFetch<IntakeReportResult>(`/leads/${encodeURIComponent(sourceRef)}`, { method: 'GET' }),
};
