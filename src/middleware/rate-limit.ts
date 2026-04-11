/**
 * In-memory sliding-window rate limiter for Next.js API routes.
 * Scale-up path: swap this implementation for @upstash/ratelimit (Redis-backed).
 *
 * Usage:
 *   import { createRateLimiter } from '@/middleware/rate-limit';
 *
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *
 *   export async function POST(req: NextRequest) {
 *     const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
 *     const result = limiter.check(ip);
 *     if (!result.allowed) {
 *       return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
 *     }
 *     // ...handler logic
 *   }
 */

interface RateLimiterOptions {
  /** Time window in milliseconds (e.g. 60_000 for 1 minute) */
  windowMs: number;
  /** Max requests allowed per window per key */
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Epoch ms when the window resets */
  resetAt: number;
}

interface WindowData {
  /** Request timestamps within the current window */
  timestamps: number[];
}

/**
 * Creates a rate limiter instance.
 * Each instance maintains its own in-memory store.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max } = options;
  const store = new Map<string, WindowData>();

  // Periodic cleanup to prevent memory leak in long-running processes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of store.entries()) {
      const valid = data.timestamps.filter((t) => t > now - windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, { timestamps: valid });
      }
    }
  }, windowMs);

  // Allow GC in test environments / serverless
  if (cleanupInterval.unref) cleanupInterval.unref();

  return {
    /**
     * Check and record a request for `key` (typically IP address or user ID).
     */
    check(key: string): RateLimitResult {
      const now = Date.now();
      const cutoff = now - windowMs;
      const entry = store.get(key) ?? { timestamps: [] };

      // Slide the window
      const valid = entry.timestamps.filter((t) => t > cutoff);

      if (valid.length >= max) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: valid[0] + windowMs,
        };
      }

      valid.push(now);
      store.set(key, { timestamps: valid });

      return {
        allowed: true,
        remaining: max - valid.length,
        resetAt: now + windowMs,
      };
    },

    /** Reset the store (useful in tests) */
    reset() {
      store.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Pre-configured limiters (matches the rate-limit table in refactor plan)
// ---------------------------------------------------------------------------

/** POST scoring / recommend routes: 10 req/min */
export const scoringLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** POST /api/send-result: 5 req/min (email sending) */
export const sendResultLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

/** GET /api/report/[token]: 30 req/min (read-only) */
export const reportLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

/** GET /api/cron/email-sequence: 1 req/min (cron + auth) */
export const cronLimiter = createRateLimiter({ windowMs: 60_000, max: 1 });
