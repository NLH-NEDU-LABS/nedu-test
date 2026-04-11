/**
 * MaxDiff service — orchestrates scoring + AI course recommendation.
 *
 * Routes consuming this service:
 *   - POST /api/maxdiff   → score()
 *   - POST /api/recommend → recommend()
 */
import { calculateMaxDiffScores } from './scoring';
import { PERSONAS } from './data';
import type { SetAnswer, AssessmentResult, CourseRecommendation } from './types';
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini/client';
import { RECOMMEND_PROMPT } from '@/lib/gemini/prompts';
import { FALLBACK_RECOMMENDATION } from '@/config/constants';

// ---------------------------------------------------------------------------
// score()
// ---------------------------------------------------------------------------

export interface ScoreInput {
  persona_id: string;
  answers: SetAnswer[];
}

/**
 * Calculate MaxDiff scores for a given persona + answers.
 * Pure — no side effects, no DB calls.
 */
export function score(input: ScoreInput): AssessmentResult {
  const persona = PERSONAS[input.persona_id];
  if (!persona) throw new Error(`Persona not found: ${input.persona_id}`);
  return calculateMaxDiffScores(persona, input.answers);
}

// ---------------------------------------------------------------------------
// recommend()
// ---------------------------------------------------------------------------

export interface RecommendInput {
  persona_label: string;
  persona_id: string;
  top_problem_1: string;
  top_problem_2: string;
  mbti_type?: string;
  occupation?: string;
  source?: string;
  country?: string;
}

/**
 * Get an AI course recommendation for a user profile.
 * Falls back to FALLBACK_RECOMMENDATION if Gemini is unavailable.
 */
export async function recommend(input: RecommendInput): Promise<CourseRecommendation> {
  if (!process.env.GEMINI_API_KEY) {
    return { ...FALLBACK_RECOMMENDATION };
  }

  const userInput = `INPUT
persona_label    : ${input.persona_label}
persona_id       : ${input.persona_id}
top_problem_1    : ${input.top_problem_1}
top_problem_2    : ${input.top_problem_2}
mbti_type        : ${input.mbti_type ?? 'chưa có'}
occupation       : ${input.occupation ?? 'chưa xác định'}
source           : ${input.source ?? 'organic'}
country          : ${input.country ?? 'Việt Nam'}`;

  const model = getGeminiModel({ responseJson: true });

  try {
    return await geminiGenerateJSON<CourseRecommendation>(
      model,
      RECOMMEND_PROMPT + '\n\n' + userInput
    );
  } catch {
    return {
      ...FALLBACK_RECOMMENDATION,
      why_fits: 'Có vẻ kết nối có gián đoạn tạm thời. Khoá Cuộc sống của bạn là khởi đầu an toàn.',
      confidence_score: 0.5,
    };
  }
}
