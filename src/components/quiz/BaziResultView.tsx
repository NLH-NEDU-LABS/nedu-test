import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { tCan, tChi, tGod, tStar, tZodiac, tGender, tCanChi } from '@/lib/bazi-translation';

interface BaziResultViewProps {
  baziData: any;
  onBack: () => void;
}

export const BaziResultView = ({ baziData, onBack }: BaziResultViewProps) => {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAI = async () => {
      if (!baziData || interpretation) {
        setIsAiLoading(false);
        return;
      }
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: baziData, type: 'bazi' })
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
  }, [baziData, interpretation]);

  if (!baziData) return null;

  // Render một trụ (Năm, Tháng, Ngày, Giờ)
  const renderPillar = (title: string, data: any) => {
    if (!data) return null;
    
    // Format Cung Chứa (Hidden stems)
    const renderHiddenStem = (key: string, stem: any) => {
      if (!stem) return null;
      return (
        <div className="flex flex-col items-center justify-center pt-2 border-t border-[#F0EBE5] min-h-[40px]">
          <span className="text-[11px] text-[#A39A92]">{key}</span>
          <span className="text-sm font-semibold text-[#8B5E3C]">{tCan(stem.天干)}</span>
          <span className="text-[10px] text-[#8B7E74]">{tGod(stem.十神)}</span>
        </div>
      );
    };

    return (
      <div className="flex flex-col border border-[#F0EBE5] rounded-xl overflow-hidden bg-white shadow-sm flex-1">
        <div className="bg-[#FDF1E9] py-2 text-center text-xs font-bold text-[#8B5E3C] border-b border-[#F0EBE5]">
          {title}
        </div>
        
        {/* Thiên Can */}
        <div className="p-3 text-center flex flex-col gap-1 items-center bg-[#FAFAFA]">
          <span className="text-[10px] text-[#A39A92] uppercase">Thiên Can</span>
          <span className="text-2xl font-bold text-[#2D2D2D] my-1">{tCan(data.天干?.天干)}</span>
          <span className="text-xs text-[#8B7E74] font-medium bg-[#F0EBE5] px-2 py-0.5 rounded-md min-w-[50px]">
            {tGod(data.天干?.十神) || 'Nhật Chủ'}
          </span>
        </div>

        {/* Địa Chi */}
        <div className="p-3 text-center flex flex-col gap-1 items-center border-t border-[#F0EBE5]">
          <span className="text-[10px] text-[#A39A92] uppercase">Địa Chi</span>
          <span className="text-2xl font-bold text-[#2D2D2D] my-1">{tChi(data.地支?.地支)}</span>
          <div className="flex gap-2 w-full mt-2">
            <div className="flex-1">{renderHiddenStem('Chủ khí', data.地支?.藏干?.主气)}</div>
            {data.地支?.藏干?.中气 && <div className="flex-1">{renderHiddenStem('Trung khí', data.地支?.藏干?.中气)}</div>}
            {data.地支?.藏干?.余气 && <div className="flex-1">{renderHiddenStem('Dư khí', data.地支?.藏干?.余气)}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 fade-in pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FDF1E9]/50 to-transparent relative -mx-6 md:-mx-12 px-6 md:px-12 mb-6">
         <button
          onClick={onBack}
          className="absolute left-6 md:left-12 top-6 text-[#A39A92] hover:text-[#2D2D2D] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-4xl mb-2">✨</span>
        <h2 className="text-2xl font-light text-[#1A1A1A]">Hồ Sơ Bát Tự</h2>
        <div className="text-sm text-[#8B7E74] mt-1 space-x-2">
          <span className="font-semibold text-[#8B5E3C]">{tCan(baziData.日主)}</span> chủ
          <span>•</span> 
          <span>Tuổi {tZodiac(baziData.生肖).split(' ')[0]}</span>
          <span>•</span>
          <span>{tGender(baziData.性别)}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-2 space-y-6">
        
        {/* Tứ Trụ Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
            Bảng Tứ Trụ
          </h3>
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {renderPillar('Trụ Giờ', baziData.时柱)}
            {renderPillar('Trụ Ngày', baziData.日柱)}
            {renderPillar('Trụ Tháng', baziData.月柱)}
            {renderPillar('Trụ Năm', baziData.年柱)}
          </div>
        </div>

        {/* Thần Sát */}
        <div className="space-y-3 pt-4 border-t border-[#F0EBE5]">
          <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
            Thần Sát Nổi Bật
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...(baziData.神煞?.年柱 || []), ...(baziData.神煞?.日柱 || []), ...(baziData.神煞?.月柱 || []), ...(baziData.神煞?.时柱 || [])]
              .filter((v, i, a) => a.indexOf(v) === i) // unique
              .slice(0, 10)
              .map((sat: string, idx: number) => (
              <span key={idx} className="bg-[#F9F8F6] text-[#6B5A4D] px-3 py-1.5 rounded-lg text-sm border border-[#EBE3DC]">
                {tStar(sat)}
              </span>
            ))}
          </div>
        </div>

        {/* Đại Vận */}
        <div className="space-y-3 pt-4 border-t border-[#F0EBE5]">
          <h3 className="text-sm font-semibold text-[#8B7E74] uppercase tracking-wider ml-1 flex justify-between items-end">
            <span>Đại Vận (10 Năm)</span>
            <span className="text-xs font-normal lowercase">bắt đầu lúc {baziData.大运?.起运年龄} tuổi</span>
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {baziData.大运?.大运?.slice(0, 6).map((van: any, idx: number) => (
              <div key={idx} className="flex-none w-24 bg-white border border-[#EBE3DC] rounded-xl p-3 text-center flex flex-col gap-1 items-center shadow-sm">
                <span className="text-lg font-bold text-[#8B5E3C]">{tCanChi(van.干支)}</span>
                <span className="text-[11px] text-[#A39A92]">{van.开始年龄}-{van.结束年龄}t</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lời Bình AI Gemini */}
        <div className="bg-[#FDF1E9] rounded-2xl p-5 border border-[#F0EBE5] relative mt-8">
          <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-sm">
            <Sparkles className="text-[#D85A30]" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#8B5E3C] mb-3 font-serif">
            Khám Phá Chiếu Trí (Từ AI)
          </h3>
          
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-[#A39A92]">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-sm">Đang chiêm nghiệm Bát Tự của bạn...</p>
            </div>
          ) : interpretation ? (
            <div className="text-[15px] leading-relaxed text-[#2D2D2D] space-y-4">
              {interpretation.split('\n\n').map((para, i) => {
                // Rất cơ bản: parse **text** thành in đậm
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
