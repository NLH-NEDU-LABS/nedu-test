import { NextResponse } from 'next/server';
import { recommend } from '@/features/maxdiff/service';
import { FALLBACK_RECOMMENDATION } from '@/config/constants';

export async function POST(request: Request) {
  try {
    const {
      persona_label,
      persona_id,
      top_problem_1,
      top_problem_2,
      mbti_type,
      occupation,
      source,
      country,
    } = await request.json();

    if (!persona_id || !top_problem_1) {
      return NextResponse.json({ error: 'Missing required inputs' }, { status: 400 });
    }

    const result = await recommend({
      persona_label,
      persona_id,
      top_problem_1,
      top_problem_2,
      mbti_type,
      occupation,
      source,
      country,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Recommendation API Error:', error);
    return NextResponse.json({ ...FALLBACK_RECOMMENDATION, confidence_score: 0.5 });
  }
}
