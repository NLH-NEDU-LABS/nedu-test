/**
 * Enneagram service — scoreAndDescribe().
 * Mirror of features/mbti/service.ts.
 */
import { ENNEAGRAM_NAMES } from './data';
import { findByReportToken } from '@/features/lead/repository';
import { upsertProfileData } from '@/features/shared/profile-repository';
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini/client';
import { buildEnneagramPrompt } from '@/lib/gemini/prompts';

export interface EnneagramScoreInput {
  token: string;
  enneagram_type: string;
}

export interface EnneagramScoreResult {
  enneagram_type: string;
  enneagram_desc: string;
}

/**
 * Score Enneagram, generate AI description, persist to DB.
 */
export async function scoreAndDescribe(input: EnneagramScoreInput): Promise<EnneagramScoreResult> {
  const { token } = input;
  const typeStr = String(input.enneagram_type);

  // 1. Find lead
  const lead = await findByReportToken(token);
  if (!lead) throw Object.assign(new Error('Lead not found'), { status: 404 });

  const metadata = lead.metadata as Record<string, unknown>;
  const persona_label = (metadata.persona_label as string) || 'Chưa xác định';
  const goal = lead.goal || 'Chưa làm rõ';
  const enneagram_name = ENNEAGRAM_NAMES[typeStr] || `Type ${typeStr}`;

  // 2. Generate AI description
  const ai = getGeminiModel({ responseJson: true });
  const prompt = buildEnneagramPrompt({
    enneagram_type: typeStr,
    enneagram_name,
    persona_label,
    goal,
  });

  let enneagram_desc = `Enneagram Type ${typeStr} (${enneagram_name}) phản ánh nhiều sâu thẳm bên trong bạn.`;
  try {
    const parsed = await geminiGenerateJSON<{ description: string }>(ai, prompt);
    if (parsed.description) enneagram_desc = parsed.description;
  } catch (err) {
    console.error('[Enneagram] Gemini error (after retries):', err);
  }

  // 3. Persist to DB (Single Source of Truth)
  await upsertProfileData(lead.id, lead.dob, {
    enneagram_type: typeStr,
    enneagram_desc,
  });

  return { enneagram_type: typeStr, enneagram_desc };
}
