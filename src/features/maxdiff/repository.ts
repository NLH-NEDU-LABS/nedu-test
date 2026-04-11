/**
 * MaxDiff / quiz_submissions repository.
 *
 * Queries extracted from send-result/route.ts:184-228
 */
import { supabase } from '@/lib/supabase/client';

export interface CreateSubmissionInput {
  visitor_email: string;
  visitor_name: string | null;
  persona_id: string;
  result_json: Record<string, unknown>;
  answers: Record<string, unknown>;
  utm_source: string | null;
}

/**
 * Step 1 of the 3-step send-result flow: insert a new quiz submission.
 * Returns the new submission ID.
 */
export async function createSubmission(input: CreateSubmissionInput): Promise<string> {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .insert({
      visitor_email: input.visitor_email,
      visitor_name: input.visitor_name,
      persona_id: input.persona_id,
      result_json: input.result_json,
      answers: input.answers,
      utm_source: input.utm_source,
      identity_status: 'anonymous',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Step 3 of the 3-step send-result flow: link a quiz submission to a lead.
 */
export async function updateLeadId(submissionId: string, leadId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_submissions')
    .update({ lead_id: leadId })
    .eq('id', submissionId);

  if (error) throw error;
}

/**
 * Get the latest submission for a given lead.
 */
export async function getLatestByLeadId(
  leadId: string
): Promise<{ result_json: Record<string, unknown>; visitor_name: string | null } | null> {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('result_json, visitor_name')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    result_json: (data.result_json as Record<string, unknown>) ?? {},
    visitor_name: data.visitor_name ?? null,
  };
}
