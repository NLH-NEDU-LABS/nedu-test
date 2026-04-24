import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import ReportClient from './report/ReportClient';
import type { QuizReportPayload } from './report/types';
import NotFound from './NotFound';

export default function Report() {
  const { token = '' } = useParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [data, setData] = useState<QuizReportPayload | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<QuizReportPayload>(`/report/${token}`)
      .then((d) => {
        if (!active) return;
        setData(d);
        setStatus('ok');
      })
      .catch(() => active && setStatus('missing'));
    return () => {
      active = false;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto p-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }
  if (status === 'missing' || !data) return <NotFound />;
  return <ReportClient data={data} token={token} />;
}
