/**
 * Shared AWS SES client singleton.
 * Previously instantiated separately in:
 *   - lib/email-sequence/send-email.ts (lines 4-10)
 *
 * Note: send-result/route.ts was using Resend (migrated to SES).
 * This is now the single SES client for the entire codebase.
 */
import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION ?? 'ap-southeast-1',
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined, // Falls back to IAM role if running on AWS infra
});
