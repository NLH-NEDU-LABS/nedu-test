import { NextResponse } from 'next/server';
import { processSendResult } from '@/features/send-result/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const result = await processSendResult(body);
    return NextResponse.json({ success: true, report_token: result.report_token });
  } catch (err: any) {
    console.error('Send Result API failed:', err);
    return NextResponse.json({ error: 'Failed to process email' }, { status: 500 });
  }
}
