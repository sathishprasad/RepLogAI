# RepLog AI — SaaS Build Plan (Live)
**Date:** 2026-02-24  
**POC:** AdaL  
**Status:** Building — Sprint 9 Complete (Analytics Tab + UX Polish)

---

## TL;DR
Build the complete RepLog AI SaaS on the existing Next.js landing page. Voice notes → AI transcription → structured CRM fields → Notion database. All integrations are LIVE (no mocks). Supabase Auth + Postgres (Prisma), Notion OAuth, OpenAI Whisper, Claude/GPT extraction, Stripe billing.

---

## 🔑 Key Decisions
- **All integrations are LIVE** — user provides API keys in `.env.local`
- **Notion is the only active integration** — others (Salesforce, HubSpot, Pipedrive, Slack) shown as "Coming Soon · Beta"
- **WhatsApp voice** — marked as "In Progress" on UI (not built for MVP)
- **Database** — Supabase Postgres via Prisma 5 (live)
- **Bypass/Demo mode** — when no Supabase env keys are set, UI is fully navigable (auth pages redirect to dashboard)

---

## 📐 Architecture

```
Next.js App Router
├── / (Landing Page - existing)
├── /auth (Stunning Sign In — Email/Password + Google)
├── /auth/signup (Stunning Sign Up — Name + Email/Password + Google)
├── /auth/forgot-password (Password Reset via Email)
├── /auth/callback (OAuth callback handler)
├── /onboarding (Notion OAuth → DB Picker → Schema Map)
├── /dashboard/* (Protected)
│   ├── / (Overview)
│   ├── /capture (Voice Record)
│   ├── /capture/review (AI Extracted Fields)
│   ├── /history (Entry Logs)
│   ├── /history/[id] (Entry Detail)
│   ├── /integrations (Notion + Coming Soon)
│   └── /settings (Account, Mapping, Billing)
├── /api/oauth/notion/* (Notion OAuth)
├── /api/notion/* (DB list, schema, sync)
├── /api/voice/* (upload, transcribe, extract)
├── /api/stripe/* (checkout, portal)
└── /api/webhooks/* (stripe, whatsapp-placeholder)
```

**Stack:** Supabase Auth → Supabase Postgres (Prisma 5) → Notion API → OpenAI Whisper → Claude/GPT → Stripe

---

## 🎨 Design System (from Landing Page)

| Token | Value |
|-------|-------|
| primary | `#4F7CFF` |
| primary-hover | `#3B66E0` |
| bg-dark | `#0B0F17` |
| bg-light | `#F6F7FB` |
| surface | `#FFFFFF` |
| text-primary | `#0F172A` |
| text-light | `#E5E7EB` |
| muted-text | `#6B7280` |
| border | `#E5E7EB` |
| font | Plus Jakarta Sans |
| Dashboard | Dark sidebar + Light content |

---

## 🗂️ Sprint Plan

