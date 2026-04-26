import { notFound } from 'next/navigation';
import { getReport } from '@/features/report/service';
import ReportClient from './ReportClient';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const data = await getReport(token);
  if (!data) notFound();

  return <ReportClient data={data} token={token} />;
}
