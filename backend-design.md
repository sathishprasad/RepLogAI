````md
# backend_architecture.md — RepLog AI (Supabase + WhatsApp Voice → Approve → Notion)

## 🎯 Objective
Build a backend that:
1) Authenticates users (Supabase Auth)
2) Connects to Notion via OAuth and stores tokens securely
3) Reads a Notion database schema (columns/types/options) during onboarding
4) Receives WhatsApp voice notes (WhatsApp Business Cloud API webhook)
5) Uses Claude or ChatGPT to turn voice → structured Notion-ready fields
6) Sends a draft back to the rep for approval (via WhatsApp)
7) Writes an approved row into the Notion database (append) safely
8) Logs everything for reliability, debugging, and billing/limits

---

## 🏗️ 1) Architecture Design

### High-level Components
- **Frontend:** Next.js web app (onboarding + settings + history + billing)
- **Backend API:** Node.js (Next.js API routes or Express/Fastify)
- **Database:** Supabase Postgres accessed via **Prisma**
- **Storage:** Supabase Storage (optional: store voice audio)
- **WhatsApp:** WhatsApp Business Cloud API (webhook + media download + outbound messages)
- **Notion API:** OAuth + Database read/write (append row)
- **AI:** Claude API or OpenAI (transcribe + extract structured JSON)
- **Payments:** Stripe (subscriptions + usage limits)
- **Queue/Jobs (optional but recommended):** Redis + BullMQ for async processing

### Why Notion-first?
- No CRM integrations needed for MVP
- Users already have Notion workflows
- Notion database schema tells us exactly what columns exist and what we can fill

---

## 🔁 2) Backend Flow (End-to-End)

### A) Onboarding Flow (Web)
Goal: make the user “live” after setup.

1. **Auth (Supabase):**
   - user signs in
2. **Connect Notion (OAuth):**
   - store encrypted access token
3. **Select Notion Database:**
   - user picks a Notion table
4. **Read Schema + Save Mapping:**
   - backend calls Notion database retrieve endpoint
   - stores schema snapshot + mapping suggestions
5. **Allowed WhatsApp Sender Numbers:**
   - user adds one or more allowed E.164 numbers
6. **Live:**
   - system will only process voice notes from allowed numbers

### B) Voice Note Processing Flow (WhatsApp → Draft)
Triggered by WhatsApp webhook.

1. **Webhook received** (`POST /webhooks/whatsapp`)
2. **Verify webhook signature**
3. **Dedupe** by `whatsapp_message_id`
4. **Identify user** by matching `from_phone` against `AllowedSenderPhoneNumber`
5. **Download audio** using WhatsApp media API (by media id)
6. **Store audio (optional)** in Supabase Storage
7. **Transcribe voice → text**
   - Use:
     - **OpenAI Whisper** (best for voice transcription), OR
     - **Claude/OpenAI** if using a multimodal endpoint that supports audio (depends on provider)
   - Save transcript
8. **Load Notion schema + mapping** from DB
9. **Extract structured fields** (LLM):
   - Prompt LLM with:
     - transcript
     - schema contract (property names/types/options)
     - mapping rules
   - Output strict JSON: values normalized to Notion types (dates ISO, numbers, select options)
10. **Validate + normalize payload**
   - enforce title exists
   - ensure select values are valid options (else warn/skip)
   - ensure date formats parse
11. **Create draft entry**
   - status = `PENDING_APPROVAL`
12. **Send WhatsApp draft message back to rep**
   - includes EntryCode and instructions:
     - `APPROVE {code}` / `EDIT {code}` / `CANCEL {code}`

### C) Approval Flow (WhatsApp → Notion Write)
Triggered when rep replies.

1. Webhook receives reply text
2. Match `EntryCode` → the draft `VoiceEntry`
3. If `CANCEL`:
   - status = `CANCELED`
   - reply confirmation
4. If `EDIT`:
   - enter edit mode and accept patches
   - update draft and re-send preview
5. If `APPROVE`:
   - status = `APPROVED`
   - write to Notion (append row)
   - status = `SYNCED`
   - send confirmation + Notion page URL

---

## 🔐 3) Notion OAuth Design (Critical)

### OAuth Overview
RepLog uses a public Notion integration + OAuth.

Flow:
1. `GET /oauth/notion/start`
2. redirect to Notion OAuth with:
   - `client_id`
   - `redirect_uri`
   - `response_type=code`
   - `state` (anti-CSRF)
3. Notion redirects back with `code`
4. backend exchanges code for access token
5. store token **encrypted** in Supabase Postgres

### Permissions / Scopes (MVP)
Request only what you need:
- Read databases user granted
- Create pages in database (append row)
- Update page properties (fill columns)

### Security Requirements
- Validate `state` in callback
- Prefer PKCE if supported by your OAuth library
- Encrypt tokens at rest (app-level encryption or KMS)
- Never expose Notion tokens to client

---

## 📦 4) WhatsApp Business Cloud API Integration

### Webhook Endpoint
- `POST /webhooks/whatsapp`

Responsibilities:
- verify signature/token
- parse inbound message events:
  - voice note (audio)
  - text reply (approve/edit/cancel/patch)
- dedupe
- route to pipeline or approval handler

### Media Download
- extract `media_id` from the audio message
- call WhatsApp media endpoint to fetch binary
- store to Supabase Storage (optional)

### Outbound Messaging
- send draft preview + approval instructions
- send edit prompts
- send final confirmation + Notion link

