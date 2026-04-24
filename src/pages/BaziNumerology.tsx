import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { BaziResultView } from '@/components/quiz/BaziResultView';
import { NumerologyResultView } from '@/components/quiz/NumerologyResultView';
import type { BaziNumerologyPayload } from './report/types';
import NotFound from './NotFound';

export default function BaziNumerology() {
  const { token = '' } = useParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [data, setData] = useState<BaziNumerologyPayload | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<BaziNumerologyPayload>(`/bazi-numerology/${token}`)
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
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 px-4 overflow-x-hidden w-full">
      <BaziResultView baziData={data.bazi_data} baziInterp={data.bazi_interp ?? undefined} />
      <hr className="w-full my-8 border-[#F0EBE5]" />
      <NumerologyResultView
        numerologyData={data.numerology_data}
        numerologyInterp={data.numerology_interp ?? undefined}
      />
    </div>
  );
}
