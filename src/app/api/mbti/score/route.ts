import { NextResponse } from 'next/server';
import { scoreAndDescribe } from '@/features/mbti/service';

export async function POST(req: Request) {
  try {
    const { token, mbti_type } = await req.json();

    if (!token || !mbti_type) {
      return NextResponse.json({ error: 'Missing token or mbti_type' }, { status: 400 });
    }

    const result = await scoreAndDescribe({ token, mbti_type });
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.status === 404) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    console.error('MBTI Score API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
