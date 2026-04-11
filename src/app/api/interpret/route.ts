import { NextResponse } from 'next/server';
import { interpret } from '@/features/bazi-numerology/service';

export async function POST(req: Request) {
  try {
    const { payload, type } = await req.json();

    if (!payload || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'System missing API key' }, { status: 500 });
    }

    if (type !== 'bazi' && type !== 'numerology') {
      return NextResponse.json({ error: 'Unsupported type' }, { status: 400 });
    }

    const interpretation = await interpret(type, payload);

    return NextResponse.json({ success: true, interpretation });
  } catch (error: any) {
    console.error('Interpret API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interpretation', details: error.message },
      { status: 500 }
    );
  }
}
