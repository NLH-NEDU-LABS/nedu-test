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

export interface ProfileDataPatch {
  /** The key indicating which dedicated column to update (e.g. mbti, bazi) */
  key: 'mbti' | 'enneagram' | 'bazi' | 'numerology';
  value: any;
}

/**
 * Upsert a field into dedicated columns in personal_profiles for a given lead.
 *
 * Implements Phase 4.5 DB schema: individual columns instead of profile_data JSONB.
 */
export async function upsertProfileData(
  leadId: string,
  sourceDob: string | null,
  patch: ProfileDataPatch
): Promise<void> {
  
  // Map the update to the correct column
  const updatePayload: Record<string, any> = {
    lead_id: leadId,
  };
  
  if (sourceDob) updatePayload.source_dob = sourceDob;

  if (patch.key === 'mbti') {
    updatePayload.mbti_type = patch.value.type;
  } else if (patch.key === 'enneagram') {
    updatePayload.enneagram_type = patch.value.type;
  } else if (patch.key === 'bazi') {
    updatePayload.bazi_data = patch.value;
  } else if (patch.key === 'numerology') {
    updatePayload.numerology_data = patch.value;
  }

  const { error } = await supabase
    .from('personal_profiles')
    .upsert(updatePayload, { onConflict: 'lead_id' });

  if (error) {
    if (error.code === '42501') {
       console.error(`[FATAL Database Permissions ERROR 42501] Supabase service_role failed to UPSERT table personal_profiles. Check database GRANTs!`);
    }
    throw error;
  }
}

/**
 * Get profile tracking columns for a lead. Returns null if not found.
 */
export async function getProfileByLeadId(
  leadId: string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('personal_profiles')
    .select('bazi_data, numerology_data, mbti_type, enneagram_type')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error || !data) return null;
  
  // Reconstruct into legacy expected structure for backward compatibility during transition
  const mockLegacyProfile: Record<string, any> = {};
  if (data.bazi_data) mockLegacyProfile.bazi = data.bazi_data;
  if (data.numerology_data) mockLegacyProfile.numerology = data.numerology_data;
  if (data.mbti_type) mockLegacyProfile.mbti = { type: data.mbti_type };
  if (data.enneagram_type) mockLegacyProfile.enneagram = { type: data.enneagram_type };

  return mockLegacyProfile;
}
