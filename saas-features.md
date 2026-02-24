RepLog AI — Feature Specification (v2 — Telegram-First)

## 🎯 Product Goal
RepLog AI lets sales teams capture meeting notes via Telegram voice messages. A shared bot transcribes them, extracts structured CRM fields using AI, and syncs them to the team's Notion database. Admin manages everything via a web dashboard.

Notion acts as the "CRM" for MVP. Telegram is the primary input channel.

---

## 🧭 Primary User Flow (v2)

### Admin Setup (One-time)
1. Admin signs in via GitHub OAuth
2. Connects Notion (OAuth)
3. Selects a Notion database (table)
4. RepLog scans the table schema (columns + types)
5. Enters company name → gets auto-generated company code
6. Uploads employee roster (CSV or manual paste: Employee ID + Name)
7. Shares bot deep link with reps: `t.me/RepLogAIBot?start=CODE`

### Rep Daily Use (via Telegram)
1. Rep clicks deep link → opens Telegram bot
2. Bot auto-detects company code
3. Rep enters Employee ID → bot confirms name
4. Rep sends voice note after any meeting
5. Bot replies with confirmation + extracted summary

### System Pipeline
```
Voice note → Download .oga → Supabase Storage
→ Transcribe (OpenAI Whisper)
→ Extract fields (Claude + admin's Notion schema)
→ Sync to Notion (with rep name as metadata)
→ Bot reply with summary
→ Admin sees entry in Dashboard
```

---

## 🖥️ Screens & Features

### 1) Landing Page
**Purpose:** Explain what RepLog does + push sign-in
**Shows:**
- Hero: "Speak your meeting notes. We fill your Notion CRM."
- 3-step preview (Record → Review → Sync)
- "Sign in" CTA
**User can:**
- Sign in
- View sample output (static demo)

---

### 2) Auth / Sign In
**Purpose:** Identify user and secure workspace
**Approach:** GitHub OAuth via Supabase Auth
**User can:**
- Sign in/out via GitHub

---

### 3) Onboarding Wizard (4 Steps)
**Purpose:** Connect Notion, select database, set up company + employees

**Step 1: Welcome** — Intro + "Let's get started"
**Step 2: Connect Notion** — OAuth button, connection status
**Step 3: Select Database + Schema** — Searchable DB list, column mapping
**Step 4: Company Setup** — Company name, auto-generated code, employee roster upload (CSV/paste), shareable deep link with copy button

---

### 4) Dashboard Overview (`/dashboard`)
**Purpose:** Admin command center with KPIs and activity charts
**Shows:**
- **4 KPI Cards:**
  - Logs This Week — total voice notes submitted this week
  - CRM Fill Rate — % of logs with all key fields auto-populated (contact, company, next_action, follow_up_date)
  - Time Saved — estimated minutes saved vs manual CRM entry (total logs × 8 min)
  - Follow-ups Due Today — count of follow-up actions due today
- **14-Day Activity Chart** — Grouped bar chart (Recharts): voice logs submitted vs follow-ups completed per day
- **Telegram Bot card** — Bot name, total reps, linked reps, shareable deep link
- **Rep Activity card** — Per-rep entry counts, linked status
- **Recent Entries** — Last 5 entries with status badges + rep names
- **Quick links** — Manage Integrations, Settings

---

### 5) Analytics (`/dashboard/analytics`)
**Purpose:** Rep-level performance analytics with dynamic Notion schema integration
**Shows:**
- **Top KPI cards:** Total Calls, Avg Fill Rate, Total Time Saved, Follow-ups Scheduled
- **Dynamic stage breakdown KPIs:** Auto-detected from Notion select/multi_select columns (count + %)
- **Rep performance table:** Rep name, Employee ID, Calls, Fill Rate %, Time Saved, Follow-ups, plus dynamic stage columns from Notion schema
- **Totals footer row** with aggregates across all reps
**Filters:**
- Period buttons: Last 14 / 30 / 60 / 90 days
- Rep search by name or employee code
- Export CSV with all metrics
**Auto-adaptive:** Each user sees different stage columns based on their Notion database schema

---

### 6) History (`/dashboard/history`)
**Purpose:** Track what was submitted and when
**Shows:**
- List of voice entries with status badges (Synced, Pending, Failed, etc.)
- Rep name + "TG" badge for Telegram entries
- Notion page link for synced entries
**Filters:**
- Text search (matches title, database, rep name)
- Status dropdown (All, Synced, Pending, Failed, etc.)
- Rep Name dropdown (auto-populated from entries)
- Date Range picker (From/To calendar inputs)
- Export to CSV (Excel-compatible with BOM encoding)
**User can:**
- Click to open entry detail
- See entry count: "X of Y entries"
- Clear all filters

---

### 6) History Detail (`/dashboard/history/[id]`)
**Purpose:** Full details of a single voice entry
**Shows:**
- Transcript text
- Extracted fields with values
- Notion sync status + page link
- Rep name + source badge
**User can:**
- View all extracted data
- Open in Notion

---

### 7) Integrations (`/dashboard/integrations`)
**Purpose:** Manage connected services
**Shows:**
- Notion: Connection status, workspace name, reconnect/disconnect
- Salesforce, HubSpot, Pipedrive, Slack: "Coming Soon · Beta"
**User can:**
- Connect/disconnect Notion
- See future integrations

---

### 8) Settings (`/dashboard/settings`)
**Purpose:** Manage account, Telegram bot, employees, billing
**Sections:**
- **Account** — Name, email, avatar
- **Telegram Bot** — Company code, bot link, webhook status
- **Employee Roster** — View/add/remove employees, Telegram link status, CSV upload
- **Notion Connection** — Status, workspace, database, reconnect
- **Billing** — Current plan, usage meter, upgrade via Stripe
- **Danger Zone** — Delete transcripts, delete account, reset onboarding
**User can:**
- Edit name
- Manage employees (add/remove)
- Disconnect/reconnect Notion
- Change database
- Manage Stripe subscription
- Delete data

---

## 🤖 Telegram Bot Interaction

### Deep Link Flow
```
Rep clicks t.me/RepLogAIBot?start=ACME7X2
Bot: "👋 Welcome to RepLog AI! You're joining Acme Corp. Please enter your Employee ID:"
Rep: "EMP-5105"
Bot: "✅ Hi John Smith! Send me a voice note after any meeting 🎙️"
```

### Voice Note Flow
```
Rep: [sends voice note]
Bot: "🎙️ Processing your meeting notes..."
Bot: "✅ Logged by John Smith!
     📋 Contact: Dr. Patel | Summary: Discussed Q3 renewal | Stage: Negotiation"
```

### Error Handling
- Invalid company code → "❌ Invalid company code. Ask your manager for the correct link."
- Invalid employee ID → "❌ Not found. Check with your manager and try again."
- Already linked rep → processes voice notes directly (no re-onboarding)

---

## Frontend Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Auth: Supabase (GitHub OAuth)
- Charts: Recharts (grouped bar charts)
- Audio processing: Server-side (Telegram → Whisper)
- API calls via fetch + server actions
- UI components: shadcn/ui + custom

---

## Frontend Security Notes
- Never store Notion tokens in localStorage
- All Notion calls go through backend
- Use CSRF protection for OAuth callback
- Use strict CORS and secure cookies for sessions
- Telegram webhook validates bot token
