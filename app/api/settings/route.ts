import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
    include: {
      notionConnection: true,
      notionDatabaseConfig: true,
      stripeCustomer: true,
    },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const entriesThisMonth = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, createdAt: { gte: startOfMonth } },
  });

  const plan = dbUser.stripeCustomer?.plan || "FREE";

  const repCount = await prisma.employee.count({ where: { adminId: dbUser.id } });
  const maxReps = plan === "SCALE" ? 999 : plan === "PRO" ? 10 : 3;
  const unlimitedUpdates = plan === "PRO" || plan === "SCALE";
  const updatesPerRepPerDay = unlimitedUpdates ? -1 : 10;
  const maxAudioSecs = plan === "PRO" || plan === "SCALE" ? 300 : 60;

  const now2 = new Date();
  const startOfDay = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());
  const entriesToday = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, createdAt: { gte: startOfDay } },
  });

  const dailyLimit = unlimitedUpdates ? -1 : updatesPerRepPerDay * Math.max(repCount, 1);
  const limits = { maxReps, maxAudioSecs, updatesPerRepPerDay, unlimitedUpdates, dailyLimit };

  const schema = dbUser.notionDatabaseConfig?.schemaSnapshotJson as any[] || [];

  return NextResponse.json({
    account: {
      name: dbUser.name || "",
      email: dbUser.email,
      avatarUrl: dbUser.avatarUrl,
      createdAt: dbUser.createdAt.toISOString(),
    },
    notion: dbUser.notionConnection ? {
      connected: true,
      workspaceName: dbUser.notionConnection.workspaceName || "Notion Workspace",
      workspaceIcon: dbUser.notionConnection.workspaceIcon,
      connectedAt: dbUser.notionConnection.connectedAt.toISOString(),
    } : { connected: false },
    database: dbUser.notionDatabaseConfig ? {
      configured: true,
      databaseId: dbUser.notionDatabaseConfig.databaseId,
      databaseName: dbUser.notionDatabaseConfig.databaseName,
      columns: schema.map((s: any) => ({
        name: s.name,
        type: s.type,
        fillable: s.fillable !== false,
      })),
    } : { configured: false },
    company: {
      companyName: dbUser.companyName || "",
      companyCode: dbUser.companyCode || "",
    },
    billing: {
      plan,
      entriesUsedToday: entriesToday,
      repCount,
      limits,
      currentPeriodEnd: dbUser.stripeCustomer?.currentPeriodEnd?.toISOString() || null,
      hasSubscription: !!dbUser.stripeCustomer?.stripeSubscriptionId,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, companyName, companyCode, onboardingComplete } = body;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (companyName !== undefined) data.companyName = companyName;
  if (companyCode !== undefined) data.companyCode = companyCode;
  if (onboardingComplete !== undefined) data.onboardingComplete = onboardingComplete;

  await prisma.user.update({
    where: { id: auth.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
