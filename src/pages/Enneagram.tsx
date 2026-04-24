import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import EnneagramQuizClient from './enneagram/EnneagramQuizClient';
import EnneagramResultView from './enneagram/EnneagramResultView';
import NotFound from './NotFound';

type ReportPayload = {
  enneagram_type?: string | number | null;
  enneagram_desc?: string | null;
};

export default function Enneagram() {
  const { token = '' } = useParams();
  const [search] = useSearchParams();
  const nextStep = search.get('next') ?? undefined;
  const mode = search.get('mode') ?? undefined;
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [payload, setPayload] = useState<ReportPayload | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<ReportPayload>(`/report/${token}`)
      .then((data) => {
        if (!active) return;
        setPayload(data);
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
  if (status === 'missing') return <NotFound />;

  if (payload?.enneagram_type) {
    return (
      <EnneagramResultView
        enneagramType={payload.enneagram_type}
        enneagramDesc={payload.enneagram_desc ?? undefined}
        token={token}
        nextStep={nextStep}
        mode={mode}
      />
    );
  }
  return <EnneagramQuizClient token={token} nextStep={nextStep} mode={mode} />;
}
