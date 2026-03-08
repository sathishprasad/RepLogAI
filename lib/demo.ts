import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export const DEMO_COOKIE = "replog-demo-session";
export const DEMO_EMAIL_SUFFIX = "@demo.replog.ai";

// Source user whose Notion config we mirror
const SOURCE_USER_ID = "08af4736-b6b6-4a96-ab94-59f10f7b192b";

/**
 * Check if an email belongs to a demo user.
 */
export function isDemoEmail(email: string): boolean {
  return email.endsWith(DEMO_EMAIL_SUFFIX);
}

/**
 * Unified auth helper — tries Supabase first, falls back to demo cookie.
 * Returns the Prisma user or null.
 */
export async function getAuthenticatedUser() {
  // Try Supabase auth first
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (dbUser) return { user: dbUser, isDemo: false };
    }
  }

  // Fall back to demo cookie
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_COOKIE);
  if (demoCookie?.value) {
    const dbUser = await prisma.user.findUnique({ where: { id: demoCookie.value } });
    if (dbUser && isDemoEmail(dbUser.email)) {
      return { user: dbUser, isDemo: true };
    }
  }

  return null;
}

/**
 * Creates a fresh demo user with unique email, seeded data, and Notion config.
 * Each call creates a completely isolated demo session.
 */
