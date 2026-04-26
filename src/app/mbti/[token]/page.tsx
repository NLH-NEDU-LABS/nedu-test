import { notFound } from 'next/navigation';
import { intakeClient } from '@/lib/nedu-intake/client';
import MbtiQuizClient from './MbtiQuizClient';
import MbtiResultView from './MbtiResultView';

export const dynamic = 'force-dynamic';

interface MbtiPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function MbtiPage({ params, searchParams }: MbtiPageProps) {
  const { token } = await params;
  const { next: nextStep } = await searchParams;

  const report = await intakeClient.getReport(token).catch(() => null);
  if (!report) notFound();

  const mbtiType = report.personalProfile?.mbtiType ?? null;
  const mbtiDesc = report.personalProfile?.mbtiDesc ?? null;

  if (mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} token={token} nextStep={nextStep} />;
  }

  return <MbtiQuizClient token={token} nextStep={nextStep} />;
}
