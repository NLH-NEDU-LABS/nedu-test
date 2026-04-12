import React, { useState } from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import { FollowUpModal } from './FollowUpModal';
// import { MaxDiffResultChart } from './MaxDiffResultChart';
import type { AssessmentResult, Persona } from '@/types/assessment';
import type { UserBirthData } from '@/types/user-data';

interface ResultScreenProps {
  result: AssessmentResult;
  persona: Persona;
  onRestart: () => void;
  onAdvancedTestStart?: (data: UserBirthData) => void;
}

const COURSE_TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  online: { label: 'Online', bg: 'bg-[#1D9E75]/10', text: 'text-[#1D9E75]' },
  retreat: { label: 'Retreat', bg: 'bg-[#D85A30]/10', text: 'text-[#D85A30]' },
  community: { label: 'Cộng đồng', bg: 'bg-[#378ADD]/10', text: 'text-[#378ADD]' },
  coaching: { label: 'Coaching', bg: 'bg-[#534AB7]/10', text: 'text-[#534AB7]' },
  signature: { label: 'Signature', bg: 'bg-[#BA7517]/10', text: 'text-[#BA7517]' },
};

export const ResultScreen = ({ result, persona, onRestart, onAdvancedTestStart }: ResultScreenProps) => {
  const [showModal, setShowModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleAcceptTerms = async () => {
    setHasAcceptedTerms(true);
    try {
      await fetch('/api/track-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: persona.id,
          source: typeof window !== 'undefined' ? window.location.hostname : 'web'
        }),
      });
    } catch (err) {
      console.error('Failed to log consent:', err);
    }
  };

  const handleFollowUpSubmit = (data: UserBirthData) => {
    console.log("Submit follow up:", data);
    setShowModal(false);
    if (onAdvancedTestStart) {
      onAdvancedTestStart(data);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-48 md:pb-0">

        {/* Header */}
        <div className="space-y-2 text-center mt-6 md:mt-0">
          <div className="inline-block px-4 py-1.5 bg-[#FDF1E9] text-[#8B5E3C] rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">
            Kết quả
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-[#1A1A1A]">
            Nedu đã hiểu bạn hơn <br className="md:hidden" />
            <span className="font-semibold italic">một chút</span>
          </h2>
          <p className="text-sm text-[#8B7E74] flex items-center justify-center gap-1.5">
            <span>{persona.emoji}</span> {persona.label}
          </p>
          <p className="text-sm text-[#8B7E74] mt-3 max-w-sm mx-auto leading-relaxed px-4">
            Dựa trên những gì bạn chia sẻ, đây là những gì chúng tôi nghĩ bạn đang cần nhất:
          </p>
        </div>



        {/* Course recommendations from AI */}
        {result.ai_recommendation ? (
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-semibold text-[#8B7E74] uppercase tracking-wider ml-1">
              Gợi ý hành trình phù hợp nhất
            </h3>
            <div className="p-5 bg-[#FDF1E9]/50 rounded-2xl border border-[#FDF1E9]">
              <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#EACbb3] text-xs font-medium text-[#8B5E3C]">
                <span>⭐</span> Recommended
              </div>
              <a 
                href={result.ai_recommendation.primary_course_url || "https://nedu.nhi.sg/"}
                target="_blank"
                rel="noreferrer"
                className="text-xl font-medium text-[#8B5E3C] mb-3 hover:underline flex items-center gap-1.5"
              >
                {result.ai_recommendation.primary_course_name} ↗
              </a>
              <p className="text-sm text-[#5C5550] leading-relaxed mb-4">
                <span className="font-semibold block mb-1">Tại sao khóa này phù hợp với bạn?</span>
                {result.ai_recommendation.why_fits}
              </p>
              <div className="text-xs text-[#8B7E74] bg-white p-3 rounded-xl border border-[#F0EBE5]">
                <span className="font-semibold text-[#8B5E3C]">Lưu ý về phương pháp: </span>
                {result.ai_recommendation.learning_style_note}
              </div>
              <p className="text-xs text-rose-600 mt-4 font-medium italic">
                {result.ai_recommendation.urgency_message}
              </p>
            </div>
            
            {(result.ai_recommendation.backup_course_id && result.ai_recommendation.backup_course_name) && (
              <div className="p-4 bg-white rounded-2xl border border-[#F0EBE5]">
                <h4 className="text-sm font-semibold text-[#8B7E74] mb-1">
                  Lựa chọn thay thế:
                </h4>
                <a 
                  href={result.ai_recommendation.backup_course_url || "https://nedu.nhi.sg/"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#2D2D2D] font-medium text-sm hover:underline hover:text-[#8B5E3C]"
                >
                  {result.ai_recommendation.backup_course_name} ↗
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 p-6 text-center text-sm text-[#8B7E74] bg-[#F9F8F6] rounded-2xl border border-[#F0EBE5]">
             Hệ thống gợi ý AI hiện không khả dụng. Xin vui lòng liên hệ Nedu để được tư vấn trực tiếp.
          </div>
        )}
        <div className="text-center pt-6 mb-2 md:mb-0">
           <button
            onClick={onRestart}
            className="text-xs font-medium text-[#A39A92] hover:text-[#6B6B6B] transition-colors cursor-pointer py-2 underline underline-offset-4 decoration-transparent hover:decoration-[#A39A92]"
          >
            Làm lại từ đầu
          </button>
        </div>

        {/* 🔥 STICKY CTA BLOCK */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent z-40 md:relative md:bg-transparent md:p-0 md:pt-8 md:mt-4 pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto flex flex-col items-center gap-3">
            <p className="text-sm text-[#8B7E74]">Bạn muốn tiếp tục như thế nào?</p>
            <div className="w-full space-y-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-[#8B5E3C] text-white p-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#704B30] transition-colors font-medium border border-transparent shadow-sm"
              >
                <span>📩</span> Nhận kết quả phân tích chi tiết qua Email
              </button>
              
              <a 
                href={result.ai_recommendation?.primary_course_url || "https://nedu.nhi.sg/"}
                target="_blank"
                rel="noreferrer"
                className="w-full border border-[#8B5E3C] text-[#8B5E3C] bg-white p-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FDF1E9] transition-colors font-medium shadow-sm block text-center"
              >
                Xem chi tiết khóa học phù hợp →
              </a>
            </div>
            <p className="text-xs text-[#8B7E74]">Lựa chọn nào cũng đáng giá cho hành trình của bạn</p>
          </div>
        </div>
      </div>

      {showModal && (
        <FollowUpModal
          onClose={() => setShowModal(false)}
          onSubmit={handleFollowUpSubmit}
        />
      )}

      {!hasAcceptedTerms && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 duration-500">
            <div className="w-12 h-12 bg-[#FDF1E9] text-[#8B5E3C] rounded-full flex items-center justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            
            <h3 className="text-xl font-medium text-[#1A1A1A]">Bảo mật & Quyền riêng tư</h3>
            
            <p className="text-sm text-[#5C5550] leading-relaxed">
              Bạn vui lòng cho phép Nedu lưu trữ và phân tích các lựa chọn vừa rồi để hệ thống có thể đối chiếu dữ liệu và tạo ra báo cáo chính xác nhất.
            </p>

            <div className="text-xs text-[#8B7E74] bg-[#F9F8F6] p-4 rounded-2xl border border-[#F0EBE5] leading-relaxed">
              Dữ liệu của bạn được bảo mật tuyệt đối, chỉ phục vụ cho việc cá nhân hóa lộ trình và phân tích nội bộ. Nedu cam kết không chia sẻ cho bên thứ ba.
            </div>

            <button
              onClick={handleAcceptTerms}
              className="w-full py-4 bg-[#8B5E3C] text-white rounded-2xl font-medium hover:bg-[#704B30] transition-colors mt-2 shadow-sm cursor-pointer"
            >
              Đồng ý & Xem kết quả
            </button>
          </div>
        </div>
      )}
    </>
  );
};
