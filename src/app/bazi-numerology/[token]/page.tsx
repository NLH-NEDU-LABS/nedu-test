import { notFound } from 'next/navigation';
import { intakeClient } from '@/lib/nedu-intake/client';
import { calculate, interpret } from '@/features/bazi-numerology/service';
import { getBaziNumerologyReport } from '@/features/report/service';

export const dynamic = 'force-dynamic';
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
    const report = await intakeClient.getReport(token).catch(() => null);
    if (!report) notFound();

    const meta = (report.metadata ?? {}) as Record<string, unknown>;

    const { bazi, numerology } = calculate({
      dob: report.birthDate ?? '',
      birthTime: report.birthTime ?? null,
      birthPlace: (meta.birth_place as string) ?? 'vietnam',
      gender: ((meta.gender as 0 | 1) ?? 1),
      fullName: report.fullName ?? undefined,
    });

    const [bazi_interp, numerology_interp] = await Promise.all([
      interpret('bazi', bazi).catch(() => null),
      interpret('numerology', numerology).catch(() => null),
    ]);

    try {
      await intakeClient.upsertProfile(token, { bazi, numerology, bazi_interp: bazi_interp ?? undefined, numerology_interp: numerology_interp ?? undefined });
    } catch (err) {
      console.error('[BaziPage] Failed to cache bazi result:', err);
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
