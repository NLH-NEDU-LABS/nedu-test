/**
 * Shared HTML email template builder.
 * Previously duplicated in:
 *   - lib/email-sequence/send-email.ts — buildHtml() (lines 14-52)
 *   - send-result/route.ts — inline HTML string (lines 113-148)
 *
 * Both produce the same Nedu brand style (cream background, brown gradient header).
 */
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from './ses-client';
import { EMAIL_SENDER } from '@/config/constants';

/**
 * Build a branded Nedu HTML email.
 *
 * @param content  Plain text with `\n\n` paragraph breaks
 * @param ctaLabel Button label (optional)
 * @param ctaUrl   Button URL (optional)
 */
export function buildHtml(content: string, ctaLabel?: string, ctaUrl?: string): string {
  const paragraphs = content
    .split('\n\n')
    .filter((p) => p.trim())
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-size:15px;color:#5C544D;line-height:1.7;">${p.trim()}</p>`
    )
    .join('');

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${ctaUrl}"
         style="display:inline-block;background:#8B5E3C;color:#fff;text-decoration:none;
                padding:14px 32px;border-radius:14px;font-weight:500;font-size:15px;
                letter-spacing:0.3px;box-shadow:0 4px 12px rgba(139,94,60,0.2);">
        ${ctaLabel}
      </a>
    </div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:40px 16px;background:#FDFBF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(139,94,60,0.06);">
    <div style="height:6px;background:linear-gradient(90deg,#F0EBE5,#8B5E3C,#F0EBE5);"></div>
    <div style="padding:48px 32px 40px;">
      ${paragraphs}
      ${ctaHtml}
      <div style="margin-top:48px;border-top:1px solid #F5F2F0;padding-top:24px;text-align:center;">
        <p style="font-size:12px;color:#A39A92;margin:0;">
          Gửi từ <span style="font-weight:500;color:#8B5E3C;">Nedu Education</span> bằng tất cả sự chân thành.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send an email via AWS SES.
 *
 * @param to       Recipient email address
 * @param subject  Email subject
 * @param html     Full HTML string (use buildHtml())
 * @param from     Optional override for sender (defaults to EMAIL_SENDER constant)
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const { to, subject, html, from = EMAIL_SENDER } = params;

  await sesClient.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    })
  );
}
