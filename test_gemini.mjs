import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// read env from .env.local
const envPath = resolve('.env.local');
const envStr = readFileSync(envPath, 'utf8');
const keyMatch = envStr.match(/GEMINI_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1] : '';

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

const genAI = new GoogleGenerativeAI(key);
const ai = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: { responseMimeType: "application/json" }
});

const prompt = `
--- THÔNG TIN NGƯỜI NHẬN ---
Tên                  : Tân
Email                : tan@gmail.com
Persona              : Sinh viên / Học sinh
Vấn đề ưu tiên #1   : Test
Vấn đề ưu tiên #2   : Test
Khoá được gợi ý     : Test
Why it fits (từ P01) : Test
Nguồn traffic        : web

--- GHI CHÚ ---
Email này là email đầu tiên trong chuỗi 14 ngày.
Mục tiêu duy nhất: Khiến họ đồng cảm và tò mò về kết quả.
Chưa bán gì cả. KHÔNG ĐƯỢC CHÈN BẤT CỨ LINK NÀO.
`;

async function test() {
  try {
    const response = await ai.generateContent(prompt);
    console.log("SUCCESS:");
    console.log(response.response.text());
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}

test();
