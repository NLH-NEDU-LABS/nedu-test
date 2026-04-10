import { NextResponse } from 'next/server';
import { getGeminiModel, geminiGenerateJSON } from '@/lib/gemini';



const SYSTEM_PROMPT = `Bạn là hệ thống gợi ý khoá học của Nedu Education.
Nhiệm vụ duy nhất: đọc profile người dùng và chọn đúng 1 khoá học chủ lực và 1 khoá học dự phòng phù hợp nhất từ danh sách hợp lệ dưới đây:

DANH SÁCH KHOÁ HỌC HỢP LỆ (BẮT BUỘC CHỈ SỬ DỤNG CÁC ID VÀ URL NÀY):
- suc-manh-vo-han (Sức Mạnh Vô Hạn): Offline. Dành cho doanh nhân Việt cần chiến lược đột phá, mở rộng thị trường, xây nền tảng kinh doanh vươn tầm. URL: https://nedu.nhi.sg/program-offline/suc-manh-vo-han
- la-chinh-minh (Là Chính Mình): Offline 3.5 ngày. Đánh thức sức mạnh nội tại, gỡ bỏ rào cản tâm lý sống rực rỡ trọn vẹn. Thích hợp chữa lành, tìm lại bản thân. URL: https://nedu.nhi.sg/program-offline/la-chinh-minh
- thuong-hieu-cua-ban (Thương Hiệu Của Bạn): Online. Kiến thức cơ bản cho người muốn mở doanh nghiệp/cải tổ. Kỷ nguyên AI. 4 ngày. URL: https://nedu.nhi.sg/program-online/thuong-hieu-cua-ban
- cuoc-song-cua-ban (Cuộc Sống Của Bạn): Online. Khám phá và định hình lại cuộc sống, tìm ra con đường phát triển bản thân. Nhẹ nhàng hơn, tìm hướng đi. URL: https://nedu.nhi.sg/program-online/cuoc-song-cua-ban
- thu-thach-30-ngay (Thử Thách 30 Ngày): Online. Dành cho người biết nhiều ráo lý thuyết nhưng thiếu hành động, trì hoãn. Tạo môi trường kỷ luật. URL: https://nedu.nhi.sg/program-online/thu-thach-30-ngay

QUY TẮC BẮT BUỘC:
1. KHÔNG tạo tên khóa học mới. Phải dùng ID, Name, và URL như danh sách trên.
2. Nếu người dùng quan tâm kinh doanh/doanh nghiệp: Chọn "suc-manh-vo-han" (Offline, quy mô lớn) hoặc "thuong-hieu-cua-ban" (Online, mới bắt đầu).
3. Nếu người dùng cần vượt qua trì hoãn, thói quen xấu: Ưu tiên "thu-thach-30-ngay".
4. Nếu lạc lối, muốn chữa lành tâm lý sâu: "la-chinh-minh" (Offline) hoặc "cuoc-song-cua-ban" (Online).
5. Luôn trả về 1 Primary và 1 Backup. Secondary phải tương tự về độ fit nhưng có format hoặc chi phí dễ tiếp cận hơn so với Primary (ví dụ Primary Offline thì Backup Online).

OUTPUT FORMAT — trả về đúng JSON thuần tuý này, không bọc bởi Markdown (không dùng \`\`\`json):
{
  "primary_course_id": "...",
  "primary_course_name": "...",
  "primary_course_url": "...",
  "backup_course_id": "...",
  "backup_course_name": "...",
  "backup_course_url": "...",
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
          primary_course_id: "cuoc-song-cua-ban",
          primary_course_name: "Cuộc Sống Của Bạn",
          primary_course_url: "https://nedu.nhi.sg/program-online/cuoc-song-cua-ban",
          backup_course_id: "thu-thach-30-ngay",
          backup_course_name: "Thử Thách 30 Ngày",
          backup_course_url: "https://nedu.nhi.sg/program-online/thu-thach-30-ngay",
          why_fits: "Bạn đang cần định hướng cho bản thân trước khi hành động. Khóa Cuộc Sống Của Bạn giúp bạn vạch rõ đâu là những giá trị thực sự cho mình.",
          learning_style_note: "Học Online chủ động, thích hợp gỡ rối giai đoạn đầu.",
          urgency_message: "Hãy bắt đầu đặt nền tảng sớm.",
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

    const model = getGeminiModel({ responseJson: true });
    
    // Combining system prompt and user input
    const fullPrompt = SYSTEM_PROMPT + "\n\n" + userInput;

    let aiRecommendation;
    try {
      aiRecommendation = await geminiGenerateJSON(model, fullPrompt);
    } catch(e) {
      console.warn('Gemini recommendation failed after retries, using fallback');
      aiRecommendation = {
        primary_course_id: "cuoc-song-cua-ban",
        primary_course_name: "Cuộc Sống Của Bạn",
        primary_course_url: "https://nedu.nhi.sg/program-online/cuoc-song-cua-ban",
        backup_course_id: "thu-thach-30-ngay",
        backup_course_name: "Thử Thách 30 Ngày",
        backup_course_url: "https://nedu.nhi.sg/program-online/thu-thach-30-ngay",
        why_fits: "Hệ thống đang chuẩn hóa gợi ý cho bạn.",
        learning_style_note: "Bắt đầu với tự học khám phá bản thân.",
        urgency_message: "Hành động ngay khi bạn lơ lửng.",
        confidence_score: 0.5
      };
    }

    return NextResponse.json(aiRecommendation);

  } catch (error: any) {
    console.error('Gemini Recommendation Error:', error);
    return NextResponse.json({
      primary_course_id: "cuoc-song-cua-ban",
      primary_course_name: "Cuộc Sống Của Bạn",
      primary_course_url: "https://nedu.nhi.sg/program-online/cuoc-song-cua-ban",
      backup_course_id: "thu-thach-30-ngay",
      backup_course_name: "Thử Thách 30 Ngày",
      backup_course_url: "https://nedu.nhi.sg/program-online/thu-thach-30-ngay",
      why_fits: "Có vẻ kết nối có gián đoạn tạm thời. Khóa Cuộc sống của bạn là khởi đầu an toàn.",
      learning_style_note: "Học mọi lúc mọi nơi.",
      urgency_message: "Liên hệ Hotline Nedu nếu cần điểm chuẩn đoán.",
      confidence_score: 0.5
    });
  }
}
