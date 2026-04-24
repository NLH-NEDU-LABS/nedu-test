import { useState } from 'react';
import { api } from '@/lib/api';

export default function EnneagramResultView({
  enneagramType,
  enneagramDesc,
  token,
  nextStep,
  mode,
}: {
  enneagramType: string | number;
  enneagramDesc?: string;
  token?: string;
  nextStep?: string;
  mode?: string;
}) {
  const [showConsent, setShowConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConsent = async (consent: boolean) => {
    if (!token) return;
    setIsSaving(true);
    try {
      await api.post('/express/complete', { token, consent });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = `https://test.nedu.vn/report/${token}`;
    }
  };

  if (showConsent) {
    return (
      <div className="max-w-xl mx-auto p-4 py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-[22px] font-bold mb-4 text-[#1C1917] tracking-tight">Chia sẻ kết quả</h2>
        <p className="text-[15px] text-[#6B6B6B] mb-8 leading-relaxed">
          Bạn có muốn chia sẻ kết quả với đội ngũ Nedu không?
          <br />
          (Sau bước này bạn sẽ nhận được báo cáo chi tiết)
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            disabled={isSaving}
            onClick={() => handleConsent(true)}
            className="px-6 py-3 bg-[#8B5E3C] text-white rounded-[14px] text-[15px] font-semibold hover:bg-[#704B30] disabled:opacity-50 tracking-tight"
          >
            Có, tôi muốn chia sẻ
          </button>
          <button
            disabled={isSaving}
            onClick={() => handleConsent(false)}
            className="px-6 py-3 bg-[#F2F2F7] text-[#1C1917] rounded-[14px] text-[15px] font-medium hover:bg-[#E5E5EA] disabled:opacity-50 tracking-tight"
          >
            Không, cảm ơn
          </button>
        </div>
        {isSaving && <p className="mt-4 text-sm text-[#8E8E93]">Đang tạo báo cáo chi tiết...</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-16 text-center">
      <h2 className="text-[22px] font-bold mb-4 text-[#1C1917] tracking-tight">Kết quả Enneagram của bạn</h2>
      <div className="text-6xl font-bold text-[#8B5E3C] mb-6 tracking-tight">Type {enneagramType}</div>
      {enneagramDesc ? (
        <div className="text-[15px] text-[#1C1917] leading-relaxed text-left bg-[#F9F9F9] p-6 rounded-2xl border border-[#E5E5EA]">
          {enneagramDesc.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">Đang hiển thị kết quả. Vui lòng check email để nhận báo cáo chi tiết.</p>
      )}

      {nextStep === 'report' && mode === 'express' && (
        <div className="mt-8">
          <button
            onClick={() => setShowConsent(true)}
            className="inline-flex items-center justify-center gap-2 group px-8 py-4 bg-[#8B5E3C] text-white hover:bg-[#704B30] rounded-[14px] text-[15px] font-semibold transition-all tracking-tight"
          >
            Tiếp tục
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
