# 🎙️ RepLog AI

**Turn sales meeting voice notes into structured CRM entries — automatically.**

RepLog AI lets sales teams record voice notes after meetings (via Telegram), then uses AI to transcribe, extract structured fields, and sync everything directly to their Notion CRM — no manual data entry required.

---

## The Problem

Sales reps lose **30+ minutes per day** updating CRM records after meetings. Notes get forgotten, fields go empty, and managers have zero visibility into pipeline activity. The result: garbage data, missed follow-ups, and wasted rep time.

## The Solution

RepLog AI replaces manual CRM entry with a single voice note. Reps send a voice message to a Telegram bot after any meeting. AI handles the rest — transcription, field extraction, and CRM sync happen in seconds.

```
Rep sends voice note → Whisper transcribes → Claude extracts fields → Notion row created
```

---

## ✨ Features

### For Reps
- **One-tap logging** — Send a voice note to the Telegram bot after any meeting
- **Zero app switching** — Works inside Telegram, the app reps already use
- **Instant confirmation** — Bot replies with extracted fields so reps can verify at a glance

### For Managers
- **Company onboarding** — Upload employee roster, share a single Telegram link with the team
- **Notion-native** — Syncs to your existing Notion CRM database with your exact schema
- **Smart extraction** — AI maps voice content to your specific Notion columns (stages, contacts, dates, follow-ups)
- **Rep analytics** — See per-rep activity, CRM fill rates, time saved, and follow-up tracking
- **CSV export** — Download filtered history for reporting

