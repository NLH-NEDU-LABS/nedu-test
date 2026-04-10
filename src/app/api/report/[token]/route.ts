import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function setCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://test.nedu.vn');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return setCORSHeaders(NextResponse.json({}));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const { data: lead } = await supabase
    .from('leads')
    .select('metadata, personal_profiles ( profile_data )')
    .eq("metadata->>report_token", resolvedParams.token)
    .single();

  if (!lead) {
    return setCORSHeaders(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  }

  const profileData = Array.isArray(lead.personal_profiles) 
    ? (lead.personal_profiles as { profile_data?: unknown }[])[0]?.profile_data 
    : (lead.personal_profiles as { profile_data?: unknown })?.profile_data;

  // Assuming metadata is an object containing these properties
  const metadata = (lead.metadata || {}) as Record<string, unknown>;
  const profileRecord = (profileData || {}) as Record<string, unknown>;

  const bazi_data = profileRecord.bazi || null;
  const numerology_data = profileRecord.numerology || null;

  const payload = {
    persona_label: metadata.persona_label || null,
    top_problem_1: metadata.top_problem_1 || null,
    top_problem_2: metadata.top_problem_2 || null,
    primary_course_name: metadata.primary_course_name || null,
    primary_course_url: metadata.primary_course_url || null,
    why_fits: metadata.why_fits || null,
    mbti_type: metadata.mbti_type || null,
    mbti_desc: metadata.mbti_desc || null,
    enneagram_type: metadata.enneagram_type || null,
    enneagram_desc: metadata.enneagram_desc || null,
    bazi_data,
    numerology_data,
    has_bazi: !!bazi_data
  };

  return setCORSHeaders(NextResponse.json(payload));
}
