import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/onboarding?error=notion_denied", process.env.NEXT_PUBLIC_APP_URL!));
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_APP_URL!));

  try {
    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Notion token error:", tokenData);
      return NextResponse.redirect(new URL("/onboarding?error=notion_token_failed", process.env.NEXT_PUBLIC_APP_URL!));
    }

    let dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { email: user.email!, name: user.user_metadata?.full_name, avatarUrl: user.user_metadata?.avatar_url },
      });
    }

    await prisma.notionConnection.upsert({
      where: { userId: dbUser.id },
      update: {
        accessTokenEncrypted: encrypt(tokenData.access_token),
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name,
        workspaceIcon: tokenData.workspace_icon,
        botId: tokenData.bot_id,
        revokedAt: null,
        connectedAt: new Date(),
      },
      create: {
        userId: dbUser.id,
        accessTokenEncrypted: encrypt(tokenData.access_token),
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name,
        workspaceIcon: tokenData.workspace_icon,
        botId: tokenData.bot_id,
      },
    });

    const freshUser = await prisma.user.findUnique({ where: { id: dbUser.id } });
    if (freshUser?.onboardingComplete || freshUser?.companyCode) {
      return NextResponse.redirect(new URL("/dashboard/settings?reconnected=true", process.env.NEXT_PUBLIC_APP_URL!));
    }

    return NextResponse.redirect(new URL("/onboarding?step=database", process.env.NEXT_PUBLIC_APP_URL!));
  } catch (err) {
    console.error("Notion OAuth error:", err);
    return NextResponse.redirect(new URL("/onboarding?error=notion_failed", process.env.NEXT_PUBLIC_APP_URL!));
  }
}
