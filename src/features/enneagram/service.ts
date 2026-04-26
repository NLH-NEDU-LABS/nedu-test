import { ENNEAGRAM_NAMES } from './data';
import { intakeClient } from '@/lib/nedu-intake/client';
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

export async function scoreAndDescribe(input: EnneagramScoreInput): Promise<EnneagramScoreResult> {
  const { token } = input;
  const typeStr = String(input.enneagram_type);

  // 1. Find lead context via intake API
  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) throw Object.assign(new Error('Lead not found'), { status: 404 });

  const persona_label = report.personalProfile?.personaLabel || 'Chưa xác định';
  const goal = report.goal || 'Chưa làm rõ';
  const enneagram_name = ENNEAGRAM_NAMES[typeStr] || `Type ${typeStr}`;

  // 2. Generate AI description
  const ai = getGeminiModel({ responseJson: true });
  const prompt = buildEnneagramPrompt({ enneagram_type: typeStr, enneagram_name, persona_label, goal });

  let enneagram_desc = `Enneagram Type ${typeStr} (${enneagram_name}) phản ánh nhiều sâu thẳm bên trong bạn.`;
  try {
    const parsed = await geminiGenerateJSON<{ description: string }>(ai, prompt);
    if (parsed.description) enneagram_desc = parsed.description;
  } catch (err) {
    console.error('[Enneagram] Gemini error (after retries):', err);
  }

  // 3. Upsert vào personal_profiles
  await intakeClient.upsertProfile(token, { enneagram_type: typeStr, enneagram_desc });

  return { enneagram_type: typeStr, enneagram_desc };
}