### Platform
- **Schema-aware AI** — Extraction adapts to your Notion database structure automatically
- **Deep link onboarding** — Reps click one link, enter their employee ID, and they're live
- **Multi-rep support** — One bot serves your entire team with full attribution
- **Real-time dashboard** — KPI cards, activity charts, rep leaderboards, and pipeline stage breakdowns

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  Next.js App (App Router)                 │
├────────────┬──────────────┬──────────────────────────────┤
│  Landing   │  Auth        │  Dashboard (Protected)        │
│  /         │  /auth       │  /dashboard/*                 │
├────────────┴──────────────┴──────────────────────────────┤
│                   API Routes (/api/*)                     │
│  /api/voice  /api/notion  /api/webhooks/telegram         │
│  /api/employees  /api/analytics  /api/stripe             │
├──────────────────────────────────────────────────────────┤
│  Supabase Auth │ Supabase Postgres (Prisma) │ Storage    │
├──────────────────────────────────────────────────────────┤
│  Telegram Bot API │ Notion API │ OpenAI Whisper │ Claude │
└──────────────────────────────────────────────────────────┘
```

### Voice Processing Pipeline

```
Telegram voice note received
  → Download .oga audio from Telegram servers
  → Upload to Supabase Storage
  → Transcribe with OpenAI Whisper
  → Extract structured fields with Claude (schema-aware)
  → Validate & normalize against Notion column types
  → Create row in Notion database
  → Reply to rep with confirmation + extracted summary
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase Postgres + Prisma 5 |
| Auth | Supabase Auth (GitHub OAuth) |
| Storage | Supabase Storage |
| Bot | Telegram Bot API |
| Transcription | OpenAI Whisper |
| Extraction | Claude (Anthropic) |
| CRM | Notion API (raw fetch, v2022-06-28) |
| Billing | Stripe |
| Charts | Recharts |
| UI | Tailwind CSS + shadcn/ui |
| Font | Plus Jakarta Sans |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Notion integration](https://www.notion.so/my-integrations) (OAuth, public)
- API keys for [OpenAI](https://platform.openai.com) and [Anthropic](https://console.anthropic.com)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/replog-ai.git
cd replog-ai
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Notion OAuth
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=http://localhost:3000/api/oauth/notion/callback

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Security
ENCRYPTION_KEY=          # 32-byte hex string for token encryption

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
npx prisma db push
```

### 4. Set Up Telegram Webhook (Development)

Expose your local server with ngrok:

```bash
ngrok http 3000
```

Then register the webhook:

```bash
curl -X POST http://localhost:3000/api/telegram/setup
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page. Sign in to access the dashboard.

---

## 📱 How It Works

### Admin Setup (One-time)

1. Sign in with GitHub
2. Connect your Notion workspace via OAuth
3. Select the Notion database you use as your CRM
4. Map your schema (the app auto-detects columns and types)
5. Enter your company name → get a unique company code
6. Upload your employee roster (CSV with Employee ID + Name)
7. Share the Telegram deep link with your team: `t.me/RepLogAIBot?start=YOUR_CODE`

### Rep Daily Use

1. Click the deep link → opens Telegram bot
2. Enter Employee ID (one-time)
3. After any meeting, send a voice note
4. Bot replies with extracted fields + confirmation
5. Entry appears in Notion and on the admin dashboard

### Example Bot Interaction

```
Rep: [sends voice note after a meeting]

Bot: ✅ Logged by John Smith!

     📋 Extracted:
     • Contact: Dr. Patel
     • Summary: Discussed Q3 renewal pricing
     • Stage: Negotiation
     • Next Steps: Send revised proposal by Friday
```

---

## 📊 Dashboard

The web dashboard gives managers full visibility:

- **Overview** — KPI cards (logs this week, CRM fill rate, avg time saved per rep, follow-ups due)
- **Activity Chart** — 14-day cumulative time saved visualization
- **History** — Searchable, filterable log of all entries with rep attribution and Telegram badges
- **Analytics** — Per-rep performance table with dynamic columns matching your Notion schema
- **Settings** — Manage employees, Telegram bot config, Notion connection, billing

---

## 📁 Project Structure

```
app/
├── page.tsx                     # Landing page
├── auth/                        # Sign in, sign up, forgot password
├── onboarding/                  # 4-step setup wizard
├── dashboard/
│   ├── page.tsx                 # Overview + KPIs
│   ├── history/                 # Entry logs + detail views
│   ├── analytics/               # Rep-level performance
│   ├── integrations/            # Notion + coming soon
│   └── settings/                # Account, team, billing
├── api/
│   ├── voice/                   # upload, transcribe, extract
│   ├── notion/                  # databases, schema, sync
│   ├── employees/               # Roster CRUD
│   ├── analytics/               # Rep analytics API
│   ├── telegram/                # Webhook setup
│   ├── stripe/                  # Checkout, portal
│   └── webhooks/                # Telegram + Stripe handlers
lib/
├── telegram.ts                  # Telegram Bot API wrapper
├── telegram-pipeline.ts         # Voice processing pipeline
├── notion.ts                    # Notion API helpers
├── ai/
│   ├── transcribe.ts            # Whisper integration
│   ├── extract.ts               # Schema-aware field extraction
│   └── prompts.ts               # LLM prompt templates
├── supabase/                    # Client, server, service-role helpers
├── stripe.ts                    # Billing helpers
├── usage.ts                     # Usage tracking + plan limits
└── encryption.ts                # Token encryption
prisma/
└── schema.prisma                # Full database schema
```

---

## 🗄️ Data Model

Key models in the Prisma schema:

- **User** — Admin account with `companyCode`, `companyName`, Notion connection
- **Employee** — Roster entries linked to an admin, with optional `telegramChatId`
- **NotionConnection** — Encrypted OAuth tokens for Notion workspace access
- **NotionDatabaseConfig** — Selected database, schema snapshot, field mapping
- **VoiceEntry** — Each voice note with transcript, extracted JSON, sync status, source (`WEB` or `TELEGRAM`), and rep attribution

---

## 🔒 Security

- Notion OAuth tokens encrypted at rest with AES-256
- Telegram webhook signature verification
- Supabase RLS + service-role separation
- Employee ID validation against admin's roster
- Idempotent processing (deduplication by `telegramMessageId`)

---

## 🗺️ Roadmap

- [ ] Interactive clarification — bot asks follow-up questions for missing fields
- [ ] Per-rep analytics leaderboard with streaks
- [ ] WhatsApp Business integration
- [ ] Bulk employee import improvements
- [ ] Rep self-registration with admin approval
- [ ] Salesforce / HubSpot CRM connectors

---

## 📄 License

MIT

---

Built by **Sathish** using **AdaL** · Powered by Claude, Whisper, and Notion