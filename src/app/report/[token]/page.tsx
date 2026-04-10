import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTimezoneForLocation } from '@/lib/timezone';
import { getSolarTime, buildBazi } from '@/lib/bazi';
import { calculateFullNumerology } from '@/lib/numerology';
import ReportClient from './ReportClient';

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const { data: lead } = await supabase
    .from('leads')
    .select('id, dob, birth_time, metadata, personal_profiles ( profile_data )')
    .eq("metadata->>report_token", resolvedParams.token)
    .single();

  if (!lead) {
    notFound();
  }

  let profileData = Array.isArray(lead.personal_profiles) 
    ? (lead.personal_profiles as { profile_data?: unknown }[])[0]?.profile_data 
    : (lead.personal_profiles as { profile_data?: unknown })?.profile_data;

  if (!profileData) {
    const tz = getTimezoneForLocation((lead.metadata as any)?.birth_place ?? 'vietnam');
    const timeToUse = lead.birth_time || '12:00';
    const isoString = `${lead.dob}T${timeToUse}:00${tz}`;
    const solarTime = getSolarTime(isoString, tz);
    
    const baziData = buildBazi({ 
      solarTime, 
      gender: ((lead.metadata as any)?.gender ?? 1) as 0 | 1,
      eightCharProviderSect: 2
    });
    const numerologyData = calculateFullNumerology(lead.dob, (lead.metadata as any)?.full_name ?? '');

    profileData = { bazi: baziData, numerology: numerologyData };

    await supabase.from('personal_profiles').upsert({
      lead_id: lead.id,
      profile_data: profileData,
      source_dob: lead.dob
    });
  }

  const profileRecord = (profileData || {}) as Record<string, any>;
  const { bazi: baziData, numerology: numerologyData } = profileRecord;
  const recommendation = lead.metadata ? {
    primary_course_name: lead.metadata.primary_course_name,
    primary_course_url: lead.metadata.primary_course_url,
    why_fits: lead.metadata.why_fits
  } : null;

  return <ReportClient baziData={baziData} numerologyData={numerologyData} recommendation={recommendation} />;
}
