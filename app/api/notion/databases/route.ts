import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notionConnection: true },
  });

  if (!dbUser?.notionConnection) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 400 });
  }

  const token = decrypt(dbUser.notionConnection.accessTokenEncrypted);

  try {
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

    if (!searchRes.ok) {
      console.error("Notion search error:", searchData);
      return NextResponse.json({ error: searchData.message || "Failed to search" }, { status: 500 });
    }

    const databases = (searchData.results || []).map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || "Untitled",
      icon: db.icon?.emoji || db.icon?.external?.url || null,
      lastEditedTime: db.last_edited_time,
    }));

    return NextResponse.json({ databases });
  } catch (err) {
    console.error("Notion search error:", err);
    return NextResponse.json({ error: "Failed to fetch databases" }, { status: 500 });
  }
}
