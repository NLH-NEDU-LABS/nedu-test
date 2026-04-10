import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
/**
 * Shared Gemini AI client with retry + exponential backoff.
 * 
 * Usage:
 *   import { geminiGenerate, getGeminiModel } from '@/lib/gemini';
 *   const model = getGeminiModel({ responseJson: true });
 *   const text = await geminiGenerate(model, prompt);
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GeminiModelOptions {
  /** Model name, defaults to 'gemini-2.5-flash' */
  model?: string;
  /** If true, sets responseMimeType to application/json */
  responseJson?: boolean;
  /** Optional system instruction */
  systemInstruction?: string;
}

/**
 * Get a configured Gemini GenerativeModel instance.
 */
export function getGeminiModel(options: GeminiModelOptions = {}): GenerativeModel {
  const {
    model = 'gemini-3.1-flash-lite-preview',
    responseJson = false,
    systemInstruction,
  } = options;

  return genAI.getGenerativeModel({
    model,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: responseJson
      ? { responseMimeType: 'application/json' }
      : undefined,
  });
}

interface RetryOptions {
  /** Max number of attempts (default: 5) */
  maxRetries?: number;
  /** Base delay in ms before first retry (default: 1500) */
  baseDelayMs?: number;
  /** Max delay cap in ms (default: 30000) */
  maxDelayMs?: number;
}

const FALLBACK_MODEL = 'gemini-2.0-flash';

/**
 * Call Gemini generateContent with automatic retry + exponential backoff.
 * Returns the raw text response.
 *
 * Retries on:
 * - Network errors
 * - 429 (rate limit)
 * - 500/503 (server overload)
 *
 * Does NOT retry on:
 * - 400 (bad request / invalid prompt)
 * - 403 (auth errors)
 *
 * Falls back to gemini-2.0-flash if primary model (gemini-2.5-flash) 503s
 * more than half the allowed attempts.
 */
export async function geminiGenerate(
  model: GenerativeModel,
  prompt: string,
  options: RetryOptions = {}
): Promise<string> {
  const { maxRetries = 5, baseDelayMs = 1500, maxDelayMs = 30000 } = options;

  let lastError: Error | null = null;
  let overloadCount = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // After half the retries are 503, switch to fallback model
      const activeModel = overloadCount >= Math.floor(maxRetries / 2)
        ? genAI.getGenerativeModel({
          model: FALLBACK_MODEL,
          generationConfig: (model as any)?.generationConfig,
          systemInstruction: (model as any)?.systemInstruction,
        })
        : model;

      const result = await activeModel.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (bad request, auth)
      const status = error?.status || error?.httpStatusCode || 0;
      if (status === 400 || status === 403 || status === 404) {
        throw error;
      }

      if (status === 503 || status === 500) {
        overloadCount++;
      }

      // Last attempt — don't sleep, just throw
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff — longer delay for 503 overload
      const base = (status === 503 || status === 500) ? baseDelayMs * 2 : baseDelayMs;
      const delay = Math.min(base * Math.pow(2, attempt), maxDelayMs);
      const jitter = delay * 0.2 * Math.random();
      const waitMs = Math.round(delay + jitter);

      console.warn(
        `[Gemini] Attempt ${attempt + 1}/${maxRetries} failed status=${status} (${error?.message || 'unknown'}). Retry in ${waitMs}ms... (overloads: ${overloadCount})`
      );

      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  throw lastError || new Error('Gemini generation failed after retries');
}

/**
 * Convenience: generate + parse JSON response.
 * Strips markdown code fences if AI accidentally wraps output.
 */
export async function geminiGenerateJSON<T = any>(
  model: GenerativeModel,
  prompt: string,
  options: RetryOptions = {}
): Promise<T> {
  const text = await geminiGenerate(model, prompt, options);
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
