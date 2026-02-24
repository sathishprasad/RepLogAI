# RepLog AI — SaaS Build Plan (Live)
**Date:** 2026-02-24  
**POC:** AdaL  
**Status:** Building — Sprint 2 Complete

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

### Sprint 3: Onboarding & Notion OAuth ⬜ NEXT
- [ ] Onboarding wizard (4 steps)
- [ ] Notion OAuth start + callback (live)
- [ ] Database picker (list user's Notion DBs)
- [ ] Schema discovery + mapping UI
- [ ] Other integrations shown as "Coming Soon · Beta"

### Sprint 4: Voice → AI → Notion
- [ ] Voice recorder (mic, timer, waveform, 90s limit) — UI done, needs live connection
- [ ] Audio upload API → Supabase Storage (live)
- [ ] Transcription API (OpenAI Whisper) — route exists, needs live wiring
- [ ] Field extraction API (Claude/GPT + schema context) — route exists, needs live wiring
- [ ] Review & edit page — UI done, needs live data
- [ ] Notion sync API (write row) — route exists, needs live wiring
- [ ] Sync result page

### Sprint 5: History & Settings (Live Data)
- [ ] History list page wired to Prisma/Supabase
- [ ] Entry detail page with real data
- [ ] Settings page wired (account, notion, mapping, billing)

### Sprint 6: Billing & Polish
- [ ] Stripe checkout + portal (live)
- [ ] Usage tracking + limits
- [ ] WhatsApp section marked "In Progress"
- [ ] Loading states, error handling, mobile responsive

---

## 📁 File Structure

```
app/
├── page.tsx                    # Landing (existing)
├── layout.tsx                  # Root layout (existing)
├── globals.css                 # Styles (existing)
├── auth/
│   ├── page.tsx                # Sign in (uses SignIn1 component)
│   ├── signup/page.tsx         # Sign up (uses SignUp1 component)
│   ├── forgot-password/page.tsx # Reset password (uses ForgotPassword1)
│   └── callback/route.ts      # OAuth callback
├── onboarding/
│   ├── page.tsx                # Multi-step wizard
│   └── layout.tsx
├── dashboard/
│   ├── layout.tsx              # Sidebar + topbar
│   ├── page.tsx                # Overview
│   ├── capture/
│   │   ├── page.tsx            # Voice record
│   │   └── review/page.tsx     # Review fields
│   ├── history/
│   │   ├── page.tsx            # Entry list
│   │   └── [id]/page.tsx       # Detail
│   ├── integrations/page.tsx   # Notion + coming soon
│   └── settings/page.tsx       # All settings
├── api/
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
│   └── webhooks/
│       ├── stripe/route.ts
│       └── whatsapp/route.ts
components/
├── ui/                         # Shadcn + custom
│   ├── modern-stunning-sign-in.tsx
│   ├── modern-stunning-sign-up.tsx
│   └── modern-stunning-forgot-password.tsx
├── dashboard/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── overview-cards.tsx
│   ├── voice-recorder.tsx
│   ├── review-panel.tsx
│   ├── field-editor.tsx
│   ├── sync-result.tsx
│   ├── history-table.tsx
│   ├── schema-mapper.tsx
│   └── notion-connector.tsx
lib/
├── utils.ts                    # Existing
├── supabase/
│   ├── client.ts               # Browser client (bypass mode)
│   ├── server.ts               # Server client
│   └── middleware.ts            # Auth helper (bypass mode)
├── prisma.ts                   # Singleton
├── notion.ts                   # API helpers
├── ai/
│   ├── transcribe.ts           # Whisper
│   ├── extract.ts              # Schema-aware extraction
│   └── prompts.ts              # LLM prompts
├── stripe.ts                   # Stripe helpers
└── encryption.ts               # Token encrypt/decrypt
prisma/
└── schema.prisma               # Full schema (Prisma 5)
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

# WhatsApp (Future)
# WHATSAPP_VERIFY_TOKEN=
# WHATSAPP_ACCESS_TOKEN=
# WHATSAPP_PHONE_NUMBER_ID=

# Encryption
ENCRYPTION_KEY=  # 32-byte hex for token encryption

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📝 Notes
- Refer to `backend-design.md` for detailed backend logic
- Refer to `saas-features.md` for screen/UX specifications
- Landing page theme must be maintained across all new pages
- All "Start Free" / "Get Started" / "Log in" buttons → `/auth`
- App running on `localhost:3001` (dev server)
- Prisma 5 used (not v7) to avoid config issues
- Auth pages use stunning glass-card design matching the dark theme
