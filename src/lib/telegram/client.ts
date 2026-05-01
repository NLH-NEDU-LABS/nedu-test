/**
 * Telegram bot notification client.
 * Moved from lib/email-sequence/notify-telegram.ts.
 *
 * Note: The old file at lib/email-sequence/notify-telegram.ts
 * becomes a re-export stub in Phase 1 to avoid breaking imports.
 */
import type { Lead } from '@/lib/email-sequence/types';
import { BASE_URLS } from '@/config/constants';

/**
 * Send a Telegram message to the configured chat when a lead
 * reaches a milestone day in the email sequence.
 */
export async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping notification');
    return;
  }

  const text = [
    '🔔 Lead mới sẵn sàng tư vấn',
    '',
    `👤 ${lead.full_name} — ${lead.persona_label ?? 'Chưa xác định'}`,
    `🧠 MBTI: ${lead.mbti_type ?? 'Chưa làm'} | Enneagram: ${lead.enneagram_type ?? 'Chưa làm'}`,
    `🎯 Vấn đề: ${lead.goal ?? lead.job ?? 'Không rõ'}`,
    `📚 Khoá gợi ý: ${lead.primary_course_name ?? 'Chưa có'}`,
    `🔗 Full report: ${BASE_URLS.reportBase}/report/${lead.report_token}`,
    `📧 Email: ${lead.email}`,
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Telegram] Notification failed:', errorText);
  }
}
