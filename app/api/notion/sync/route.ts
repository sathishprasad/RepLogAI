import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(request: Request) {
  try {
    const { entryId, transcript, fields } = await request.json();

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { notionConnection: true, notionDatabaseConfig: true },
    });

    if (!dbUser?.notionConnection || !dbUser?.notionDatabaseConfig) {
      return NextResponse.json({ error: "Notion not configured" }, { status: 400 });
    }

    const token = decrypt(dbUser.notionConnection.accessTokenEncrypted);
    const notion = new Client({ auth: token });
    const dbConfig = dbUser.notionDatabaseConfig;
    const schema = dbConfig.schemaSnapshotJson as any[];

    const properties: Record<string, any> = {};

    if (schema && Array.isArray(schema)) {
      for (const prop of schema) {
        const value = fields[prop.name?.toLowerCase()?.replace(/\s+/g, "_")] || 
                      fields[prop.name] || "";
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
            properties[prop.name] = { checkbox: value === "true" || value === true };
            break;
        }
      }
    }

    if (Object.keys(properties).length === 0) {
      const titleProp = schema?.find((p: any) => p.type === "title");
      const titleName = titleProp?.name || "Name";
      properties[titleName] = {
        title: [{ text: { content: fields.account || fields.summary || "Voice Entry" } }],
      };
    }

    const page = await notion.pages.create({
      parent: { database_id: dbConfig.databaseId },
      properties,
    });

    if (entryId) {
      await prisma.voiceEntry.update({
        where: { id: entryId },
        data: {
          finalJson: fields,
          status: "SYNCED",
          notionPageId: page.id,
          notionPageUrl: (page as any).url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      pageId: page.id,
      url: (page as any).url,
    });
  } catch (err: any) {
    console.error("Notion sync error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to sync to Notion",
    }, { status: 500 });
  }
}
