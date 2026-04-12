import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { persona_id, source } = body;

    const { error } = await supabase
      .from('quiz_submissions')
      .insert({
        visitor_email: `anonymous_consent_${Date.now()}@nedu.local`,
        visitor_name: 'Anonymous (Consent Only)',
        persona_id: persona_id || 'unknown',
        result_json: { status: 'consented_only' },
        answers: { has_consented: true },
        utm_source: source || 'web',
        identity_status: 'anonymous',
      });

    if (error) {
      console.error('Consent Tracking DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Consent Tracking API failed:', err);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
