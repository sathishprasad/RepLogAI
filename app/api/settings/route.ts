import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
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
  const limits = plan === "PRO"
    ? { maxEntries: 1000, maxAudioSecs: 300 }
    : { maxEntries: 30, maxAudioSecs: 60 };

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
      entriesUsed: entriesThisMonth,
      limits,
      currentPeriodEnd: dbUser.stripeCustomer?.currentPeriodEnd?.toISOString() || null,
      hasSubscription: !!dbUser.stripeCustomer?.stripeSubscriptionId,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, companyName, companyCode } = body;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (companyName !== undefined) data.companyName = companyName;
  if (companyCode !== undefined) data.companyCode = companyCode;

  await prisma.user.update({
    where: { email: user.email! },
    data,
  });

  return NextResponse.json({ success: true });
}
