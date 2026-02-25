import { prisma } from "@/lib/prisma";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { decrypt } from "@/lib/encryption";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function processVoiceFromTelegram(
  adminId: string,
  employeeId: string,
  audioBuffer: Buffer,
  chatId: string
): Promise<{ success: boolean; summary?: string; error?: string }> {
  let entryId: string | null = null;

  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { notionConnection: true, notionDatabaseConfig: true },
    });

    if (!admin?.notionConnection || !admin?.notionDatabaseConfig) {
      return { success: false, error: "Admin has not configured Notion yet." };
    }

    const dbConfig = admin.notionDatabaseConfig;
    const schema = dbConfig.schemaSnapshotJson as any[];

    const fileName = `voice/${adminId}/${Date.now()}.oga`;
    const serviceClient = createServiceSupabaseClient();
    const { error: storageError } = await serviceClient.storage
      .from("voice-notes")
      .upload(fileName, audioBuffer, { contentType: "audio/ogg" });

    if (storageError) {
      console.error("Storage upload error:", storageError);
    }

    const entry = await prisma.voiceEntry.create({
      data: {
        userId: adminId,
        employeeId,
        source: "TELEGRAM",
        databaseId: dbConfig.databaseId,
        telegramChatId: chatId,
        audioStoragePath: fileName,
        status: "TRANSCRIBING",
      },
    });
    entryId = entry.id;

    const uint8 = new Uint8Array(audioBuffer);
    const audioFile = new File([uint8], "recording.oga", { type: "audio/ogg" });
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "en",
    });

    await prisma.voiceEntry.update({
      where: { id: entryId },
      data: { transcriptText: transcription.text, status: "EXTRACTING" },
    });

    const todayEST = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const todayStr = todayEST.toISOString().split("T")[0];
    const dayOfWeek = todayEST.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });

    const fieldDescriptions = (schema || []).map((prop: any) => {
      const key = prop.name.toLowerCase().replace(/\s+/g, "_");
      let desc = `- "${key}" (type: ${prop.type})`;
      if (prop.options?.length) desc += ` — allowed values: [${prop.options.join(", ")}]`;
      if (prop.type === "date") {
        if (key.match(/call|meeting|entry|log/i)) desc += ` — this is the date the call/meeting happened`;
        if (key.match(/follow|next|due|action/i)) desc += ` — this is a future follow-up/action date`;
      }
      return desc;
    });

    const fieldKeys = (schema || []).map((prop: any) => {
      const key = prop.name.toLowerCase().replace(/\s+/g, "_");
      return `  "${key}": {"value": "extracted value or empty string", "confidence": 0.0}`;
    });

    const systemPrompt = `You are an expert CRM data extraction AI. Your job is to listen to sales rep voice notes and extract structured data into specific database fields.

You are precise, thorough, and never miss follow-up dates or action items. You pay special attention to:
1. Temporal references ("next week", "follow up Friday", "call back in 3 days", "end of month")
2. Deal stages and pipeline status
3. Contact names and account information
4. Objections, blockers, and next steps

TODAY is ${todayStr} (${dayOfWeek}), Eastern Time.`;

    const userPrompt = `Extract structured CRM data from this voice transcript.

TRANSCRIPT:
"""
${transcription.text}
"""

DATABASE FIELDS TO EXTRACT:
${fieldDescriptions.join("\n")}

CRITICAL DATE RULES:
- Today is ${todayStr} (${dayOfWeek})
- Any field about when the call/meeting happened (call_date, meeting_date, entry_date, log_date, date): ALWAYS set to "${todayStr}" with confidence 1.0
- Any field about follow-up/next action dates: carefully parse temporal references:
  • "tomorrow" → add 1 day to today
  • "next week" → add 7 days to today
  • "in X days" → add X days to today
  • "next Monday/Tuesday/etc" → calculate the next occurrence of that weekday from today
  • "end of month" → last day of the current month
  • "follow up Friday" → the next Friday from today
  • "in a couple weeks" → add 14 days
  • "next month" → 1st of next month
  • If the transcript mentions ANY timing for follow-up but is vague (e.g., "I'll follow up", "need to check back"), set to 7 days from today with confidence 0.5
  • If NO follow-up timing is mentioned at all, set value to "" and confidence to 0

EXTRACTION RULES:
- For select fields: value MUST exactly match one of the allowed values listed
- For date fields: use ISO format YYYY-MM-DD
- For text/rich_text fields: be concise (1-2 sentences max), capture the key information
- For title fields: use account name, contact name, or a brief meeting summary
- Confidence score (0.0-1.0): how clearly the information was stated. Explicit mention = 0.8-1.0, inferred = 0.4-0.7, default/assumed = 0.1-0.3

Respond ONLY with valid JSON:
{
${fieldKeys.join(",\n")}
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: userPrompt },
      ],
      system: systemPrompt,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    await prisma.voiceEntry.update({
      where: { id: entryId },
      data: { extractedJson: extracted, status: "APPROVED" },
    });

    const fields: Record<string, string> = {};
    for (const [key, val] of Object.entries(extracted)) {
      const v = val as any;
      if (v?.value) fields[key] = v.value;
    }

    const token = decrypt(admin.notionConnection.accessTokenEncrypted);
    const properties: Record<string, any> = {};

    for (const prop of schema || []) {
      const key = prop.name?.toLowerCase()?.replace(/\s+/g, "_");
      const value = fields[key] || fields[prop.name] || "";
      if (!value) continue;

      switch (prop.type) {
        case "title":
          properties[prop.name] = { title: [{ text: { content: value } }] };
          break;
        case "rich_text":
          properties[prop.name] = { rich_text: [{ text: { content: value } }] };
          break;
        case "select":
          if (prop.options?.includes(value)) {
            properties[prop.name] = { select: { name: value } };
          }
          break;
        case "multi_select":
          properties[prop.name] = {
            multi_select: value.split(",").map((v: string) => ({ name: v.trim() })),
          };
          break;
        case "date":
          properties[prop.name] = { date: { start: value } };
          break;
        case "number":
          const num = parseFloat(value);
          if (!isNaN(num)) properties[prop.name] = { number: num };
          break;
        case "url":
          properties[prop.name] = { url: value };
          break;
        case "email":
          properties[prop.name] = { email: value };
          break;
        case "phone_number":
          properties[prop.name] = { phone_number: value };
          break;
        case "checkbox":
          properties[prop.name] = { checkbox: value === "true" };
          break;
      }
    }

    if (Object.keys(properties).length === 0) {
      const titleProp = schema?.find((p: any) => p.type === "title");
      properties[titleProp?.name || "Name"] = {
        title: [{ text: { content: fields.account || fields.summary || "Voice Entry" } }],
      };
    }

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: dbConfig.databaseId },
        properties,
      }),
    });

    const pageData = await notionRes.json();

    if (!notionRes.ok) {
      console.error("Notion sync error from Telegram:", pageData);
      await prisma.voiceEntry.update({
        where: { id: entryId },
        data: { status: "FAILED" },
      });
      return { success: false, error: "Failed to sync to Notion." };
    }

    await prisma.voiceEntry.update({
      where: { id: entryId },
      data: {
        finalJson: fields,
        status: "SYNCED",
        notionPageId: pageData.id,
        notionPageUrl: pageData.url,
      },
    });

    const summaryParts = Object.entries(fields)
      .filter(([_, v]) => v)
      .map(([k, v]) => `• ${k.replace(/_/g, " ")}: ${v}`);

    return {
      success: true,
      summary: summaryParts.join("\n"),
    };
  } catch (err: any) {
    console.error("Telegram voice pipeline error:", err);
    if (entryId) {
      await prisma.voiceEntry.update({
        where: { id: entryId },
        data: { status: "FAILED" },
      }).catch(() => {});
    }
    return { success: false, error: err.message || "Processing failed." };
  }
}
