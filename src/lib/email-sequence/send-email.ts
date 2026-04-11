import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { Lead } from './types'

const ses = new SESClient({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// --- HTML wrapper (matches existing send-result email style) ---

function buildHtml(content: string, ctaLabel?: string, ctaUrl?: string): string {
  const paragraphs = content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin:0 0 16px 0;font-size:15px;color:#5C544D;line-height:1.7;">${p.trim()}</p>`)
    .join('')

  const ctaHtml = ctaLabel && ctaUrl ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${ctaUrl}"
         style="display:inline-block;background:#8B5E3C;color:#fff;text-decoration:none;
                padding:14px 32px;border-radius:14px;font-weight:500;font-size:15px;
                letter-spacing:0.3px;box-shadow:0 4px 12px rgba(139,94,60,0.2);">
        ${ctaLabel}
      </a>
    </div>` : ''

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
</html>`
}

// --- Email templates per day ---

type EmailTemplate = {
  subject: string
  content: string
  ctaLabel: string
  ctaUrl: string
}

function getTemplate(lead: Lead, day: number): EmailTemplate | null {
  const name = lead.full_name || 'bạn'
  const persona = lead.persona_label ?? 'này'
  const token = lead.report_token

  switch (day) {
    case 2:
      return {
        subject: 'Khám phá MBTI của bạn 🧠',
        content: `Chào ${name},\n\nNhi vừa nghĩ đến bạn.\n\nHồi đó bạn chia sẻ rằng mình đang ở giai đoạn ${persona}. Nhi biết giai đoạn này không dễ — và thường thì, điều khiến mình bị mắc kẹt không phải hoàn cảnh bên ngoài, mà là cách mình hiểu về chính mình.\n\nMBTI không phải con số định mệnh. Nhưng nó là một chiếc gương — giúp bạn thấy rõ hơn cách mình xử lý áp lực, kết nối với người khác, và đưa ra quyết định.\n\nChỉ mất 5 phút.`,
        ctaLabel: 'Khám phá kiểu MBTI của tôi →',
        ctaUrl: `https://test.nhi.sg/mbti/${token}`,
      }

    case 5:
      return {
        subject: 'Enneagram — một góc nhìn khác về bạn',
        content: `Chào ${name},\n\nNếu MBTI cho bạn thấy cách bạn tư duy — thì Enneagram cho bạn thấy tại sao bạn làm những điều mình làm.\n\nĐây là bài test Nhi thấy chạm đến nội tâm nhất. Nó không hỏi bạn thích gì — nó hỏi bạn sợ gì, khao khát gì, và điều gì đang thực sự thúc đẩy bạn bên dưới lớp bề mặt.\n\nVới người đang ở giai đoạn ${persona} như bạn, hiểu được điều này có thể thay đổi rất nhiều thứ.`,
        ctaLabel: 'Khám phá Enneagram của tôi →',
        ctaUrl: `https://test.nhi.sg/enneagram/${token}`,
      }

    case 10:
      return {
        subject: 'Hồ sơ chuyên sâu của bạn đã sẵn sàng ✨',
        content: `Chào ${name},\n\nHệ thống Nedu đã phân tích hồ sơ Bát Tự và Thần Số Học của bạn.\n\nĐây không phải chiêm tinh học thông thường. Bát Tự là bản đồ năng lượng bẩm sinh — nó giải thích tại sao một số giai đoạn trong cuộc đời bạn cảm thấy thuận, và một số giai đoạn cảm thấy như đang bơi ngược dòng.`,
        ctaLabel: 'Xem hồ sơ chuyên sâu của tôi →',
        ctaUrl: `https://test.nhi.sg/bazi-numerology/${token}`,
      }

    case 14:
      return {
        subject: 'Full report tổng hợp 5 điểm số của bạn',
        content: `Chào ${name},\n\nHành trình 2 tuần qua — MaxDiff, MBTI, Enneagram, Bát Tự, Thần Số Học — tất cả giờ đã được tổng hợp thành một bức tranh đầy đủ về bạn.\n\nNhi đã đọc qua profile của bạn. Có một vài điểm giao thoa thú vị giữa các bài test mà Nhi muốn bạn tự khám phá.`,
        ctaLabel: 'Xem full report của tôi →',
        ctaUrl: `https://test.nhi.sg/report/${token}`,
      }

    case 16: {
      const courseName = lead.primary_course_name ?? 'Cuộc Sống Của Bạn'
      const courseUrl = lead.primary_course_url ?? 'https://nedu.nhi.sg'
      const whyFits = lead.why_fits ? `\n\n${lead.why_fits}` : ''

      return {
        subject: 'Tư vấn viên sẽ liên hệ bạn',
        content: `Chào ${name},\n\nBạn đã đi được một hành trình dài — từ MaxDiff đến Bát Tự. Nhi trân trọng điều đó.\n\nDựa trên toàn bộ profile của bạn, Nhi nghĩ khoá "${courseName}" là điểm khởi đầu phù hợp nhất với bạn lúc này.${whyFits}\n\nMột tư vấn viên của Nedu sẽ liên hệ bạn trong 24 giờ tới để trả lời bất kỳ câu hỏi nào — không có áp lực, không ép mua.`,
        ctaLabel: 'Xem chi tiết khoá học →',
        ctaUrl: courseUrl,
      }
    }

    default:
      return null
  }
}

// --- Main send function ---

export async function sendEmail(lead: Lead, day: number): Promise<void> {
  const template = getTemplate(lead, day)
  if (!template) {
    console.warn(`No email template for day ${day}, skipping lead ${lead.id}`)
    return
  }

  const html = buildHtml(template.content, template.ctaLabel, template.ctaUrl)

  try {
    await ses.send(new SendEmailCommand({
      Source: 'Nhi Le <noreply@nhi.sg>',
      Destination: { ToAddresses: [lead.email] },
      Message: {
        Subject: { Data: template.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    }))
  } catch (error) {
    console.error(`Failed to send day ${day} email to ${lead.email}:`, error)
    throw error
  }
}
