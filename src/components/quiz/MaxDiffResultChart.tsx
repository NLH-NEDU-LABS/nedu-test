import React from 'react';
import type { ScoredItem } from '@/types/assessment';

interface MaxDiffResultChartProps {
  scores: ScoredItem[];
  respondentCount?: number;
}

export function MaxDiffResultChart({ scores, respondentCount = 1 }: MaxDiffResultChartProps) {
  return (
    <div className="w-full bg-white md:border md:border-gray-200 md:rounded-lg p-2 md:p-6 mb-8 mt-6">
      <div className="text-center mb-8">
        <h3 className="text-sm md:text-base font-semibold text-gray-700">Item scores</h3>
        <p className="text-[11px] text-gray-500">N={respondentCount}</p>
      </div>
      
      <div className="relative">
        {/* Background Grid Lines (0, 25, 50, 75, 100) */}
        <div className="absolute top-0 bottom-0 left-[35%] right-0 md:left-[30%] flex justify-between pointer-events-none">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="h-full border-l border-gray-200 flex flex-col relative z-0">
              <span className="text-[10px] text-gray-400 absolute -top-5 transform -translate-x-1/2">
                {tick}
              </span>
            </div>
          ))}
        </div>

        {/* Chart Bars */}
        <div className="relative z-10 space-y-4 pt-1 pb-2">
          {scores.map((score) => {
            const barWidth = Math.max(score.normalized, 0);
            return (
              <div key={score.item_id} className="flex group">
                {/* Y-Axis Label */}
                <div className="w-[35%] md:w-[30%] pr-3 flex flex-col justify-center text-right">
                  <span className="text-[11px] md:text-xs text-gray-700 font-medium leading-snug line-clamp-2" title={score.label}>
                    {score.label}
                  </span>
                </div>
                
                {/* Bar Area */}
                <div className="w-[65%] md:w-[70%] flex items-center min-h-[24px]">
                  <div 
                    className="h-[18px] md:h-[22px] bg-[#2563EB] rounded-r-[1px] transition-all duration-1000 ease-out flex-shrink-0" 
                    style={{ width: `${barWidth}%`, minWidth: '1px' }}
                  />
                  <div className="ml-1.5 text-[11px] text-gray-600 font-medium">
                    {score.normalized.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
