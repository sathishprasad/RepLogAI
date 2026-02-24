# Plan: Telegram Bot Pivot — RepLog AI v2
**Date:** 2026-02-24  
**Status:** ✅ COMPLETE  
**POC:** AdaL

---

## TL;DR
One shared bot (`@RepLogAIBot`). During onboarding, Admin gets a unique company code and uploads employee roster (ID + Name). Admin shares deep link `t.me/RepLogAIBot?start=CODE` with reps. Reps click link → enter Employee ID → send voice notes → auto-synced to Notion. Admin sees analytics per rep name.

---

## 🎯 v1 Flow

### Admin (One-time Setup)
1. Sign up via GitHub OAuth
2. Connect Notion → select database → map schema
3. Upload employee roster (CSV/Excel: Employee ID, Name)
4. Get shareable link: `t.me/RepLogAIBot?start=ACME7X2`
5. Share link with reps (Slack, email, WhatsApp group, etc.)

### Rep (Daily Use)
1. Click link → opens Telegram bot
2. Bot auto-detects company code from deep link
3. Enter Employee ID → bot matches against roster → confirms name
4. Send voice note
5. Bot replies: "✅ Logged by John Smith! [summary]"

### System Flow
```
Rep clicks t.me/RepLogAIBot?start=ACME7X2
  → Bot receives: /start ACME7X2
  → Bot: "Welcome! Enter your Employee ID:"
  → Rep: "EMP-5105"
  → Lookup: companyCode=ACME7X2 → Admin → roster → EMP-5105 = "John Smith"
  → Bot: "✅ Hi John Smith! Send me a voice note after any meeting."
  → Store: telegramChatId → linked to Admin + Employee record
  
[Later]
Rep sends voice note
  → Webhook: /api/webhooks/telegram
  → Lookup chatId → Employee → Admin
  → Download .oga → Supabase Storage
  → Transcribe (Whisper) → Extract (Claude + Admin's schema)
  → Sync to Notion (with rep name as metadata)
  → Bot: "✅ Logged by John Smith! Contact: Dr. Patel | Stage: Negotiation"
  → Admin sees entry in Dashboard with rep attribution
```

---

## 📐 Schema Changes

### New Model: `Employee`
```prisma
model Employee {
  id           String   @id @default(uuid())
  adminId      String
  employeeCode String                    // e.g. "EMP-5105"
  name         String                    // e.g. "John Smith"
  telegramChatId String? @unique         // Set on first bot interaction
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  admin        User         @relation(...)
  voiceEntries VoiceEntry[]

  @@unique([adminId, employeeCode])
}
```

### Update `User` (Admin)
```
companyCode   String?  @unique   // e.g. "ACME7X2" — auto-generated
companyName   String?            // e.g. "Acme Corp"
```

### Update `VoiceEntry`
```
employeeId        String?              // links to Employee
source            EntrySource @default(TELEGRAM)
telegramMessageId String?     @unique
telegramChatId    String?
```

### New Enum
```
enum EntrySource {
  WEB
  TELEGRAM
}
```

---

## 🖥️ Web Dashboard Changes

### Onboarding Updates
- Step 1: Welcome (existing)
- Step 2: Connect Notion (existing)
- Step 3: Select Database + Schema (existing)
- Step 4: **NEW — Company Setup**
  - Enter company name
  - Auto-generate company code (e.g. "ACME7X2")
  - Upload employee roster (CSV: EmployeeID, Name)
  - Show shareable deep link: `t.me/RepLogAIBot?start=ACME7X2`
  - Copy button for the link

### Settings Updates
- **Telegram Bot section**: Shows company code, deep link, connected employee count
- **Employee Management**: View/add/remove employees, see who's linked via Telegram

### Dashboard Updates
- Overview cards: entries by rep
- History: shows rep name + "via Telegram" badge

### Remove
- `/dashboard/capture` and `/dashboard/capture/review`
- Web voice recording UI
- "Capture" from sidebar nav

---

## 🤖 Bot Conversation Design

### Deep Link Flow (Happy Path)
```
[Rep clicks t.me/RepLogAIBot?start=ACME7X2]

Bot: 👋 Welcome to RepLog AI!
     You're joining Acme Corp.
     
     Please enter your Employee ID:

Rep: EMP-5105

Bot: ✅ Hi John Smith! You're all set.
     
     Just send me a voice note after any meeting 
     and I'll log it to your CRM automatically. 🎙️
```

### Deep Link Flow (Invalid Employee ID)
```
Rep: XYZ-999

Bot: ❌ Employee ID "XYZ-999" not found for Acme Corp.
     Please check with your manager and try again.
     
     Type your Employee ID to retry:
```

### Deep Link Flow (Invalid Company Code)
```
[Rep clicks t.me/RepLogAIBot?start=INVALID]

Bot: ❌ Invalid company code. Please ask your 
     manager for the correct link.
```

