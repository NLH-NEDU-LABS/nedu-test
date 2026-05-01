// src/lib/supabase/client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _client;
}

// Lazy proxy — defers createClient() until first actual use at runtime.
// This prevents "supabaseUrl is required" crashes during Next.js build
// when SUPABASE_URL is not available as a build-time env var.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return (getClient() as any)[prop as string];
  },
});
