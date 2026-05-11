import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, Calendar, Briefcase, ChevronRight, X, User, MapPin, HelpCircle } from 'lucide-react';
import { LocationAutocomplete, type GeoLocation } from '@/components/ui/location-autocomplete';
import type { UserBirthData } from '@/types/user-data';
import { isExpressMode } from '@/config/constants';

interface FollowUpModalProps {
  onClose: () => void;
  onSubmit: (data: UserBirthData) => void;
}

// Detect Vietnamese name entered without diacritics.
// Heuristic: contains common Vietnamese-only consonant combos (nh, ng, ph, th, tr, ch, kh, gi)
// but has no Unicode diacritical characters (àáâãèéêìíòóôõùúýăđơư and their variants).
function looksLikeVietnameseWithoutAccents(name: string): boolean {
  if (!name.trim()) return false;
  const hasVietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(name);
  if (hasVietnameseDiacritics) return false;
  const hasVietnameseCombos = /\b(nguyen|nguyn|pham|hoang|tran|le|ngo|vu|vo|dang|bui|do|ho|huynh|duong|ly|dinh|truong|dao|thai|phan|luu|trinh|nguyen|thao|linh|anh|minh|hung|tuan|hoa|lan|thu|mai|hieu|lam|khoa|phong|quang|dung|thanh|thi|trang|van|son|nam|long|quyen|ngoc|yen|huyen|nhi|khanh|bao|duc|hai|tan|cuong|phuc|thuy|xuan|an)\b/i.test(name);
  return hasVietnameseCombos;
}

export const FollowUpModal = ({ onClose, onSubmit }: FollowUpModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [formData, setFormData] = useState<UserBirthData>({
    email: '',
    fullName: '',
    phone: '',
    telegramUsername: '',
    dob: '',
    birthTime: '',
    birthTimeUnknown: false,
    birthPlace: '',
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
    // Vietnamese mobile: starts with 0 or +84, total 9-11 digits
    if (!/^(0|\+84)[0-9]{8,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      alert('Vui lòng nhập số điện thoại hợp lệ (VD: 0901234567).');
      return;
    }
    // Telegram username: 5-32 chars, letters/digits/underscores, optional leading @
    if (!/^@?[A-Za-z0-9_]{5,32}$/.test(formData.telegramUsername)) {
      alert('Telegram username phải từ 5–32 ký tự, chỉ chữ/số/dấu _ (VD: @yourname).');
      return;
    }
    setIsLoading(true);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      {showTelegramGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowTelegramGuide(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="telegram-guide-title"
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE5]">
              <h4 id="telegram-guide-title" className="text-base font-semibold text-[#2D2D2D]">
                Hướng dẫn lấy Telegram username
              </h4>
              <button
                type="button"
                onClick={() => setShowTelegramGuide(false)}
                className="p-2 -mr-2 rounded-full text-[#A39A92] hover:text-[#2D2D2D] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                aria-label="Đóng hướng dẫn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
              <div className="rounded-xl overflow-hidden bg-white border border-[#F0EBE5] shadow-sm">
                <Image
                  src="/images/telegram-username-guide-v2.png"
                  alt="Hướng dẫn lấy username Telegram: vào Setting để xem username dạng @yourname"
                  width={1280}
                  height={476}
                  sizes="(max-width: 640px) 94vw, (max-width: 1024px) 640px, 720px"
                  className="w-full h-auto block"
                  priority
                />
              </div>
              <p className="text-xs text-[#8B7E74] text-center mt-4 leading-relaxed">
                Username gồm 5–32 ký tự, chỉ dùng chữ a–z, số 0–9 và dấu gạch dưới.
              </p>
            </div>
          </div>
        </div>
      )}
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
            <h3 className="text-xl font-medium text-[#1A1A1A] text-left">
              {isExpressMode 
                ? 'Hãy để lại thông tin để tiếp tục bài phân tích chuyên sâu'
                : 'Nhận báo cáo phân tích chuyên sâu qua Email'}
            </h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8B7E74]">Họ và tên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Thảo Lê"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#2D2D2D] shadow-sm ${
                    looksLikeVietnameseWithoutAccents(formData.fullName || '')
                      ? 'border-amber-400 focus:border-amber-500'
                      : 'border-[#F0EBE5] focus:border-[#8B5E3C]'
                  }`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              {looksLikeVietnameseWithoutAccents(formData.fullName || '') && (
                <p className="text-xs text-amber-600 mt-1">
                  Tên tiếng Việt cần nhập đầy đủ dấu (VD: <span className="font-medium">Thảo Lê</span>) để tính Thần Số Học chính xác.
                </p>
              )}
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
              <label className="text-sm font-medium text-[#8B7E74]">Nơi sinh *</label>
              <LocationAutocomplete
                value={formData.birthPlace}
                onChange={(loc: GeoLocation) => setFormData({
                  ...formData,
                  birthPlace: `${loc.name}, ${loc.adminName1 ? loc.adminName1 + ', ' : ''}${loc.countryName}`,
                  birthPlaceLat: loc.lat,
                  birthPlaceLng: loc.lng,
                  birthPlaceTimezone: loc.timezone,
                })}
                placeholder="Nhập thành phố (VD: Nha Trang)"
              />
            </div>

            <div className="space-y-1.5 border-t border-[#F0EBE5] pt-4 mt-2">
              <label className="text-sm font-medium text-[#8B7E74]">Số điện thoại *</label>
              <div className="relative">
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="0901234567"
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#8B7E74]">Telegram username *</label>
                <button
                  type="button"
                  onClick={() => setShowTelegramGuide(true)}
                  className="flex items-center gap-1 text-xs text-[#8B5E3C] hover:text-[#704B30] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  <HelpCircle size={12} />
                  Hướng dẫn lấy username
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="@yourname"
                  className="w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm"
                  value={formData.telegramUsername}
                  onChange={(e) => {
                    let v = e.target.value.trim();
                    if (v && !v.startsWith('@')) v = '@' + v;
                    setFormData({...formData, telegramUsername: v});
                  }}
                />
              </div>
              <p className="text-xs text-[#8B7E74]">Để team N-Education hỗ trợ bạn nhanh hơn qua Telegram.</p>
            </div>

            <div className="space-y-1.5">
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
              disabled={isLoading}
              className="w-full py-4 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#704B30] transition-colors mt-4 shadow-md shadow-[#8B5E3C]/20 border border-[#704B30]/50 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : 'Gửi Kết Quả Cho Tôi'}
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


