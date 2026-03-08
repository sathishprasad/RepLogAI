# RepLog AI — Features Implemented (March 8, 2026)

> **Author:** Sathish Prasad V T (with AdaL AI pair programming)
> **Role:** Data Scientist learning full-stack development
> **Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL (Supabase), Vercel, Telegram Bot API, Notion API, OpenAI Whisper, Claude Sonnet

---

## 🎯 What We Built in One Session

Starting from grader feedback (Score: 93/100), we implemented **production-grade features** across security, infrastructure, UX, and a full demo mode — all in a single pair-programming session.

---

## 1. 🔐 Telegram Webhook Security

**What:** Secured the Telegram bot webhook endpoint against unauthorized access.

**How:**
- Generated a cryptographic secret token (`openssl rand -hex 32`)
- Registered it with Telegram's API via `setWebhook`
- Added server-side header verification (`X-Telegram-Bot-Api-Secret-Token`)
- Unauthorized requests now receive `403 Forbidden`

**What I learned:**
- Webhooks are public URLs — anyone who knows the URL can send fake requests
- Secret token verification acts as a shared password between your server and Telegram
- Graceful degradation: the check skips if the env var isn't set (dev-friendly)

---

## 2. 📊 Centralized Plan Limits

**What:** Created a single source of truth for all subscription plan limits.

**How:**
- Created `lib/plans.ts` with `getPlanLimits()` function
- Refactored `lib/usage.ts` to import from the shared module
- Eliminated duplicate plan limit definitions across route handlers

**What I learned:**
- "Don't Repeat Yourself" (DRY) principle — when limits are defined in multiple places, they drift out of sync
- TypeScript interfaces (`PlanLimits`, `PlanType`) enforce consistent data shapes
- A single module export means changing a limit once updates it everywhere

---

## 3. 🛡️ Usage Enforcement on Telegram

**What:** Added server-side guards to check daily limits and audio duration *before* running expensive AI operations.

**How:**
- Added `checkUsageLimits()` call before processing any voice note
- Added audio duration validation against plan limits (FREE: 60s, PRO: 300s)
- Returns user-friendly error messages to the Telegram bot

**What I learned:**
- Always validate before doing expensive work (API calls cost money!)
- The guard pattern: check → reject early → proceed only if allowed
- Including the admin's `stripeCustomer` relation via Prisma `include` for plan lookup

---

## 4. 💾 Telegram Session Persistence (Prisma)

**What:** Replaced in-memory conversation state with database-backed sessions.

**Before:** `const pendingStates = new Map<number, ConversationState>()` — lost on every deploy.
**After:** `TelegramSession` Prisma model with auto-expiry (10-minute TTL).

**How:**
- Added `TelegramSession` model to `prisma/schema.prisma`
- Created `getSessionState()`, `setSessionState()`, `deleteSession()` helpers
- Used `prisma.telegramSession.upsert()` for atomic create-or-update
- Applied `prisma db push` to sync schema to production DB

**What I learned:**
- In-memory state (Maps, variables) is lost when servers restart or redeploy
- Database-backed sessions survive deployments and scale across multiple instances
- TTL (Time-To-Live) pattern: set `expiresAt` and check it on read to auto-clean stale data
- `upsert` = "update if exists, create if not" — avoids race conditions

---

## 5. 🎮 Full Demo Mode

**What:** One-click demo experience — no signup, no Telegram, no Notion setup required.

### 5a. Demo Login
- "Try Demo — No signup needed" button on the login page
- `POST /api/auth/demo` creates a demo user with pre-seeded data
- Sets an `httpOnly` session cookie (24h expiry) + a client-readable flag cookie
- Middleware updated to allow demo cookie sessions through

### 5b. Seeded Data
- Demo user: "Acme Sales Corp" with company code `DEMO2026`
- 3 sample employees: Alice Johnson, Bob Martinez, Charlie Kim
- 3 voice entries with realistic transcripts, CRM fields, and confidence scores
- Meeting dates and follow-up dates set to **today** for live KPI cards
- All Notion schema fields populated: `contact_name`, `stage`, `meeting_notes`, `follow-up_date`, etc.

