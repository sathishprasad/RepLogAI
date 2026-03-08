import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
    include: { notionDatabaseConfig: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entry = await prisma.voiceEntry.findFirst({
    where: { id: params.id, userId: dbUser.id },
  });

  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  const extracted = entry.extractedJson as any;
  const finalFields = entry.finalJson as any;
  const title = extracted?.account?.value || extracted?.summary?.value || `${entry.meetingType || "Voice"} Entry`;

  return NextResponse.json({
    id: entry.id,
    title,
    status: entry.status,
    database: dbUser.notionDatabaseConfig?.databaseName || "Not configured",
    databaseId: dbUser.notionDatabaseConfig?.databaseId || null,
    meetingType: entry.meetingType || "Call",
    duration: Math.round(entry.audioDurationSecs || 0),
    createdAt: entry.createdAt.toISOString(),
    transcript: entry.transcriptText || "",
    extractedFields: finalFields || extracted || {},
    notionPageUrl: entry.notionPageUrl || null,
    notionPageId: entry.notionPageId || null,
  });
}
