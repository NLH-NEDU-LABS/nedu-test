import React from 'react';

interface AdvancedTestScreenProps {
  onBackToResult: () => void;
  userBirthData?: any;
  persona?: any;
}

export const AdvancedTestScreen = ({ onBackToResult, userBirthData }: AdvancedTestScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700 w-full px-6 py-12">
      <div className="w-24 h-24 bg-[#E8F5EE] text-[#1D9E75] rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border-[6px] border-[#1D9E75]/10">
        ✓
      </div>
      <h2 className="text-2xl font-medium text-[#1A1A1A] mb-3 text-center">Cảm ơn bạn!</h2>
      <p className="text-sm text-[#8B7E74] text-center mb-8 max-w-sm leading-relaxed">
        Thông tin của bạn đã được ghi nhận. Hệ thống sẽ sớm phân tích chi tiết hồ sơ của bạn ({userBirthData?.email}) và gửi kết quả chuyên sâu qua email trong thời gian tới.
      </p>
      <button
        onClick={onBackToResult}
        className="w-full bg-[#8B5E3C] text-white p-4 rounded-xl font-medium hover:bg-[#704B30] transition-colors shadow-md flex items-center justify-center gap-2"
      >
        Trở về kết quả
      </button>
    </div>
  );
};
