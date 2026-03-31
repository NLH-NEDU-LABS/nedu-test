import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Loader2, Hash, Heart, Star, User, TrendingUp, Grid3X3 } from 'lucide-react';

interface NumerologyResultViewProps {
  numerologyData: any;
  onBack: () => void;
}

// Mô tả ngắn gọn từng chỉ số
const NUMBER_MEANINGS: Record<number, string> = {
  1: 'Lãnh đạo, tiên phong, độc lập',
  2: 'Hài hòa, ngoại giao, nhạy cảm',
  3: 'Sáng tạo, giao tiếp, biểu đạt',
  4: 'Kỷ luật, ổn định, thực tế',
  5: 'Tự do, phiêu lưu, linh hoạt',
  6: 'Trách nhiệm, yêu thương, gia đình',
  7: 'Tri thức, tâm linh, phân tích',
  8: 'Quyền lực, thành đạt, tham vọng',
  9: 'Nhân đạo, lý tưởng, trưởng thành',
  11: 'Trực giác cao, tâm linh, sáng suốt',
  22: 'Kiến tạo vĩ đại, tầm nhìn rộng',
  33: 'Bậc thầy chữa lành, cống hiến',
};

const getNumberMeaning = (num: number) => NUMBER_MEANINGS[num] || NUMBER_MEANINGS[num % 10] || '';

export const NumerologyResultView = ({ numerologyData, onBack }: NumerologyResultViewProps) => {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAI = async () => {
      if (!numerologyData || interpretation) {
        setIsAiLoading(false);
        return;
      }
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: numerologyData, type: 'numerology' })
        });
        const data = await res.json();
        if (data.success && mounted) {
          setInterpretation(data.interpretation);
        }
      } catch (e) {
        console.error("AI Error:", e);
      } finally {
        if (mounted) setIsAiLoading(false);
      }
    };
    fetchAI();
    return () => { mounted = false; };
  }, [numerologyData, interpretation]);

  if (!numerologyData) return null;

  const { life_path_number, soul_urge_number, destiny_number, name_chart, life_pinnacles, life_peaks } = numerologyData;

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 fade-in pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FDF8F0]/80 to-transparent relative -mx-6 md:-mx-12 px-6 md:px-12 mb-6">
        <button
          onClick={onBack}
          className="absolute left-6 md:left-12 top-6 text-[#A39A92] hover:text-[#2D2D2D] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-4xl mb-2">⭐</span>
        <h2 className="text-2xl font-light text-[#1A1A1A]">Hồ Sơ Thần Số Học</h2>
        <p className="text-sm text-[#8B7E74] mt-1">Pythagorean Numerology</p>
      </div>

      <div className="max-w-xl mx-auto w-full px-2 space-y-6">

        {/* 3 Chỉ số Cốt lõi */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
            Chỉ Số Cốt Lõi
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Life Path */}
            <div className="bg-gradient-to-br from-[#8B5E3C] to-[#6B4528] rounded-2xl p-4 text-center text-white shadow-md">
              <TrendingUp size={18} className="mx-auto mb-1 opacity-80" />
              <span className="text-3xl font-bold block my-1">{life_path_number}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Đường Đời</span>
              <p className="text-[9px] mt-1 opacity-70 leading-tight">{getNumberMeaning(life_path_number)}</p>
            </div>
            {/* Destiny */}
            <div className="bg-gradient-to-br from-[#CDA376] to-[#A8844F] rounded-2xl p-4 text-center text-white shadow-md">
              <Star size={18} className="mx-auto mb-1 opacity-80" />
              <span className="text-3xl font-bold block my-1">{destiny_number}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Sứ Mệnh</span>
              <p className="text-[9px] mt-1 opacity-70 leading-tight">{getNumberMeaning(destiny_number)}</p>
            </div>
            {/* Soul Urge */}
            <div className="bg-gradient-to-br from-[#D85A30] to-[#B04420] rounded-2xl p-4 text-center text-white shadow-md">
              <Heart size={18} className="mx-auto mb-1 opacity-80" />
              <span className="text-3xl font-bold block my-1">{soul_urge_number}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Linh Hồn</span>
              <p className="text-[9px] mt-1 opacity-70 leading-tight">{getNumberMeaning(soul_urge_number)}</p>
            </div>
          </div>
        </div>

        {/* 4 Đỉnh Cao cuộc đời */}
        {life_pinnacles && (
          <div className="space-y-3 pt-4 border-t border-[#F0EBE5]">
            <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
              4 Đỉnh Cao Cuộc Đời
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(life_pinnacles).map(([key, val], idx) => (
                <div key={key} className="bg-white border border-[#EBE3DC] rounded-xl p-3 text-center shadow-sm">
                  <span className="text-[10px] text-[#A39A92] block mb-1">Đỉnh {idx + 1}</span>
                  <span className="text-2xl font-bold text-[#8B5E3C]">{val as number}</span>
                  {life_peaks && (
                    <span className="text-[10px] text-[#A39A92] block mt-1">
                      ~{Object.values(life_peaks)[idx] as number}t
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biểu đồ tên */}
        {name_chart && (
          <div className="space-y-3 pt-4 border-t border-[#F0EBE5]">
            <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1 flex items-center gap-2">
              <Grid3X3 size={14} />
              Biểu Đồ Tên
            </h3>
            <div className="bg-[#F9F8F6] rounded-xl p-4 font-mono text-center text-lg tracking-[0.25em] text-[#8B5E3C] border border-[#EBE3DC]">
              {name_chart}
            </div>
          </div>
        )}

        {/* Lời Bình AI Gemini */}
        <div className="bg-[#FDF8F0] rounded-2xl p-5 border border-[#F0EBE5] relative mt-8">
          <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-sm">
            <Sparkles className="text-[#CDA376]" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#8B5E3C] mb-3 font-serif">
            Giải Mã Con Số (Từ AI)
          </h3>
          
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-[#A39A92]">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-sm">Đang phân tích Thần số học...</p>
            </div>
          ) : interpretation ? (
            <div className="text-[15px] leading-relaxed text-[#2D2D2D] space-y-4">
              {interpretation.split('\n\n').map((para, i) => {
                const parsed = para.split(/(\*\*.*?\*\*)/g).map((chunk, j) => {
                  if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={j} className="text-[#8B5E3C]">{chunk.slice(2, -2)}</strong>;
                  }
                  return chunk;
                });
                return <p key={i}>{parsed}</p>;
              })}
            </div>
          ) : (
             <p className="text-sm text-[#A39A92] italic">Không thể phân tích dữ liệu ngay lúc này. Xin thử lại sau.</p>
          )}
        </div>

      </div>
    </div>
  );
};
