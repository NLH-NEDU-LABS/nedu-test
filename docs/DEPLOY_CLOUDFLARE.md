# Deploy `nedu-test` lên Cloudflare Workers

> Mục đích: chạy song song với Vercel trong giai đoạn test, sau đó cutover.

## Stack

- Next.js 16 build qua `@opennextjs/cloudflare`
- Triển khai dưới dạng Cloudflare Worker + Static Assets
- Cron Trigger (thay Vercel Cron) → drip email-sequence

## Trước khi bắt đầu

1. Cài Wrangler CLI:
   ```bash
   npm i -g wrangler
   wrangler login
   ```
2. Cài lại deps để loại `puppeteer-core` / `@sparticuz/chromium-min` đã gỡ khỏi `package.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 1. Set secrets

Wrangler có 2 môi trường: **prod** (default) và **preview** (`--env preview`).

```bash
# === PROD ===
wrangler secret put NEDU_BACKEND_URL          # vd: https://api.nedu.vn
wrangler secret put NEDU_INTERNAL_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put CRON_SECRET
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID

# Drip mode mới cần (nếu chạy express thì có thể bỏ qua, nhưng nên set sẵn):
wrangler secret put AWS_SES_REGION
wrangler secret put AWS_ACCESS_KEY_ID
wrangler secret put AWS_SECRET_ACCESS_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Optional:
wrangler secret put GEONAMES_USERNAME

# === PREVIEW (point sang api-dev.nedu.vn) ===
wrangler secret put NEDU_BACKEND_URL --env preview
wrangler secret put NEDU_INTERNAL_SECRET --env preview
# ... lặp lại cho từng key
```

> Public vars (`NEXT_PUBLIC_*`) đã được khai trong `wrangler.jsonc` → `vars`, **không** dùng `secret put`.

## 2. Build & smoke test local

```bash
# Build cho Cloudflare (tạo .open-next/)
npm run build:cf

# Chạy preview tại local — workerd runtime + cron
npm run preview:cf
```

Test các luồng critical:

- [ ] Form khảo sát (express mode) → submit → nhận email + report ngay
- [ ] `GET /api/cron/email-sequence` với header `Authorization: Bearer $CRON_SECRET` → trả 200
- [ ] Mở 1 report token cũ → render OK
- [ ] Test Bát Tự (cần GEONAMES_USERNAME nếu bật)

## 3. Test cron trigger tại local

`opennextjs-cloudflare preview` không tự fire cron. Test bằng cách gọi tay endpoint `/__scheduled` của workerd:

```bash
curl "http://localhost:8788/__scheduled?cron=*+*+*+*+*"
```

Hoặc đơn giản hơn — gọi thẳng route:

```bash
curl http://localhost:8788/api/cron/email-sequence \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 4. Deploy preview → QA

```bash
# Deploy lên preview environment (URL: nedu-test-preview.<account>.workers.dev)
wrangler deploy --env preview

# Trước khi QA: thêm URL preview vào CORS_ORIGINS của backend dev (api-dev.nedu.vn)
#   CORS_ORIGINS=...,https://nedu-test-preview.<account>.workers.dev
```

QA đầy đủ rồi mới sang prod.

## 5. Deploy prod (chưa cutover DNS)

```bash
wrangler deploy
# URL ban đầu: nedu-test-prod.<account>.workers.dev
```

Ở giai đoạn này:
- `test.nhi.sg` vẫn trỏ Vercel → user thật vào Vercel
- URL `*.workers.dev` để team test Cloudflare
- Nhớ thêm `*.workers.dev` URL vào `CORS_ORIGINS` của backend prod tạm thời

## 6. Cutover DNS

Khi đã yên tâm:

1. Cloudflare dashboard → Workers → `nedu-test-prod` → Settings → Triggers → Add Custom Domain → `test.nhi.sg`
2. Cloudflare DNS panel: đảm bảo record `test.nhi.sg` orange-cloud (Proxied)
3. Trong Vercel: tắt domain `test.nhi.sg` (không xoá project — giữ làm fallback)
4. Theo dõi 24h → nếu ổn:
   - Gỡ `*.workers.dev` URL khỏi `CORS_ORIGINS` backend
   - Gỡ Vercel cron (xoá `vercel.json`) hoặc ngược lại nếu cần rollback

## 7. Sau cutover

- Rotate AWS access key + Telegram bot token (vì cũ đã từng commit/lưu local)
- Monitor: Cloudflare dashboard → Workers → Logs (đã bật `observability.enabled`)

## Lưu ý đã biết

### Cron timezone
`triggers.crons: ["0 1 * * *"]` chạy theo **UTC** = 8h sáng giờ Việt Nam.
Nếu muốn 1h sáng VN → đổi thành `"0 18 * * *"` (18:00 UTC ngày hôm trước).

### Rate limiter
[src/middleware/rate-limit.ts](../src/middleware/rate-limit.ts) dùng `Map` in-memory. Trên Workers, mỗi isolate có store riêng → giới hạn không chính xác (best-effort).
Phương án nâng cấp khi cần: Cloudflare Rate Limiting API hoặc Durable Object.

### AWS SES bundle size
`@aws-sdk/client-ses` ~vài MB compressed. Nếu `wrangler deploy` báo vượt limit 10MB, cân nhắc:
- Thay bằng raw `fetch` + AWS SigV4 (nhẹ hơn ~50x)
- Hoặc đổi sang Resend / Cloudflare Email Workers