### Sprint 1: Infrastructure ✅ COMPLETE
- [x] Install deps (prisma, @supabase/supabase-js, @supabase/ssr, @notionhq/client, openai, stripe, @anthropic-ai/sdk)
- [x] Prisma 5 schema (User, Account, NotionConnection, VoiceEntry, FieldMapping, Subscription)
- [x] Supabase client (browser + server) with bypass/demo mode
- [x] Auth middleware (protect /dashboard/*, bypass when no env keys)
- [x] Auth callback handler (/auth/callback/route.ts)

### Sprint 2: Dashboard Shell + Auth UI ✅ COMPLETE
- [x] Dashboard layout (sidebar + topbar)
- [x] Dashboard home (overview cards — entries, synced, streak, plan)
- [x] Voice Capture page (recorder + waveform visualizer)
- [x] Review & Edit page (AI-extracted fields editor)
- [x] History page (entry list with status badges)
- [x] Integrations Hub page (Notion live, others "Coming Soon")
- [x] Settings page (Account, Notion, Field Mapping, Billing sections)
- [x] Link all landing page CTAs → /auth
- [x] 12 API routes (voice/upload, voice/transcribe, voice/extract, notion/databases, notion/schema, notion/sync, stripe/checkout, stripe/portal, oauth/notion/start, oauth/notion/callback, webhooks/stripe, webhooks/whatsapp)
- [x] Stunning Auth pages: Sign In, Sign Up, Forgot Password (glass-card dark theme)

### Sprint 3: Onboarding & Notion OAuth ✅ COMPLETE
- [x] Onboarding wizard (4 steps: Welcome → Connect → Database → Schema)
- [x] Notion OAuth start + callback (live)
- [x] Database picker (list user's Notion DBs)
- [x] Schema discovery + mapping UI
- [x] Other integrations shown as "Coming Soon · Beta"

### Sprint 4: Voice → AI → Notion ✅ COMPLETE
- [x] Voice recorder (mic, timer, waveform, 90s limit) — live
- [x] Audio upload API → Supabase Storage (service-role client, bypasses RLS)
- [x] Transcription API (OpenAI Whisper) — live
- [x] Field extraction API (Claude + dynamic schema context) — live
- [x] Review & edit page — live data from extraction
- [x] Notion sync API (raw fetch, auto-correcting database ID) — live
- [x] Sync result with Notion page link

### Sprint 5: History & Settings (Live Data) ✅ COMPLETE
- [x] History list page wired to Prisma/Supabase
- [x] Entry detail page with real data (`/api/history/[id]`)
- [x] Dashboard overview with real stats (`/api/dashboard`)
- [x] Settings page wired — account (name edit), Notion (connect/disconnect/reconnect), database mapping (real columns), billing (usage meter + Stripe), danger zone (delete transcripts/account/reset onboarding)
- [x] Re-onboarding / change database flow (Settings → Change Database or Reset Onboarding)

### Sprint 6: Billing & Polish ✅ COMPLETE
- [x] Stripe checkout route (`/api/stripe/checkout`) — creates customer + checkout session
- [x] Stripe customer portal route (`/api/stripe/portal`) — manage subscription
- [x] Stripe webhook handler — handles checkout.completed, subscription.updated, subscription.deleted
- [x] Usage tracking (`lib/usage.ts`) — tracks entries + audio seconds per month
- [x] Plan limit enforcement — blocks new uploads when monthly limit reached (429 response)
- [x] WhatsApp section marked "In Progress" on integrations page
- [x] Loading states on all pages (Loader2 spinners)
- [x] Error handling with toast notifications on settings page
- [x] Integrations page shows real Notion connection status
- [x] Suspense boundaries for `useSearchParams` pages (review, settings, onboarding)
- [x] Reset onboarding feature in Settings → Danger Zone
- [x] Production build passes (`next build` ✅)

### Sprint 7: Telegram Bot Pivot ✅ COMPLETE
- [x] Prisma schema updates — Employee model, companyCode/companyName on User, EntrySource enum, telegram fields on VoiceEntry
- [x] `lib/telegram.ts` — Telegram Bot API wrapper (sendMessage, getFile, downloadFile, setWebhook, deleteWebhook, getMe)
- [x] `lib/telegram-pipeline.ts` — Headless voice pipeline (download → storage → Whisper → Claude → Notion sync → bot reply)
- [x] `/api/webhooks/telegram` — Full webhook handler (deep link, employee matching, voice processing)
- [x] `/api/telegram/setup` — Webhook registration endpoint
- [x] `/api/employees` — Employee roster CRUD (GET/POST/DELETE)
- [x] Onboarding Step 4: Company Setup (code generation, roster upload, deep link sharing)
- [x] Settings: Telegram Bot section + Employee Roster management
- [x] Dashboard & History updated for rep attribution + Telegram badges
- [x] Notion API switched to raw fetch with v2022-06-28 (fixes SDK search issues)

### Sprint 8: Dashboard v2 — KPIs, Analytics & History Filters ✅ COMPLETE
- [x] New KPI cards: Logs This Week, CRM Fill Rate, Avg Time Saved/Rep, Follow-ups Due Today
- [x] Cumulative Time Saved area chart (Recharts) — starts from company's first entry date
- [x] History page: Rep Name filter, Date Range calendar picker, CSV export
- [x] History search matches rep names + entry counter with filter indicator
- [x] Installed `recharts` charting library

### Sprint 9: Analytics Tab & UX Polish ✅ COMPLETE
- [x] `/dashboard/analytics` page — rep-level performance table with dynamic Notion schema columns
- [x] `/api/analytics` route — groups entries by rep, computes fill rate, time saved, follow-ups, stage tallies
- [x] Dynamic stage breakdown from Notion select/multi_select columns (auto-detected per user)
- [x] Period filter buttons (14/30/60/90 days), rep search, CSV export, totals footer
- [x] Topbar dropdown menu with Settings + Sign Out (moved from sidebar)
- [x] Sidebar cleaned: removed Settings, Sign Out, Telegram Bot Active text; added Analytics nav
- [x] Fixed CRM Fill Rate (now uses actual Notion schema keys, ≥80% threshold)
- [x] Fixed Avg Time Saved/Rep sliding window logic (min date as Day 1)

---

## 📁 File Structure

```
app/
├── page.tsx                    # Landing (existing)
├── layout.tsx                  # Root layout (existing)
├── globals.css                 # Styles (existing)
├── auth/
│   ├── page.tsx                # Sign in (GitHub OAuth)
│   ├── signup/page.tsx         # Sign up (GitHub OAuth)
│   ├── forgot-password/page.tsx # Reset password
│   └── callback/route.ts      # OAuth callback
├── onboarding/
│   ├── page.tsx                # Multi-step wizard (4 steps incl. Company Setup)
│   └── layout.tsx
├── dashboard/
│   ├── layout.tsx              # Sidebar + topbar
│   ├── page.tsx                # Overview (KPI cards + 14-day chart + rep stats)
│   ├── history/
│   │   ├── page.tsx            # Entry list (filters, search, CSV export)
│   │   └── [id]/page.tsx       # Detail
│   ├── analytics/page.tsx      # Rep-level analytics (dynamic Notion columns)
│   ├── integrations/page.tsx   # Notion + coming soon
│   └── settings/page.tsx       # Account, Telegram, Employees, Billing
├── api/
│   ├── dashboard/route.ts      # Overview KPIs, chart data, rep stats
│   ├── analytics/route.ts      # Rep-level analytics API (?days=14|30|60|90)
│   ├── oauth/notion/
│   │   ├── start/route.ts
│   │   └── callback/route.ts
│   ├── notion/
│   │   ├── databases/route.ts
│   │   ├── schema/route.ts
│   │   └── sync/route.ts
│   ├── voice/
│   │   ├── upload/route.ts
│   │   ├── transcribe/route.ts
│   │   └── extract/route.ts
│   ├── stripe/
│   │   ├── checkout/route.ts
│   │   └── portal/route.ts
│   ├── telegram/
│   │   └── setup/route.ts      # Webhook registration
│   ├── employees/route.ts      # Employee roster CRUD
│   ├── history/
│   │   ├── route.ts            # History list API
│   │   └── [id]/route.ts       # Entry detail API
│   └── webhooks/
│       ├── stripe/route.ts
│       └── telegram/route.ts   # Telegram bot webhook handler
components/
├── ui/                         # Shadcn + custom
│   ├── modern-stunning-sign-in.tsx
│   ├── modern-stunning-sign-up.tsx
│   └── modern-stunning-forgot-password.tsx
├── dashboard/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   └── overview-cards.tsx      # 4 KPI cards (Logs, Fill Rate, Time Saved, Follow-ups)
lib/
├── utils.ts                    # Existing
├── supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client
│   ├── service.ts              # Service-role client (bypasses RLS)
│   └── middleware.ts            # Auth helper
├── prisma.ts                   # Singleton
├── notion.ts                   # API helpers (raw fetch, v2022-06-28)
├── telegram.ts                 # Telegram Bot API wrapper
├── telegram-pipeline.ts        # Headless voice processing pipeline
├── ai/
│   ├── transcribe.ts           # Whisper
│   ├── extract.ts              # Schema-aware extraction
│   └── prompts.ts              # LLM prompts
├── stripe.ts                   # Stripe helpers
├── usage.ts                    # Usage tracking + plan limits
└── encryption.ts               # Token encrypt/decrypt
prisma/
└── schema.prisma               # Full schema (User, Employee, VoiceEntry, etc.)
```

---

## 🔐 Required Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase Postgres)
DATABASE_URL=

# Notion OAuth
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=http://localhost:3000/api/oauth/notion/callback

# OpenAI (Whisper + optional GPT)
OPENAI_API_KEY=

# Anthropic (Claude for extraction)
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Telegram Bot
TELEGRAM_BOT_TOKEN=  # From @BotFather

# Encryption
ENCRYPTION_KEY=  # 32-byte hex for token encryption

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📝 Notes
- Refer to `backend-design.md` for detailed backend logic
- Refer to `saas-features.md` for screen/UX specifications (updated to v2 Telegram-first)
- Refer to `plan_telegram_pivot.md` for Telegram bot architecture details
- Landing page theme must be maintained across all new pages
- All "Start Free" / "Get Started" / "Log in" buttons → `/auth`
- App running on `localhost:3000` (dev server)
- Prisma 5 used (not v7) to avoid config issues
- Auth: GitHub OAuth (Google OAuth removed)
- Auth pages use stunning glass-card design matching the dark theme
- Telegram webhook: registered via ngrok for development
- Bot: @RepLogAIBot — shared bot, one per deployment
- Charts: Recharts (installed for dashboard 14-day activity chart)
- Notion API: Uses raw fetch with `Notion-Version: 2022-06-28` (bypasses SDK limitations)
