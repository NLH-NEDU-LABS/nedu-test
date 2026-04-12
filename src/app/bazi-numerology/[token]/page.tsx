import { notFound } from 'next/navigation';
import { findByReportToken } from '@/features/lead/repository';
import { calculate, interpret } from '@/features/bazi-numerology/service';
import { upsertProfileData } from '@/features/shared/profile-repository';
import { getBaziNumerologyReport } from '@/features/report/service';
import { BaziResultView } from '@/components/quiz/BaziResultView';
import { NumerologyResultView } from '@/components/quiz/NumerologyResultView';

export default async function BaziNumerologyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Try cache first
  let data = await getBaziNumerologyReport(token);
  if (data === null) notFound();

  // 2. Generate + cache if missing
  if (!data.bazi_data || !data.bazi_interp) {
    const lead = await findByReportToken(token);
    if (!lead) notFound();

    const metadata = lead.metadata as Record<string, unknown>;

    const { bazi, numerology } = calculate({
      dob: lead.dob ?? '',
      birthTime: null,
      birthPlace: (metadata.birth_place as string) ?? 'vietnam',
      gender: ((metadata.gender as 0 | 1) ?? 1),
      fullName: (metadata.full_name as string) ?? undefined,
    });

    const [bazi_interp, numerology_interp] = await Promise.all([
      interpret('bazi', bazi).catch(() => null),
      interpret('numerology', numerology).catch(() => null),
    ]);

    // We wrap these in a try-catch to avoid crashing the whole page
    // if the database cache insertion fails (e.g., due to RLS or constraints).
    try {
      await upsertProfileData(lead.id, lead.dob, {
        bazi,
        numerology,
        bazi_interp,
        numerology_interp,
      });
    } catch (upsertError: any) {
      console.error('Failed to cache bazi/numerology profile data:', upsertError?.message || upsertError);
    }

    data = {
      has_bazi: true,
      bazi_data: bazi,
      numerology_data: numerology,
      bazi_interp: bazi_interp,
      numerology_interp: numerology_interp,
    };
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 px-4 overflow-x-hidden w-full">
      <BaziResultView
        baziData={data.bazi_data}
        baziInterp={data.bazi_interp ?? undefined}
      />
      <hr className="w-full my-8 border-[#F0EBE5]" />
      <NumerologyResultView
        numerologyData={data.numerology_data}
        numerologyInterp={data.numerology_interp ?? undefined}
      />
    </div>
  );
}
