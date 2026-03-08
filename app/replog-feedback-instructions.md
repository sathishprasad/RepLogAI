# RepLog AI — Grader Feedback: LLM Execution Instructions

> **Grade: A | Score: 93/100 | Status: Pass**
> Convert each section below into concrete code/product changes. Work through them in priority order.

---

## 1. CRITICAL: Fix Telegram Conversation State Persistence

**Problem:** Onboarding state is stored in a process-memory `Map`. This breaks across deploys and multiple instances.

**Instructions:**
- Replace the in-memory `Map` keyed by `chat_id` with a Prisma table (e.g., `TelegramSession`) or Redis entry.
- Schema suggestion:
  ```prisma
  model TelegramSession {
    chatId     String   @id
    state      Json
    updatedAt  DateTime @updatedAt
    expiresAt  DateTime?
  }
  ```
- Add TTL/expiry logic so stale onboarding sessions auto-clean.
- Ensure reads and writes are async and wrapped in try/catch.

---

## 2. CRITICAL: Centralize Plan Limits Logic

**Problem:** Plan limits are defined in `usage.ts` but re-derived in multiple route handlers, causing drift. `AUDIO_SECONDS` is tracked but not enforced.

**Instructions:**
- Create a single `lib/plans.ts` module that exports a `getPlanLimits(plan: PlanType)` function returning all limits (updates/day, audio seconds, etc.).
- Replace all inline plan-limit derivations across route handlers with imports from this module.
- Add a server-side guard for `AUDIO_SECONDS` — mirror the same pattern used for `updates-per-day`.

---

## 3. HIGH: Add Request Validation with Zod

**Problem:** API routes handling JSON bodies and query params lack input validation.

**Instructions:**
- Install Zod if not already present: `npm install zod`
- Add Zod schemas and `.parse()` / `.safeParse()` calls to the following routes:
  - `POST /api/employees`
  - `POST /api/notion/config`
  - `GET /api/analytics` (query params)
  - Any other route accepting user-controlled input
- On validation failure, return `400` with a descriptive error message.
- Also enforce maximum audio file size and MIME type on upload — reject oversized or unsupported codecs early with a clear error.

---

## 4. HIGH: Harden Webhooks

**Instructions:**

### Telegram Webhook
- Set `X-Telegram-Bot-Api-Secret-Token` when registering the webhook with Telegram.
- Verify this header on every incoming request to `/api/webhooks/telegram`. Reject requests with missing or mismatched tokens with `403`.
- Add rate limiting to `/api/webhooks/telegram` (e.g., using `upstash/ratelimit` or a simple in-memory limiter).

### Stripe Webhook
- Already correct (raw body + secret verification). No changes needed.

---

## 5. HIGH: Move AI Pipeline to a Job Queue

**Problem:** Transcription → extraction → sync is chained via HTTP calls, making it fragile and hard to retry.

**Instructions:**
- Introduce a job queue (e.g., [Trigger.dev](https://trigger.dev), BullMQ with Redis, or Inngest).
- Refactor the pipeline into discrete jobs:
  1. `transcribe-audio` — calls Whisper, stores transcript
  2. `extract-fields` — calls Claude with transcript, stores structured output
  3. `sync-to-notion` — writes to Notion using extracted fields
- Each job should have retry logic with exponential backoff.
- Expose pipeline stage status (`uploaded → transcribed → extracted → synced`) to the frontend so users see inline progress and can retry failed stages.

---

## 6. MEDIUM: Add Structured Logging + Error Tracking

**Instructions:**
- Integrate Sentry (or equivalent): `npm install @sentry/nextjs` and follow Next.js setup guide.
- Add correlation IDs to requests (e.g., using `nanoid`) and thread them through logs.
- Audit all `console.log` calls — ensure no secrets, tokens, or full JSON payloads are logged in production. Add log redaction where needed.
- Switch to structured logging format (JSON) for prod; use a logger like `pino`.

---

## 7. MEDIUM: Fix `force-dynamic` Overuse

**Problem:** `force-dynamic` on all routes disables caching and hurts performance.

**Instructions:**
- Audit every route that uses `export const dynamic = 'force-dynamic'`.
- Remove it from routes that serve static or revalidatable content.
- Use `export const revalidate = <seconds>` for ISR where appropriate.
- Keep `force-dynamic` only on routes that truly require per-request freshness (auth-gated, user-specific data).

---

## 8. MEDIUM: Harden Notion Sync

**Instructions:**
- For `multi_select` fields: trim whitespace and deduplicate values before writing to Notion.
- Build a `POST /api/notion/preview` (dry-run) endpoint that returns the mapped schema output without committing a write — lets admins verify field mapping before going live.

---

## 9. MEDIUM: Security Hardening

**Instructions:**
- Validate that `ENCRYPTION_KEY` is exactly 32 bytes (64 hex chars) at app startup. If invalid, throw a clear startup error — do not silently proceed.
- Review Supabase storage bucket policies: ensure public read is disabled and object paths are tenant-isolated (e.g., `/{orgId}/{userId}/...`).
- Add CSRF protection to all state-changing browser-facing endpoints (use `next-csrf` or SameSite cookie strategy).

---

## 10. LOW: Build a Sandbox / Demo Mode

**Problem:** Judges and new users can't test the full flow without their own Notion/Telegram credentials.

**Instructions:**
- Add a `DEMO_MODE=true` env flag.
- When enabled:
  - Bypass real Notion OAuth; use a seeded mock Notion database.
  - Provide a pre-linked Telegram test bot with a disposable company code and employee ID.
  - Optionally seed a sample audio file and show expected extraction output for comparison.
- Add a "Try Demo" CTA on the landing page and onboarding screen.

---

## 11. LOW: Landing Page Polish

**Instructions:**
- **Accessibility:** Run Axe or Lighthouse audit. Fix color contrast issues on muted text over dark backgrounds. Ensure all CTAs and links have visible focus states.
- **Performance:** Compress or lazy-load heavy hero assets. Target LCP < 2.5s.
- **Social proof:** Add a "Trusted by" logo strip above the fold (can be placeholder logos initially).

---

## Score Recovery Opportunity

To potentially increase the **Core Functionality** score from 21/25, provide the grader with:

- [ ] Temporary magic-link or test credentials for the live app
- [ ] A test Notion database pre-shared with the integration
- [ ] Telegram bot username + disposable company code + one valid test employee ID
- [ ] A sample audio file and expected Notion record output for extraction fidelity check

---

*Generated from grader feedback — RepLog AI submission, March 2026.*
