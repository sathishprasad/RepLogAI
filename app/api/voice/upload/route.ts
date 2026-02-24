import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const audio = formData.get("audio") as File;
    const meetingType = formData.get("meetingType") as string;
    const duration = parseFloat(formData.get("duration") as string);

    if (!audio) return NextResponse.json({ error: "No audio file" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const dbConfig = await prisma.notionDatabaseConfig.findUnique({ where: { userId: dbUser.id } });
    const databaseId = dbConfig?.databaseId || "pending";

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `voice/${dbUser.id}/${Date.now()}.webm`;

    const { data: storageData, error: storageError } = await supabase.storage
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
