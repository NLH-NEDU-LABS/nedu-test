import React, { useState } from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import { FollowUpModal } from './FollowUpModal';
// import { MaxDiffResultChart } from './MaxDiffResultChart';
import type { AssessmentResult, Persona } from '@/types/assessment';
import type { UserBirthData } from '@/types/user-data';
import { isExpressMode } from '@/config/constants';

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

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
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
                {isExpressMode ? (
                  <><span>✨</span> Tiếp tục làm bài phân tích chuyên sâu</>
                ) : (
                  <><span>📩</span> Nhận kết quả phân tích chi tiết qua Email</>
                )}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full h-auto max-h-[90vh] rounded-3xl max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col border border-[#F0EBE5]">
            
            <div className="flex-1 overflow-y-auto px-6 lg:px-8 pt-8 pb-6 custom-scrollbar">
               {/* Logos at top */}
               <div className="flex items-center justify-center gap-5 mb-6">
                 <div className="w-12 h-12 bg-[#F9F8F6] border border-[#F0EBE5] rounded-full flex items-center justify-center shadow-sm">
                   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A39A92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
                 </svg>
                 <div className="w-12 h-12 bg-white border border-[#EACbb3]/50 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                   <img src="/nedu-logo.jpg" alt="Nedu" className="w-full h-full object-cover" />
                 </div>
               </div>

               <p className="text-sm text-[#2D2D2D] leading-relaxed mb-2">
                 Bằng cách nhấn &ldquo;Đồng ý&rdquo;, bạn xác nhận đã đọc và cho phép N-Education (thuộc NHILE HOLDING.,JSC, ĐKKD số: 0402230476) thu thập và xử lý các dữ liệu cá nhân sau theo Luật Bảo vệ dữ liệu cá nhân năm 2025, Nghị định số 356/2025/NĐ-CP:
               </p>
               <p className="text-[#2D2D2D] text-sm mb-5 font-semibold">
                 Xem chi tiết quyền truy cập:
               </p>

               <ul className="space-y-4 mb-6">
                 {[
                   <><span className="font-semibold text-[#2D2D2D]">Thông tin cơ bản</span> — họ và tên, ngày tháng năm sinh, giờ sinh, nơi sinh, giới tính, email, số điện thoại, độ tuổi, công việc</>,
                   <><span className="font-semibold text-[#2D2D2D]">Kết quả bài test</span> — điểm số và phân tích năng lực học tập</>,
                   <><span className="font-semibold text-[#2D2D2D]">Dữ liệu hành vi</span> — cookies và analytics trong phiên làm bài <span className="text-[#8B7E74]">(chỉ dùng để cải thiện trải nghiệm)</span></>
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-start gap-3.5 text-[13px] text-[#5C5550] leading-relaxed">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                       <circle cx="12" cy="12" r="10" fill="#FDF1E9" />
                       <path d="M8 12L10.5 14.5L16 9" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>

               <div className="border-t border-[#F0EBE5] pt-5 space-y-2.5">
                 <p className="text-xs text-[#8B7E74] leading-relaxed">
                   <span className="font-medium text-[#5C5550]">Mục đích xử lý dữ liệu:</span> Đánh giá năng lực và đề xuất khoá học phù hợp với bạn.
                 </p>
                 <p className="text-xs text-[#8B7E74] leading-relaxed">
                   <span className="font-medium text-[#5C5550]">Thời gian lưu trữ:</span> Tối đa 24 tháng kể từ ngày thu thập, hoặc đến khi chúng tôi nhận được yêu cầu xoá của bạn.
                 </p>
                 <p className="text-xs text-[#8B7E74] leading-relaxed">
                   <span className="font-medium text-[#5C5550]">Chia sẻ dữ liệu:</span> Chúng tôi không bán dữ liệu của bạn. Dữ liệu chỉ được chia sẻ với các đơn vị, cá nhân thực hiện vận hành kỹ thuật (như hệ thống lưu trữ đám mây) theo hợp đồng bảo mật ràng buộc, và cơ quan nhà nước khi có yêu cầu hợp pháp.
                 </p>
                 <p className="text-xs text-[#8B7E74] leading-relaxed">
                   <span className="font-medium text-[#5C5550]">Quyền của bạn:</span> Xem, chỉnh sửa, hoặc xoá dữ liệu bất cứ lúc nào — liên hệ <a href="mailto:privacy@n-education.com" className="text-[#8B5E3C] hover:underline font-medium">privacy@n-education.com</a> (phản hồi trong 72 giờ)
                 </p>
                 <p className="text-xs text-[#8B7E74] leading-relaxed">
                   <a href="#" className="text-[#8B5E3C] hover:underline font-medium">Xem đầy đủ Chính sách Bảo mật</a>
                 </p>
               </div>
            </div>

            <div className="p-6 bg-white border-t border-[#F0EBE5] flex flex-col gap-2">
              <button
                onClick={handleAcceptTerms}
                className="w-full py-4 bg-[#8B5E3C] text-white rounded-2xl font-medium hover:bg-[#704B30] transition-colors mt-2 shadow-sm cursor-pointer"
              >
                Đồng ý
              </button>
              <button
                onClick={() => {
                   alert('Xin lỗi, nhưng Nedu cần phải thu thập các thông tin trên mới có thể phân tích và kết xuất kết quả cho bạn.');
                }}
                className="w-full py-2 bg-transparent text-[#8B7E74] hover:text-[#2D2D2D] font-medium text-sm transition-colors"
               >
                Không đồng ý
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
