import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { entryId, audioPath } = await request.json();
    if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 });

    const entry = await prisma.voiceEntry.findUnique({ where: { id: entryId } });
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    const supabase = await createServerSupabaseClient();
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("voice-notes")
      .download(audioPath || entry.audioStoragePath!);

    if (downloadError || !audioData) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to download audio" }, { status: 500 });
    }

    const audioFile = new File([audioData], "recording.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "en",
    });

    await prisma.voiceEntry.update({
      where: { id: entryId },
      data: {
        transcriptText: transcription.text,
        status: "EXTRACTING",
      },
    });

    const extractRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voice/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId }),
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
