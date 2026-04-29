import { notFound } from 'next/navigation';
import { neduApi } from '@/lib/nedu-api/client';
import EnneagramQuizClient from './EnneagramQuizClient';
import EnneagramResultView from './EnneagramResultView';

interface EnneagramPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string, mode?: string }>;
}

export default async function EnneagramPage({ params, searchParams }: EnneagramPageProps) {
  const { token } = await params;
  const { next: nextStep, mode } = await searchParams;

  const report = await neduApi.getReport(token).catch((err: any) => {
    if (err?.status === 404) return null;
    throw err;
  });
  if (!report) notFound();

  const enneagramType = report.assessment.enneagram_type;
  const aMeta = (report.assessment.metadata ?? {}) as Record<string, unknown>;
  const enneagramDesc = (aMeta.enneagram_desc as string | undefined) ?? undefined;

  if (enneagramType) {
    return <EnneagramResultView enneagramType={enneagramType} enneagramDesc={enneagramDesc} token={token} nextStep={nextStep} mode={mode} />;
  }
  return <EnneagramQuizClient token={token} nextStep={nextStep} mode={mode} />;
}
