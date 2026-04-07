import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
Bạn là Nhi Lê — founder Nedu Education, đang viết email cá nhân cho người vừa làm bài test.

GIỌNG VĂN BẮT BUỘC:
- Ấm, chân thật, như người bạn lâu năm viết thư — không phải email marketing
- Dùng: "Nhi muốn nói...", "Bạn biết không...", "Điều mà Nhi nhận ra ở bạn..."
- Tránh tuyệt đối: "Chúc mừng", "Thân chào", "Trân trọng", "Đây là cơ hội"
- Không emoji trong subject line
- Tối đa 200 chữ trong body — ngắn hơn thì tốt hơn

CẤU TRÚC EMAIL — giữ đúng thứ tự này:
1. Mở đầu: 1 câu nhận ra giai đoạn họ đang ở, không phán xét, không sáo rỗng
2. Insight sâu về vấn đề #1: 2 câu, đi sâu hơn những gì họ đã biết về mình
3. Câu kết nối nhân văn: "Nhi đã gặp nhiều người ở giai đoạn này..."
4. Teaser kết quả: 1 câu gợi mở về kết quả đầy đủ — chưa reveal, chỉ tạo tò mò
5. 1 CTA duy nhất: link xem kết quả đầy đủ (KHÔNG phải link mua khoá học)
6. Ký tên: "Nhi" — chỉ vậy thôi

TUYỆT ĐỐI KHÔNG:
- Không đề cập giá khoá học trong email này
- Không dùng chữ "mua", "đăng ký", "ưu đãi", "giảm giá"
- Không bullet points, không bold quá nhiều
- Subject line không được quá 50 ký tự

Trả về JSON thuần túy, không thêm text ngoài JSON theo format:
{"subject": "...", "body": "..."}
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const ai = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      persona_label, 
      top_problem_1, 
      top_problem_2, 
      primary_course_name, 
      why_fits, 
      source 
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // 1. Dùng Gemini để generate nội dung Email
    const prompt = `
--- THÔNG TIN NGƯỜI NHẬN ---
Tên                  : ${name || "bạn"}
Email                : ${email}
Persona              : ${persona_label}
Vấn đề ưu tiên #1   : ${top_problem_1}
Vấn đề ưu tiên #2   : ${top_problem_2}
Khoá được gợi ý     : ${primary_course_name}
Why it fits (từ P01) : ${why_fits}
Nguồn traffic        : ${source}

--- URL CẦN NHÚNG ---
Link xem kết quả đầy đủ: https://nedu.nhi.sg/ket-qua-ca-nhan
(URL này dẫn đến trang kết quả cá nhân, không phải trang khoá học)

--- GHI CHÚ ---
Email này là email đầu tiên trong chuỗi 14 ngày.
Mục tiêu duy nhất: khiến họ mở link xem kết quả đầy đủ.
Chưa bán gì cả.
    `;

    let emailSubject = "Kết quả bài phân tích của bạn";
    let emailBody = `Chào ${name || "bạn"},\n\nNhi thấy bạn đang trong giai đoạn ${persona_label}. Nhi đã gửi kết quả phân tích chi tiết của bạn qua hệ thống. Bạn có thể xem kết quả đầy đủ tại đây: https://nedu.nhi.sg/ket-qua-ca-nhan\n\nNhi`;

    try {
      const response = await ai.generateContent(prompt);
      const dataStr = response.response.text() || "{}";
      const parsed = JSON.parse(dataStr);
      if (parsed.subject) emailSubject = parsed.subject;
      if (parsed.body) emailBody = parsed.body;
    } catch (err) {
      console.error("Gemini Email Gen error:", err);
    }

    // 2. Gửi Email qua Resend
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Nhi Le <onboarding@resend.dev>',
          to: [email],
          subject: emailSubject,
          html: emailBody.replace(/\n/g, '<br/>')
        })
      });

      if (!resendResponse.ok) {
        console.error("Resend error:", await resendResponse.text());
      }
    } else {
      console.warn("RESEND_API_KEY is not set. Mocking email output:");
      console.log('To:', email);
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email API failed:", err);
    return NextResponse.json({ error: 'Failed to process email' }, { status: 500 });
  }
}
