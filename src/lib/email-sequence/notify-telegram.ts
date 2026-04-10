import type { Lead } from './types'

export async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping notification')
    return
  }

  const text = [
    '🔔 Lead mới sẵn sàng tư vấn',
    '',
    `👤 ${lead.full_name} — ${lead.persona_label ?? 'Chưa xác định'}`,
    `🧠 MBTI: ${lead.mbti_type ?? 'Chưa làm'} | Enneagram: ${lead.enneagram_type ?? 'Chưa làm'}`,
    `🎯 Vấn đề: ${lead.goal ?? lead.job ?? 'Không rõ'}`,
    `📚 Khoá gợi ý: ${lead.primary_course_name ?? 'Chưa có'}`,
    `🔗 Full report: https://test.nedu.vn/report/${lead.report_token}`,
    `📧 Email: ${lead.email}`,
  ].join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Telegram notification failed:', errorText)
  }
}
