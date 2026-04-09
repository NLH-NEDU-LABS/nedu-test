// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("SERVER ENV KEYS MISSING:", {
    url: process.env.SUPABASE_URL,
    has_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
