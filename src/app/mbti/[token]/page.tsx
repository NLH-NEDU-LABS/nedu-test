import { notFound } from 'next/navigation';
import { neduApi } from '@/lib/nedu-api/client';
import MbtiQuizClient from './MbtiQuizClient';
import MbtiResultView from './MbtiResultView';

interface MbtiPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string }>;
}

// Token được tạo client-side và POST /api/send-result theo pattern fire-and-forget
// (xem useQuizFlow.ts:92-148). User click Continue có thể đến đây trước khi BE persist
// xong lead → 404 race. Retry để đợi BE thay vì block UX.
async function getReportWithRetry(token: string, maxAttempts = 5, delayMs = 600) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const report = await neduApi.getReport(token).catch((err: any) => {
      if (err?.status === 404) return null;
      throw err;
    });
    if (report) return report;
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

export default async function MbtiPage({ params, searchParams }: MbtiPageProps) {
  const { token } = await params;
  const { next: nextStep } = await searchParams;

  const report = await getReportWithRetry(token);
  if (!report) notFound();

  const mbtiType = report.assessment.mbti_type;
  const aMeta = (report.assessment.metadata ?? {}) as Record<string, unknown>;
  const mbtiDesc = (aMeta.mbti_desc as string | undefined) ?? undefined;

  if (mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} token={token} nextStep={nextStep} />;
  }
  return <MbtiQuizClient token={token} nextStep={nextStep} />;
}
