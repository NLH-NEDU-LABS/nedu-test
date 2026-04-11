import { NextResponse } from 'next/server';
import { scoreAndDescribe } from '@/features/enneagram/service';

export async function POST(req: Request) {
  try {
    const { token, enneagram_type } = await req.json();

    if (!token || !enneagram_type) {
      return NextResponse.json({ error: 'Missing token or enneagram_type' }, { status: 400 });
    }

    const result = await scoreAndDescribe({ token, enneagram_type });
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.status === 404) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    console.error('Enneagram Score API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
