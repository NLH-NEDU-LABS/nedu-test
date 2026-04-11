# Nedu Full Refactor — Implementation Plan

## Context

Codebase hiện tại (~2100 LOC, 51 files) là monolith MVP với business logic trộn lẫn trong API route handlers, `lib/` folder phẳng không phân domain, duplicate code (email template, SES client, fallback data), không có test, không validation, không rate limiting. Có external consumers gọi vào API — response format phải giữ nguyên, API paths được phép thay đổi.

Mục tiêu: Chuyển sang feature-based architecture với service layer, repository pattern, shared config, Zod validation, rate limiting, và tests — triển khai theo từng phase, mỗi phase deployable độc lập.

---

## Target Folder Structure

```
src/
├── config/
│   ├── constants.ts          # Sender email, base URLs, course catalog, fallback data
│   ├── env.ts                # Zod-validated environment variables
│   └── cors.ts               # Allowed origins (thay * hiện tại)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Supabase client init
│   │   └── types.ts          # Generated DB types (npx supabase gen types)
│   ├── gemini/
│   │   ├── client.ts         # getGeminiModel, geminiGenerate, geminiGenerateJSON
│   │   └── prompts.ts        # All system prompts (hiện hardcode rải rác 4 routes)
│   ├── email/
│   │   ├── ses-client.ts     # AWS SES singleton (hiện duplicate ở 2 files)
│   │   ├── templates.ts      # Shared HTML builder (hiện duplicate ở 2 files)
│   │   └── sender.ts         # High-level send wrapper
│   └── telegram/
│       └── client.ts         # Telegram bot notification
│
├── features/
│   ├── maxdiff/
│   │   ├── types.ts          # Persona, ScoredItem, SetAnswer, AssessmentResult, CourseRecommendation
│   │   ├── data.ts           # PERSONAS, PERSONA_ROUTES
│   │   ├── scoring.ts        # calculateMaxDiffScores (pure function)
│   │   ├── service.ts        # score() + recommend() orchestration
│   │   ├── repository.ts     # quiz_submissions CRUD
│   │   ├── validation.ts     # Zod schemas
│   │   └── __tests__/
│   │
│   ├── bazi-numerology/
│   │   ├── types.ts          # BaziData, NumerologyData, UserBirthData
│   │   ├── bazi.ts           # buildBazi, getSolarTime
│   │   ├── bazi-translation.ts
│   │   ├── numerology.ts     # calculateFullNumerology
│   │   ├── timezone.ts       # getTimezoneForLocation, BIRTHPLACE_OPTIONS
│   │   ├── service.ts        # calculate() + interpret()
│   │   ├── validation.ts
│   │   └── __tests__/
│   │
│   ├── mbti/
│   │   ├── types.ts
│   │   ├── data.ts           # MBTI_QUESTIONS, MBTI_ANSWER_MAP, MBTI_NAMES
│   │   ├── scoring.ts        # calculateMBTI
│   │   ├── service.ts        # scoreAndDescribe()
│   │   ├── repository.ts
│   │   ├── validation.ts
│   │   └── __tests__/
│   │
│   ├── enneagram/            # Cùng structure với mbti/
│   │   ├── types.ts, data.ts, scoring.ts, service.ts
│   │   ├── repository.ts, validation.ts
│   │   └── __tests__/
│   │
│   ├── report/
│   │   ├── types.ts          # ReportPayload
│   │   ├── service.ts        # getReport() — join 3 tables
│   │   ├── repository.ts     # Complex join query
│   │   ├── validation.ts
│   │   └── __tests__/
│   │
│   ├── lead/
│   │   ├── types.ts
│   │   ├── repository.ts     # Shared: findByReportToken, create, updateMetadata
│   │   └── __tests__/
│   │
│   ├── shared/
│   │   └── profile-repository.ts  # personal_profiles upsert (dùng chung MBTI + Enneagram)
│   │
│   └── email-sequence/
│       ├── types.ts
│       ├── templates.ts      # Day-based email content
│       ├── service.ts        # processSequence() — batched parallel
│       ├── repository.ts     # RPC wrapper
│       └── __tests__/
│
├── middleware/
│   ├── rate-limit.ts         # Sliding-window per route
│   └── validate.ts           # Generic Zod validation wrapper
│
├── hooks/
│   └── useQuizFlow.ts        # Client-side (giữ nguyên vị trí)
│
├── components/
│   ├── quiz/
│   │   ├── maxdiff/          # MaxDiffSetScreen, MaxDiffResultChart
│   │   ├── bazi/             # BaziResultView, NumerologyResultView
│   │   ├── shared/           # QuestionScreen
│   │   ├── WelcomeScreen.tsx
│   │   ├── StageSelectionScreen.tsx
│   │   ├── AnalyzingScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── AdvancedTestScreen.tsx
│   │   └── FollowUpModal.tsx
│   └── ui/
│       └── ProgressBar.tsx
│
├── app/                      # Route handlers → thin controllers (~15 LOC each)
│   ├── api/                  # Giữ nguyên 9 API paths + response format
│   └── ...pages              # Giữ nguyên
│
└── types/                    # Deprecated re-export stubs (xóa cuối cùng)
```

