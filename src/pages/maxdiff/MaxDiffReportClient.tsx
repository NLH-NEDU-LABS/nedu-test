import type { ScoredItem, CourseRecommendation } from '@/types/assessment';

interface MaxDiffReportClientProps {
  scores: ScoredItem[];
  aiRecommendation: CourseRecommendation | null;
  personaLabel: string;
  topProblem1: string;
  topProblem2: string;
}

export function MaxDiffReportClient({
  scores,
  aiRecommendation,
  personaLabel,
  topProblem1,
  topProblem2,
}: MaxDiffReportClientProps) {
  const sortedScores = [...scores].sort((a, b) => b.normalized - a.normalized);

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 bg-[#FDF1E9] text-[#8B5E3C] rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3">
            Kết quả phân tích
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#1A1A1A] mb-2">
            Những gì Nedu <span className="font-semibold italic">thấy ở bạn</span>
          </h1>
          {personaLabel && (
            <p className="text-sm text-[#8B7E74]">
              Giai đoạn: <span className="font-medium text-[#5C5550]">{personaLabel}</span>
            </p>
          )}
        </div>

        {/* Top Needs */}
        {(topProblem1 || topProblem2) && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-[#F0EBE5] shadow-sm">
            <h2 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider mb-3">
              Nhu cầu ưu tiên của bạn
            </h2>
            <div className="space-y-2">
              {topProblem1 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🥇</span>
                  <p className="text-sm text-[#2D2D2D] font-medium">{topProblem1}</p>
                </div>
              )}
              {topProblem2 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🥈</span>
                  <p className="text-sm text-[#2D2D2D]">{topProblem2}</p>
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
        {aiRecommendation && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
              Gợi ý hành trình phù hợp nhất
            </h2>

            {/* Primary Course */}
            <div className="p-5 bg-[#FDF1E9]/50 rounded-2xl border border-[#FDF1E9]">
              <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#EACbb3] text-xs font-medium text-[#8B5E3C]">
                <span>⭐</span> Recommended
              </div>
              <a
                href={aiRecommendation.primary_course_url || 'https://nedu.nhi.sg/'}
                target="_blank"
                rel="noreferrer"
                className="text-xl font-medium text-[#8B5E3C] mb-3 hover:underline flex items-center gap-1.5"
              >
                {aiRecommendation.primary_course_name} ↗
              </a>
              <p className="text-sm text-[#5C5550] leading-relaxed mb-4">
                <span className="font-semibold block mb-1">Tại sao khóa này phù hợp với bạn?</span>
                {aiRecommendation.why_fits}
              </p>
              {aiRecommendation.learning_style_note && (
                <div className="text-xs text-[#8B7E74] bg-white p-3 rounded-xl border border-[#F0EBE5]">
                  <span className="font-semibold text-[#8B5E3C]">Lưu ý về phương pháp: </span>
                  {aiRecommendation.learning_style_note}
                </div>
              )}
              {aiRecommendation.urgency_message && (
                <p className="text-xs text-rose-600 mt-4 font-medium italic">
                  {aiRecommendation.urgency_message}
                </p>
              )}
            </div>

            {/* Backup Course */}
            {aiRecommendation.backup_course_id && aiRecommendation.backup_course_name && (
              <div className="p-4 bg-white rounded-2xl border border-[#F0EBE5]">
                <h3 className="text-sm font-semibold text-[#8B7E74] mb-1">
                  Lựa chọn thay thế:
                </h3>
                <a
                  href={aiRecommendation.backup_course_url || 'https://nedu.nhi.sg/'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2D2D2D] font-medium text-sm hover:underline hover:text-[#8B5E3C]"
                >
                  {aiRecommendation.backup_course_name} ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-[#F0EBE5]">
          <p className="text-xs text-[#A39A92] mb-4">
            Kết quả được phân tích bởi Nedu AI dựa trên phương pháp Best-Worst Scaling
          </p>
          <a
            href="https://test.nhi.sg"
            className="inline-block text-sm font-medium text-[#8B5E3C] hover:underline underline-offset-4"
          >
            ← Quay lại trang chủ Nedu
          </a>
        </div>
      </div>
    </main>
  );
}
