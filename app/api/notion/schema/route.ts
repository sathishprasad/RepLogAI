import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

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
  const notion = new Client({ auth: token });

  try {
    const searchResponse = await notion.search({
      filter: { property: "object", value: "database" as any },
      page_size: 100,
    });

    const database = searchResponse.results.find((r: any) => r.id === databaseId);
    if (!database) {
      return NextResponse.json({ error: "Database not found or not shared with integration" }, { status: 404 });
    }

    const properties = Object.entries((database as any).properties || {}).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.type,
      options: prop.type === "select" ? prop.select?.options?.map((o: any) => o.name) :
               prop.type === "multi_select" ? prop.multi_select?.options?.map((o: any) => o.name) : undefined,
    }));

    return NextResponse.json({
      databaseId,
      title: (database as any).title?.[0]?.plain_text || "Untitled",
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
