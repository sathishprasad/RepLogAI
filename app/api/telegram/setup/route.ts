import { NextResponse } from "next/server";
import { setWebhook, deleteWebhook, getMe } from "@/lib/telegram";
export const dynamic = 'force-dynamic';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function POST(request: Request) {
  try {
    const { action, webhookUrl } = await request.json();

    if (action === "set" && webhookUrl) {
      const result = await setWebhook(TOKEN, `${webhookUrl}/api/webhooks/telegram`);
      const me = await getMe(TOKEN);
      return NextResponse.json({ ok: true, webhook: result, bot: me });
    }

    if (action === "delete") {
      const result = await deleteWebhook(TOKEN);
      return NextResponse.json({ ok: true, result });
    }

    if (action === "info") {
      const me = await getMe(TOKEN);
      return NextResponse.json({ ok: true, bot: me });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Telegram setup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
