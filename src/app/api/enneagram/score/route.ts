import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const ENNEAGRAM_NAMES: Record<string, string> = {
  "1": "Người Cầu Toàn (The Reformer)",
  "2": "Người Giúp Đỡ (The Helper)",
  "3": "Người Thành Đạt (The Achiever)",
  "4": "Người Cá Tính (The Individualist)",
  "5": "Người Quan Sát (The Investigator)",
  "6": "Người Trung Thành (The Loyalist)",
  "7": "Người Nhiệt Huyết (The Enthusiast)",
  "8": "Người Thách Thức (The Challenger)",
  "9": "Người Hòa Giải (The Peacemaker)",
};

export async function POST(req: Request) {
  try {
    const { token, enneagram_type } = await req.json();

    if (!token || !enneagram_type) {
      return NextResponse.json({ error: 'Missing token or enneagram_type' }, { status: 400 });
    }

    // 1. Query leads lấy persona_label + goal để personalize description
    const { data: lead, error: leadError } = await supabase.from("leads")
      .select("id, dob, metadata, job, goal")
      .eq("metadata->>report_token", token)
      .single();

    if (leadError || !lead) {
      console.error("Error finding lead:", leadError);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const metadata = (lead.metadata || {}) as any;
    const persona_label = metadata.persona_label || "Chưa xác định";
    const goal = lead.goal || "Chưa làm rõ";
    
    // Đảm bảo type là chuỗi để lookup an toàn từ dictionary
    const typeStr = String(enneagram_type);
    const enneagram_name = ENNEAGRAM_NAMES[typeStr] || `Type ${typeStr}`;

    // 2. Gọi Gemini generate description
    const aiPrompt = `
Bạn là chuyên gia Enneagram và tâm lý học.
User có Enneagram Type: ${typeStr} (${enneagram_name})
Persona Nedu: ${persona_label}
Vấn đề ưu tiên: ${goal}

Viết 2-3 đoạn ngắn (tối đa 150 chữ) giải thích Type ${typeStr} trong bối cảnh thách thức hiện tại của người này.
Văn phong: ấm, sâu sắc, không phán xét.
Dùng "bạn". Không bullet points.
Trả về JSON: { "description": "..." }
    `;

    const ai = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    let enneagram_desc = "";
    try {
      const response = await ai.generateContent(aiPrompt);
      let dataStr = response.response.text() || "{}";
      dataStr = dataStr.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(dataStr);
      if (parsed.description) {
        enneagram_desc = parsed.description;
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      // Fallback description in case of AI failure
      enneagram_desc = `Enneagram Type ${typeStr} (${enneagram_name}) phản ánh nhiều sâu thẳm bên trong bạn. Hiện tại AI đang bận xử lý hệ thống nên chưa thể cung cấp diễn giải chi tiết ngay lúc này.`;
    }

    // 3. UPDATE leads.metadata { enneagram_type, enneagram_desc }
    const newMetadata = {
      ...metadata,
      enneagram_type: typeStr,
      enneagram_desc
    };

    const { error: updateError } = await supabase
      .from('leads')
      .update({ metadata: newMetadata })
      .eq('id', lead.id);

    if (updateError) {
      console.error("Update DB error:", updateError);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    // 4. UPSERT personal_profiles
    const { data: existingProfile } = await supabase
      .from('personal_profiles')
      .select('id, profile_data')
      .eq('lead_id', lead.id)
      .maybeSingle();

    const currentProfileData = (existingProfile?.profile_data as Record<string, any>) || {};
    const newProfileData = {
      ...currentProfileData,
      enneagram: { type: typeStr, desc: enneagram_desc }
    };

    if (existingProfile) {
      await supabase.from('personal_profiles')
        .update({ profile_data: newProfileData })
        .eq('id', existingProfile.id);
    } else {
      await supabase.from('personal_profiles')
        .insert({
          lead_id: lead.id,
          profile_data: newProfileData,
          source_dob: lead.dob || null
        });
    }



    // 4. Return { enneagram_type, enneagram_desc }
    return NextResponse.json({ enneagram_type: typeStr, enneagram_desc });
  } catch (err: any) {
    console.error("Enneagram Score API Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
