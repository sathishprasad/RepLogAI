import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { entryId, transcript, fields } = await request.json();

    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { notionConnection: true, notionDatabaseConfig: true },
    });

    if (!dbUser?.notionConnection || !dbUser?.notionDatabaseConfig) {
      return NextResponse.json({ error: "Notion not configured" }, { status: 400 });
    }

    const token = decrypt(dbUser.notionConnection.accessTokenEncrypted);
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

    let rawDbId = dbConfig.databaseId;
    const cleanDbId = rawDbId.replace(/-/g, "");

    console.log("Syncing to Notion DB (raw):", rawDbId);
    console.log("Syncing to Notion DB (clean):", cleanDbId);
    console.log("Properties:", JSON.stringify(properties, null, 2));

    const verifyRes = await fetch(`https://api.notion.com/v1/databases/${rawDbId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const verifyData = await verifyRes.json();
    console.log("DB verify (raw ID) status:", verifyRes.status, JSON.stringify(verifyData).slice(0, 500));

    let workingDbId = rawDbId;
    if (!verifyRes.ok) {
      const verifyRes2 = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
        },
      });
      const verifyData2 = await verifyRes2.json();
      console.log("DB verify (clean ID) status:", verifyRes2.status, JSON.stringify(verifyData2).slice(0, 500));

      if (verifyRes2.ok) {
        workingDbId = cleanDbId;
      } else {
        const searchRes = await fetch("https://api.notion.com/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            filter: { property: "object", value: "database" },
            page_size: 100,
          }),
        });
        const searchData = await searchRes.json();
        console.log("Search for databases:", searchData.results?.map((r: any) => ({
          id: r.id,
          object: r.object,
          title: r.title?.[0]?.plain_text,
        })));

        const match = searchData.results?.find((r: any) =>
          r.id === rawDbId || r.id === cleanDbId || r.id.replace(/-/g, "") === cleanDbId
        );
        if (match) {
          workingDbId = match.id;
          console.log("Found matching DB via search:", workingDbId);
        } else if (searchData.results?.length === 1) {
          workingDbId = searchData.results[0].id;
          console.log("Only 1 database found, using it:", workingDbId);
          await prisma.notionDatabaseConfig.update({
            where: { userId: dbUser.id },
            data: { databaseId: workingDbId },
          });
          console.log("Updated stored databaseId to:", workingDbId);
        } else {
          console.error("Database not found via any method. Available DBs:", 
            searchData.results?.map((r: any) => r.id));
          return NextResponse.json({
            success: false,
            error: `Database ${rawDbId} not accessible. Found ${searchData.results?.length || 0} databases. The integration may not have access to this database — please re-share it.`,
          }, { status: 400 });
        }
      }
    }

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: workingDbId },
        properties,
      }),
    });

    const pageData = await notionRes.json();

    if (!notionRes.ok) {
      console.error("Notion API error:", pageData);
      return NextResponse.json({
        success: false,
        error: pageData.message || "Failed to create Notion page",
      }, { status: 500 });
    }

    if (entryId) {
      await prisma.voiceEntry.update({
        where: { id: entryId },
        data: {
          finalJson: fields,
          status: "SYNCED",
          notionPageId: pageData.id,
          notionPageUrl: pageData.url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      pageId: pageData.id,
      url: pageData.url,
    });
  } catch (err: any) {
    console.error("Notion sync error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to sync to Notion",
    }, { status: 500 });
  }
}
