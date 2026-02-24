import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const databaseId = searchParams.get("databaseId");
  if (!databaseId) return NextResponse.json({ error: "Missing databaseId" }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notionConnection: true },
  });

  if (!dbUser?.notionConnection) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 400 });
  }

  const token = decrypt(dbUser.notionConnection.accessTokenEncrypted);

  try {
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    const dbData = await dbRes.json();

    if (!dbRes.ok) {
      console.error("Notion DB fetch error:", dbData);
      return NextResponse.json({ error: dbData.message || "Database not found" }, { status: 404 });
    }

    const properties = Object.entries(dbData.properties || {}).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.type,
      options: prop.type === "select" ? prop.select?.options?.map((o: any) => o.name) :
               prop.type === "multi_select" ? prop.multi_select?.options?.map((o: any) => o.name) : undefined,
    }));

    return NextResponse.json({
      databaseId,
      title: dbData.title?.[0]?.plain_text || "Untitled",
      properties,
    });
  } catch (err) {
    console.error("Schema error:", err);
    return NextResponse.json({ error: "Failed to fetch schema" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { databaseId, databaseName, schema, mapping } = await request.json();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.notionDatabaseConfig.upsert({
    where: { userId: dbUser.id },
    update: {
      databaseId,
      databaseName,
      schemaSnapshotJson: schema,
      mappingJson: mapping,
    },
    create: {
      userId: dbUser.id,
      databaseId,
      databaseName,
      schemaSnapshotJson: schema,
      mappingJson: mapping,
    },
  });

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { onboardingComplete: true },
  });

  return NextResponse.json({ success: true });
}
