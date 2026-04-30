/**
 * NEDU backend API client (server-side).
 *
 * Gọi api.nedu.vn để persist lead + quiz assessment data.
 * Browser KHÔNG bao giờ import file này — secret key chỉ ở Node runtime.
 *
 * Auth: header `X-Internal-Secret` cho /api/internal/* endpoints.
 * Public GET /api/quiz/report/:token không cần auth (opaque token là đủ).
 */

const BASE_URL = process.env.NEDU_BACKEND_URL;
const SECRET = process.env.NEDU_INTERNAL_SECRET;

function ensureConfig() {
  if (!BASE_URL) throw new Error('NEDU_BACKEND_URL is not set');
  if (!SECRET) throw new Error('NEDU_INTERNAL_SECRET is not set');
}

interface FetchOptions {
  method: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  internal: boolean;
}

async function neduFetch<T>(path: string, opts: FetchOptions): Promise<T> {
  ensureConfig();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts.internal) {
    headers['X-Internal-Secret'] = SECRET as string;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '<no body>');
    throw Object.assign(
      new Error(`NEDU ${opts.method} ${path} failed: ${res.status} ${text}`),
      { status: res.status, path },
    );
  }

  // Some endpoints (PATCH) may return empty body with 204; tolerate that.
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as T;
  const body = await res.json();
  // Backend wraps responses in { data: ... } via TransformInterceptor — unwrap.
  return (
    body && typeof body === 'object' && 'data' in body ? body.data : body
  ) as T;
}

// ── DTO types (mirror backend) ───────────────────────────────────────────────

export interface StartQuizDto {
  full_name: string;
  phone: string;
  report_token: string; // FE pre-generates UUID
  source_ref?: string;
  source?: string;
  source_channel?: string;
  email?: string;
  birth_date?: string;
  birth_time?: string;
  occupation?: string;
  goal?: string;
  main_concern?: string;
  interested_courses?: string[];
  assessment_mode?: 'express' | 'drip';
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer_url?: string;
  landing_url?: string;
  preferred_consultant_user_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateQuizAssessmentDto {
  persona_label?: string;
  mbti_type?: string;
  enneagram_type?: string;
  recommended_course_name?: string;
  recommended_course_url?: string;
  why_fits?: string;
  bazi_data?: Record<string, unknown>;
  numerology_data?: Record<string, unknown>;
  maxdiff_scores?: unknown[];
  top_problems?: unknown[];
  full_recommendation?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface StartQuizResponse {
  lead_id: string;
  report_token: string;
  is_new: boolean;
}

export interface QuizReportResponse {
  lead: {
    id: string;
    full_name: string;
    email: string | null;
    birth_date: string | null;
    occupation: string | null;
    goal: string | null;
    metadata: Record<string, unknown> | null;
  };
  assessment: {
    report_token: string;
    assessment_source: string;
    assessment_mode: string | null;
    persona_label: string | null;
    mbti_type: string | null;
    enneagram_type: string | null;
    recommended_course_name: string | null;
    recommended_course_url: string | null;
    why_fits: string | null;
    bazi_data: unknown;
    numerology_data: unknown;
    maxdiff_scores: unknown;
    top_problems: unknown;
    full_recommendation: unknown;
    metadata: Record<string, unknown> | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export const neduApi = {
  startQuiz(dto: StartQuizDto): Promise<StartQuizResponse> {
    return neduFetch<StartQuizResponse>('/api/internal/quiz/start', {
      method: 'POST',
      body: dto,
      internal: true,
    });
  },

  updateAssessment(
    reportToken: string,
    dto: UpdateQuizAssessmentDto,
  ): Promise<{ success: true }> {
    return neduFetch(`/api/internal/quiz/${reportToken}`, {
      method: 'PATCH',
      body: dto,
      internal: true,
    });
  },

  completeAssessment(
    reportToken: string,
    consent: boolean,
  ): Promise<{ success: true; consent: boolean }> {
    return neduFetch(`/api/internal/quiz/${reportToken}/complete`, {
      method: 'POST',
      body: { consent },
      internal: true,
    });
  },

  getReport(reportToken: string): Promise<QuizReportResponse> {
    return neduFetch<QuizReportResponse>(`/api/quiz/report/${reportToken}`, {
      method: 'GET',
      internal: false,
    });
  },
};
