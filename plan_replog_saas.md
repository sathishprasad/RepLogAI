# RepLog AI — Full SaaS Build Plan
**Date:** 2026-02-24  
**POC:** AdaL  
**Status:** Planning → Implementation

---

## TL;DR
Build the complete RepLog AI SaaS application on top of the existing Next.js landing page. The app lets sales reps record voice notes, transcribe them via AI, extract structured CRM fields, and sync them to a Notion database. Backend uses Supabase (Auth + Postgres via Prisma), Notion OAuth, OpenAI Whisper + Claude/GPT for AI, and Stripe for billing.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App (App Router)              │
├──────────────┬──────────────┬───────────────────────────┤
│  Landing     │  Auth        │  Dashboard (Protected)     │
│  /           │  /auth       │  /dashboard/*              │
├──────────────┴──────────────┴───────────────────────────┤
│                  API Routes (/api/*)                      │
│  /api/auth  /api/notion  /api/voice  /api/stripe         │
│  /api/webhooks/whatsapp  /api/webhooks/stripe            │
├──────────────────────────────────────────────────────────┤
│  Supabase Auth │ Supabase Postgres (Prisma) │ Storage    │
├──────────────────────────────────────────────────────────┤
│  External: Notion API │ OpenAI Whisper │ Claude/GPT      │
│  Stripe │ WhatsApp Business Cloud API                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🗂️ Phase Breakdown

### Phase 1: Foundation & Infrastructure
1. **Install dependencies** — Prisma, Supabase client, next-auth/supabase-auth, stripe, openai, @notionhq/client
2. **Prisma schema** — All models from backend-design.md (User, NotionConnection, NotionDatabaseConfig, AllowedSenderPhoneNumber, VoiceEntry, StripeCustomer, UsageEvent)
3. **Environment config** — `.env.local` template with all required keys
4. **Supabase project setup** — Auth config, database connection
5. **Middleware** — Auth protection for `/dashboard/*` routes

### Phase 2: Auth & Onboarding Flow
6. **Auth page** (`/auth`) — Sign in with Google via Supabase Auth
7. **Auth callback** (`/auth/callback`) — Handle OAuth redirect
8. **Onboarding wizard** (`/onboarding`) — Multi-step: Connect Notion → Select DB → Review Schema → Add Phone
9. **Notion OAuth** (`/api/oauth/notion/start`, `/api/oauth/notion/callback`) — Connect Notion, store encrypted token

### Phase 3: Dashboard Layout & Navigation
10. **Dashboard layout** (`/dashboard/layout.tsx`) — Persistent sidebar + topbar
11. **Sidebar navigation** — Voice Capture, History, Integrations, Settings
12. **Dashboard home** (`/dashboard`) — Overview cards (usage, recent entries, connection status)

### Phase 4: Core Feature — Voice Capture & Processing
13. **Voice Capture page** (`/dashboard/capture`) — Record button, timer, waveform, 90s limit
14. **Audio upload API** (`/api/voice/upload`) — Accept audio blob, store in Supabase Storage
15. **Transcription API** (`/api/voice/transcribe`) — OpenAI Whisper integration
16. **Field extraction API** (`/api/voice/extract`) — Claude/GPT with Notion schema context
17. **Validation service** — Normalize extracted fields against Notion schema

### Phase 5: Review & Sync
18. **Review page** (`/dashboard/capture/review`) — Show transcript + extracted fields + confidence
19. **Edit capabilities** — Inline edit transcript and any extracted field
20. **Sync to Notion API** (`/api/notion/sync`) — Write approved row to Notion database
21. **Sync result UI** — Success/failure with link to Notion page

### Phase 6: History & Logs
22. **History page** (`/dashboard/history`) — List of all voice entries with status
23. **Entry detail** (`/dashboard/history/[id]`) — Full details, re-sync option

### Phase 7: Settings & Integrations
24. **Settings page** (`/dashboard/settings`) — Notion connection, database selection, mapping, account
25. **Integrations page** (`/dashboard/integrations`) — Notion status, future CRM connections
26. **Schema mapping UI** — Toggle fillable columns, rename meanings

### Phase 8: Billing (Stripe)
27. **Stripe integration** — Customer creation, checkout session, portal
28. **Usage tracking** — Count entries per billing period
29. **Upgrade prompts** — When limits reached
30. **Webhook handler** (`/api/webhooks/stripe`) — Subscription updates

### Phase 9: WhatsApp Integration (Optional/Future)
31. **WhatsApp webhook** (`/api/webhooks/whatsapp`) — Receive voice notes
32. **Approval flow** — APPROVE/EDIT/CANCEL via WhatsApp replies

### Phase 10: Polish & Landing Page Links
33. **Link landing page CTAs** — "Start Free" → `/auth`, "Log in" → `/auth`, pricing buttons → `/auth`
34. **Loading states** — Skeletons for all dashboard pages
35. **Error boundaries** — Graceful error handling
36. **Mobile responsive** — All dashboard screens

---

## 🎨 Design System (Consistent with Landing Page)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4F7CFF` | Buttons, accents, links |
| `primary-hover` | `#3B66E0` | Button hover states |
| `bg-dark` | `#0B0F17` | Dark sections, sidebar |
| `bg-light` | `#F6F7FB` | Light backgrounds |
| `surface` | `#FFFFFF` | Cards, panels |
| `text-primary` | `#0F172A` | Main text |
| `text-light` | `#E5E7EB` | Text on dark bg |
| `muted-text` | `#6B7280` | Secondary text |
| `border` | `#E5E7EB` | Borders, dividers |
| Font | Plus Jakarta Sans | Global |
| Radius | `rounded-2xl` (cards), `rounded-full` (buttons) | Consistent corners |

**Dashboard Theme:** Dark sidebar (`#0B0F17`) + Light content area (`#F6F7FB`) — matches the landing page's alternating dark/light sections.

---

## 📁 File Structure (Target)

```
app/
├── page.tsx                          # Landing page (existing)
├── layout.tsx                        # Root layout (existing)
├── globals.css                       # Global styles (existing)
├── auth/
│   ├── page.tsx                      # Sign in page
│   └── callback/route.ts            # Auth callback
├── onboarding/
│   ├── page.tsx                      # Onboarding wizard
│   └── layout.tsx                    # Onboarding layout
├── dashboard/
│   ├── layout.tsx                    # Dashboard shell (sidebar + topbar)
│   ├── page.tsx                      # Dashboard home / overview
│   ├── capture/
│   │   ├── page.tsx                  # Voice capture
│   │   └── review/page.tsx           # Review & edit extracted fields
│   ├── history/
│   │   ├── page.tsx                  # Entry history list
│   │   └── [id]/page.tsx             # Entry detail
│   ├── integrations/page.tsx         # Integrations hub
│   └── settings/page.tsx             # Settings
├── api/
│   ├── auth/[...supabase]/route.ts   # Auth routes
│   ├── oauth/notion/
│   │   ├── start/route.ts            # Initiate Notion OAuth
│   │   └── callback/route.ts         # Handle Notion OAuth callback
│   ├── notion/
│   │   ├── databases/route.ts        # List user's Notion databases
│   │   ├── schema/route.ts           # Get database schema
│   │   └── sync/route.ts             # Write row to Notion
│   ├── voice/
│   │   ├── upload/route.ts           # Upload audio
│   │   ├── transcribe/route.ts       # Whisper transcription
│   │   └── extract/route.ts          # AI field extraction
│   ├── stripe/
│   │   ├── checkout/route.ts         # Create checkout session
│   │   └── portal/route.ts           # Customer portal
│   └── webhooks/
│       ├── stripe/route.ts           # Stripe webhook
│       └── whatsapp/route.ts         # WhatsApp webhook
components/
├── ui/                               # Existing shadcn + landing page components
├── dashboard/
│   ├── sidebar.tsx                   # Dashboard sidebar
│   ├── topbar.tsx                    # Dashboard topbar
│   ├── overview-cards.tsx            # Dashboard home cards
│   ├── voice-recorder.tsx            # Mic + waveform + timer
│   ├── review-panel.tsx              # Transcript + extracted fields
│   ├── field-editor.tsx              # Editable field rows
│   ├── sync-result.tsx               # Success/failure display
│   ├── history-table.tsx             # Voice entry history table
│   ├── schema-mapper.tsx             # Column mapping UI
│   └── notion-connector.tsx          # Notion OAuth status + button
lib/
├── utils.ts                          # Existing cn() helper
├── supabase/
│   ├── client.ts                     # Browser Supabase client
│   ├── server.ts                     # Server Supabase client
│   └── middleware.ts                 # Auth middleware helper
├── prisma.ts                         # Prisma client singleton
├── notion.ts                         # Notion API helpers
├── ai/
│   ├── transcribe.ts                # Whisper transcription
│   ├── extract.ts                   # Schema-aware field extraction
│   └── prompts.ts                   # LLM prompt templates
├── stripe.ts                         # Stripe helpers
└── encryption.ts                     # Token encryption/decryption
prisma/
├── schema.prisma                     # Full database schema
└── migrations/                       # Auto-generated
```

---

## 🔄 Screen-by-Screen Specifications

### Screen 1: Auth (`/auth`)
- Dark background matching hero (`#0B0F17`)
- Centered card with RepLog AI logo
- "Sign in with Google" button (Supabase Auth)
- Subtle grid background like hero section
- Redirect to `/onboarding` if new user, `/dashboard` if returning

### Screen 2: Onboarding (`/onboarding`)
- Multi-step wizard (4 steps):
  1. **Welcome** — "Let's connect your Notion workspace"
  2. **Connect Notion** — OAuth button, shows connection status
  3. **Select Database** — Searchable list of Notion databases
  4. **Review Schema** — Column mapping table with toggles
- Progress bar at top
- Dark sidebar theme, light content area

### Screen 3: Dashboard Home (`/dashboard`)
- Overview cards: Total entries, entries this month, Notion status, plan usage
- Recent entries quick list (last 5)
- Quick "Record New" CTA button
- Connection status banners

### Screen 4: Voice Capture (`/dashboard/capture`)
- Large centered mic button with pulse animation
- Timer display (counts up to 90s)
- Waveform visualization during recording
- States: idle → recording → processing → review
- Optional quick tags: Call / In-person / Demo
- "Submit" sends to transcription pipeline

### Screen 5: Review & Edit (`/dashboard/capture/review`)
- Two-column layout:
  - Left: Transcript (editable textarea)
  - Right: Extracted fields (editable cards)
- Field groups: Summary, Key Outcomes, Objections, Next Steps, Follow Up Date, Stage
- Confidence indicators per field
- "Write to Notion" primary CTA
- "Re-record" secondary action

### Screen 6: Sync Result
- Success: Green checkmark, "Row created in Notion ✅", link to Notion page, fields written
- Failure: Red indicator, which fields failed and why, "Retry" button
- "Record Another" CTA

### Screen 7: History (`/dashboard/history`)
- Table/list view: Timestamp, Account/Title, Database, Status badge, Actions
- Status badges: Draft (yellow), Synced (green), Failed (red), Pending (blue)
- Click to open detail view
- Filters: status, date range

### Screen 8: Settings (`/dashboard/settings`)
- Sections: Account, Notion Connection, Database & Mapping, Billing, Danger Zone
- Notion: Connection status, Reconnect/Disconnect buttons
- Mapping: Current database schema table with toggles
- Billing: Current plan, usage meter, upgrade button
- Danger: Delete account, clear data

---

## 🏗️ Implementation Order (What I'll Build)

Since this is a full build, I'll implement in this order to get a working demo ASAP:

### Sprint 1: Core Infrastructure (First)
1. Install all dependencies (Prisma, Supabase, etc.)
2. Set up Prisma schema
3. Create Supabase client utilities
4. Auth middleware
5. Auth page + callback

### Sprint 2: Dashboard Shell
6. Dashboard layout (sidebar + topbar)
7. Dashboard home page
8. Link landing page buttons

### Sprint 3: Notion Integration
9. Notion OAuth flow
10. Database picker
11. Schema discovery + mapping

### Sprint 4: Voice → AI → Notion Pipeline
12. Voice recorder component
13. Upload + transcribe API
14. Field extraction API
15. Review & edit page
16. Notion sync API
17. Sync result page

### Sprint 5: History & Settings
18. History page
19. Entry detail page
20. Settings page

### Sprint 6: Billing & Polish
21. Stripe integration
22. Usage tracking
23. Loading states, error handling, mobile

---

## ❓ Questions / Clarifications

1. **Supabase vs mock auth?** For immediate development, I can build with Supabase Auth (requires project URL + anon key in .env.local) OR create a mock auth system that simulates the flow so we can demo the full UI without external services. **Recommendation: Build real Supabase Auth structure but with a demo/mock mode fallback so the UI works without credentials.**

2. **Notion OAuth vs mock?** Same question — real OAuth needs a Notion integration client ID/secret. **Recommendation: Build the real API routes but include mock data for demo mode.**

3. **AI APIs (Whisper + Claude)?** These need API keys. **Recommendation: Build real integration code but include a mock transcription/extraction mode with sample data.**

4. **Stripe?** Needs Stripe keys. **Recommendation: Build the UI and API routes, mock the checkout flow for demo.**

5. **WhatsApp?** The spec mentions it but it's more of a future feature. **Recommendation: Skip for MVP, focus on web-based voice capture.**

6. **Database?** Prisma needs a database URL. **Recommendation: Use SQLite for local dev (no Supabase needed), easily swap to Supabase Postgres later.**

**My plan: Build everything with real integration code + a demo mode that uses mock data, so the full UI workflow is functional immediately. You can add real API keys later to go live.**

---

## 🚀 Ready to Build

Once you confirm the plan (or answer the questions above), I'll start with Sprint 1 and work through sequentially. Each sprint will produce working, testable screens.