---

## Implementation Phases

### Phase 0: Foundation (không thay đổi behavior)

**Files tạo mới:**
- `src/config/env.ts` — Zod schema validate tất cả 10 env vars, thay thế `process.env.X!` rải rác
- `src/config/constants.ts` — Extract: sender email (`'Nhi Le <noreply@nhi.sg>'` duplicate ở `send-result/route.ts:169` + `send-email.ts:131`), fallback recommendation (duplicate 3 lần ở `recommend/route.ts:54,89,108`), course catalog, base URLs
- `src/config/cors.ts` — Allowed origins list
- `src/middleware/validate.ts` — Generic `withValidation(schema, handler)` wrapper
- `src/middleware/rate-limit.ts` — Sliding-window rate limiter (in-memory)
- `vitest.config.ts` — Test runner config

**Files sửa:**
- `package.json` — thêm `vitest`, `zod`, `@vitest/coverage-v8`

---

### Phase 1: Reorganize lib/ thành sub-modules

Tách infrastructure code, file cũ giữ re-export stub để không break imports.

| Hiện tại | Chuyển sang | Lý do |
|----------|-------------|-------|
| `lib/supabase.ts` | `lib/supabase/client.ts` | Chuẩn bị cho generated types |
| `lib/gemini.ts` | `lib/gemini/client.ts` | Tách client khỏi prompts |
| System prompts trong 4 routes | `lib/gemini/prompts.ts` | Centralize Vietnamese prompts |
| SES client ở 2 nơi | `lib/email/ses-client.ts` | Xóa duplication |
| `buildHtml()` ở `send-email.ts` + inline HTML ở `send-result` | `lib/email/templates.ts` | Xóa duplication |
| `email-sequence/notify-telegram.ts` | `lib/telegram/client.ts` | Tách concern |

---

### Phase 2: Feature modules — Types, Data, Pure Functions

Move cơ học — mỗi file gốc thành re-export stub.

**Nhóm MaxDiff:**
- `types/assessment.ts` → `features/maxdiff/types.ts`
- `data/maxdiff-data.ts` → `features/maxdiff/data.ts`
- `lib/scoring.ts` → `features/maxdiff/scoring.ts`

**Nhóm Bazi/Numerology:**
- `types/user-data.ts` → `features/bazi-numerology/types.ts`
- `lib/bazi.ts` → `features/bazi-numerology/bazi.ts`
- `lib/bazi-translation.ts` → `features/bazi-numerology/bazi-translation.ts`
- `lib/numerology.ts` → `features/bazi-numerology/numerology.ts`
- `lib/timezone.ts` → `features/bazi-numerology/timezone.ts`

**Nhóm MBTI:**
- `lib/mbti-scoring.ts` → `features/mbti/scoring.ts` + `features/mbti/data.ts`
- `MBTI_NAMES` (hiện hardcode ở `api/mbti/score/route.ts:7-24`) → `features/mbti/data.ts`

**Nhóm Enneagram:**
- `lib/enneagram-scoring.ts` → `features/enneagram/scoring.ts` + `features/enneagram/data.ts`
- `ENNEAGRAM_NAMES` (ở `api/enneagram/score/route.ts:7-17`) → `features/enneagram/data.ts`

**Nhóm Email Sequence:**
- `lib/email-sequence/types.ts` → `features/email-sequence/types.ts`

**Tất cả validation.ts files** — Zod schemas cho mỗi feature.

---

### Phase 3: Repository Layer

Tạo repositories, chưa wire vào routes.

