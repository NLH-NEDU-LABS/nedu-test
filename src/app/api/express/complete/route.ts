import { NextResponse } from 'next/server';
import { completeExpressFlow } from '@/features/express/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, consent } = body;

    if (!token || typeof consent !== 'boolean') {
      return NextResponse.json({ error: 'Missing token or consent flag' }, { status: 400 });
    }

    await completeExpressFlow(token, consent);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Express complete API failed:', err);
    return NextResponse.json({ error: 'Failed to complete express flow' }, { status: 500 });
  }
}
