# Plan: Dual Assessment Mode (Drip vs Express)

## Context

Currently the app has a single flow (Drip): MaxDiff → email → nhận MBTI/Enneagram/Bazi qua chuỗi 16 ngày. Cần thêm Express mode cho khách quen — hoàn thành tất cả trong một buổi, nhận report ngay.

---

## Architecture Overview

```
Mode toggle: NEXT_PUBLIC_ASSESSMENT_MODE=drip|express

DRIP (hiện tại, không đổi):
  MaxDiff → Result → FollowUpModal → send-result (email day 0) → cron 16 ngày

EXPRESS (mới):
  MaxDiff → Success screen → /mbti/[token]?next=enneagram
          → /enneagram/[token]?next=report&mode=express
          → Consent screen → POST /api/express/complete
          → landing-lane-connect.vercel.app/report/[token]
```

---

## Express Mode — Flow Chi Tiết

```
1. MaxDiff quiz (như cũ)
2. Điền form (email + birth data) — reuse FollowUpModal
3. POST /api/send-result (mode=express) → trả về { report_token }
4. Màn hình thành công + nút "Làm bài MBTI →"
5. Redirect → /mbti/[token]?next=enneagram
6. Làm MBTI 32 câu → kết quả → nút "Làm tiếp Enneagram →"
7. Redirect → /enneagram/[token]?next=report&mode=express
8. Làm Enneagram → kết quả → Consent screen:
   "Bạn có muốn chia sẻ kết quả với đội ngũ Nedu không?
    (Sau bước này bạn sẽ nhận kết quả chi tiết)"
   → [Có] / [Không]
9. POST /api/express/complete { token, consent }
   ├─ Gửi email ngay (day-16 style)
   ├─ Nếu consent=true → notify Telegram
   └─ Lưu metadata.consent vào leads
10. Redirect → landing-lane-connect.vercel.app/report/[token]
    (UI nhắc: "Kiểm tra email để nhận lời nhắn từ đội ngũ Nedu")
```

---

## Implementation Steps

### 1. Env var + helper

**`src/config/env.ts`**
```ts
NEXT_PUBLIC_ASSESSMENT_MODE: z.enum(['drip', 'express']).default('drip'),
```

**`src/config/constants.ts`**
```ts
export const isExpressMode = process.env.NEXT_PUBLIC_ASSESSMENT_MODE === 'express';
```

### 2. Modify send-result for express

**`src/features/send-result/service.ts`**
- Add `mode?: 'drip' | 'express'` to `SendResultInput`
- Return type: `Promise<{ report_token: string }>` (cả 2 modes)
- If `mode === 'express'`:
  - **SKIP** Gemini email + SES
  - **STILL** tạo quiz_submission + lead + personal_profiles
  - Lưu `assessment_mode: 'express'` trong `leads.metadata`
  - Return `{ report_token }`
- If drip: giữ nguyên + return `{ report_token }`

**`src/app/api/send-result/route.ts`** — pass `mode`, return `report_token` trong response.

### 3. Success screen sau MaxDiff

**`src/app/page.tsx`** + **`src/hooks/useQuizFlow.ts`**

Thêm step `'expressSuccess'` vào `StepType`.

`handleAdvancedTestStart()` trong express mode:
- Gọi `/api/send-result` với `mode: 'express'`
- Lưu `reportToken` từ response vào state
- Chuyển sang step `'expressSuccess'`

Màn hình `expressSuccess` hiển thị:
- "Hoàn thành! Bạn đã sẵn sàng khám phá tính cách"
- Nút: "Làm bài MBTI →" → `window.location.href = /mbti/${reportToken}?next=enneagram`

### 4. MBTI page — thêm CTA tiếp theo

**`src/app/mbti/[token]/MbtiResultView.tsx`**

Đọc query param `?next`:
- Nếu `next=enneagram` → hiện nút "Làm tiếp Enneagram →" trỏ tới `/enneagram/[token]?next=report&mode=express`
- Nếu không có `?next` → giữ nguyên (drip mode, không có nút)

### 5. Enneagram page — thêm Consent screen

**`src/app/enneagram/[token]/EnneagramResultView.tsx`**

