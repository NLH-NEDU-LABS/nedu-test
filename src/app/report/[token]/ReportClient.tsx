"use client";

import { BaziResultView } from '@/components/quiz/BaziResultView';
import { NumerologyResultView } from '@/components/quiz/NumerologyResultView';
import { useRouter } from 'next/navigation';

interface ReportClientProps {
  baziData: unknown;
  numerologyData: unknown;
  recommendation?: {
    primary_course_name?: string;
    why_fits?: string;
    primary_course_url?: string;
  } | null;
}

export default function ReportClient({ baziData, numerologyData, recommendation }: ReportClientProps) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8">
      <BaziResultView baziData={baziData} onBack={() => router.push('/')} />
      <hr className="w-full my-8 border-[#F0EBE5]" />
      <NumerologyResultView numerologyData={numerologyData} onBack={() => router.push('/')} />
      
      {recommendation?.primary_course_name && (
        <div className="w-full max-w-xl mx-auto px-6 mt-8">
          <div className="bg-[#FDF8F0] rounded-2xl p-6 border border-[#F0EBE5] shadow-sm">
            <h3 className="text-xl font-semibold text-[#8B5E3C] mb-2 font-serif">
              Khóa học gợi ý: {recommendation.primary_course_name}
            </h3>
            <p className="text-[15px] leading-relaxed text-[#2D2D2D] my-4">
              {recommendation.why_fits}
            </p>
            {recommendation.primary_course_url && (
              <a 
                href={recommendation.primary_course_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-[#D85A30] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#B04420] transition-colors"
              >
                Nhận tư vấn khóa học
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
