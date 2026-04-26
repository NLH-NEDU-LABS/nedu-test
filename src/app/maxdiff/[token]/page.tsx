import { notFound } from 'next/navigation';
import { intakeClient } from '@/lib/nedu-intake/client';
import { MaxDiffReportClient } from './MaxDiffReportClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kết quả MaxDiff — Nedu',
  description: 'Xem kết quả phân tích nhu cầu cá nhân của bạn từ Nedu AI.',
};

export default async function MaxDiffReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) notFound();

  const p = report.personalProfile;

  return (
    <MaxDiffReportClient
      scores={(p?.maxdiffScores as any[]) ?? []}
      aiRecommendation={p?.aiRecommendation ?? null}
      personaLabel={p?.personaLabel ?? ''}
      topProblem1={p?.topProblem1 ?? ''}
      topProblem2={p?.topProblem2 ?? ''}
    />
  );
}
