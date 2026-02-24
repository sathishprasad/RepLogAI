RepLog AI (Notion-first Voice → CRM)

## 🎯 Product Goal
RepLog AI lets a rep record a quick voice note after a meeting. The app transcribes it, extracts structured fields, then fills the right columns in an existing Notion database (table) and appends a new row (or updates an existing one).

Notion acts as the “CRM” for MVP.

---

## 🧭 Primary User Flow (MVP)
1. User signs in
2. User connects Notion (OAuth)
3. User selects a Notion database (table)
4. RepLog scans the table schema (columns + types)
5. User records a voice note
6. App shows extracted fields + confidence
7. User clicks “Write to Notion”
8. New row appears in Notion with fields filled

---

## 🖥️ Screens & Features

### 1) Landing Page
**Purpose:** Explain what RepLog does + push sign-in  
**Shows:**
- Hero: “Speak your meeting notes. We fill your Notion CRM.”
- 3-step preview (Record → Review → Sync)
- “Sign in” CTA  
**User can:**
- Sign in
- View sample output (static demo)

---

### 2) Auth / Sign In
**Purpose:** Identify user and secure workspace  
**Approach options (pick 1):**
- Supabase Auth (Google)
- Clerk
- NextAuth (Google)  
**User can:**
- Sign in/out

---

### 3) Notion Connect
**Purpose:** Connect user’s Notion via OAuth  
**Shows:**
- “Connect Notion” button
- What permissions are required (simple text)
- Connection status (Connected / Needs Reconnect)  
**User can:**
- Start OAuth
- Disconnect Notion

---

### 4) Workspace & Database Picker
**Purpose:** Choose where RepLog should write  
**Shows:**
- List of databases user granted access to (search + filter)
- Database name + last edited (if available)
- “Select” button  
**User can:**
- Select a database
- Change database later

---

### 5) Schema Review (Auto Mapping)
**Purpose:** RepLog reads database columns and prepares how to fill them  
**Shows:**
- Table of columns:
  - Column name
  - Notion type (rich_text, select, date, people, number, relation, etc.)
  - “Fillable?” (yes/no)
  - Mapping suggestion (e.g., “Next Follow Up Date” ← “follow_up_date”)  
**User can:**
- Toggle columns as fillable / ignore
- Rename “meaning” of columns (simple dropdown of common meanings)
- Save mapping

**MVP rule:** Default to auto-map, user only adjusts if needed.

---

### 6) Voice Capture (Core)
**Purpose:** Capture a meeting update quickly  
**Shows:**
- Record button (web audio)
- Timer
- Optional “Meeting type” quick tag (Call / In-person / Demo)
- Optional “Account / Client” quick select (if you support it)  
**User can:**
- Record / stop
- Re-record
- Submit

**MVP constraint:** 90 seconds max voice note.

---

### 7) Review & Edit (Human-in-the-loop) Send message back via whatsapp
**Purpose:** Let user verify before writing to Notion  
**Shows:**
- Transcript
- Extracted fields with confidence
- Fields grouped:
  - Summary
  - Key outcomes
  - Objections
  - Next steps
  - Follow up date
  - Stage / Status
- “Write to Notion” button  
**User can:**
- Edit transcript
- Edit any extracted field
- Add missing values
- Confirm and sync

---

### 8) Sync Result (Success / Failure)
**Purpose:** Clear confirmation and trust  
**Shows:**
- “Row created in Notion ✅”
- Link to open the row in Notion
- What fields were written
- If partial failure: which fields failed and why  
**User can:**
- Retry failed fields
- Copy JSON output (optional)

---

### 9) History (Logs)
**Purpose:** Track what was written and when  
**Shows:**
- List of voice notes
- Timestamp
- Target database
- Status (Synced / Failed / Draft)
- Open details  
**User can:**
- Reopen an entry
- Re-sync to Notion
- Duplicate entry

---

### 10) Settings
**Purpose:** Manage defaults  
**Shows:**
- Connected Notion status
- Selected database
- Column mapping
- Data retention preference (optional)
- Delete account / data  
**User can:**
- Disconnect Notion
- Change database
- Reset mapping
- Delete stored transcripts


## Frontend Tech Stack (Suggested)
- Next.js (App Router)
- Tailwind
- Auth: Supabase or NextAuth
- Audio: MediaRecorder API
- API calls via fetch + server actions (or REST)
- Simple UI components (shadcn/ui)

---

## Frontend Security Notes
- Never store Notion tokens in localStorage
- All Notion calls should go through backend
- Use CSRF protection for OAuth callback
- Use strict CORS and secure cookies for sessions