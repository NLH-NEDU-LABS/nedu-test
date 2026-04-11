import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface Props {
  reportToken: string;
}

export const ExpressSuccessScreen: React.FC<Props> = ({ reportToken }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-[#4CAF50]" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-serif text-[#2C2825] mb-4">
        Hoàn thành!
      </h2>
      
      <p className="text-[#5C5652] mb-8 leading-relaxed max-w-sm">
        Hồ sơ của bạn đã được khởi tạo. Bạn đã sẵn sàng để khám phá các bài kiểm tra chuyên sâu tiếp theo chưa?
      </p>

      <button
        onClick={() => {
          window.location.href = `/mbti/${reportToken}?next=enneagram`;
        }}
        className="w-full flex items-center justify-center gap-2 group p-4 bg-[#8B5E3C] text-white hover:bg-[#704B30] rounded-xl text-lg font-medium transition-colors"
      >
        Làm bài MBTI
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
