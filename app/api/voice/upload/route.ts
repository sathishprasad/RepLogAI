import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkUsageLimits, trackUsage } from "@/lib/usage";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const dbUser = auth.user;

    const formData = await request.formData();
    const audio = formData.get("audio") as File;
    const meetingType = formData.get("meetingType") as string;
    const duration = parseFloat(formData.get("duration") as string);

    if (!audio) return NextResponse.json({ error: "No audio file" }, { status: 400 });

    // Demo users limited to 5 recordings
    if (auth.isDemo) {
      const demoEntryCount = await prisma.voiceEntry.count({ where: { userId: dbUser.id } });
      if (demoEntryCount >= 5) {
        return NextResponse.json({
          error: "Demo limit reached (5 recordings). Sign up for a free account to continue!",
          code: "DEMO_LIMIT",
        }, { status: 429 });
      }
    }

    const usageCheck = await checkUsageLimits(dbUser.id);
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.reason, code: "LIMIT_REACHED" }, { status: 429 });
    }

    const dbConfig = await prisma.notionDatabaseConfig.findUnique({ where: { userId: dbUser.id } });
    const databaseId = dbConfig?.databaseId || "pending";

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `voice/${dbUser.id}/${Date.now()}.webm`;

    const serviceClient = createServiceSupabaseClient();
    const { data: storageData, error: storageError } = await serviceClient.storage
      .from("voice-notes")
      .upload(fileName, buffer, { contentType: "audio/webm" });

    if (storageError) {
      console.error("Storage error:", storageError);
    }

    const entry = await prisma.voiceEntry.create({
      data: {
        userId: dbUser.id,
        databaseId,
        audioStoragePath: storageData?.path || fileName,
        audioDurationSecs: duration,
        meetingType: meetingType || "Call",
        status: "TRANSCRIBING",
      },
    });

    await trackUsage(dbUser.id, "ENTRIES_CREATED", 1);
    if (duration) await trackUsage(dbUser.id, "AUDIO_SECONDS", duration);

    const transcribeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voice/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: entry.id, audioPath: storageData?.path || fileName }),
    });

    return NextResponse.json({ entryId: entry.id, status: "processing" });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
