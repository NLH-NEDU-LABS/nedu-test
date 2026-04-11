/**
 * Next.js Edge Middleware — runs before every matched API route.
 *
 * Responsibilities:
 *  1. CORS: enforce allowlist, handle OPTIONS preflight
 *  2. Rate limiting: per-route limits via in-memory sliding window
 *     Scale-up path: swap `middleware/rate-limit.ts` for @upstash/ratelimit
 *
 * NOTE: Next.js middleware runs in the Edge Runtime.
 * Only use Web APIs (no Node builtins like 'crypto', 'fs').
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/config/cors';
import {
  scoringLimiter,
  sendResultLimiter,
  reportLimiter,
  cronLimiter,
} from '@/middleware/rate-limit';

type Limiter = { check: (key: string) => { allowed: boolean; resetAt: number; remaining: number } };

// Routes that require rate limiting, mapped to their limiter
const RATE_LIMIT_MAP: Array<{ pattern: RegExp; limiter: Limiter }> = [
  { pattern: /^\/api\/(maxdiff|recommend|calculate|interpret|mbti|enneagram)/, limiter: scoringLimiter },
  { pattern: /^\/api\/send-result/, limiter: sendResultLimiter },
  { pattern: /^\/api\/(report|bazi-numerology)\//, limiter: reportLimiter },
  { pattern: /^\/api\/cron\//, limiter: cronLimiter },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // 1. Handle OPTIONS preflight — respond immediately
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // 2. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';

  for (const { pattern, limiter } of RATE_LIMIT_MAP) {
    if (pattern.test(pathname)) {
      const result = limiter.check(ip);
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Too Many Requests', retryAfter },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              ...getCorsHeaders(origin),
            },
          }
        );
      }
      break; // Only apply first matching limiter
    }
  }

  // 3. Attach CORS headers to every API response
  const response = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
