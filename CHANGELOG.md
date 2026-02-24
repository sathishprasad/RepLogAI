# Changelog — RepLog AI (Mangal)

## 2026-02-24 — Session 3: End-to-End Pipeline Complete 🎉

### Milestone
**Full voice-to-Notion pipeline working end-to-end:** Record → Transcribe (Whisper) → Extract (Claude) → Review → Write to Notion ✅

### Fixed
- **Notion sync "Could not find database" error** — Root cause: `data_source` search filter returned wrapper object IDs, not actual database IDs. The stored ID `311cdf46-f1e5-80cd-8260-000bd8ee15f9` didn't match the real DB ID `311cdf46-f1e5-804a-915b-ef2d5d0858c8`
- **Sync route now auto-recovers** — If stored database ID fails verification, searches all accessible databases and auto-corrects the stored ID
- **Notion database listing** — Switched back from `data_source` to `database` filter in both `/api/notion/databases` and `/api/notion/schema` routes
- **History detail page showed hardcoded dummy data** — Rewrote `app/dashboard/history/[id]/page.tsx` to fetch real entry data from new API endpoint

### Added
- **`app/api/history/[id]/route.ts`** — New API endpoint returning full entry detail (transcript, extracted fields, Notion URL, status)
- **`lib/supabase/service.ts`** — Service-role Supabase client for server-side storage operations (bypasses RLS)
- **Dynamic Claude extraction** — Extraction prompt now receives user's actual Notion schema columns so AI fills the right fields
- **Notion sync uses raw fetch API** — Bypassed Notion SDK v5.9.0 issues by using direct `fetch()` with `Notion-Version: 2022-06-28` header

### Changed
- `app/api/notion/sync/route.ts` — Complete rewrite: raw fetch API, database ID verification + auto-correction, detailed logging
- `app/api/notion/databases/route.ts` — Filter changed from `data_source` to `database`
- `app/api/notion/schema/route.ts` — Filter changed from `data_source` to `database`
- `app/api/voice/extract/route.ts` — Claude prompt now dynamically includes user's Notion schema
- `app/api/voice/upload/route.ts` — Uses service-role client for Supabase Storage uploads
- `app/dashboard/history/[id]/page.tsx` — Fetches real data from `/api/history/[id]`
- `app/dashboard/history/page.tsx` — Uses live API data instead of dummy entries
- `app/dashboard/page.tsx` — Dashboard overview uses real stats from `/api/dashboard`

### Pipeline Status
| Step | Status |
|------|--------|
| GitHub OAuth Sign In | ✅ Working |
| Notion OAuth Connect | ✅ Working |
| Database Selection | ✅ Working |
| Schema Discovery | ✅ Working |
| Voice Recording | ✅ Working |
| Whisper Transcription | ✅ Working |
| Claude Field Extraction | ✅ Working |
| Review & Edit Fields | ✅ Working |
| Write to Notion | ✅ Working |
| History (List) | ✅ Live data |
| History (Detail) | ✅ Live data |
| Dashboard Overview | ✅ Live data |

---

## 2026-02-24 — Session 2: Auth Fix, Env & Notion OAuth

### Fixed
- **Server crash on auth page** — Stale Next.js dev server was unresponsive; restarted and verified all routes return correct status codes
- **Prisma `DATABASE_URL` empty at runtime** — `next.config.mjs` `env` option only creates build-time replacements; now directly assigns all vars to `process.env` so Prisma and all server-side libs can read them
- **Prisma CLI can't access DATABASE_URL** — Added `DIRECT_URL` (port 5432, no pgbouncer) for schema operations
- **`.env` had wrong `NOTION_REDIRECT_URI`** — Was set to full Notion auth URL instead of callback endpoint; fixed to `http://localhost:3000/api/oauth/notion/callback`

### Changed
- `next.config.mjs` — Rewrote to set `process.env[key]` directly (not just Next.js `env` config); reduced `env` block to only `NEXT_PUBLIC_*` vars
- `prisma/schema.prisma` — Added `directUrl = env("DIRECT_URL")` to datasource block
- `.env.local` — Added `DIRECT_URL` for direct Postgres connection (bypasses pgbouncer)
- `.env` — Fixed `NOTION_REDIRECT_URI` value

