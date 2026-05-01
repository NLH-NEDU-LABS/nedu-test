import { NextRequest, NextResponse } from 'next/server';
import { getReport } from '@/features/report/service';
import { getCorsHeaders } from '@/config/cors';

/**
 * GET /api/report/[token]
 *
 * Returns quiz results: MaxDiff scores, AI recommendation, MBTI, Enneagram.
 * Bazi/Numerology data is served separately at /api/bazi-numerology/[token].
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const { token } = await params;
  const payload = await getReport(token);

  if (!payload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(payload, { headers: corsHeaders });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}
