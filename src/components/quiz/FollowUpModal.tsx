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
            <h3 className="text-xl font-medium text-[#1A1A1A] text-left">Điền thêm thông tin để Nedu phân tích Bát Tự & Thần Số nhé</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8B7E74]">Ngày sinh *</label>
                <div className="relative">
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm appearance-none"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8B7E74]">Giờ sinh</label>
                <div className="relative">
                  <input 
                    type="time"
                    disabled={formData.birthTimeUnknown}
                    className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm appearance-none disabled:opacity-50 disabled:bg-gray-100"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="unknown-time" 
                      className="rounded border-gray-300 text-[#8B5E3C] focus:ring-[#8B5E3C]"
                      checked={formData.birthTimeUnknown}
                      onChange={(e) => {
                        const unknown = e.target.checked;
                        setFormData({
                          ...formData, 
                          birthTimeUnknown: unknown,
                          birthTime: unknown ? '' : formData.birthTime
                        });
                      }}
                    />
                    <label htmlFor="unknown-time" className="text-xs text-[#8B7E74] cursor-pointer">Không nhớ giờ</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8B7E74]">Nơi sinh *</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm appearance-none"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                  >
                    {BIRTHPLACE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8B7E74]">Giới tính *</label>
                <div className="flex items-center gap-4 py-3.5 h-full">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value={0}
                      checked={formData.gender === 0}
                      onChange={() => setFormData({...formData, gender: 0})}
                      className="text-[#8B5E3C] focus:ring-[#8B5E3C]"
                    />
                    <span className="text-sm text-[#2D2D2D]">Nữ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value={1}
                      checked={formData.gender === 1}
                      onChange={() => setFormData({...formData, gender: 1})}
                      className="text-[#8B5E3C] focus:ring-[#8B5E3C]"
                    />
                    <span className="text-sm text-[#2D2D2D]">Nam</span>
                  </label>
                </div>
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
              Đồng ý & Tiếp tục
            </button>
            <p className="text-xs text-center text-[#8B7E74]">
              Thông tin của bạn được bảo mật và tự động tính toán Bát Tự & Thần Số.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


