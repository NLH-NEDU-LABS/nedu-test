/**
 * Shared personal_profiles repository.
 * Used by both MBTI and Enneagram scoring routes.
 *
 * Eliminates the duplicate SELECT → if/else INSERT/UPDATE pattern in:
 *   - mbti/score/route.ts:95-118
 *   - enneagram/score/route.ts:91-114
 *
 * Uses Supabase .upsert() with onConflict: 'lead_id' instead of manual check.
 */
import { supabase } from '@/lib/supabase/client';

export type ProfileDataPatch = Record<string, any>;

/**
 * Upsert fields into personal_profiles.profile_data for a given lead.
 *
 * Strategy: read → spread merge → upsert (onConflict: lead_id).
 */
export async function upsertProfileData(
  leadId: string,
  sourceDob: string | null,
  patch: ProfileDataPatch
): Promise<void> {
  // 1. Try to fetch existing profile
  const { data: existing } = await supabase
    .from('personal_profiles')
    .select('id, profile_data')
    .eq('lead_id', leadId)
    .maybeSingle();

  const currentData = (existing?.profile_data as Record<string, unknown>) ?? {};
  
  // Merge multiple root keys into the JSONB object
  const newData = { ...currentData, ...patch };

  if (existing) {
    const { error } = await supabase
      .from('personal_profiles')
      .update({ profile_data: newData })
      .eq('id', existing.id);
      
    if (error) {
      if (error.code === '42501') console.error(`[FATAL Database ERROR 42501] Supabase service_role failed to UPDATE table personal_profiles. Check database GRANTs!`);
      throw error;
    }
  } else {
    // 2. Insert new row
    const insertPayload: Record<string, any> = {
      lead_id: leadId,
      profile_data: newData,
    };
    if (sourceDob) insertPayload.source_dob = sourceDob;
    
    const { error } = await supabase
      .from('personal_profiles')
      .insert(insertPayload);
      
    if (error) {
      if (error.code === '42501') console.error(`[FATAL Database ERROR 42501] Supabase service_role failed to INSERT table personal_profiles. Check database GRANTs!`);
      throw error;
    }
  }
}

/**
 * Get profile_data for a lead. Returns null if not found.
 */
export async function getProfileByLeadId(
  leadId: string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('personal_profiles')
    .select('profile_data')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error || !data) return null;
  return (data.profile_data as Record<string, unknown>) ?? null;
}
