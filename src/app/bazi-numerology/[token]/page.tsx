import { notFound } from 'next/navigation';
import { neduApi } from '@/lib/nedu-api/client';
import { calculate, interpret } from '@/features/bazi-numerology/service';
import { BaziResultView } from '@/components/quiz/BaziResultView';
import { NumerologyResultView } from '@/components/quiz/NumerologyResultView';

export default async function BaziNumerologyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const report = await neduApi.getReport(token).catch((err: any) => {
    if (err?.status === 404) return null;
    throw err;
  });

  if (!report) notFound();

  const a = report.assessment;
  const aMeta = (a.metadata ?? {}) as Record<string, unknown>;
  const leadMeta = (report.lead.metadata ?? {}) as Record<string, unknown>;

  let baziData: unknown = a.bazi_data ?? null;
  let numerologyData: unknown = a.numerology_data ?? null;
  let baziInterp: string | null = (aMeta.bazi_interp as string | null) ?? null;
  let numerologyInterp: string | null = (aMeta.numerology_interp as string | null) ?? null;

  if (!baziData || !baziInterp) {
    const { bazi, numerology } = calculate({
      dob: report.lead.birth_date ?? '',
      birthTime: report.lead.birth_time ?? null,
      birthPlace: (leadMeta.birth_place as string) ?? 'vietnam',
      gender: ((leadMeta.gender as 0 | 1) ?? 1),
      fullName: report.lead.full_name ?? undefined,
    });

    const [bazi_interp, numerology_interp] = await Promise.all([
      interpret('bazi', bazi).catch(() => null),
      interpret('numerology', numerology).catch(() => null),
    ]);

    try {
      await neduApi.updateAssessment(token, {
        bazi_data: bazi as Record<string, unknown>,
        numerology_data: numerology as Record<string, unknown>,
        metadata: { ...aMeta, bazi_interp, numerology_interp },
      });
    } catch (err: any) {
      console.error('Failed to cache bazi/numerology data:', err?.message || err);
    }

    baziData = bazi;
    numerologyData = numerology;
    baziInterp = bazi_interp;
    numerologyInterp = numerology_interp;
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 px-4 overflow-x-hidden w-full">
      <BaziResultView
        baziData={baziData}
        baziInterp={baziInterp ?? undefined}
      />
      <hr className="w-full my-8 border-[#F0EBE5]" />
      <NumerologyResultView
        numerologyData={numerologyData}
        numerologyInterp={numerologyInterp ?? undefined}
      />
    </div>
  );
}