| Repository | Queries extract từ | Methods |
|---|---|---|
| `features/lead/repository.ts` | `report/[token]/route.ts`, `send-result/route.ts`, `mbti/score/route.ts`, `enneagram/score/route.ts` | `findByReportToken()`, `create()`, `updateMetadata()` |
| `features/shared/profile-repository.ts` | `mbti/score/route.ts:94-118`, `enneagram/score/route.ts:92-116` (gần giống nhau) | `upsertProfileData()`, `getByLeadId()` |
| `features/maxdiff/repository.ts` | `send-result/route.ts:184-228` | `createSubmission()`, `updateLeadId()`, `getLatestByLeadId()` |
| `features/report/repository.ts` | `report/[token]/route.ts:6-36` | `getFullReport()` — join leads + profiles + submissions |
| `features/email-sequence/repository.ts` | `cron/email-sequence/route.ts:18` | `getLeadsByDay()` — RPC wrapper |

---

### Phase 4: Service Layer + Route Rewiring

Mỗi sub-phase: tạo service → route handler chỉ còn validate + gọi service + return response.

**4a: MaxDiff** (`/api/maxdiff` + `/api/recommend`)
- `features/maxdiff/service.ts`: `score()`, `recommend()`
- Routes shrink ~120 LOC → ~15 LOC each

**4b: Bazi/Numerology** (`/api/calculate` + `/api/interpret`)
- `features/bazi-numerology/service.ts`: `calculate()`, `interpret()`

**4c: MBTI + Enneagram** (`/api/mbti/score` + `/api/enneagram/score`)
- `features/mbti/service.ts`: `scoreAndDescribe()`
- `features/enneagram/service.ts`: `scoreAndDescribe()`
- Key win: eliminate duplicate lead-lookup + metadata-update pattern

**4d: SendResult** (`/api/send-result` — 240 LOC, phức tạp nhất)
- Service orchestrates: AI email gen → SES send → DB triple-insert
- Route drops to ~15 LOC

**4e: Report** (`/api/report/[token]`)
- `features/report/service.ts`: `getReport()`

**4f: Cron** (`/api/cron/email-sequence`)
- `features/email-sequence/service.ts`: `processSequence()`
- **Key improvement**: Thay sequential loop (500ms/lead) bằng batched `Promise.allSettled` — 5 concurrent sends/batch, 500ms giữa các batches
- 100 leads: 50s → ~10s

---

### Phase 4.5: Database Schema Migration

Sau khi service layer + repository layer ổn định (Phase 4 done):

1. **Migration 1**: Tách `leads.metadata` → columns riêng (`report_token`, `full_name`, `gender`, `birth_place`, `persona_label`, `mbti_type`, `enneagram_type`) + index
2. **Migration 2**: Tách `personal_profiles.profile_data` → columns riêng (`mbti_data`, `enneagram_data`, `bazi_data`, `numerology_data`, `bazi_interp`, `numerology_interp`) + unique constraint `(lead_id)`
3. **Migration 3**: Tách `quiz_submissions.result_json` → `top_problem_1`, `top_problem_2` columns
4. Update repositories đọc/ghi từ columns mới (dual-write giai đoạn chuyển tiếp)
5. Verify data consistency → drop metadata fields cũ

Chi tiết SQL migrations xem section "Database Layer Refactor" ở trên, update trong nedu-db

---

### Phase 5: CORS Lockdown

- `next.config.ts` dùng allowlist từ `config/cors.ts` thay vì `"*"`
- Tạo `src/middleware.ts` (Next.js edge middleware) cho CORS preflight
- Giai đoạn chuyển tiếp: log unrecognized origins trước khi block

---

### Phase 6: Component + Page Reorganization

#### 6a: Component folder restructure

| Component | Chuyển sang |
|---|---|
| `MaxDiffSetScreen.tsx`, `MaxDiffResultChart.tsx` | `components/quiz/maxdiff/` |
| `BaziResultView.tsx`, `NumerologyResultView.tsx` | `components/quiz/bazi/` |
| `QuestionScreen.tsx` | `components/quiz/shared/` |
| Còn lại (Welcome, Stage, Analyzing, Result, FollowUp, Advanced) | Giữ `components/quiz/` root |

#### 6b: Deduplicate `/app` pages — xóa copy-paste

