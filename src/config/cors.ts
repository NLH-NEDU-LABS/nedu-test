/**
 * CORS configuration.
 * Replaces the wildcard `*` used in current API routes.
 *
 * During Phase 5 (CORS Lockdown) these origins will be enforced.
 * For now, this file is the single place to manage the allowlist.
 */

export const ALLOWED_ORIGINS = [
  // Production app
  'https://test.nhi.sg',
  'https://nedu.nhi.sg',
  // Vercel preview deployments
  /^https:\/\/nedu-test-[a-z0-9]+-nhile-teams\.vercel\.app$/,
  // Landing page
  'https://test.nedu.vn',
] as const;

/**
 * Check whether `origin` is in the allowed list.
 * Supports both exact string matches and RegExp patterns.
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  );
}

/**
 * Returns CORS headers for a given origin.
 * If origin is not allowed, defaults to the primary production origin.
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin)
    ? (origin as string)
    : 'https://test.nhi.sg';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Secret',
    'Access-Control-Max-Age': '86400',
  };
}
