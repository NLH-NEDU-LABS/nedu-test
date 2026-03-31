import React, { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import type { UserBirthData } from '@/types/user-data';
import { BaziResultView } from './BaziResultView';
import { NumerologyResultView } from './NumerologyResultView';

interface AdvancedTestScreenProps {
  onBackToResult: () => void;
  persona: any;
  userBirthData?: UserBirthData;
}

type TestType = 'mbti' | 'enneagram' | 'motivation' | 'numerology' | 'battu' | null;

const MOCK_QUESTIONS: Record<string, any[]> = {
  mbti: [{ id: 1, question: "Bạn cảm thấy tràn đầy năng lượng khi?", options: ["Gặp gỡ và nói chuyện với nhiều người", "Có thời gian yên tĩnh ở một mình", "Suy nghĩ về ý tưởng và khả năng mới", "Hoàn thành việc cụ thể"] }],
  enneagram: [{ id: 1, question: "Khi đối mặt với áp lực, bạn thường xử lý bằng cách?", options: ["Chủ động kiểm soát tình hình", "Xoa dịu cảm xúc người khác", "Tách mình ra để suy nghĩ", "Làm việc theo khuôn khổ"] }],
  motivation: [{ id: 1, question: "Điều gì thường thúc đẩy bạn hành động nhất?", options: ["Cơ hội vượt qua thử thách mới", "Tìm kiếm sự an toàn và ổn định", "Hoàn thành trách nhiệm được giao", "Được tự do sáng tạo"] }],
  numerology: [{ id: 1, question: "Bạn phát huy điểm mạnh tốt nhất khi làm việc ở môi trường?", options: ["Tự do, độc lập cá nhân", "Quy củ, kỷ luật chặt chẽ", "Nhiều cảm xúc, con người", "Năng động, gắn kết đội nhóm"] }],
  battu: [{ id: 1, question: "Năng lượng nào mô tả bạn đúng nhất lúc này?", options: ["Linh hoạt, chảy như Nước", "Nhiệt huyết, bùng cháy như Lửa", "Vững chãi, bao dung như Đất", "Nhanh nhẹn, thông tri như Gió"] }]
};

const PETALS = [
  { id: 'mbti', label: 'MBTI', angle: 0, color: '#9B7FCB', desc: '20 câu', icon: '🌸' },
  { id: 'enneagram', label: 'Enneagram', angle: 72, color: '#F5A623', desc: '30 câu', icon: '🌿' },
  { id: 'motivation', label: 'Động lực', angle: 144, color: '#E8636F', desc: '15 câu', icon: '🌊' },
  { id: 'battu', label: 'Bát tự', angle: 216, color: '#6BB58D', desc: '5 phút', icon: '✨' },
  { id: 'numerology', label: 'Thần số', angle: 288, color: '#1A7FA8', desc: '3 phút', icon: '⭐' }
];

export const AdvancedTestScreen = ({ onBackToResult, persona, userBirthData }: AdvancedTestScreenProps) => {
  const [activeTest, setActiveTest] = useState<TestType>(null);
  // Initially no tests are completed
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  // API fetched data cache
  const [baziData, setBaziData] = useState<any>(null);
  const [numerologyData, setNumerologyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePetalClick = async (petalId: TestType) => {
    if (!petalId || completedTests.includes(petalId)) return;

    if (petalId === 'battu' || petalId === 'numerology') {
      if ((petalId === 'battu' && baziData) || (petalId === 'numerology' && numerologyData)) {
        setActiveTest(petalId);
        return;
      }

      setActiveTest(petalId);
      setIsLoading(true);
      try {
        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userBirthData)
        });
        const data = await res.json();
        if (data.success) {
          setBaziData(data.bazi);
          setNumerologyData(data.numerology);
        }
      } catch (err) {
        console.error("Failed to load calculation:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveTest(petalId);
    }
  };

  if (completedTests.length === 5) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700 w-full px-6 py-12">
        <div className="w-24 h-24 bg-[#E8F5EE] text-[#1D9E75] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border-[6px] border-[#1D9E75]/10">
          ✓
        </div>
        <h2 className="text-2xl font-medium text-[#1A1A1A] mb-3 text-center">Chúc mừng bạn!</h2>
        <p className="text-sm text-[#8B7E74] text-center mb-8 max-w-xs leading-relaxed">
          Bạn đã hoàn thành bản đồ 5 cánh hoa Nedu. Báo cáo chuyên sâu đã được phân tích hoàn tất và đang được gửi về email của bạn.
        </p>
        <button
          onClick={onBackToResult}
          className="w-full bg-[#8B5E3C] text-white p-4 rounded-xl font-medium hover:bg-[#704B30] transition-colors shadow-md"
        >
          Xong & Trở về
        </button>
      </div>
    );
  }

  if (activeTest) {
    const testInfo = PETALS.find(p => p.id === activeTest);

    if (activeTest === 'battu') {
      if (isLoading) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in w-full text-[#8B7E74]">
            <Loader2 size={32} className="animate-spin text-[#8B5E3C] mb-4" />
            <p>Đang tính toán Bát Tự...</p>
          </div>
        );
      }
      return (
        <BaziResultView
          baziData={baziData}
          onBack={() => {
            setCompletedTests(prev => Array.from(new Set([...prev, 'battu'])));
            setActiveTest(null);
          }}
        />
      );
    }

    if (activeTest === 'numerology') {
      if (isLoading) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in w-full text-[#8B7E74]">
            <Loader2 size={32} className="animate-spin text-[#CDA376] mb-4" />
            <p>Đang phân tích Thần Số Học...</p>
          </div>
        );
      }
      return (
        <NumerologyResultView
          numerologyData={numerologyData}
          onBack={() => {
            setCompletedTests(prev => Array.from(new Set([...prev, 'numerology'])));
            setActiveTest(null);
          }}
        />
      );
    }

    const mockQ = MOCK_QUESTIONS[activeTest]?.[0] || MOCK_QUESTIONS.mbti[0];

    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 fade-in pb-12 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-[#F0EBE5] mb-8 w-[100vw] -ml-6 md:-ml-12 px-6 md:px-12 bg-white sticky top-0 z-20">
          <button
            onClick={() => setActiveTest(null)}
            className="text-[#A39A92] hover:text-[#2D2D2D] transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-xs font-semibold tracking-widest text-[#8B5E3C] uppercase flex items-center gap-2">
            <span>{testInfo?.icon}</span>
            {testInfo?.label} - 1/1
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-2">
          <div className="text-center mb-8">
            <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-3 bg-[#FDF1E9] inline-block px-3 py-1 rounded-full">Câu 1</h3>
            <h2 className="text-[22px] font-normal text-[#1A1A1A] leading-relaxed">
              {mockQ.question}
            </h2>
          </div>

          <div className="space-y-3">
            {mockQ.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setCompletedTests(prev => [...prev, activeTest]);
                  setActiveTest(null);
                }}
                className="w-full text-left p-4 rounded-xl border border-[#F0EBE5] bg-white text-[#4A4A4A] hover:border-[#8B5E3C]/40 hover:bg-[#FDF1E9]/30 transition-all font-medium text-[15px] flex items-center gap-4 cursor-pointer shadow-sm hover:shadow"
              >
                <span className="w-8 h-8 rounded-full bg-[#F9F8F6] flex items-center justify-center text-xs font-bold text-[#A39A92] shrink-0 border border-[#F0EBE5]">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="leading-snug">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500 w-full relative">
      <button
        onClick={onBackToResult}
        className="absolute top-0 left-0 p-2 text-[#A39A92] hover:text-[#2D2D2D] transition-colors cursor-pointer -ml-2 -mt-2 z-40"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Header */}
      <div className="text-center space-y-3 mt-4 w-full">
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8B5E3C]/60 mb-6">
          N · E · D · U
        </div>
        <h2 className="text-[28px] font-light text-[#1A1A1A]">
          Hành trình 5 cánh hoa
        </h2>
        <p className="text-[#8B7E74] text-sm">
          Chạm vào từng cánh để bắt đầu bài test
        </p>
      </div>

      {/* Flower — using the actual flower image with text overlays on each petal */}
      <div className="relative w-[420px] h-[420px] my-6 flex items-center justify-center">

        {/* The flower image itself */}
        <img
          src="/flower-5-petals.png"
          alt="5 cánh hoa Nedu"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Clickable text overlays on each petal */}
        {PETALS.map((petal) => {
          const isCompleted = completedTests.includes(petal.id);
          const rad = (petal.angle - 90) * (Math.PI / 180);
          const r = 115; // tuned for square-cropped image in 420px container
          const cx = Math.cos(rad) * r;
          const cy = Math.sin(rad) * r;

          return (
            <button
              key={petal.id}
              onClick={() => handlePetalClick(petal.id as TestType)}
              className={`absolute top-1/2 left-1/2 w-[130px] h-[130px] rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-20 ${isCompleted ? 'opacity-40 pointer-events-none' : 'hover:scale-110 active:scale-95'}`}
              style={{
                transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`,
                background: 'transparent',
              }}
            >
              <span className="text-[26px] mb-1 drop-shadow-md">{petal.icon}</span>
              <span
                className="text-[14px] font-bold leading-tight text-white"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                {petal.label}
              </span>
              <span
                className="text-[11px] mt-0.5 font-medium text-white/90"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {isCompleted ? '✓ Xong' : petal.desc}
              </span>
            </button>
          );
        })}

        {/* Center Nedu label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full flex flex-col items-center justify-center z-30">
          <span className="text-[#8B5E3C] text-[16px] font-bold tracking-wide">Nedu</span>
          <span className="text-[#A39A92] text-[11px] mt-0.5 font-bold tracking-widest">{completedTests.length}/5</span>
        </div>
      </div>

      {/* Pagination dots & status */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2, 3, 4].map(idx => (
          <div key={idx} className={`w-2 h-2 rounded-full transition-colors duration-500 ${idx < completedTests.length ? 'bg-[#8B5E3C]' : 'bg-[#EAE1D9]'}`}></div>
        ))}
      </div>

      <p className="text-[13px] text-[#A39A92] italic mb-8">
        Còn {5 - completedTests.length} cánh nữa — chạm vào từng cánh để bắt đầu
      </p>

    </div>
  );
};
