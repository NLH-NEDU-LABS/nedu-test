import React from 'react';
import { Sparkles } from 'lucide-react';

export const AnalyzingScreen = ({ message }: { message?: string }) => {
  return (
    <div className="text-center space-y-8 py-12 animate-pulse">
      <div className="flex justify-center flex-col items-center">
        <Sparkles size={48} className="text-[#8B5E3C] animate-spin-slow" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-light">{message ?? 'Nedu AI đang thấu hiểu các chỉ số...'}</h2>
        <p className="text-sm text-[#8B7E74]">Dựa trên tâm lý học hành vi và triết lý thấu cảm nội tâm.</p>
      </div>
    </div>
  );
};
