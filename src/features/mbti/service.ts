/**
 * MBTI service — scoreAndDescribe().
 *
 * Migrated from Supabase 2026-04 — fetches context + persists via api.nedu.vn.
 */
import { MBTI_NAMES } from './data';
import { neduApi } from '@/lib/nedu-api/client';
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini/client';
import { buildMbtiPrompt } from '@/lib/gemini/prompts';

export interface MbtiScoreInput {
  token: string;
  mbti_type: string;
}

export interface MbtiScoreResult {
  mbti_type: string;
  mbti_desc: string;
}

export async function scoreAndDescribe(input: MbtiScoreInput): Promise<MbtiScoreResult> {
  const { token, mbti_type } = input;

  // 1. Fetch existing assessment for AI prompt context.
  const report = await neduApi.getReport(token).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) throw Object.assign(new Error('Lead not found'), { status: 404 });

  const persona_label = report.assessment.persona_label || 'Chưa xác định';
  const goal = report.lead.goal || 'Chưa làm rõ';
  const mbti_name = MBTI_NAMES[mbti_type] || mbti_type;

  // 2. Generate AI description
  const ai = getGeminiModel({ responseJson: true });
  const prompt = buildMbtiPrompt({ mbti_type, mbti_name, persona_label, goal });

  let mbti_desc = `Kiểu tính cách ${mbti_type} (${mbti_name}) là những người rất đặc biệt.`;
  try {
    const parsed = await geminiGenerateJSON<{ description: string }>(ai, prompt);
    if (parsed.description) mbti_desc = parsed.description;
  } catch (err) {
    console.error('[MBTI] Gemini error (after retries):', err);
  }

  // 3. Persist to nedu (mbti_type column + mbti_desc in metadata).
  await neduApi.updateAssessment(token, {
    mbti_type,
    metadata: { mbti_desc },
  });

  return { mbti_type, mbti_desc };
}
