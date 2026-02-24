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

    const schema = entry.user.notionDatabaseConfig?.schemaSnapshotJson as any;
    const mapping = entry.user.notionDatabaseConfig?.mappingJson as any;

    const schemaContext = schema
      ? JSON.stringify(schema, null, 2)
      : `Default CRM fields: Account (title), Contact (text), Summary (text), Stage (select: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost), Next Steps (text), Follow Up Date (date)`;

    const prompt = `You are an AI that extracts structured CRM data from sales call transcripts.

Given this transcript from a sales meeting:
"""
${entry.transcriptText}
"""

And this database schema:
${schemaContext}

Extract structured fields. For each field, provide a value and a confidence score (0.0-1.0).

Respond ONLY with valid JSON in this exact format:
{
  "account": {"value": "string", "confidence": 0.0},
  "contact": {"value": "string", "confidence": 0.0},
  "summary": {"value": "string", "confidence": 0.0},
  "stage": {"value": "string from allowed options", "confidence": 0.0},
  "next_steps": {"value": "string", "confidence": 0.0},
  "follow_up_date": {"value": "YYYY-MM-DD or empty", "confidence": 0.0}
}

Rules:
- If a field is not mentioned, set value to "" and confidence to 0
- Stage must match one of the allowed options exactly
- Dates must be in ISO format (YYYY-MM-DD)
- Summary should be concise (1-2 sentences)
- Confidence reflects how clearly the information was stated`;

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
