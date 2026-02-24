import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const { entryId } = await request.json();
    if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 });

    const entry = await prisma.voiceEntry.findUnique({
      where: { id: entryId },
      include: { user: { include: { notionDatabaseConfig: true } } },
    });

    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    if (!entry.transcriptText) return NextResponse.json({ error: "No transcript" }, { status: 400 });

    const schema = entry.user.notionDatabaseConfig?.schemaSnapshotJson as any[];

    const fieldDescriptions = (schema || []).map((prop: any) => {
      const key = prop.name.toLowerCase().replace(/\s+/g, "_");
      let desc = `"${key}": type=${prop.type}`;
      if (prop.options?.length) desc += ` (options: ${prop.options.join(", ")})`;
      return desc;
    });

    const fieldKeys = (schema || []).map((prop: any) => {
      const key = prop.name.toLowerCase().replace(/\s+/g, "_");
      return `  "${key}": {"value": "extracted value or empty string", "confidence": 0.0}`;
    });

    const prompt = `You are an AI that extracts structured data from voice transcripts into CRM/database fields.

Given this transcript:
"""
${entry.transcriptText}
"""

Database fields to extract:
${fieldDescriptions.join("\n")}

Extract structured fields. For each field, provide a value and a confidence score (0.0-1.0).

Respond ONLY with valid JSON in this exact format:
{
${fieldKeys.join(",\n")}
}

Rules:
- If a field is not mentioned in the transcript, set value to "" and confidence to 0
- For select fields, the value must match one of the allowed options exactly
- For date fields, use ISO format (YYYY-MM-DD)
- For title/text fields, extract the most relevant information
- Confidence reflects how clearly the information was stated in the transcript
- Be concise for text fields (1-2 sentences max)`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    await prisma.voiceEntry.update({
      where: { id: entryId },
      data: {
        extractedJson: extracted,
        status: "PENDING_APPROVAL",
      },
    });

    return NextResponse.json({ fields: extracted });
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("id");
  if (!entryId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const entry = await prisma.voiceEntry.findUnique({ where: { id: entryId } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    transcript: entry.transcriptText || "",
    fields: entry.extractedJson || {},
    status: entry.status,
  });
}
