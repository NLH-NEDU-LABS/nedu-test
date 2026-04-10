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
    model = 'gemini-2.5-flash',
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
  /** Max number of attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms before first retry (default: 1000) */
  baseDelayMs?: number;
  /** Max delay cap in ms (default: 8000) */
  maxDelayMs?: number;
}

/**
 * Call Gemini generateContent with automatic retry + exponential backoff.
 * Returns the raw text response.
 * 
 * Retries on:
 * - Network errors
 * - 429 (rate limit)
 * - 500/503 (server errors)
 * 
 * Does NOT retry on:
 * - 400 (bad request / invalid prompt)
 * - 403 (auth errors)
 */
export async function geminiGenerate(
  model: GenerativeModel,
  prompt: string,
  options: RetryOptions = {}
): Promise<string> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 8000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (bad request, auth)
      const status = error?.status || error?.httpStatusCode || 0;
      if (status === 400 || status === 403 || status === 404) {
        throw error;
      }

      // Last attempt — don't sleep, just throw
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = delay * 0.2 * Math.random(); // ±20% jitter
      const waitMs = Math.round(delay + jitter);

      console.warn(
        `[Gemini] Attempt ${attempt + 1}/${maxRetries} failed (${error?.message || 'unknown'}). Retrying in ${waitMs}ms...`
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
