import { notFound } from 'next/navigation';
import { intakeClient } from '@/lib/nedu-intake/client';
import EnneagramQuizClient from './EnneagramQuizClient';
import EnneagramResultView from './EnneagramResultView';

export const dynamic = 'force-dynamic';

interface EnneagramPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string; mode?: string }>;
}

export default async function EnneagramPage({ params, searchParams }: EnneagramPageProps) {
  const { token } = await params;
  const { next: nextStep, mode } = await searchParams;

  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) notFound();

  const enneagramType = report.personalProfile?.enneagramType ?? null;
  const enneagramDesc = report.personalProfile?.enneagramDesc ?? null;

  if (enneagramType) {
    return <EnneagramResultView enneagramType={enneagramType} enneagramDesc={enneagramDesc} token={token} nextStep={nextStep} mode={mode} />;
  }

  return <EnneagramQuizClient token={token} nextStep={nextStep} mode={mode} />;
}
