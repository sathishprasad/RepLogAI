const TELEGRAM_API = "https://api.telegram.org";

export async function sendMessage(
  token: string,
  chatId: string | number,
  text: string,
  options?: { parse_mode?: "HTML" | "Markdown"; reply_markup?: any }
) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || "HTML",
      ...(options?.reply_markup && { reply_markup: options.reply_markup }),
    }),
  });
  return res.json();
}

export async function getFile(token: string, fileId: string) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await res.json();
  return data.result?.file_path as string | undefined;
}

export async function downloadFile(token: string, filePath: string): Promise<Buffer> {
  const url = `${TELEGRAM_API}/file/bot${token}/${filePath}`;
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function setWebhook(token: string, url: string, secret?: string) {
  const body: any = { url };
  if (secret) body.secret_token = secret;
  const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteWebhook(token: string) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/deleteWebhook`, {
    method: "POST",
  });
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
  const data = await res.json();
  return data.result as { id: number; first_name: string; username: string } | undefined;
}
