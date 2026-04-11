import Link from 'next/link';

export default function MbtiResultView({ 
  mbtiType, 
  mbtiDesc,
  token,
  nextStep 
}: { 
  mbtiType: string; 
  mbtiDesc?: string;
  token: string;
  nextStep?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto p-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Kết quả MBTI của bạn</h2>
      <div className="text-6xl font-extrabold text-[#8B5E3C] mb-6">{mbtiType}</div>
      {mbtiDesc ? (
        <div className="text-gray-700 text-lg leading-relaxed text-left bg-[#FAF8F5] p-6 rounded-xl border border-[#EAE3DC]">
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
            href={`/enneagram/${token}?next=report&mode=express`}
            className="inline-flex items-center justify-center gap-2 group px-8 py-4 bg-[#B99A7B] text-white hover:bg-[#A38A6E] rounded-xl text-lg font-medium transition-all"
          >
            Làm tiếp Enneagram
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
