import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
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
