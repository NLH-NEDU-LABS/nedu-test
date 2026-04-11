"use client";

import { useState } from 'react';

export default function EnneagramResultView({ 
  enneagramType, 
  enneagramDesc,
  token,
  nextStep,
  mode
}: { 
  enneagramType: string | number, 
  enneagramDesc?: string,
  token?: string,
  nextStep?: string,
  mode?: string
}) {
  const [showConsent, setShowConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConsent = async (consent: boolean) => {
    if (!token) return;
    setIsSaving(true);
    try {
      await fetch('/api/express/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, consent })
      });
      window.location.href = `https://landing-lane-connect.vercel.app/report/${token}`;
    } catch (e) {
      console.error(e);
      window.location.href = `https://landing-lane-connect.vercel.app/report/${token}`;
    }
  };

  if (showConsent) {
    return (
      <div className="max-w-xl mx-auto p-4 py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Chia sẻ kết quả</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Bạn có muốn chia sẻ kết quả với đội ngũ Nedu không?<br/>
          (Sau bước này bạn sẽ nhận được báo cáo chi tiết)
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            disabled={isSaving}
            onClick={() => handleConsent(true)}
            className="px-6 py-3 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#704B30] disabled:opacity-50"
          >
            Có, tôi muốn chia sẻ
          </button>
          <button
            disabled={isSaving}
            onClick={() => handleConsent(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Không, cảm ơn
          </button>
        </div>
        {isSaving && (
           <p className="mt-4 text-sm text-gray-500">Đang tạo báo cáo chi tiết...</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Kết quả Enneagram của bạn</h2>
      <div className="text-6xl font-extrabold text-[#8B5E3C] mb-6">Type {enneagramType}</div>
      {enneagramDesc ? (
        <div className="text-gray-700 text-lg leading-relaxed text-left bg-[#FAF8F5] p-6 rounded-xl border border-[#EAE3DC]">
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
            className="inline-flex items-center justify-center gap-2 group px-8 py-4 bg-[#8B5E3C] text-white hover:bg-[#704B30] rounded-xl text-lg font-medium transition-all"
          >
            Tiếp tục
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
