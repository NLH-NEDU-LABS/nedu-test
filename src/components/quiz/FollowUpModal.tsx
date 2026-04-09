import React, { useState } from 'react';
import { Mail, Calendar, Briefcase, ChevronRight, X, User, MapPin } from 'lucide-react';
import { BIRTHPLACE_OPTIONS } from '@/lib/timezone';
import type { UserBirthData } from '@/types/user-data';

interface FollowUpModalProps {
  onClose: () => void;
  onSubmit: (data: UserBirthData) => void;
}

export const FollowUpModal = ({ onClose, onSubmit }: FollowUpModalProps) => {
  const [formData, setFormData] = useState<UserBirthData>({
    email: '',
    fullName: '',
    dob: '',
    birthTime: '',
    birthTimeUnknown: false,
    birthPlace: 'vietnam',
    gender: 0,
    occupation: '',
    feeling: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthTimeUnknown && !formData.birthTime) {
      alert('Vui lòng nhập Giờ sinh hoặc chọn "Không nhớ".');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Nút đóng */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#F9F8F6] rounded-full text-[#A39A92] hover:text-[#2D2D2D] hover:bg-[#F0EBE5] transition-all z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="text-center space-y-2 pr-6">
            <h3 className="text-xl font-medium text-[#1A1A1A] text-left">Nhận báo cáo phân tích chuyên sâu qua Email</h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Họ và tên (Zalo)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Thảo Lê" 
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Email của bạn *</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  placeholder="an@gmail.com" 
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>


            
            <div className="space-y-1.5 border-t border-[#F0EBE5] pt-4 mt-2">
              <label className="text-sm font-medium text-[#8B7E74]">Giới tính *</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: parseInt(e.target.value) as 0 | 1})}
                >
                  <option value={0}>Nữ</option>
                  <option value={1}>Nam</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Ngày sinh dương lịch *</label>
              <div className="relative">
                <input 
                  required
                  type="date"
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#8B7E74]">Giờ sinh *</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="accent-[#8B5E3C] w-4 h-4 rounded border-gray-300 cursor-pointer"
                    checked={formData.birthTimeUnknown}
                    onChange={(e) => {
                      const isUnknown = e.target.checked;
                      setFormData({...formData, birthTimeUnknown: isUnknown, birthTime: isUnknown ? '' : formData.birthTime});
                    }}
                  />
                  <span className="text-xs text-[#8B7E74]">Không nhớ</span>
                </label>
              </div>
              <div className="relative">
                <input 
                  type="time" 
                  disabled={formData.birthTimeUnknown}
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Nơi sinh (Múi giờ) *</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                >
                  {BIRTHPLACE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} (GMT{opt.tz})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-[#F0EBE5] pt-4 mt-2">
              <label className="text-sm font-medium text-[#8B7E74]">Công việc hiện tại *</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="Marketing Manager" 
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Điều bạn đang quan tâm *</label>
              <div className="relative">
                <textarea 
                  required
                  rows={2}
                  placeholder="Mình đang cảm thấy..." 
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm resize-none"
                  value={formData.feeling}
                  onChange={(e) => setFormData({...formData, feeling: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#704B30] transition-colors mt-4 shadow-md shadow-[#8B5E3C]/20 border border-[#704B30]/50 cursor-pointer"
            >
              Gửi Kết Quả Cho Tôi
            </button>
            <p className="text-xs text-center text-[#8B7E74]">
              Thông tin của bạn được bảo mật tuyệt đối.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