Đọc query param `?next` và `?mode`:
- Nếu `next=report&mode=express` → sau khi show kết quả, hiện Consent screen:
  ```
  "Bạn có muốn chia sẻ kết quả với đội ngũ Nedu không?
   (Sau bước này bạn sẽ nhận được báo cáo chi tiết)"
  [Có, tôi muốn] / [Không, cảm ơn]
  ```
  → Cả 2 nút đều gọi `POST /api/express/complete { token, consent: true/false }`
  → Redirect sang `landing-lane-connect.vercel.app/report/[token]`
- Nếu không có params → giữ nguyên (drip mode)

### 6. New API: `/api/express/complete`

**`src/app/api/express/complete/route.ts`**

```ts
POST { token: string, consent: boolean }
```

**`src/features/express/service.ts`** — `completeExpressFlow()`:
1. Find lead by `report_token`
2. Lưu `metadata.consent = consent` vào leads
3. Gửi email ngay (day-16 style) qua AWS SES
   - Content: tone express — "Bạn vừa hoàn thành phân tích chuyên sâu trong một buổi..."
   - Link: full report + course recommendation + CTA liên hệ tư vấn
   - Nhắc: "Kiểm tra email để nhận lời nhắn từ đội ngũ Nedu"
4. Nếu `consent = true` → `notifyTelegram(lead)` (reuse từ `email-sequence/service.ts`)
5. Return `{ success: true }`

### 7. Cron — không cần thay đổi

Express leads không đi qua cron (không nhận email drip).  
Email duy nhất họ nhận là từ `/api/express/complete` ở bước 6.  
RPC `get_leads_by_day` giữ nguyên — express leads không có `sla_started_at` mapping nào → tự nhiên không được pick up.

> Nếu cần chắc chắn hơn, thêm filter vào RPC:
> ```sql
> AND (metadata->>'assessment_mode' IS NULL OR metadata->>'assessment_mode' != 'express')
> ```

---

## Files to Create
| File | Ghi chú |
|------|---------|
| `src/features/express/service.ts` | `completeExpressFlow()` |
| `src/app/api/express/complete/route.ts` | POST handler |

## Files to Modify
| File | Change |
|------|--------|
| `src/config/env.ts` | Add `NEXT_PUBLIC_ASSESSMENT_MODE` |
| `src/config/constants.ts` | Add `isExpressMode` |
| `src/hooks/useQuizFlow.ts` | Add `expressSuccess` step + lưu `reportToken` |
| `src/app/page.tsx` | Render `expressSuccess` step |
| `src/features/send-result/service.ts` | Branch express: skip email, return token |
| `src/app/api/send-result/route.ts` | Pass mode, return token |
| `src/app/mbti/[token]/MbtiResultView.tsx` | Đọc `?next` → CTA tiếp theo |
| `src/app/enneagram/[token]/EnneagramResultView.tsx` | Đọc `?next&mode` → Consent screen |

## No longer needed (vs plan cũ)
- ~~`MbtiQuizInline.tsx`~~ — tái dụng page có sẵn
- ~~`EnneagramQuizInline.tsx`~~ — tái dụng page có sẵn
- ~~`ExpressInfoForm.tsx`~~ — reuse `FollowUpModal` hiện tại

---

## Key Design Decisions

1. **Query params `?next` / `?mode`** thay vì hardcode express logic vào result views — drip mode không bị ảnh hưởng
2. **Tái sử dụng `/mbti/[token]` và `/enneagram/[token]`** — không build inline components, ít code hơn
3. **`/api/express/complete` riêng** — không đụng cron, trigger ngay khi user xong, email content có thể custom
4. **Consent trước khi xem report** — tốt về UX, user cảm thấy được tôn trọng; Telegram chỉ gửi khi có consent
5. **Bazi/Numerology** — tính tại `/bazi-numerology/[token]` page hoặc có thể trigger ngầm từ `send-result` express

---

## Verification

1. **Drip regression**: `NEXT_PUBLIC_ASSESSMENT_MODE=drip` → flow y hệt hiện tại
2. **Express E2E**:
   - MaxDiff → form → success screen → `/mbti/[token]?next=enneagram`
   - MBTI xong → nút "Làm tiếp Enneagram" hiện ra
   - Enneagram xong → Consent screen hiện ra
   - Bấm "Có" → email gửi + Telegram notify → redirect report
   - Bấm "Không" → email gửi (không Telegram) → redirect report
3. **Drip leads** không thấy CTA "Làm tiếp" trên MBTI/Enneagram result pages
4. **DB check**: `leads.metadata.assessment_mode = 'express'`, `consent = true/false`
