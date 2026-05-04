# test.nhi.sg — Nedu Assessment App

**Next.js** app chạy bài kiểm tra tính cách / định hướng học tập (MaxDiff, MBTI, Enneagram, Bazi).  
Sau khi hoàn thành → lưu kết quả vào backend, gửi email, và redirect user sang **test.nedu.vn** để xem report.

---

## How it works

```
User mở test.nhi.sg
  → làm quiz liên tục một mạch (MaxDiff → MBTI → Enneagram → Bazi)
  → kết quả + lead data gửi về api.nedu.vn (single source of truth)
  → redirect tới test.nedu.vn/report/{token}
```

> App này chỉ xử lý logic tính toán và quiz flow. Toàn bộ data (lead, assessment) lưu trên **api.nedu.vn** — không dùng Supabase trực tiếp nữa.

Stack: Next.js · Gemini AI · AWS SES · Cloudflare Workers (deploy)

---

## Setup

```bash
npm install
cp .env.example .env.local   # điền các giá trị bên dưới
npm run dev                  # http://localhost:3000
```

### Env vars (`.env.local`)

| Biến | Bắt buộc | Lấy ở đâu |
|------|----------|-----------|
| `NEDU_BACKEND_URL` | ✅ | URL của api.nedu.vn (prod: `https://api.nedu.vn`) |
| `NEDU_INTERNAL_SECRET` | ✅ | Secret server-to-server — lấy từ người bàn giao |
| `GEMINI_API_KEY` | ✅ | [aistudio.google.com](https://aistudio.google.com) |
| `NEXT_PUBLIC_REPORT_BASE_URL` | ✅ | Local: `http://localhost:8080` · Prod: `https://test.nedu.vn` |
| `NEXT_PUBLIC_ASSESSMENT_MODE` | ✅ | `express` hoặc `drip` — xem bên dưới |
| `SUPABASE_URL` | ⚠️ legacy | Còn trong env schema, chưa xoá — điền tạm để app khởi động |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ legacy | Tương tự trên |
| `AWS_SES_REGION` | 📧 optional | `ap-southeast-1` (chỉ cần khi dùng chế độ `drip`) |
| `AWS_ACCESS_KEY_ID` | 📧 optional | AWS IAM credentials |
| `AWS_SECRET_ACCESS_KEY` | 📧 optional | AWS IAM credentials |
| `TELEGRAM_BOT_TOKEN` | 💬 optional | BotFather token |
| `TELEGRAM_CHAT_ID` | 💬 optional | Chat/channel ID |
| `GEONAMES_USERNAME` | 🌏 optional | [geonames.org](https://www.geonames.org) (cho Bazi geocode) |
| `CRON_SECRET` | ⏰ optional | Bất kỳ string ngẫu nhiên (bảo vệ endpoint cron) |

### Assessment Mode: `express` vs `drip`

**`drip`** — chế độ chính thức cho traffic bên ngoài (YouTube, fanpage, …):

```
User nhấn link test.nhi.sg
  → làm MaxDiff → nhận kết quả
  → Day 0 : Teaser result + "Bạn là kiểu người nào?"
  → Day 2 : MBTI trong email (link test đầy đủ)
  → Day 5 : Enneagram
  → Day 10: BaZi / Tử vi (nếu chưa có)
  → Day 14: Full report tổng hợp 5 điểm số + link test.nedu.vn
  → Day 16: Tư vấn viên liên hệ (dựa trên data)
```

Bật khi: **chị Hà / admin yêu cầu** cho người ngoài dùng. Cần AWS SES đã config.

---

**`express`** — chế độ test nội bộ, dành cho học viên NEducation:

```
User làm liên tục một mạch:
  MaxDiff → MBTI → Enneagram → Bazi
  → gửi 1 email duy nhất: report tổng hợp cuối
  → không có chuỗi email 16 ngày
```

Bật khi: **giai đoạn test ban đầu** — học viên làm hết tất cả bài một lần, nhận kết quả ngay.

> **Default hiện tại:** `express`. Đừng tự đổi sang `drip` nếu chưa có yêu cầu từ admin.

---

## Deploy (Cloudflare Workers)

```bash
npm run build:cf        # build với OpenNext
npx wrangler deploy     # deploy lên Cloudflare
```

Secrets (không để trong wrangler.jsonc) — set qua Cloudflare dashboard hoặc CLI:
```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GEMINI_API_KEY
# ... tương tự các biến còn lại
```

---

## Link với test.nedu.vn

Repo này là **backend + frontend của quiz**.  
Sau khi user hoàn thành, app redirect tới `NEXT_PUBLIC_REPORT_BASE_URL/report/{token}`.  
**test.nedu.vn** nhận token đó và gọi lại `/api/report/{token}` của repo này để lấy dữ liệu hiển thị.

→ Xem thêm: [test.nedu.vn repo](https://github.com/NLH-NEDU-LABS/nedu-test-report)
