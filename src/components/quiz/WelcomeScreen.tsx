import React from 'react';
import Image from 'next/image';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-[#F0EBE5]">
          <Image 
            src="/nedu-logo.jpg" 
            alt="Nedu Logo" 
            width={80} 
            height={80} 
            className="w-full h-full object-cover"
            priority 
          />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#1A1A1A]">
          Chào bạn đến với <span className="font-semibold italic text-[#8B5E3C]">Nedu</span>
        </h1>
        <p className="text-[#6B6B6B] leading-relaxed text-lg font-light">
          Đã bao lâu rồi bạn chưa dành vài phút để thực sự lắng nghe chính mình?
        </p>
      </div>

      <div className="bg-[#F9F8F6] p-4 rounded-2xl flex items-start gap-3 border border-[#F0EBE5]">
        <ShieldCheck className="text-[#8B5E3C] shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-[#8B7E74] leading-relaxed">
          Mọi chia sẻ của bạn được mã hóa an toàn 100% và chỉ dùng để cá nhân hóa hành trình của riêng bạn.
        </p>
      </div>

      <button 
        onClick={onStart}
        className="w-full py-4 bg-[#2D2D2D] text-white rounded-2xl hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 group shadow-lg"
      >
        Bắt đầu hành trình
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
