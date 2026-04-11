/**
 * Generic Zod validation wrapper for Next.js API route handlers.
 *
 * Usage (POST route):
 *   import { withValidation } from '@/middleware/validate';
 *   import { z } from 'zod';
 *
 *   const schema = z.object({ email: z.string().email() });
 *
 *   export const POST = withValidation(schema, async (req, data) => {
 *     // `data` is fully typed as z.infer<typeof schema>
 *     return NextResponse.json({ ok: true });
 *   });
 */
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodType } from 'zod';

type ValidatedHandler<T> = (req: NextRequest, data: T) => Promise<NextResponse>;

/**
 * Wrap a route handler with Zod input validation.
 * Parses JSON body, validates against `schema`, returns 400 on error.
 */
export function withValidation<T>(
  schema: ZodType<T>,
  handler: ValidatedHandler<T>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    return handler(req, result.data);
  };
}
