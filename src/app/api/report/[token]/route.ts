import { NextRequest, NextResponse } from 'next/server';
import { getReport } from '@/features/report/service';

/**
 * GET /api/report/[token]
 *
 * Returns quiz results: MaxDiff scores, AI recommendation, MBTI, Enneagram.
 * Bazi/Numerology data is served separately at /api/bazi-numerology/[token].
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = await getReport(token);

  if (!payload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(payload);
}
