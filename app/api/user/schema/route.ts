import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notionDatabaseConfig: true },
  });

  if (!dbUser?.notionDatabaseConfig) {
    return NextResponse.json({ error: "No database configured" }, { status: 404 });
  }

  const schema = dbUser.notionDatabaseConfig.schemaSnapshotJson as any[];
  const mapping = dbUser.notionDatabaseConfig.mappingJson as any;

  return NextResponse.json({
    databaseName: dbUser.notionDatabaseConfig.databaseName,
    schema: schema || [],
    mapping: mapping || {},
  });
}
