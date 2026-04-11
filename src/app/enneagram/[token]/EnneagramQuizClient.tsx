"use client";

import { useState } from 'react';
import {
  ENNEAGRAM_PHASE1,
  ENNEAGRAM_PHASE2,
  LIKERT_OPTIONS,
  type Center,
  type EnneagramQuestion,
} from '@/features/enneagram/data';
import { determineCenter, calculateEnneagramType } from '@/features/enneagram/scoring';
import AssessmentResultView from '@/components/quiz/shared/AssessmentResultView';

type AppState = 'quiz' | 'analyzing' | 'result';

const LIKERT_KEYS = ["1", "2", "3", "4", "5"] as const;

export default function EnneagramQuizClient({ token }: { token: string }) {
  const [appState, setAppState] = useState<AppState>('quiz');
  const [phase, setPhase] = useState<1 | 2>(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase1Answers, setPhase1Answers] = useState<Record<string, string>>({});
  const [phase2Answers, setPhase2Answers] = useState<Record<string, string>>({});
  const [center, setCenter] = useState<Center | null>(null);
  const [enneagramType, setEnneagramType] = useState<number | null>(null);
  const [enneagramDesc, setEnneagramDesc] = useState<string | undefined>(undefined);

  const phase1Questions = ENNEAGRAM_PHASE1;
  const phase2Questions = center ? ENNEAGRAM_PHASE2[center] : [];
  const currentQuestions: EnneagramQuestion[] = phase === 1 ? phase1Questions : phase2Questions;
  const totalQuestions = phase1Questions.length + (center ? ENNEAGRAM_PHASE2[center].length : ENNEAGRAM_PHASE2.gut.length);
  const globalIdx = phase === 1 ? currentIdx : phase1Questions.length + currentIdx;

  const currentAnswers = phase === 1 ? phase1Answers : phase2Answers;
  const setCurrentAnswers = phase === 1 ? setPhase1Answers : setPhase2Answers;

  const q = currentQuestions[currentIdx];
  const answered = q ? currentAnswers[q.id] : undefined;

  const handleSelect = (val: string) => {
    if (!q) return;
    setCurrentAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const handleNext = () => {
    if (phase === 1) {
      if (currentIdx < phase1Questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Phase 1 xong → tính trung tâm → chuyển phase 2
        const detectedCenter = determineCenter(phase1Answers);
        setCenter(detectedCenter);
        setPhase(2);
        setCurrentIdx(0);
      }
    } else {
      if (currentIdx < phase2Questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Phase 2 xong → tính type → gọi API
        setAppState('analyzing');
        const detectedCenter = center!;
        const type = calculateEnneagramType(detectedCenter, phase2Answers);
        setEnneagramType(type);

        fetch('/api/enneagram/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, enneagram_type: type })
        })
          .then(res => res.json())
          .then(data => {
            if (data.enneagram_desc) setEnneagramDesc(data.enneagram_desc);
            setAppState('result');
          })
          .catch(e => {
            console.error("Lỗi khi lưu kết quả Enneagram:", e);
            setAppState('result');
          });
      }
    }
  };

  const handleBack = () => {
    if (phase === 2 && currentIdx === 0) {
      // Quay về câu cuối phase 1
      setPhase(1);
      setCenter(null);
      setCurrentIdx(phase1Questions.length - 1);
      setPhase2Answers({});
    } else if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  if (appState === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto p-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl text-gray-700">Đang phân tích dữ liệu tính cách của bạn...</h2>
      </div>
    );
  }

  if (appState === 'result' && enneagramType !== null) {
    return <AssessmentResultView 
             title="Kết quả Enneagram của bạn"
             typeLabel={`Type ${enneagramType}`}
             description={enneagramDesc} 
           />;
  }

  if (!q) return null;

  const isLastQuestion = phase === 2 && currentIdx === phase2Questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Khám phá tính cách Enneagram</span>
          <span>Câu {globalIdx + 1} / {totalQuestions}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8B5E3C] rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((globalIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        {phase === 2 && center && (
          <p className="text-xs text-[#8B7E74] mt-2">
            {center === 'gut' && 'Trung tâm Bản năng'}
            {center === 'heart' && 'Trung tâm Cảm xúc'}
            {center === 'head' && 'Trung tâm Lý trí'}
          </p>
        )}
      </div>

      {/* Statement */}
      <h2 className="text-xl font-medium mb-2 text-gray-800 leading-relaxed">
        {q.statement}
      </h2>
      <p className="text-sm text-[#8B7E74] mb-8">Câu này đúng với bạn ở mức nào?</p>

      {/* Likert scale */}
      <div className="space-y-2">
        {LIKERT_KEYS.map(key => {
          const isSelected = answered === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#8B5E3C] bg-[#FAF8F5]'
                  : 'border-gray-100 hover:border-[#D5CDC4] hover:bg-gray-50/50'
              }`}
            >
              <span className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                isSelected
                  ? 'bg-[#8B5E3C] border-[#8B5E3C] text-white'
                  : 'border-gray-200 text-gray-500'
              }`}>
                {key}
              </span>
              <span className="text-gray-700 text-sm">{LIKERT_OPTIONS[key]}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex justify-between">
        <button
          onClick={handleBack}
          disabled={phase === 1 && currentIdx === 0}
          className="px-6 py-3 rounded-xl font-medium transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100"
        >
          Quay lại
        </button>
        <button
          onClick={handleNext}
          disabled={!answered}
          className="px-8 py-3 rounded-xl font-medium transition-colors bg-[#8B5E3C] text-white hover:bg-[#6e492d] disabled:opacity-50 disabled:hover:bg-[#8B5E3C]"
        >
          {isLastQuestion ? 'Xem kết quả' : 'Tiếp theo'}
        </button>
      </div>
    </div>
  );
}
