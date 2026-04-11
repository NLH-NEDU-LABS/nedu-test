"use client";

import { useEffect } from 'react';
import MbtiResultView from '@/app/mbti/[token]/MbtiResultView';
import EnneagramResultView from '@/app/enneagram/[token]/EnneagramResultView';
import { BaziResultView } from '@/components/quiz/BaziResultView';
import { NumerologyResultView } from '@/components/quiz/NumerologyResultView';
import type { QuizReportPayload } from '@/features/report/service';
import type { ScoredItem, CourseRecommendation } from '@/types/assessment';

interface ReportClientProps {
  data: QuizReportPayload;
  token: string;
}

export default function ReportClient({ data, token }: ReportClientProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === '1') {
      setTimeout(() => window.print(), 1500);
    }
  }, []);
  const {
    persona_label,
    top_problem_1,
    top_problem_2,
    maxdiff_scores,
    ai_recommendation,
    mbti_type,
    mbti_desc,
    enneagram_type,
    enneagram_desc,
    bazi_data,
    numerology_data,
    bazi_interp,
    numerology_interp,
  } = data;

  const sortedScores = [...(maxdiff_scores as ScoredItem[])].sort(
    (a, b) => b.normalized - a.normalized
  );
  const rec = ai_recommendation as CourseRecommendation | null;

  return (
    <main className="min-h-screen bg-[#FDFCFB]">

      {/* ── 01 MaxDiff ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 bg-[#FDF1E9] text-[#8B5E3C] rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3">
            Kết quả phân tích
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#1A1A1A] mb-2">
            Những gì Nedu <span className="font-semibold italic">thấy ở bạn</span>
          </h1>
          {persona_label && (
            <p className="text-sm text-[#8B7E74]">
              Giai đoạn: <span className="font-medium text-[#5C5550]">{persona_label}</span>
            </p>
          )}
        </div>

        {/* Top Needs */}
        {(top_problem_1 || top_problem_2) && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-[#F0EBE5] shadow-sm">
            <h2 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider mb-3">
              Nhu cầu ưu tiên của bạn
            </h2>
            <div className="space-y-2">
              {top_problem_1 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🥇</span>
                  <p className="text-sm text-[#2D2D2D] font-medium">{top_problem_1}</p>
                </div>
              )}
              {top_problem_2 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🥈</span>
                  <p className="text-sm text-[#2D2D2D]">{top_problem_2}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BWS Score Chart */}
        {sortedScores.length > 0 && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-[#F0EBE5] shadow-sm">
            <h2 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider mb-4">
              Bản đồ nhu cầu chi tiết
            </h2>
            <div className="space-y-3">
              {sortedScores.map((score, idx) => {
                const barWidth = Math.max(score.normalized, 2);
                const isTop = idx < 2;
                return (
                  <div key={score.item_id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs leading-snug ${isTop ? 'font-semibold text-[#8B5E3C]' : 'text-[#5C5550]'}`}>
                        {score.label}
                      </span>
                      <span className="text-[11px] text-[#A39A92] font-mono tabular-nums ml-2 flex-shrink-0">
                        {score.normalized.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F5F2EF] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isTop ? 'bg-[#8B5E3C]' : 'bg-[#D4C4B0]'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Course Recommendation */}
        {rec ? (
          <div className="mb-8 space-y-4">
            <h2 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
              Gợi ý hành trình phù hợp nhất
            </h2>
            <div className="p-5 bg-[#FDF1E9]/50 rounded-2xl border border-[#FDF1E9]">
              <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#EACbb3] text-xs font-medium text-[#8B5E3C]">
                <span>⭐</span> Recommended
              </div>
              <a
                href={rec.primary_course_url || 'https://nedu.nhi.sg/'}
                target="_blank"
                rel="noreferrer"
                className="text-xl font-medium text-[#8B5E3C] mb-3 hover:underline flex items-center gap-1.5"
              >
                {rec.primary_course_name} ↗
              </a>
              <p className="text-sm text-[#5C5550] leading-relaxed mb-4">
                <span className="font-semibold block mb-1">Tại sao khóa này phù hợp với bạn?</span>
                {rec.why_fits}
              </p>
              {rec.learning_style_note && (
                <div className="text-xs text-[#8B7E74] bg-white p-3 rounded-xl border border-[#F0EBE5]">
                  <span className="font-semibold text-[#8B5E3C]">Lưu ý về phương pháp: </span>
                  {rec.learning_style_note}
                </div>
              )}
              {rec.urgency_message && (
                <p className="text-xs text-rose-600 mt-4 font-medium italic">{rec.urgency_message}</p>
              )}
            </div>
            {rec.backup_course_id && rec.backup_course_name && (
              <div className="p-4 bg-white rounded-2xl border border-[#F0EBE5]">
                <h3 className="text-sm font-semibold text-[#8B7E74] mb-1">Lựa chọn thay thế:</h3>
                <a
                  href={rec.backup_course_url || 'https://nedu.nhi.sg/'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2D2D2D] font-medium text-sm hover:underline hover:text-[#8B5E3C]"
                >
                  {rec.backup_course_name} ↗
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ── 02 MBTI ────────────────────────────────────────────── */}
      {mbti_type ? (
        <>
          <hr className="border-[#F0EBE5]" />
          <MbtiResultView mbtiType={mbti_type} mbtiDesc={mbti_desc ?? undefined} token={token} />
        </>
      ) : null}

      {enneagram_type ? (
        <>
          <hr className="border-[#F0EBE5]" />
          <EnneagramResultView
            enneagramType={enneagram_type}
            enneagramDesc={enneagram_desc ?? undefined}
            token={token}
          />
        </>
      ) : null}

      {/* ── 04 Bazi ────────────────────────────────────────────── */}
      {bazi_data ? (
        <>
          <hr className="border-[#F0EBE5]" />
          <div className="max-w-4xl mx-auto py-8 px-4">
            <BaziResultView baziData={bazi_data} baziInterp={bazi_interp ?? undefined} />
          </div>
        </>
      ) : null}

      {/* ── 05 Numerology ──────────────────────────────────────── */}
      {numerology_data ? (
        <>
          <hr className="border-[#F0EBE5]" />
          <div className="max-w-4xl mx-auto py-8 px-4">
            <NumerologyResultView
              numerologyData={numerology_data}
              numerologyInterp={numerology_interp ?? undefined}
            />
          </div>
        </>
      ) : null}

    </main>
  );
}