### 5c. Notion Integration (Shared)
- Demo user shares the same Notion database config as the admin
- Copies the encrypted access token and database mapping
- Demo recordings actually write to the live Notion CRM
- Public Notion link provided so judges can verify entries

### 5d. Browser Voice Recording
- Existing `/dashboard/capture` page reused (MediaRecorder API)
- "Record Voice Note" button added to dashboard (demo users only)
- Full pipeline works: Record → Transcribe (Whisper) → Extract (Claude) → Sync to Notion

### 5e. Demo Safeguards
- **Rate limit:** 5 recordings max per demo session
- **Demo banner:** Gradient banner at top with "View Notion CRM" link
- **Reset button:** "Reset Demo" deletes all data and re-seeds fresh
- **Blocked settings:** Demo users can't edit Notion connections (shows "Pre-configured for demo")
- **PRO badge:** Analytics page shows PRO badge so demo users know it's a premium feature

**What I learned:**
- Cookie-based sessions: `httpOnly` (server-only, secure) vs regular (client-readable for UI)
- The "unified auth helper" pattern: one function that tries multiple auth methods in priority order
- Seeding data: creating realistic test data programmatically with proper foreign key relationships
- Feature flags via cookies: showing/hiding UI elements based on user type without separate codepaths
- `upsert` and `deleteMany` for idempotent data reset

---

## 6. 🔄 Unified Authentication Helper

**What:** Replaced 9+ separate Supabase auth checks with a single `getAuthenticatedUser()` function.

**How:**
- Created `lib/demo.ts` with `getAuthenticatedUser()`
- Priority: Supabase session → demo cookie fallback
- Returns `{ user, isDemo }` — API routes can branch on `isDemo` if needed
- Updated routes: `dashboard`, `history`, `history/[id]`, `analytics`, `employees`, `settings`, `voice/upload`, `notion/sync`, `user/schema`

**What I learned:**
- The adapter pattern: wrap multiple auth strategies behind a single interface
- When refactoring auth, always verify the **old path still works** (Supabase users unaffected)
- TypeScript's union types help: `{ user: DbUser; isDemo: boolean }`

---

## 📚 Technical Concepts I Picked Up

| Concept | Where I Used It |
|---------|----------------|
| **Webhooks** | Telegram sends updates to our URL when users message the bot |
| **Middleware** | Next.js middleware intercepts requests before they reach pages |
| **OAuth** | GitHub login via Supabase, Notion via custom OAuth flow |
| **Prisma ORM** | Database queries, schema migrations, `upsert`, `include` for relations |
| **TypeScript Interfaces** | `PlanLimits`, `ConversationState`, `TelegramUpdate` — type safety |
| **Cookie Authentication** | `httpOnly` for security, regular cookies for UI flags |
| **API Route Handlers** | Next.js `route.ts` files handle GET/POST/PATCH requests |
| **MediaRecorder API** | Browser-native audio recording with waveform visualization |
| **Environment Variables** | Secrets stored in `.env`, never committed to git |
| **Edge Cases** | Graceful degradation when env vars missing, TTL for stale sessions |
| **Git Workflow** | Atomic commits, descriptive messages, push to main for auto-deploy |

---

## 🔢 By the Numbers

- **20 files changed** across the codebase
- **577+ lines added** in the initial commit alone
- **4 commits** pushed to production
- **9 API routes** updated with unified auth
- **1 new Prisma model** (TelegramSession)
- **3 new API endpoints** (demo login, demo reset, demo auth)
- **1 new React component** (DemoBanner)
- **0 normal users affected** ✅

---

## 💡 Key Takeaway

> As a data scientist, I thought building production software required years of experience. In one session of AI-assisted pair programming, I implemented webhook security, database migrations, cookie-based auth, and a full demo mode — all while understanding *why* each decision was made. The gap between "knowing data" and "shipping products" is smaller than you think.

---

*Built with AdaL (AI pair programmer) — March 8, 2026*
