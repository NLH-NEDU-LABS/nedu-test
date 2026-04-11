/**
 * Bazi/Numerology service — calculate() + interpret().
 *
 * Routes consuming this service:
 *   - POST /api/calculate  → calculate()
 *   - POST /api/interpret  → interpret()
 */
import { buildBazi, getSolarTime } from '@/features/bazi-numerology/bazi';
import { calculateFullNumerology } from '@/features/bazi-numerology/numerology';
import { getTimezoneForLocation } from '@/features/bazi-numerology/timezone';
import { getGeminiModel, geminiGenerate } from '@/lib/gemini/client';
import { buildBaziPrompt, buildNumerologyPrompt } from '@/lib/gemini/prompts';

// ---------------------------------------------------------------------------
// calculate()
// ---------------------------------------------------------------------------

export interface CalculateInput {
  dob: string;
  birthTime: string | null;
  birthPlace: string;
  gender: 0 | 1;
  fullName?: string;
}

export interface CalculateResult {
  bazi: unknown;
  numerology: unknown;
}

/**
 * Calculate Bazi + Numerology data from birth info.
 * Pure computation — no DB, no AI.
 */
export function calculate(input: CalculateInput): CalculateResult {
  const tz = getTimezoneForLocation(input.birthPlace);
  const timeToUse = input.birthTime || '12:00';
  const isoString = `${input.dob}T${timeToUse}:00${tz}`;

  const solarTime = getSolarTime(isoString, tz);
  const bazi = buildBazi({ solarTime, gender: input.gender, eightCharProviderSect: 2 });
  const numerology = calculateFullNumerology(input.dob, input.fullName);

  return { bazi, numerology };
}

// ---------------------------------------------------------------------------
// interpret()
// ---------------------------------------------------------------------------

export type InterpretType = 'bazi' | 'numerology';

/**
 * Generate an AI interpretation for bazi or numerology data.
 * Returns the raw markdown text.
 */
export async function interpret(type: InterpretType, payload: unknown): Promise<string> {
  const model = getGeminiModel();

  const prompt =
    type === 'bazi' ? buildBaziPrompt(payload) : buildNumerologyPrompt(payload);

  return geminiGenerate(model, prompt);
}
