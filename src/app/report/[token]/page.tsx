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

  const cachedRecord = (profileData || {}) as Record<string, any>;
  const needsGeneration = !profileData || !cachedRecord.bazi_interp || !cachedRecord.numerology_interp;

  if (needsGeneration) {
    let baziData = cachedRecord.bazi;
    let numerologyData = cachedRecord.numerology;

    if (!baziData || !numerologyData) {
      const tz = getTimezoneForLocation((lead.metadata as any)?.birth_place ?? 'vietnam');
      const timeToUse = lead.birth_time || '12:00';
      const isoString = `${lead.dob}T${timeToUse}:00${tz}`;
      const solarTime = getSolarTime(isoString, tz);
      
      baziData = buildBazi({ 
        solarTime, 
        gender: ((lead.metadata as any)?.gender ?? 1) as 0 | 1,
        eightCharProviderSect: 2
      });
      numerologyData = calculateFullNumerology(lead.dob, (lead.metadata as any)?.full_name ?? '');
    }

    const baseUrl = process.env.NEXT_PUBLIC_REPORT_BASE_URL || 'http://localhost:3000';
    const [baziInterp, numerologyInterp] = await Promise.all([
      fetch(`${baseUrl}/api/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: baziData, type: 'bazi' })
      }).then(r => r.ok ? r.json() : null).then(d => d?.interpretation).catch(e => null),
      fetch(`${baseUrl}/api/interpret`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: numerologyData, type: 'numerology' })
      }).then(r => r.ok ? r.json() : null).then(d => d?.interpretation).catch(e => null)
    ]);

    profileData = { 
      bazi: baziData, 
      numerology: numerologyData,
      bazi_interp: baziInterp,
      numerology_interp: numerologyInterp
    };

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
