/**
 * MBTI service — scoreAndDescribe().
 *
 * Key improvement: uses shared profile-repository to eliminate
 * the duplicate SELECT → if/else INSERT/UPDATE pattern.
 */
import { calculateMBTI } from './scoring';
import { MBTI_NAMES } from './data';
import { findByReportToken } from '@/features/lead/repository';
import { upsertProfileData } from '@/features/shared/profile-repository';
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

/**
 * Score MBTI, generate AI description, persist to DB.
 */
export async function scoreAndDescribe(input: MbtiScoreInput): Promise<MbtiScoreResult> {
  const { token, mbti_type } = input;

  // 1. Find lead
  const lead = await findByReportToken(token);
  if (!lead) throw Object.assign(new Error('Lead not found'), { status: 404 });

  const metadata = lead.metadata as Record<string, unknown>;
  const persona_label = (metadata.persona_label as string) || 'Chưa xác định';
  const goal = lead.goal || 'Chưa làm rõ';
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

  // 3. Persist to DB (Single Source of Truth)
  await upsertProfileData(lead.id, lead.dob, {
    mbti_type,
    mbti_desc,
  });

  return { mbti_type, mbti_desc };
}
