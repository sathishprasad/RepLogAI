import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const DEMO_COOKIE = "replog-demo-session";
export const DEMO_USER_EMAIL = "demo@replog.ai";

// Source user whose Notion config we mirror
const SOURCE_USER_ID = "08af4736-b6b6-4a96-ab94-59f10f7b192b";

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
    if (dbUser?.email === DEMO_USER_EMAIL) {
      return { user: dbUser, isDemo: true };
    }
  }

  return null;
}

/**
 * Seeds or retrieves the demo user, copying Notion config from the source user.
 */
export async function getOrCreateDemoUser() {
  let demoUser = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: "Demo User",
        companyName: "Acme Sales Corp",
        companyCode: "DEMO2024",
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

    // Seed sample employees
    const sampleEmployees = [
      { name: "Alice Johnson", employeeCode: "EMP001" },
      { name: "Bob Martinez", employeeCode: "EMP002" },
      { name: "Charlie Kim", employeeCode: "EMP003" },
    ];

    for (const emp of sampleEmployees) {
      await prisma.employee.create({
        data: {
          adminId: demoUser.id,
          name: emp.name,
          employeeCode: emp.employeeCode,
        },
      });
    }

    // Seed sample voice entries
    const sampleEntries = [
      {
        status: "SYNCED" as const,
        meetingType: "Call",
        audioDurationSecs: 45,
        transcriptText: "Had a great call with Acme Corp. They're interested in the enterprise plan. Follow up scheduled for next Thursday.",
        extractedJson: { company: "Acme Corp", contact: "Jane Smith", stage: "Negotiation", nextStep: "Follow up Thursday" },
      },
      {
        status: "SYNCED" as const,
        meetingType: "In-person",
        audioDurationSecs: 72,
        transcriptText: "Met with TechStart Inc at their office. Demo went well, they want a pilot program starting next month.",
        extractedJson: { company: "TechStart Inc", contact: "Mike Chen", stage: "Pilot", nextStep: "Send pilot proposal" },
      },
      {
        status: "SYNCED" as const,
        meetingType: "Demo",
        audioDurationSecs: 38,
        transcriptText: "Quick check-in with GlobalTrade. They renewed for another year. Very happy with the product.",
        extractedJson: { company: "GlobalTrade", contact: "Sarah Lee", stage: "Closed Won", nextStep: "Quarterly review in 90 days" },
      },
    ];

    const employees = await prisma.employee.findMany({ where: { adminId: demoUser.id } });

    for (let i = 0; i < sampleEntries.length; i++) {
      const entry = sampleEntries[i];
      await prisma.voiceEntry.create({
        data: {
          userId: demoUser.id,
          employeeId: employees[i]?.id,
          databaseId: sourceDbConfig?.databaseId || "demo",
          audioDurationSecs: entry.audioDurationSecs,
          transcriptText: entry.transcriptText,
          extractedJson: entry.extractedJson,
          finalJson: entry.extractedJson,
          meetingType: entry.meetingType,
          status: entry.status,
          source: "WEB",
          createdAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000), // stagger over 3 days
        },
      });
    }
  }

  return demoUser;
}
