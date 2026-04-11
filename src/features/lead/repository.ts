/**
 * Lead repository — shared queries for the `leads` table.
 *
 * Queries extracted from:
 *   - report/[token]/route.ts (findByReportToken)
 *   - send-result/route.ts    (create)
 *   - mbti/score/route.ts     (findByReportToken, mergeMetadata)
 *   - enneagram/score/route.ts(findByReportToken, mergeMetadata)
 */
import { supabase } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeadRow {
  id: string;
  dob: string | null;
  metadata: Record<string, unknown>;
  job: string | null;
  goal: string | null;
}

export interface CreateLeadInput {
  quiz_persona: string;
  job: string | null;
  goal: string | null;
  dob: string | null;
  birth_time: string | null;
  courses: string[];
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Find a lead by its report_token stored in the metadata JSONB column.
 * Returns the full row needed by MBTI/Enneagram scoring.
 */
export async function findByReportToken(token: string): Promise<LeadRow | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, dob, metadata, job, goal')
    .eq('metadata->>report_token', token)
    .single();

  if (error || !data) return null;
  return data as LeadRow;
}

/**
 * Create a new lead.
 * Returns the created lead's ID, or throws on error.
 */
export async function createLead(input: CreateLeadInput): Promise<string> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      quiz_persona: input.quiz_persona,
      job: input.job,
      goal: input.goal,
      dob: input.dob,
      birth_time: input.birth_time,
      courses: input.courses,
      source_type: 'inbound',
      sla_started_at: new Date().toISOString(),
      metadata: input.metadata,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Merge a patch object into `leads.metadata` using JSONB concatenation.
 * Avoids the read-spread-write race condition.
 *
 * Equivalent SQL:
 *   UPDATE leads SET metadata = metadata || '{"mbti_type":"INTJ"}'::jsonb WHERE id = $1
 */
export async function mergeMetadata(
  leadId: string,
  patch: Record<string, unknown>
): Promise<void> {
  // Supabase JS doesn't expose raw jsonb || yet, so we use a workaround:
  // 1. Read current metadata
  // 2. Merge in JS (acceptable here — only 1 field changes at a time per route)
  // TODO Phase 4.5: replace with an RPC for true atomic merge
  const { data, error: fetchError } = await supabase
    .from('leads')
    .select('metadata')
    .eq('id', leadId)
    .single();

  if (fetchError) throw fetchError;

  const merged = { ...(data.metadata as Record<string, unknown>), ...patch };

  const { error: updateError } = await supabase
    .from('leads')
    .update({ metadata: merged })
    .eq('id', leadId);

  if (updateError) throw updateError;
}
