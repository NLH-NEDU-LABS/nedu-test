import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Bạn là hệ thống gợi ý khoá học của Nedu Education.
Nhiệm vụ duy nhất: đọc profile người dùng và chọn đúng 1 khoá học phù hợp nhất từ danh sách hợp lệ.
Trả về JSON thuần túy. Không thêm text, markdown, hay giải thích ngoài JSON.

DANH SÁCH KHOÁ HỌC HỢP LỆ — chỉ được dùng các id này:
- cohort-k13        : Thiết Kế Bản Thân Toàn Diện (8 tuần, Zoom, nhóm 15-20, 8.500.000đ)
- retreat           : Tĩnh Tâm & Lãnh Đạo Nội Tâm (11 ngày, offline, 18.000.000đ)
- eq-od             : Emotional Intelligence On-Demand (tự học, 2.500.000đ)
- meta-od           : Metacognition & Tư Duy Hệ Thống On-Demand (tự học, 2.500.000đ)
- bazi-od           : BaZi Ứng Dụng On-Demand (tự học, 3.500.000đ)
- coaching-6m       : Coaching 1:1 Nhi Lê 6 tháng (25.000.000đ)
- coaching-3m       : Coaching 1:1 Nhi Lê 3 tháng (14.000.000đ)
- workshop-journal  : Journaling Workshop 1 ngày (1.200.000đ)
- workshop-leader   : Inner Leadership Workshop 2 ngày (2.800.000đ)

QUY TẮC BẮT BUỘC — vi phạm bất kỳ quy tắc nào là kết quả sai:
1. KHÔNG tự tạo tên khoá học mới. Chỉ dùng id trong danh sách trên.
2. retreat → chỉ recommend khi persona là Quản lý / Lãnh đạo / Doanh nhân HOẶC top_problem liên quan burnout / chuyển hướng sự nghiệp / cần không gian sâu.
3. coaching → chỉ recommend khi occupation cho thấy thu nhập ổn định (manager, director, founder, doctor, lawyer...) VÀ persona là Quản lý hoặc Lãnh đạo.
4. on-demand (eq-od, meta-od, bazi-od) → ưu tiên khi user ở nước ngoài (source=youtube+overseas), lịch không ổn định, hoặc muốn tự học trước khi commit.
5. Nếu confidence_score < 0.6 → primary_course_id phải là cohort-k13 (khoá default an toàn nhất).
6. backup_course_id phải khác primary_course_id và phải là khoá phù hợp thứ 2.

OUTPUT FORMAT — trả về đúng JSON này, không thêm bất cứ thứ gì:
{
  "primary_course_id": "...",
  "primary_course_name": "...",
  "backup_course_id": "...",
  "backup_course_name": "...",
  "why_fits": "...",
  "learning_style_note": "...",
  "urgency_message": "...",
  "confidence_score": 0.0
}`;

export async function POST(request: Request) {
  try {
    const { 
      persona_label, 
      persona_id, 
      top_problem_1, 
      top_problem_2,
      mbti_type = "chưa có",
      occupation = "chưa xác định",
      source = "organic",
      country = "Việt Nam"
    } = await request.json();

    if (!persona_id || !top_problem_1 || !process.env.GEMINI_API_KEY) {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback for isolated dev environment without API key
        return NextResponse.json({
          primary_course_id: "cohort-k13",
          primary_course_name: "Thiết Kế Bản Thân Toàn Diện",
          backup_course_id: "eq-od",
          backup_course_name: "Emotional Intelligence On-Demand",
          why_fits: "Bạn đang ở giai đoạn mà mọi thứ bên ngoài trông ổn — nhưng bên trong thiếu hướng. Cohort K13 không dạy lý thuyết, nó giúp bạn ngồi xuống và thực sự nhìn rõ mình muốn đi đâu.",
          learning_style_note: "Học nhóm nhỏ với người cùng giai đoạn sẽ giúp bạn không cảm thấy một mình trong quá trình chuyển hướng.",
          urgency_message: "Cohort K13 khai giảng 01/06 — chỉ còn 8 chỗ trong nhóm 20 người.",
          confidence_score: 0.82
        });
      }
      return NextResponse.json({ error: 'Missing required inputs' }, { status: 400 });
    }

    const userInput = `INPUT
persona_label    : ${persona_label}
persona_id       : ${persona_id}
top_problem_1    : ${top_problem_1}
top_problem_2    : ${top_problem_2}
mbti_type        : ${mbti_type}
occupation       : ${occupation}
source           : ${source}
country          : ${country}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });
    
    // Combining system prompt and user input
    const fullPrompt = SYSTEM_PROMPT + "\n\n" + userInput;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON strictly
    let aiRecommendation;
    try {
      aiRecommendation = JSON.parse(responseText);
    } catch(e) {
      // Very basic fallback if gemini didn't return perfect JSON
      aiRecommendation = {
        primary_course_id: "cohort-k13",
        primary_course_name: "Thiết Kế Bản Thân Toàn Diện",
        backup_course_id: "eq-od",
        backup_course_name: "Emotional Intelligence On-Demand",
        why_fits: "Hệ thống đang chuẩn hóa kết quả cho bạn.",
        learning_style_note: "Học nhóm nhỏ với người cùng định hướng.",
        urgency_message: "Đang mở đăng ký.",
        confidence_score: 0.5
      };
    }

    return NextResponse.json(aiRecommendation);

  } catch (error: any) {
    console.error('Gemini Recommendation Error:', error);
    // Fallback if Gemini completely fails (e.g., rate limit, invalid key)
    return NextResponse.json({
      primary_course_id: "cohort-k13",
      primary_course_name: "Thiết Kế Bản Thân Toàn Diện",
      backup_course_id: "eq-od",
      backup_course_name: "Emotional Intelligence On-Demand",
      why_fits: "Có vẻ kết nối với hệ thống tư vấn đang gặp gián đoạn tạm thời. Cohort K13 là gợi ý an toàn nhất để giúp bạn sắp xếp lại bản thân.",
      learning_style_note: "Học theo nhóm giúp duy trì động lực.",
      urgency_message: "Vui lòng liên hệ hỗ trợ Nedu nếu cần điểm chuẩn đoán chi tiết.",
      confidence_score: 0.5
    });
  }
}
