import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { MaxDiffReportClient } from './maxdiff/MaxDiffReportClient';
import NotFound from './NotFound';

type MaxDiffPayload = {
  persona_label?: string;
  top_problem_1?: string;
  top_problem_2?: string;
  maxdiff_scores?: unknown[];
  ai_recommendation?: unknown;
};

export default function Maxdiff() {
  const { token = '' } = useParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [data, setData] = useState<MaxDiffPayload | null>(null);

  useEffect(() => {
    document.title = 'Kết quả MaxDiff — Nedu';
    let active = true;
    api
      .get<MaxDiffPayload>(`/report/${token}`)
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

  return (
    <MaxDiffReportClient
      scores={(data.maxdiff_scores as any[]) || []}
      aiRecommendation={(data.ai_recommendation as any) || null}
      personaLabel={data.persona_label || ''}
      topProblem1={data.top_problem_1 || ''}
      topProblem2={data.top_problem_2 || ''}
    />
  );
}
