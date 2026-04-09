import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
Bạn là Nhi Lê — founder Nedu Education, đang viết email cá nhân cho người vừa làm bài test.

GIỌNG VĂN BẮT BUỘC:
- Ấm, chân thật, mang tính chữa lành, như một người bạn tri kỷ viết thư.
- Dùng: "Nhi muốn nói...", "Bạn biết không...", "Điều mà Nhi nhận ra ở bạn..."
- Tránh tuyệt đối: "Chúc mừng", "Thân chào", "Trân trọng", "Đây là cơ hội"
- Không emoji trong subject line
- Tối đa 200 chữ trong body — ngắn hơn thì tốt hơn.
- Phải ngắt đoạn nhỏ (1-2 câu mỗi đoạn) và dùng "\\n\\n" để ngắt dòng cho thoáng đãng.

CẤU TRÚC EMAIL — giữ đúng thứ tự này:
1. Mở đầu: 1 câu nhận ra giai đoạn họ đang ở, không phán xét, không sáo rỗng
2. Insight sâu về vấn đề #1: 2 câu, đi sâu hơn những gì họ đã biết về mình
3. Câu kết nối nhân văn: "Nhi đã gặp nhiều người ở giai đoạn này..."
4. Teaser kết quả: 1 câu gợi mở về kết quả đầy đủ — chưa reveal, chỉ tạo tò mò
5. Ký tên: "Nhi" — chỉ vậy thôi (không tự tạo link CTA, hệ thống sẽ tự thêm nút!)

TUYỆT ĐỐI KHÔNG:
- KHÔNG tự chèn URL hay viết "Click vào link sau" (Hệ thống sẽ gắn nút riêng).
- KHÔNG đề cập giá khoá học trong email này
- KHÔNG dùng chữ "mua", "đăng ký", "ưu đãi", "giảm giá"
- KHÔNG bullet points, không in đậm quá nhiều
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
      persona_id,
      top_problem_1, 
      top_problem_2, 
      primary_course_name,
      primary_course_id,
      primary_course_url,
      why_fits, 
      source,
      occupation,
      feeling,
      dob,
      birthTime
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

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

--- GHI CHÚ ---
Email này là email đầu tiên trong chuỗi 14 ngày.
Mục tiêu duy nhất: Khiến họ đồng cảm và tò mò về kết quả.
Chưa bán gì cả. KHÔNG ĐƯỢC CHÈN BẤT CỨ LINK NÀO.
    `;

    let emailSubject = "Kết quả bài phân tích của bạn";
    let emailBody = `Chào ${name || "bạn"},\n\nNhi thấy bạn đang trong giai đoạn ${persona_label}...\n\nNhi`;

    try {
      const response = await ai.generateContent(prompt);
      let dataStr = response.response.text() || "{}";
      // Xoá markdown json block nếu AI lỡ sinh ra
      dataStr = dataStr.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(dataStr);
      if (parsed.subject) emailSubject = parsed.subject;
      if (parsed.body) {
         // Chèn lời chào vào đầu nếu AI chưa có
         if (!parsed.body.toLowerCase().startsWith("chào") && !parsed.body.toLowerCase().startsWith("gửi")) {
             emailBody = `Chào ${name || "bạn"},\n\n` + parsed.body;
         } else {
             emailBody = parsed.body;
         }
      }
    } catch (err) {
      console.error("Gemini Email Gen error:", err);
    }

    // Format body into HTML paragraphs
    const formattedParagraphs = emailBody
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`)
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #4A4238; line-height: 1.6;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(139, 94, 60, 0.06);">
    <!-- Decorative Header -->
    <div style="height: 6px; background: linear-gradient(90deg, #F0EBE5, #8B5E3C, #F0EBE5);"></div>
    
    <div style="padding: 48px 32px 40px;">
      <!-- Main Content -->
      <div style="font-size: 15px; color: #5C544D; letter-spacing: 0.2px;">
        ${formattedParagraphs}
      </div>
      
      <!-- Call to Action -->
      <div style="margin-top: 40px; text-align: center;">
        <a href="https://landing-lane-connect.vercel.app/" style="display: inline-block; background-color: #8B5E3C; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 500; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(139, 94, 60, 0.2);">
          Xem kết quả đầy đủ
        </a>
      </div>
      
      <!-- Footer Note -->
      <div style="margin-top: 48px; border-top: 1px solid #F5F2F0; padding-top: 24px; text-align: center;">
        <p style="font-size: 12px; color: #A39A92; margin: 0;">
          Gửi từ <span style="font-weight: 500; color: #8B5E3C;">Nedu Education</span> bằng tất cả sự chân thành.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // 2. Gửi Email qua Resend
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Nhi Le <hi@test.nhi.sg>',
          to: [email],
          subject: emailSubject,
          html: htmlContent
        })
      });

      if (!resendResponse.ok) {
        console.error("Resend error:", await resendResponse.text());
      }
    } else {
      console.warn("RESEND_API_KEY is not set.");
    }

    // 3. Thực hiện lưu vào DB 
    try {
      const { supabase } = await import('@/lib/supabase');
      const crypto = await import('crypto');

      // Bước 1: INSERT quiz_submissions
      const { data: quiz, error: quizError } = await supabase.from('quiz_submissions').insert({
        visitor_email: email, 
        visitor_name: name,
        persona_id, 
        result_json: { 
          primary_course_name, 
          why_fits,
          top_problem_1, 
          top_problem_2 
        },
        answers: { occupation, feeling },
        utm_source: source, 
        identity_status: 'anonymous'
      }).select('id').single();

      if (quizError) throw quizError;

      // Bước 2: INSERT leads
      const report_token = crypto.randomUUID();
      const { data: lead, error: leadError } = await supabase.from('leads').insert({
        quiz_persona: persona_id, 
        job: occupation, 
        goal: feeling,
        dob, 
        birth_time: birthTime,
        courses: primary_course_id ? [primary_course_id] : [],
        source_type: 'inbound',
        sla_started_at: new Date().toISOString(),
        metadata: { 
          report_token, 
          primary_course_name,
          primary_course_url, 
          why_fits,
          has_advanced: false, 
          persona_label 
        }
      }).select('id').single();

      if (leadError) throw leadError;

      // Bước 3: UPDATE quiz_submissions.lead_id
      const { error: updateError } = await supabase.from('quiz_submissions')
        .update({ lead_id: lead.id }).eq('id', quiz.id);

      if (updateError) throw updateError;
        
    } catch (dbError) {
      // Bỏ qua lỗi DB, không throw vì email đã gửi thành công
      console.error("Supabase Error after sending email:", dbError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email API failed:", err);
    return NextResponse.json({ error: 'Failed to process email' }, { status: 500 });
  }
}
