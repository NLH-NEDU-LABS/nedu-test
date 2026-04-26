/**
 * Zod-validated environment variables.
 * Import `env` instead of accessing `process.env` directly in application code.
 *
 * Usage:
 *   import { env } from '@/config/env';
 *   env.SUPABASE_URL
 */
import { z } from 'zod';

const envSchema = z.object({
  // Supabase (giữ lại trong quá trình migration parallel)
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // NEDU backend intake channel
  NEDU_BACKEND_URL: z.string().url('NEDU_BACKEND_URL must be a valid URL').optional(),
  NEDU_INTAKE_API_KEY: z.string().min(1).optional(),

  // Gemini
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TELEGRAM_CHAT_ID: z.string().min(1, 'TELEGRAM_CHAT_ID is required'),

  // Vercel Cron auth
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),

  // AWS SES (optional — empty string allowed for local dev without email sending)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SES_REGION: z.string().default('ap-southeast-1'),

  // App base URL
  NEXT_PUBLIC_REPORT_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_REPORT_BASE_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Assessment Mode
  NEXT_PUBLIC_ASSESSMENT_MODE: z.enum(['drip', 'express']).default('drip'),
});

/**
 * Validated + typed env object.
 * Throws at startup if any required env var is missing or malformed.
 */
function parseEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // In server environments, throw to surface misconfiguration early.
    // In test environments, suppress to allow unit tests without full .env.
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(`[env] Environment validation failed:\n${missing}`);
    }
    // Return a partial object for test environments
    return process.env as unknown as z.infer<typeof envSchema>;
  }

  return result.data;
}

export const env = parseEnv();
