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
//
// KHÔNG dùng setTimeout giữa retry: Cloudflare Workers + OpenNext streaming SSR
// crash khi setTimeout chạy trong async server component (isolate suspend).
// Mỗi request CF→Railway tự nó mất ~300-500ms, 5 lần liên tiếp ≈ 2s đủ buffer.
// Catch all error để fallback graceful notFound thay vì crash + digest hash.
async function getReportWithRetry(token: string, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const report = await neduApi.getReport(token);
      if (report) return report;
    } catch (err: any) {
      if (err?.status !== 404 && attempt === maxAttempts - 1) {
        console.error('[mbti] getReport failed:', err?.message ?? err);
      }
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
