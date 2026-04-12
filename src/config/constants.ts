/**
 * Application-wide constants.
 * Single source of truth — eliminates duplications found in:
 *   - send-result/route.ts (sender address, HTML builder)
 *   - lib/email-sequence/send-email.ts (sender address, HTML builder)
 *   - recommend/route.ts (fallback recommendation — 3 copies)
 */

// ---------------------------------------------------------------------------
// Email sender
// ---------------------------------------------------------------------------

/** "From" address used by all outgoing emails (via AWS SES) */
export const EMAIL_SENDER = 'Nhi Le <hi@test.nhi.sg>';

// ---------------------------------------------------------------------------
// Course catalog
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  name: string;
  url: string;
  format: 'online' | 'offline';
  description: string;
}

export const COURSES: Record<string, Course> = {
  'suc-manh-vo-han': {
    id: 'suc-manh-vo-han',
    name: 'Sức Mạnh Vô Hạn',
    url: 'https://nedu.nhi.sg/program-offline/suc-manh-vo-han',
    format: 'offline',
    description:
      'Offline. Dành cho doanh nhân Việt cần chiến lược đột phá, mở rộng thị trường, xây nền tảng kinh doanh vươn tầm.',
  },
  'la-chinh-minh': {
    id: 'la-chinh-minh',
    name: 'Là Chính Mình',
    url: 'https://nedu.nhi.sg/program-offline/la-chinh-minh',
    format: 'offline',
    description:
      'Offline 3.5 ngày. Đánh thức sức mạnh nội tại, gỡ bỏ rào cản tâm lý sống rực rỡ trọn vẹn. Thích hợp chữa lành, tìm lại bản thân.',
  },
  'thuong-hieu-cua-ban': {
    id: 'thuong-hieu-cua-ban',
    name: 'Thương Hiệu Của Bạn',
    url: 'https://nedu.nhi.sg/program-online/thuong-hieu-cua-ban',
    format: 'online',
    description:
      'Online. Kiến thức cơ bản cho người muốn mở doanh nghiệp/cải tổ. Kỷ nguyên AI. 4 ngày.',
  },
  'cuoc-song-cua-ban': {
    id: 'cuoc-song-cua-ban',
    name: 'Cuộc Sống Của Bạn',
    url: 'https://nedu.nhi.sg/program-online/cuoc-song-cua-ban',
    format: 'online',
    description:
      'Online. Khám phá và định hình lại cuộc sống, tìm ra con đường phát triển bản thân.',
  },
  'thu-thach-30-ngay': {
    id: 'thu-thach-30-ngay',
    name: 'Thử Thách 30 Ngày',
    url: 'https://nedu.nhi.sg/program-online/thu-thach-30-ngay',
    format: 'online',
    description:
      'Online. Dành cho người biết nhiều lý thuyết nhưng thiếu hành động, trì hoãn. Tạo môi trường kỷ luật.',
  },
} as const;

// ---------------------------------------------------------------------------
// Fallback recommendation (was duplicated 3× in recommend/route.ts)
// ---------------------------------------------------------------------------

export const FALLBACK_RECOMMENDATION = {
  primary_course_id: 'cuoc-song-cua-ban',
  primary_course_name: COURSES['cuoc-song-cua-ban'].name,
  primary_course_url: COURSES['cuoc-song-cua-ban'].url,
  backup_course_id: 'thu-thach-30-ngay',
  backup_course_name: COURSES['thu-thach-30-ngay'].name,
  backup_course_url: COURSES['thu-thach-30-ngay'].url,
  why_fits:
    'Bạn đang cần định hướng cho bản thân trước khi hành động. Khoá Cuộc Sống Của Bạn giúp bạn vạch rõ đâu là những giá trị thực sự cho mình.',
  learning_style_note: 'Học Online chủ động, thích hợp gỡ rối giai đoạn đầu.',
  urgency_message: 'Hãy bắt đầu đặt nền tảng sớm.',
  confidence_score: 0.82,
} as const;

// ---------------------------------------------------------------------------
// Base URLs
// ---------------------------------------------------------------------------

export const BASE_URLS = {
  landing: 'https://test.nedu.vn/',
  neduSite: 'https://nedu.nhi.sg',
  reportBase: process.env.NEXT_PUBLIC_REPORT_BASE_URL ?? 'https://test.nhi.sg',
} as const;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const isExpressMode = process.env.NEXT_PUBLIC_ASSESSMENT_MODE === 'express';
