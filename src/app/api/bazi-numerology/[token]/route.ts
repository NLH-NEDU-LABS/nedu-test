import { NextRequest, NextResponse } from 'next/server';
import { getBaziNumerologyReport } from '@/features/report/service';

/**
 * GET /api/bazi-numerology/[token]
 *
 * Returns Bazi + Numerology data for a lead identified by report_token.
 * Separated from /api/report/[token] which handles quiz results only.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = await getBaziNumerologyReport(token);

  if (!payload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(payload);
}
