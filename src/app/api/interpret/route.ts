import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { payload, type } = await req.json();

    if (!payload || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize the API inside the request to ensure latest env var is picked up
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error("NO API KEY CONFIGURED!");
      return NextResponse.json({ error: 'System missing API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (type === 'bazi') {
      prompt = `Bạn là một chuyên gia luận giải Bát Tự (Tứ Trụ) uyên bác, thấu hiểu tâm lý hiện đại. 
Hãy đọc dữ liệu Bát Tự sau đây và đưa ra một bản luận giải ngắn gọn (khoảng 3-4 đoạn, tổng tối đa 250 chữ), sử dụng văn phong nhẹ nhàng, sâu sắc, chữa lành và dễ hiểu đối với người không rành thuật số. 
Tập trung vào:
1. Tổng quan về Nhật Chủ (bản thể cốt lõi) và ngũ hành.
2. Tố chất, điểm mạnh bẩm sinh và những góc khuất cần chú ý.
3. Một lời khuyên ngắn gọn để cân bằng năng lượng trong cuộc sống hiện đại.
KHÔNG giải thích lại các thuật ngữ phức tạp, chỉ đưa ra kết luận. KHÔNG gạch đầu dòng kiểu máy móc, hãy viết thành văn xuôi mạch lạc. Trình bày bằng Markdown thuần (dùng in đậm, in nghiêng cho ý chính).

Dữ liệu Bát Tự (JSON):
${JSON.stringify(payload)}`;
    } else if (type === 'numerology') {
      prompt = `Bạn là một chuyên gia Thần Số Học (Pythagorean Numerology), am hiểu tâm lý hiện đại.
Hãy đọc dữ liệu Thần Số Học sau đây và đưa ra bản luận giải ngắn gọn (3-4 đoạn, tối đa 250 chữ), văn phong nhẹ nhàng, sâu sắc và dễ hiểu.
Tập trung vào:
1. Số Đường Đời (life_path_number): Đặc điểm tính cách cốt lõi, hướng đi lớn trong đời.
2. Mối tương quan giữa Số Sứ Mệnh (destiny_number) và Số Linh Hồn (soul_urge_number): Khát khao bên trong vs sứ mệnh bên ngoài.
3. Lời khuyên cá nhân hóa để sống hài hòa hơn dựa trên bộ số.
KHÔNG giải thích thuật ngữ phức tạp. KHÔNG gạch đầu dòng. Viết văn xuôi mạch lạc. Trình bày bằng Markdown (in đậm, in nghiêng cho ý chính).

Dữ liệu Thần Số Học (JSON):
${JSON.stringify(payload)}`;
    } else {
      return NextResponse.json({ error: 'Unsupported type' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      interpretation: text
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate interpretation', details: error.message }, { status: 500 });
  }
}
