import { notFound } from 'next/navigation';
import { getReport } from '@/features/report/service';
import ReportClient from './ReportClient';

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const data = await getReport(token);
  if (!data) notFound();

  return (
    <ReportClient
      baziData={data.bazi_data}
      numerologyData={data.numerology_data}
      baziInterp={data.bazi_interp ?? undefined}
      numerologyInterp={data.numerology_interp ?? undefined}
      recommendation={
        data.primary_course_name
          ? {
              primary_course_name: data.primary_course_name,
              primary_course_url: data.primary_course_url ?? undefined,
              why_fits: data.why_fits ?? undefined,
            }
          : null
      }
    />
  );
}
