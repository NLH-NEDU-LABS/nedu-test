/**
 * Email sequence repository — RPC wrapper.
 *
 * Extracted from cron/email-sequence/route.ts:18
 */
import { supabase } from '@/lib/supabase/client';
import type { Lead } from '@/features/email-sequence/types';

/**
 * Call the `get_leads_by_day` Supabase RPC.
 * Returns leads that are due for an email today.
 * Throws on RPC error.
 */
export async function getLeadsByDay(): Promise<Lead[]> {
  const { data, error } = await supabase.rpc('get_leads_by_day');

  if (error) throw new Error(`RPC get_leads_by_day failed: ${error.message}`);
  return (data as Lead[]) ?? [];
}
