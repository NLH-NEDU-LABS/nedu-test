import { notFound } from 'next/navigation';
import { neduApi } from '@/lib/nedu-api/client';
import { MaxDiffReportClient } from './MaxDiffReportClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kết quả MaxDiff — Nedu',
  description: 'Xem kết quả phân tích nhu cầu cá nhân của bạn từ Nedu AI.',
};

export default async function MaxDiffReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const report = await neduApi.getReport(token).catch((err: any) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) notFound();

  const a = report.assessment;
  const topProblems = Array.isArray(a.top_problems) ? a.top_problems : [];

  return (
    <MaxDiffReportClient
      scores={Array.isArray(a.maxdiff_scores) ? a.maxdiff_scores : []}
      aiRecommendation={(a.full_recommendation ?? null) as any}
      personaLabel={a.persona_label ?? ''}
      topProblem1={(topProblems[0] as string | undefined) ?? ''}
      topProblem2={(topProblems[1] as string | undefined) ?? ''}
    />
  );
}
