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
  // Landing page (production + preview)
  'https://test.nedu.vn',
  'https://landing-lane-connect.vercel.app',
  // Local testing
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
] as const;

/**
 * Check whether `origin` is in the allowed list.
 * Supports both exact string matches and RegExp patterns.
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : (allowed as RegExp).test(origin)
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
