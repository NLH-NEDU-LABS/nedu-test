import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MBTI_NAMES: Record<string, string> = {
  "ISTJ": "Người Kiên Định",
  "ISFJ": "Người Chăm Sóc",
  "INFJ": "Người Tầm Nhìn",
  "INTJ": "Người Chiến Lược",
  "ISTP": "Người Giải Quyết Vấn Đề",
  "ISFP": "Người Nghệ Sĩ",
  "INFP": "Người Lý Tưởng Hóa",
  "INTP": "Nhà Tư Tưởng",
  "ESTP": "Người Mạo Hiểm",
  "ESFP": "Người Vui Vẻ",
  "ENFP": "Người Nhiệt Huyết",
  "ENTP": "Người Sáng Tạo",
  "ESTJ": "Người Quản Lý",
  "ESFJ": "Người Tận Tâm",
  "ENFJ": "Người Lãnh Đạo Truyền Cảm Hứng",
  "ENTJ": "Người Chỉ Huy"
};

export async function POST(req: Request) {
  try {
    const { token, mbti_type } = await req.json();

    if (!token || !mbti_type) {
      return NextResponse.json({ error: 'Missing token or mbti_type' }, { status: 400 });
    }

    // 1. Query leads lấy persona_label + goal để personalize description
    const { data: lead, error: leadError } = await supabase.from("leads")
      .select("id, metadata, job, goal")
      .eq("metadata->>report_token", token)
      .single();

    if (leadError || !lead) {
      console.error("Error finding lead:", leadError);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const metadata = (lead.metadata || {}) as any;
    const persona_label = metadata.persona_label || "Chưa xác định";
    const goal = lead.goal || "Chưa làm rõ";
    const mbti_name = MBTI_NAMES[mbti_type] || mbti_type;

    // 2. Gọi Gemini generate description
    const aiPrompt = `
Bạn là chuyên gia tâm lý học ứng dụng.
User có MBTI type: ${mbti_type} (${mbti_name})
Persona Nedu: ${persona_label}
Vấn đề ưu tiên: ${goal}

Viết 2-3 đoạn ngắn (tối đa 150 chữ) giải thích type ${mbti_type} trong bối cảnh cuộc sống và thách thức của người này.
Văn phong: ấm, chữa lành, không học thuật.
Dùng "bạn" khi xưng hô. Không bullet points.
Trả về JSON: { "description": "..." }
    `;

    const ai = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    let mbti_desc = "";
    try {
      const response = await ai.generateContent(aiPrompt);
      let dataStr = response.response.text() || "{}";
      dataStr = dataStr.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(dataStr);
      if (parsed.description) {
        mbti_desc = parsed.description;
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      // Fallback description in case of AI failure
      mbti_desc = `Kiểu tính cách ${mbti_type} (${mbti_name}) là những người rất đặc biệt. Hệ thống hiện tại đang xử lý tác vụ nên chưa thể cung cấp diễn giải sâu hơn lúc này.`;
    }

    // 3. UPDATE leads.metadata { mbti_type, mbti_desc }
    const newMetadata = {
      ...metadata,
      mbti_type,
      mbti_desc
    };

    const { error: updateError } = await supabase
      .from('leads')
      .update({ metadata: newMetadata })
      .eq('id', lead.id);

    if (updateError) {
      console.error("Update DB error:", updateError);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    // 4. Return { mbti_type, mbti_desc }
    return NextResponse.json({ mbti_type, mbti_desc });
  } catch (err: any) {
    console.error("MBTI Score API Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