**Vấn đề hiện tại:** MBTI và Enneagram pages gần như copy-paste:
- `mbti/[token]/page.tsx` vs `enneagram/[token]/page.tsx` — cùng query lead, check metadata, if-done-show-result pattern
- `MbtiQuizClient.tsx` (118 LOC) vs `EnneagramQuizClient.tsx` (189 LOC) — cùng state machine (`quiz` → `analyzing` → `result`), cùng UI (progress bar + question + options + nav), cùng analyzing spinner, cùng API call pattern
- `MbtiResultView.tsx` (17 LOC) vs `EnneagramResultView.tsx` (17 LOC) — chỉ khác tên biến, layout identical
- `report/[token]/page.tsx` (88 LOC) chứa business logic phức tạp (check cache → calculate → interpret → upsert) nên nằm trong service, không phải page

**Refactor:**

1. **Tạo `components/quiz/shared/AssessmentResultView.tsx`** — generic result component thay thế `MbtiResultView` + `EnneagramResultView`:
   ```tsx
   // Thay 2 file 17 LOC gần giống hệt bằng 1 component
   interface Props {
     title: string;        // "Kết quả MBTI" | "Kết quả Enneagram"
     typeLabel: string;    // "INTJ" | "Type 4"
     description?: string;
   }
   ```

2. **Tạo `components/quiz/shared/QuizShell.tsx`** — shared quiz layout (progress bar + question + options + nav buttons + analyzing spinner). `MbtiQuizClient` và `EnneagramQuizClient` chỉ cần cung cấp:
   - Questions data
   - Scoring function
   - API endpoint
   - Display config (title, subtitle)

3. **Simplify server pages** — `mbti/[token]/page.tsx` và `enneagram/[token]/page.tsx` gọi service thay vì query DB trực tiếp:
   ```tsx
   // Trước: 32 LOC với inline Supabase query + metadata cast
   // Sau: ~10 LOC
   const result = await LeadService.getAssessmentStatus(token, 'mbti');
   if (result.completed) return <AssessmentResultView ... />;
   return <MbtiQuizClient token={token} />;
   ```

4. **Move `report/[token]/page.tsx` logic vào service** — business logic (check cache → calculate bazi/numerology → call interpret → upsert profile) chuyển vào `features/report/service.ts`. Page chỉ còn:
   ```tsx
   const reportData = await ReportService.getOrGenerate(token);
   if (!reportData) notFound();
   return <ReportClient {...reportData} />;
   ```

5. **Xóa self-fetch** — `report/[token]/page.tsx:46-57` hiện gọi `fetch('/api/interpret')` tới chính server. Sau refactor gọi `BaziNumerologyService.interpret()` trực tiếp.

---

### Phase 7: Tests

**Priority 1 — Pure function tests (critical):**
- `features/maxdiff/__tests__/scoring.test.ts` — known persona + answers → verify scores + top_problems
- `features/mbti/__tests__/scoring.test.ts` — test 16 MBTI types, tie-breaking
- `features/enneagram/__tests__/scoring.test.ts` — center detection, type discrimination
- `features/bazi-numerology/__tests__/numerology.test.ts` — reduceDigit, life path with known dates
- `config/__tests__/env.test.ts` — missing vars throw, valid vars parse

**Priority 2 — Service tests (mocked deps):**
- `features/maxdiff/__tests__/service.test.ts` — mock Gemini, verify fallback
- `features/mbti/__tests__/service.test.ts` — mock repo + Gemini
- `features/email-sequence/__tests__/service.test.ts` — verify batching logic, error collection

---

### Phase 8: Cleanup

- Xóa re-export stubs (`lib/scoring.ts`, `lib/bazi.ts`, `types/assessment.ts`, etc.)
- Update tất cả imports sang đường dẫn mới
- Xóa folders rỗng (`types/`, `data/`)
- Final pass: xóa `console.log` debug statements

---

## Duplications Eliminated

| Duplication | Hiện tại | Target |
|---|---|---|
| SES Client init | `send-result/route.ts:5-10` + `send-email.ts:3-9` | `lib/email/ses-client.ts` |
| HTML email builder | `send-result/route.ts:124-158` + `send-email.ts:14-51` | `lib/email/templates.ts` |
| Sender address | `send-result/route.ts:169` + `send-email.ts:131` | `config/constants.ts` |
| Fallback recommendation (3x) | `recommend/route.ts:54,89,108` | `config/constants.ts` |
| Lead lookup + profile upsert | `mbti/score/route.ts:35-118` + `enneagram/score/route.ts:29-116` | `features/shared/profile-repository.ts` |

---

## Rate Limiting

| Route | Window | Max |
|---|---|---|
| POST scoring/recommend routes | 60s | 10 |
| POST /api/send-result | 60s | 5 (email sending) |
| GET /api/report/[token] | 60s | 30 (read-only) |
| GET /api/cron/email-sequence | 60s | 1 (cron + auth) |