**MVP message format** (text-only, reliable everywhere):
- Draft:
  - summary + key fields + EntryCode
  - `APPROVE {code}` / `EDIT {code}` / `CANCEL {code}`

---

## 🧠 5) Core Backend Logic

### A) Notion Database Schema Discovery
Goal: detect columns/types/options so we know what we can fill.

Endpoints:
1. `GET /notion/databases`
2. `GET /notion/database/:databaseId/schema`

Output example:
```json
{
  "databaseId": "abc",
  "properties": [
    {"name":"Account", "type":"title"},
    {"name":"Contact", "type":"rich_text"},
    {"name":"Stage", "type":"select", "options":["Prospecting","Negotiation","Closed Won"]},
    {"name":"Follow Up", "type":"date"},
    {"name":"Notes", "type":"rich_text"}
  ]
}
````

### B) Schema-Aware Field Extraction (Claude or ChatGPT)

We run extraction using a strict JSON output contract:

Input:

* transcript text
* schema contract (Notion properties with allowed options)
* mapping config (internal keys → Notion column names)

Output:

* `extracted_json` with internal keys (consistent across users)
* then mapped to Notion property payload

### C) Payload Validation Rules

* Title is required:

  * If missing, create fallback like: first 6 words + date
* Select fields:

  * must match existing option
  * if not matched, skip + warning (MVP)
* Date fields:

  * must parse to ISO string
* Numbers:

  * parse cleanly; else skip + warning

---

## 🤖 6) “AI Agents” (Practical Implementation)

We implement agents as modular services with strict IO.

### Agents

1. **Orchestrator**

   * runs pipeline
   * updates VoiceEntry status
2. **Transcription Agent**

   * audio → transcript (Whisper preferred)
3. **Extraction Agent**

   * transcript + schema → JSON fields (Claude/OpenAI)
4. **Validation Agent**

   * JSON fields → safe normalized write payload + warnings
5. **Notion Write Agent**

   * payload → Notion create page

For hackathon:

* agents can run synchronously in a single request.
  For production:
* put orchestration into a queue (BullMQ).

---

## 🗄️ 7) Database Design (Supabase Postgres + Prisma)

### `User`

* `id` (UUID, PK)
* `email`
* `name`
* `createdAt`
* `updatedAt`

### `NotionConnection`

* `id` (UUID, PK)
* `userId` (FK)
* `workspaceId`
* `accessTokenEncrypted`
* `connectedAt`
* `revokedAt` (nullable)

### `NotionDatabaseConfig`

* `id` (UUID, PK)
* `userId` (FK)
* `databaseId`
* `databaseName`
* `schemaSnapshotJson` (JSONB)
* `mappingJson` (JSONB)
* `updatedAt`

### `AllowedSenderPhoneNumber`

* `id` (UUID, PK)
* `userId` (FK)
* `phoneE164` (string)
* `label` (optional)
* `createdAt`
* Unique constraint: (`userId`, `phoneE164`)

### `VoiceEntry`

* `id` (UUID, PK)
* `userId` (FK)
* `fromPhoneE164`
* `databaseId`
* `whatsappMessageId` (unique, dedupe)
* `entryCode` (short code for approvals)
* `audioStoragePath` (nullable)
* `transcriptText` (nullable)
* `extractedJson` (JSONB, nullable)
* `finalJson` (JSONB, nullable)
* `warningsJson` (JSONB, nullable)
* `status` (ENUM)
* `notionPageId` (nullable)
* `notionPageUrl` (nullable)
* `createdAt`
* `updatedAt`

### `StripeCustomer`

* `id` (UUID, PK)
* `userId` (FK)
* `stripeCustomerId`
* `stripeSubscriptionId` (nullable)
* `plan` (FREE, PRO)
* `currentPeriodEnd` (nullable)

### `UsageEvent`

* `id` (UUID, PK)
* `userId` (FK)
* `type` (ENTRIES_CREATED, AUDIO_SECONDS)
* `quantity`
* `createdAt`

---

## 💳 8) Stripe Billing & Usage Limits

### Plan example (simple)

**Free**

* 30 entries/month
* 60 seconds max per voice note

**Pro**

* 300 entries/month
* 120 seconds max per voice note
* multiple Notion databases

### Enforcement (backend)

Before processing a voice note:

* compute usage in current billing month
* if exceeded:

  * reply via WhatsApp: “Limit reached — upgrade here: {checkout_link}”
  * do not transcribe/extract

### Stripe Webhook

* `POST /stripe/webhook`
  Updates:
* subscription status
* plan
* current period end

---

## 🛡️ 9) Security, Reliability, and Idempotency

### WhatsApp Webhook Security

* verify signature/token
* validate payload schema
* rate-limit endpoint

### Notion Token Security

* encrypt tokens at rest
* never expose tokens to client
* support reconnect/disconnect

### Idempotency

* dedupe inbound voice notes:

  * `VoiceEntry.whatsappMessageId` unique
* approval actions:

  * if already SYNCED, do not write again

### Safe Notion Writes

* use schema snapshot + re-check select options at write time if needed
* skip invalid fields; do not fail entire write
* always write title

---

## ✅ 10) MVP Definition

* Supabase Auth login works
* Notion OAuth works
* User selects Notion database; backend stores schema snapshot + mapping
* User adds allowed WhatsApp sender number
* WhatsApp voice note triggers:

  * download audio
  * transcription
  * structured extraction based on schema
  * draft sent back for approval
* Approve → Notion row appended
* History stored in Supabase Postgres
* Stripe upgrade gates usage