### Voice Note Flow
```
Rep: [sends voice note]

Bot: 🎙️ Processing your meeting notes...

Bot: ✅ Logged by John Smith!
     
     📋 Extracted:
     • Contact: Dr. Patel
     • Summary: Discussed Q3 renewal pricing
     • Stage: Negotiation
     • Next Steps: Send revised proposal
```

### Already Linked Rep (Returns to Bot)
```
Rep: [sends voice note directly — no /start needed]

Bot: [processes normally, already knows who they are]
```

### /start Without Code (Direct Bot Search)
```
[Rep finds bot via search, no deep link]

Bot: 👋 Welcome to RepLog AI!
     Please enter your company code:

Rep: ACME7X2

Bot: ✅ You're joining Acme Corp!
     Please enter your Employee ID:
[... continues as above]
```

---

## 🛠️ Implementation Steps

### Step 1: Schema Updates ✅
- [x] Add `companyCode`, `companyName` to User
- [x] Create `Employee` model
- [x] Update `VoiceEntry` with source, telegramMessageId, telegramChatId, employeeId
- [x] Add `EntrySource` enum
- [x] Remove old `AllowedSenderPhoneNumber` and `SalesRep` models
- [x] `prisma db push`

### Step 2: Telegram API Wrapper ✅
- [x] Create `lib/telegram.ts`
  - `sendMessage(token, chatId, text, options?)`
  - `getFile(token, fileId)` → file path
  - `downloadFile(token, filePath)` → Buffer
  - `setWebhook(token, url, secret?)`
  - `deleteWebhook(token)`
  - `getMe(token)` → bot info (name, username)

### Step 3: Webhook Handler ✅
- [x] Create `/api/webhooks/telegram/route.ts`
  - Parse Telegram Update
  - Route by message type:
    - `/start CODE` → lookup admin by companyCode → ask for Employee ID
    - `/start` (no code) → ask for company code
    - Text (during onboarding) → match employee ID → link chatId
    - Voice/Audio → process pipeline
    - Other → help message

### Step 4: Headless Voice Pipeline ✅
- [x] Reuse existing transcribe + extract + sync logic
- [x] New function: `processVoiceFromTelegram(adminId, employeeId, audioBuffer, chatId)`
  - Upload to Supabase Storage
  - Create VoiceEntry
  - Transcribe → Extract → Sync to Notion
  - Return summary for bot reply

### Step 5: Onboarding — Company Setup Step ✅
- [x] New step after schema mapping
- [x] Company name input
- [x] Auto-generate unique company code
- [x] CSV upload for employee roster (parse Employee ID + Name)
- [x] Show deep link with copy button
- [x] Save employees to DB

### Step 6: Settings — Telegram Section ✅
- [x] Show company code + deep link
- [x] Employee list (name, ID, Telegram linked status)
- [x] Add/remove employees
- [x] `/api/settings/telegram` routes
- [x] `/api/employees` CRUD routes

### Step 7: Dashboard Updates ✅
- [x] History shows rep name + Telegram badges
- [x] Overview shows per-rep stats + KPI cards + 14-day activity chart
- [x] History: rep filter, date range, CSV export
- [x] Remove capture pages + sidebar link

---

## 🔗 Deep Link Format
Telegram deep link: `t.me/{BOT_USERNAME}?start={COMPANY_CODE}`

When clicked, Telegram sends to bot: `/start {COMPANY_CODE}`

Example: `t.me/RepLogAIBot?start=ACME7X2`

The admin gets this link displayed prominently with a copy button. They share it via any channel (Slack, email, WhatsApp group).

---

## 🔑 What We Need From You (Admin)

1. **Create the shared bot**: Go to `@BotFather` in Telegram → `/newbot` → name it "RepLog AI" → get token
2. **Set env var**: `TELEGRAM_BOT_TOKEN=<token from BotFather>`
3. **For production**: A public HTTPS URL for the webhook (ngrok for dev, Vercel for prod)

That's it! Everything else is automated.

---

## 🔑 Environment Variables
```bash
TELEGRAM_BOT_TOKEN=    # From BotFather (the shared bot)
```

---

## 📊 Effort Estimate
| Step | Time |
|------|------|
| Schema updates | 15 min |
| Telegram wrapper | 20 min |
| Webhook handler | 45 min |
| Headless voice pipeline | 30 min |
| Onboarding company setup | 45 min |
| Settings telegram section | 30 min |
| Dashboard updates + cleanup | 30 min |
| **Total** | **~3.5 hours** |

---

## 🔮 Future (v2)
- Interactive clarification (bot asks for missing fields)
- Per-rep analytics dashboard (leaderboard, streaks)
- WhatsApp bot integration
- Bulk employee import improvements
- Rep self-registration (admin approves)