export async function createDemoUser() {
  const sessionId = randomBytes(6).toString("hex");
  const email = `demo-${sessionId}${DEMO_EMAIL_SUFFIX}`;
  const companyCode = `DEMO-${sessionId.slice(0, 6).toUpperCase()}`;

  const demoUser = await prisma.user.create({
    data: {
      email,
      name: "Demo User",
      companyName: "Acme Sales Corp",
      companyCode,
      onboardingComplete: true,
    },
  });

  // Copy Notion connection from source user
  const sourceConnection = await prisma.notionConnection.findUnique({
    where: { userId: SOURCE_USER_ID },
  });
  if (sourceConnection) {
    await prisma.notionConnection.create({
      data: {
        userId: demoUser.id,
        workspaceId: sourceConnection.workspaceId,
        workspaceName: sourceConnection.workspaceName,
        workspaceIcon: sourceConnection.workspaceIcon,
        accessTokenEncrypted: sourceConnection.accessTokenEncrypted,
        botId: sourceConnection.botId,
      },
    });
  }

  // Copy Notion database config from source user
  const sourceDbConfig = await prisma.notionDatabaseConfig.findUnique({
    where: { userId: SOURCE_USER_ID },
  });
  if (sourceDbConfig) {
    await prisma.notionDatabaseConfig.create({
      data: {
        userId: demoUser.id,
        databaseId: sourceDbConfig.databaseId,
        databaseName: sourceDbConfig.databaseName,
        schemaSnapshotJson: sourceDbConfig.schemaSnapshotJson as any,
        mappingJson: sourceDbConfig.mappingJson as any,
      },
    });
  }

  // Seed sample employees (unique telegramChatIds per session)
  const sampleEmployees = [
    { name: "Alice Johnson", employeeCode: "EMP001", telegramChatId: `demo_alice_${sessionId}` },
    { name: "Bob Martinez", employeeCode: "EMP002", telegramChatId: `demo_bob_${sessionId}` },
    { name: "Charlie Kim", employeeCode: "EMP003", telegramChatId: `demo_charlie_${sessionId}` },
  ];

  for (const emp of sampleEmployees) {
    await prisma.employee.create({
      data: {
        adminId: demoUser.id,
        name: emp.name,
        employeeCode: emp.employeeCode,
        telegramChatId: emp.telegramChatId,
      },
    });
  }

  // Seed 55 sample voice entries spread over 14 days
  const employees = await prisma.employee.findMany({ where: { adminId: demoUser.id } });

  const contacts = [
    { name: "Jane Smith", account: "ACME-2024", company: "Acme Corp" },
    { name: "Mike Chen", account: "TS-1001", company: "TechStart Inc" },
    { name: "Sarah Lee", account: "GT-500", company: "GlobalTrade" },
    { name: "David Park", account: "NX-300", company: "NexGen Solutions" },
    { name: "Emily Rodriguez", account: "CP-750", company: "CloudPeak" },
    { name: "James Wilson", account: "BV-220", company: "BlueVista" },
    { name: "Lisa Chang", account: "MF-410", company: "MetaForge" },
    { name: "Tom Harris", account: "SR-600", company: "SkyRail" },
    { name: "Anna Kumar", account: "DW-880", company: "DataWave" },
    { name: "Ryan Brooks", account: "FP-150", company: "FrostPeak" },
  ];

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const meetingTypes = ["Call", "In-person", "Demo"];
  const noteTemplates = [
    "Discussed pricing and timeline. Client is very interested in the enterprise plan.",
    "Initial discovery call. Identified pain points around manual CRM entry and data quality.",
    "Product demo went well. CTO was impressed with voice-to-CRM accuracy.",
    "Follow-up after proposal. They want to negotiate on the annual contract terms.",
    "Quick check-in. Customer is happy, exploring upsell opportunities for Q2.",
    "Renewal discussion. They confirmed renewal for another year.",
    "Cold outreach turned warm. They agreed to a full demo next week.",
    "Objection handling session. Addressed concerns about data privacy and security.",
    "Contract review meeting. Legal team had minor comments, otherwise ready to sign.",
    "Quarterly business review. Usage is up 40%, very satisfied with ROI.",
  ];
  const nextStepTemplates = [
    "Send pricing proposal by EOD",
    "Schedule follow-up demo with technical team",
    "Send pilot agreement and SOW",
    "Set up onboarding call for next week",
    "Share case study and ROI calculator",
    "Quarterly review in 90 days",
    "Send contract for signature",
    "Follow up on legal review comments",
    "Schedule executive sponsor meeting",
    "Prepare custom integration proposal",
  ];

  const entryPromises = [];
  for (let i = 0; i < 55; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
    const meetingDate = new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0];
    const contact = contacts[i % contacts.length];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
    const employee = employees[i % employees.length];
    const note = noteTemplates[i % noteTemplates.length];
    const nextStep = nextStepTemplates[i % nextStepTemplates.length];

    const hasFollowUpToday = Math.random() < 0.4;
    const followUpDaysFromNow = hasFollowUpToday ? 0 : Math.floor(Math.random() * 7) + 1;
    const followUpDate = new Date(Date.now() + followUpDaysFromNow * 86400000).toISOString().split("T")[0];

    const duration = 20 + Math.floor(Math.random() * 70);

    entryPromises.push(
      prisma.voiceEntry.create({
        data: {
          userId: demoUser.id,
          employeeId: employee?.id,
          databaseId: sourceDbConfig?.databaseId || "demo",
          audioDurationSecs: duration,
          transcriptText: `${meetingType} with ${contact.company}. ${note} Next step: ${nextStep}.`,
          extractedJson: {
            contact_name: { value: contact.name, confidence: 0.9 + Math.random() * 0.1 },
            account_number: { value: contact.account, confidence: 0.85 + Math.random() * 0.1 },
            meeting_date: { value: meetingDate, confidence: 1.0 },
            meeting_notes: { value: note, confidence: 0.8 + Math.random() * 0.15 },
            stage: { value: stage, confidence: 0.8 + Math.random() * 0.2 },
            next_steps: { value: nextStep, confidence: 0.75 + Math.random() * 0.2 },
            "follow-up_date": { value: stage === "Closed Won" || stage === "Closed Lost" ? "" : followUpDate, confidence: stage === "Closed Won" || stage === "Closed Lost" ? 0 : 0.85 },
          },
          finalJson: {
            contact_name: contact.name,
            account_number: contact.account,
            meeting_date: meetingDate,
            meeting_notes: note,
            stage: stage,
            next_steps: nextStep,
            "follow-up_date": stage === "Closed Won" || stage === "Closed Lost" ? "" : followUpDate,
          },
          meetingType: meetingType,
          status: "SYNCED",
          source: "TELEGRAM",
          createdAt,
        },
      })
    );
  }
  await Promise.all(entryPromises);

  return demoUser;
}

/**
 * Deletes a demo user and all their data.
 */
export async function deleteDemoUser(userId: string) {
  await prisma.voiceEntry.deleteMany({ where: { userId } });
  await prisma.employee.deleteMany({ where: { adminId: userId } });
  await prisma.notionDatabaseConfig.deleteMany({ where: { userId } });
  await prisma.notionConnection.deleteMany({ where: { userId } });
  await prisma.usageEvent.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

/**
 * Cleanup expired demo users (older than 24h). Call periodically.
 */
export async function cleanupExpiredDemoUsers() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expiredUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: DEMO_EMAIL_SUFFIX },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  for (const user of expiredUsers) {
    await deleteDemoUser(user.id);
  }

  return expiredUsers.length;
}
