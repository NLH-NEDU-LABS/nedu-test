"use client";

import { useState } from 'react';
import { MBTI_QUESTIONS, calculateMBTI } from '@/lib/mbti-scoring';
import MbtiResultView from './MbtiResultView';

export default function MbtiQuizClient({ token }: { token: string }) {
  const [state, setState] = useState<'quiz' | 'analyzing' | 'result'>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [mbtiDesc, setMbtiDesc] = useState<string | undefined>(undefined);

  const handleNext = () => {
    if (currentIdx < MBTI_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Hoàn thành bài test
      setState('analyzing');
      const type = calculateMBTI(answers);
      setMbtiType(type);
      
      // Gọi API cập nhật type (sẽ implement route này sau)
      fetch('/api/mbti/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, mbti_type: type })
      }).then(res => res.json()).then((data) => {
        if (data.mbti_desc) setMbtiDesc(data.mbti_desc);
        setState('result');
      }).catch((e) => {
        console.error("Lỗi khi lưu kết quả MBTI:", e);
        setState('result'); // Vẫn render kết quả ngay cả khi lưu lỗi tạm thời
      });
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleOptionSelect = (opt: string) => {
    setAnswers(prev => ({ ...prev, [MBTI_QUESTIONS[currentIdx].id]: opt }));
  };

  if (state === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto p-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl text-gray-700">Đang phân tích dữ liệu tính cách của bạn...</h2>
      </div>
    );
  }

  if (state === 'result' && mbtiType) {
    return <MbtiResultView mbtiType={mbtiType} mbtiDesc={mbtiDesc} />;
  }

  const q = MBTI_QUESTIONS[currentIdx];
  const answered = answers[q.id];

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      <div className="mb-10">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Khám phá tính cách MBTI</span>
          <span>Câu {currentIdx + 1} / {MBTI_QUESTIONS.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#8B5E3C] rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentIdx + 1) / MBTI_QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-8 text-gray-800 leading-relaxed">
        {q.question}
      </h2>
      
      <div className="space-y-3">
        {Object.entries(q.options).map(([optKey, optText]) => {
          const isSelected = answered === optKey;
          return (
            <button 
              key={optKey}
              onClick={() => handleOptionSelect(optKey)}
              className={`block w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-[#8B5E3C] bg-[#FAF8F5]' 
                  : 'border-gray-100 hover:border-[#D5CDC4] hover:bg-gray-50/50'
              }`}
            >
              <span className="text-gray-700">{optText}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-between">
        <button 
          onClick={handleBack} 
          disabled={currentIdx === 0}
          className="px-6 py-3 rounded-xl font-medium transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100"
        >
          Quay lại
        </button>
        <button 
          onClick={handleNext}
          disabled={!answered}
          className="px-8 py-3 rounded-xl font-medium transition-colors bg-[#8B5E3C] text-white hover:bg-[#6e492d] disabled:opacity-50 disabled:hover:bg-[#8B5E3C]"
        >
          {currentIdx === MBTI_QUESTIONS.length - 1 ? 'Xem kết quả' : 'Tiếp theo'}
        </button>
      </div>
    </div>
  );
}
