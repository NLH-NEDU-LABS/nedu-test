import { MBTI_NAMES } from './data';
import { intakeClient } from '@/lib/nedu-intake/client';
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

  // 1. Find lead context via intake API
  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) throw Object.assign(new Error('Lead not found'), { status: 404 });

  const maxdiff = report.quiz_submissions.find((s) => s.quizType === 'maxdiff');
  const persona_label = (maxdiff?.payload.persona_label as string) || 'Chưa xác định';
  const goal = report.goal || 'Chưa làm rõ';
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

  // 3. Upsert vào personal_profiles
  await intakeClient.upsertProfile(token, { mbti_type, mbti_desc });

  return { mbti_type, mbti_desc };
}
