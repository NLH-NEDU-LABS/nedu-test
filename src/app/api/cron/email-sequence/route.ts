import { NextRequest, NextResponse } from 'next/server';
import { processSequence } from '@/features/email-sequence/service';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processSequence();

    if (result.total === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No leads to process today' });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Email sequence cron failed:', err);
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
  }
}
