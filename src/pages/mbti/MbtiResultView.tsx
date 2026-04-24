import { Link } from 'react-router-dom';

export default function MbtiResultView({
  mbtiType,
  mbtiDesc,
  token,
  nextStep,
}: {
  mbtiType: string;
  mbtiDesc?: string;
  token: string;
  nextStep?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto p-4 py-16 text-center">
      <h2 className="text-[22px] font-bold mb-4 text-[#1C1917] tracking-tight">Kết quả MBTI của bạn</h2>
      <div className="text-6xl font-bold text-[#8B5E3C] mb-6 tracking-tight">{mbtiType}</div>
      {mbtiDesc ? (
        <div className="text-[15px] text-[#1C1917] leading-relaxed text-left bg-[#F9F9F9] p-6 rounded-2xl border border-[#E5E5EA]">
          {mbtiDesc.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">Đang hiển thị kết quả. Vui lòng check email để nhận báo cáo chi tiết.</p>
      )}

      {nextStep === 'enneagram' && (
        <div className="mt-8">
          <Link
            to={`/enneagram/${token}?next=report&mode=express`}
            className="inline-flex items-center justify-center gap-2 group px-8 py-4 bg-[#8B5E3C] text-white hover:bg-[#704B30] rounded-[14px] text-[15px] font-semibold transition-all tracking-tight"
          >
            Làm tiếp Enneagram
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
