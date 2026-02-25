import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_APP_URL!));

  const state = Buffer.from(JSON.stringify({ userId: user.id, ts: Date.now() })).toString("base64url");

  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: process.env.NOTION_REDIRECT_URI!,
    response_type: "code",
    owner: "user",
    state,
  });

  return NextResponse.redirect(`https://api.notion.com/v1/oauth/authorize?${params.toString()}`);
}