In-memory sliding window. Scale lên → chuyển `@upstash/ratelimit`.

---

## Database Layer Refactor

### Vấn đề hiện tại

#### 1. `leads.metadata` là JSONB "thùng rác" — anti-pattern nghiêm trọng

Mọi route đều nhét data vào cùng 1 cột JSONB không có schema:

- **Khi tạo lead** (`send-result/route.ts:202-219`): `{ report_token, persona_label, ai_recommendation, full_name, gender, birth_place, has_advanced }`
- **Khi user làm MBTI** (`mbti/score/route.ts:78-82`): spread metadata cũ + thêm `{ mbti_type, mbti_desc }`
- **Khi user làm Enneagram** (`enneagram/score/route.ts:74-78`): spread metadata cũ + thêm `{ enneagram_type, enneagram_desc }`
- **Khi đọc** (`report/[token]/route.ts:22`): cast `as Record<string, unknown>` — mất type safety

**Hậu quả:**
- **Race condition**: MBTI + Enneagram route đều read → spread → write metadata. Chạy song song = last write wins, mất data
- **Không query/index được**: tìm "lead có MBTI INTJ" phải scan toàn bộ JSONB
- **Không validate**: TypeScript cast `as any` khắp nơi
- **Data cơ bản** (`full_name`, `gender`, `birth_place`, `report_token`) nên là column riêng

#### 2. `personal_profiles.profile_data` — cùng pattern

Một cột JSONB duy nhất chứa: `bazi`, `numerology`, `bazi_interp`, `numerology_interp`, `mbti`, `enneagram`. Cùng vấn đề race condition khi nhiều assessment write cùng lúc.

#### 3. Manual upsert thay vì dùng DB upsert

`mbti/score/route.ts:95-118` và `enneagram/score/route.ts:91-114` — copy-paste gần giống hệt: SELECT xem profile tồn tại chưa → if/else UPDATE hoặc INSERT. 2 queries thay vì 1 `.upsert()`. Logic lặp lại ở 2 routes + `report/page.tsx:66-71`.

#### 4. Server Component gọi fetch() tới chính nó

`report/[token]/page.tsx:46-57` — Server Component gọi HTTP fetch tới `/api/interpret` của chính server:
```
const baseUrl = process.env.NEXT_PUBLIC_REPORT_BASE_URL;
await fetch(`${baseUrl}/api/interpret`, { ... })
```
Thêm network overhead vô nghĩa. Nên gọi trực tiếp service function.

#### 5. `send-result` — 3 DB operations không có transaction

INSERT quiz_submissions → INSERT leads → UPDATE quiz_submissions.lead_id. Nếu bước 3 fail → quiz_submission orphan, không rollback.

#### 6. `quiz_submissions.result_json` — thêm một JSONB bag

`top_problem_1`, `top_problem_2` là data queryable quan trọng — nên là column riêng.

---

### Fix ngắn hạn (Phase 4 — không đổi schema)

Áp dụng ngay trong service layer khi rewire routes:

| Vấn đề | Fix | Áp dụng ở |
|---|---|---|
| Race condition trên metadata | Dùng Supabase jsonb partial update: `metadata = metadata \|\| '{"mbti_type":"INTJ"}'::jsonb` thay vì read-spread-write | `features/lead/repository.ts` — method `mergeMetadata(leadId, patch)` dùng RPC hoặc raw SQL |
| Duplicate upsert logic | Extract vào `features/shared/profile-repository.ts` dùng `.upsert()` với `onConflict: 'lead_id'` | `features/mbti/service.ts`, `features/enneagram/service.ts` |
| Server fetch tới chính nó | Import `features/bazi-numerology/service.ts` trực tiếp trong `report/[token]/page.tsx` thay vì HTTP call | `report/[token]/page.tsx` — gọi `interpret()` trực tiếp |
| 3-step insert không transaction | Dùng Supabase RPC (stored procedure) để atomic insert quiz + lead + link | `features/maxdiff/repository.ts` — method `createQuizAndLead()` |

### Fix dài hạn (Phase riêng — DB migration)

Thêm **Phase 4.5: Database Schema Migration** sau khi service layer ổn định:

**Migration 1 — Tách `leads.metadata` thành columns:**

