import { notFound } from 'next/navigation';
import { neduApi } from '@/lib/nedu-api/client';
import MbtiQuizClient from './MbtiQuizClient';
import MbtiResultView from './MbtiResultView';

interface MbtiPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function MbtiPage({ params, searchParams }: MbtiPageProps) {
  const { token } = await params;
  const { next: nextStep } = await searchParams;

  const report = await neduApi.getReport(token).catch((err: any) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) notFound();

  const mbtiType = report.assessment.mbti_type;
  const aMeta = (report.assessment.metadata ?? {}) as Record<string, unknown>;
  const mbtiDesc = (aMeta.mbti_desc as string | undefined) ?? undefined;

  if (mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} token={token} nextStep={nextStep} />;
  }
  return <MbtiQuizClient token={token} nextStep={nextStep} />;
}
