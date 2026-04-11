import { NextResponse } from 'next/server';
import { processSendResult } from '@/features/send-result/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    await processSendResult(body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send Result API failed:', err);
    return NextResponse.json({ error: 'Failed to process email' }, { status: 500 });
  }
}