```sql
-- Thêm columns mới
ALTER TABLE leads ADD COLUMN report_token UUID UNIQUE;
ALTER TABLE leads ADD COLUMN full_name TEXT;
ALTER TABLE leads ADD COLUMN gender SMALLINT;
ALTER TABLE leads ADD COLUMN birth_place TEXT;
ALTER TABLE leads ADD COLUMN persona_label TEXT;
ALTER TABLE leads ADD COLUMN mbti_type VARCHAR(4);
ALTER TABLE leads ADD COLUMN enneagram_type VARCHAR(2);

-- Backfill từ metadata
UPDATE leads SET
  report_token = (metadata->>'report_token')::UUID,
  full_name = metadata->>'full_name',
  gender = (metadata->>'gender')::SMALLINT,
  birth_place = metadata->>'birth_place',
  persona_label = metadata->>'persona_label',
  mbti_type = metadata->>'mbti_type',
  enneagram_type = metadata->>'enneagram_type';

-- Index cho query phổ biến
CREATE INDEX idx_leads_report_token ON leads(report_token);
CREATE INDEX idx_leads_mbti_type ON leads(mbti_type);
```

**Migration 2 — Tách `personal_profiles.profile_data`:**

```sql
ALTER TABLE personal_profiles ADD COLUMN mbti_data JSONB;
ALTER TABLE personal_profiles ADD COLUMN enneagram_data JSONB;
ALTER TABLE personal_profiles ADD COLUMN bazi_data JSONB;
ALTER TABLE personal_profiles ADD COLUMN numerology_data JSONB;
ALTER TABLE personal_profiles ADD COLUMN bazi_interp TEXT;
ALTER TABLE personal_profiles ADD COLUMN numerology_interp TEXT;

-- Backfill
UPDATE personal_profiles SET
  mbti_data = profile_data->'mbti',
  enneagram_data = profile_data->'enneagram',
  bazi_data = profile_data->'bazi',
  numerology_data = profile_data->'numerology',
  bazi_interp = profile_data->>'bazi_interp',
  numerology_interp = profile_data->>'numerology_interp';

-- Unique constraint
ALTER TABLE personal_profiles ADD CONSTRAINT uq_profile_lead UNIQUE (lead_id);
```

**Migration 3 — Tách `quiz_submissions.result_json`:**

```sql
ALTER TABLE quiz_submissions ADD COLUMN top_problem_1 TEXT;
ALTER TABLE quiz_submissions ADD COLUMN top_problem_2 TEXT;

UPDATE quiz_submissions SET
  top_problem_1 = result_json->>'top_problem_1',
  top_problem_2 = result_json->>'top_problem_2';
```

**Chiến lược migration:**
1. Thêm columns mới + backfill (backward compatible — metadata cột cũ vẫn còn)
2. Update repository layer đọc/ghi từ columns mới
3. Dual-write giai đoạn chuyển tiếp (ghi cả column mới + metadata cũ)
4. Verify data consistency
5. Drop metadata fields cũ (hoặc giữ read-only cho backward compat)

---

## API Contract Preservation

Response format **không thay đổi** cho tất cả 9 routes. External consumers không bị ảnh hưởng. Nếu đổi API paths, tạo redirect từ path cũ → mới trong `next.config.ts` redirects.

---

## Verification

Sau mỗi phase:
1. `npm run build` — không lỗi TypeScript
2. `npx vitest run` — tests pass (từ Phase 7)
3. Manual test: hoàn thành full quiz flow (persona select → MaxDiff → result → follow-up form → email received)
4. Verify API responses: `curl` mỗi endpoint, so sánh response shape với contract đã document
5. Verify cron: trigger manual `/api/cron/email-sequence` với auth header, check logs
6. Deploy Vercel preview → smoke test trước khi merge

---

## Estimates

| Phase | New Files | Modified | Delete |
|---|---|---|---|
| 0: Foundation | 6 | 1 | 0 |
| 1: Lib Reorg | 8 | 2 | 0 |
| 2: Feature Types/Data | ~22 | ~10 | 0 |
| 3: Repositories | 7 | 0 | 0 |
| 4: Services + Routes | ~8 | 9 | 0 |
| 4.5: DB Schema Migration | 3 (SQL) | ~5 (repos) | 0 |
| 5: CORS | 2 | 1 | 0 |
| 6: Component Reorg | 0 | ~8 | 0 |
| 7: Tests | ~12 | 0 | 0 |
| 8: Cleanup | 0 | ~15 | ~15 |
| **Total** | **~65** | **~46** | **~15** |