### Fixed (Notion)
- **Notion database list empty** — `notion.search()` filter value `"database"` is deprecated in newer Notion API; changed to `"data_source"` in `app/api/notion/databases/route.ts`
- **Schema columns not loading on onboarding** — `databases.retrieve()` fails with `data_source` IDs; rewrote `app/api/notion/schema/route.ts` to use `notion.search()` and find the database by ID from search results instead
- **History page showed dummy data** — Replaced hardcoded `sampleEntries` array with real API call to new `/api/history` endpoint
- **Created `app/api/history/route.ts`** — New API endpoint fetching real voice entries from Prisma DB

### Requires User Action
- **Supabase Storage bucket "voice-notes" missing** — Must create bucket in Supabase Dashboard → Storage for voice upload pipeline to work

### Notes
- Login always redirects to onboarding because `onboardingComplete` is `false` until user completes full Notion setup flow (this is correct behavior, not a bug)
- Voice pipeline code (Whisper → Claude → Notion sync) is fully implemented but blocked by missing storage bucket

---

## 2026-02-24 — Session 1: Full Overhaul

### Auth
- Replaced Google OAuth with **GitHub OAuth** across all components
- Created `app/auth/page.tsx` — Sign-in page with GitHub OAuth + email/password + dev bypass
- Created `app/auth/signup/page.tsx` — Sign-up page with GitHub OAuth
- Created `app/auth/callback/route.ts` — Handles OAuth code exchange, creates user in Prisma DB, redirects to onboarding or dashboard
- Updated `lib/supabase/middleware.ts` — Auth guards for `/dashboard`, `/onboarding`; redirects unauthenticated users to `/auth`
- Updated `middleware.ts` — Wired to supabase middleware with correct matcher paths

### Database
- Created `prisma/schema.prisma` with full schema:
  - `User` (id, email, name, avatarUrl, onboardingComplete)
  - `NotionConnection` (encrypted access token, workspace info)
  - `NotionDatabaseConfig` (database mapping + schema snapshot)
  - `AllowedSenderPhoneNumber` (WhatsApp sender verification)
  - `VoiceEntry` (full voice-to-CRM pipeline status tracking)
  - `StripeCustomer` (subscription + plan tracking)
  - `UsageEvent` (metered usage for plan limits)
- Created `ddl.sql` — Manual DDL for Supabase table creation
- Fixed UUID/TEXT type mismatch (userId fields)
- URL-encoded special characters in DATABASE_URL password (`[`, `]`, `;`)

### Infrastructure
- Created `next.config.mjs` — Custom `.env.local` loader to bypass Node v24/Next.js dotenv issues
- Injected all env vars (Supabase, Notion, OpenAI, Anthropic, Stripe, Encryption) into Next.js runtime
- Generated `ENCRYPTION_KEY` via `openssl rand -hex 32`

### Dashboard
- Created `/api/dashboard` — API route fetching real stats from Prisma (total entries, audio minutes, synced count, pending count, recent entries)
- Rewrote `app/dashboard/page.tsx` — Consumes live API data with loading/empty states

### Components
- `components/ui/modern-stunning-sign-in.tsx` — Glass-card sign-in UI with GitHub, email, dev bypass
- `components/ui/modern-stunning-sign-up.tsx` — Sign-up UI with GitHub + email

---

## Supabase Tables Required

Your Prisma schema defines these tables. Run `npx prisma db push` (uses DIRECT_URL) or execute the DDL in `ddl.sql` manually:

| Table | Purpose |
|-------|---------|
| `User` | Core user record (from GitHub OAuth) |
| `NotionConnection` | Encrypted Notion OAuth tokens |
| `NotionDatabaseConfig` | User's chosen Notion DB + field mapping |
| `AllowedSenderPhoneNumber` | WhatsApp sender whitelist |
| `VoiceEntry` | Voice recording → CRM pipeline entries |
| `StripeCustomer` | Stripe subscription tracking |
| `UsageEvent` | Metered usage for plan limits |

Plus enums: `VoiceEntryStatus`, `Plan`, `UsageType`

**No additional Supabase table changes needed** — the schema is already complete for the current feature set.
