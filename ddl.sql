-- =============================================
-- RepLog AI — Database DDL for Supabase
-- =============================================

-- 1. ENUMS
CREATE TYPE "VoiceEntryStatus" AS ENUM (
  'RECORDING',
  'TRANSCRIBING',
  'EXTRACTING',
  'PENDING_APPROVAL',
  'APPROVED',
  'SYNCED',
  'FAILED',
  'CANCELED'
);

CREATE TYPE "Plan" AS ENUM (
  'FREE',
  'PRO'
);

CREATE TYPE "UsageType" AS ENUM (
  'ENTRIES_CREATED',
  'AUDIO_SECONDS'
);

-- 2. USERS
CREATE TABLE "User" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"              TEXT NOT NULL UNIQUE,
  "name"               TEXT,
  "avatarUrl"          TEXT,
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. NOTION CONNECTION
CREATE TABLE "NotionConnection" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               UUID NOT NULL UNIQUE,
  "workspaceId"          TEXT,
  "workspaceName"        TEXT,
  "workspaceIcon"        TEXT,
  "accessTokenEncrypted" TEXT NOT NULL,
  "botId"                TEXT,
  "connectedAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "revokedAt"            TIMESTAMPTZ,

  CONSTRAINT "fk_notion_connection_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 4. NOTION DATABASE CONFIG
CREATE TABLE "NotionDatabaseConfig" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"             UUID NOT NULL UNIQUE,
  "databaseId"         TEXT NOT NULL,
  "databaseName"       TEXT NOT NULL,
  "schemaSnapshotJson" JSONB NOT NULL,
  "mappingJson"        JSONB NOT NULL,
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_notion_db_config_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 5. ALLOWED SENDER PHONE NUMBERS
CREATE TABLE "AllowedSenderPhoneNumber" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL,
  "phoneE164" TEXT NOT NULL,
  "label"     TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_allowed_phone_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,

  CONSTRAINT "uq_user_phone"
    UNIQUE ("userId", "phoneE164")
);

-- 6. VOICE ENTRIES
CREATE TABLE "VoiceEntry" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            UUID NOT NULL,
  "fromPhoneE164"     TEXT,
  "databaseId"        TEXT NOT NULL,
  "whatsappMessageId" TEXT UNIQUE,
  "entryCode"         TEXT,
  "audioStoragePath"  TEXT,
  "audioDurationSecs" DOUBLE PRECISION,
  "transcriptText"    TEXT,
  "extractedJson"     JSONB,
  "finalJson"         JSONB,
  "warningsJson"      JSONB,
  "status"            "VoiceEntryStatus" NOT NULL DEFAULT 'RECORDING',
  "notionPageId"      TEXT,
  "notionPageUrl"     TEXT,
  "meetingType"       TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_voice_entry_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 7. STRIPE CUSTOMER
CREATE TABLE "StripeCustomer" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               UUID NOT NULL UNIQUE,
  "stripeCustomerId"     TEXT NOT NULL UNIQUE,
  "stripeSubscriptionId" TEXT,
  "plan"                 "Plan" NOT NULL DEFAULT 'FREE',
  "currentPeriodEnd"     TIMESTAMPTZ,
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_stripe_customer_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 8. USAGE EVENTS
CREATE TABLE "UsageEvent" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL,
  "type"      "UsageType" NOT NULL,
  "quantity"  DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_usage_event_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- INDEX for usage queries
CREATE INDEX "idx_usage_user_type_created"
  ON "UsageEvent" ("userId", "type", "createdAt");

-- =============================================
-- HELPER: Auto-update "updatedAt" trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notion_db_config_updated_at
  BEFORE UPDATE ON "NotionDatabaseConfig"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_voice_entry_updated_at
  BEFORE UPDATE ON "VoiceEntry"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stripe_customer_updated_at
  BEFORE UPDATE ON "StripeCustomer"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
