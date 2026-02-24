import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage, getFile, downloadFile } from "@/lib/telegram";
import { processVoiceFromTelegram } from "@/lib/telegram-pipeline";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    date: number;
    text?: string;
    voice?: { file_id: string; duration: number; file_size?: number };
    audio?: { file_id: string; duration: number; file_size?: number };
  };
}

interface ConversationState {
  step: "awaiting_company_code" | "awaiting_employee_id";
  companyCode?: string;
  adminId?: string;
}

const pendingStates = new Map<number, ConversationState>();

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text?.trim() || "";

    if (message.voice || message.audio) {
      await handleVoice(chatId, message.voice || message.audio!, message.message_id);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/start")) {
      await handleStart(chatId, text);
      return NextResponse.json({ ok: true });
    }

    const state = pendingStates.get(chatId);
    if (state?.step === "awaiting_company_code") {
      await handleCompanyCode(chatId, text);
      return NextResponse.json({ ok: true });
    }

    if (state?.step === "awaiting_employee_id") {
      await handleEmployeeId(chatId, text, state);
      return NextResponse.json({ ok: true });
    }

    const employee = await prisma.employee.findUnique({
      where: { telegramChatId: String(chatId) },
    });

    if (employee) {
      await sendMessage(TOKEN, chatId, "🎙️ Send me a voice note and I'll log it to your CRM!");
    } else {
      await sendMessage(
        TOKEN,
        chatId,
        "👋 Welcome to RepLog AI!\n\nPlease ask your manager for the bot link, or enter your company code:"
      );
      pendingStates.set(chatId, { step: "awaiting_company_code" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}

async function handleStart(chatId: number, text: string) {
  const parts = text.split(" ");
  const code = parts[1]?.trim();

  if (!code) {
    await sendMessage(
      TOKEN,
      chatId,
      "👋 Welcome to RepLog AI!\n\nPlease enter your company code:"
    );
    pendingStates.set(chatId, { step: "awaiting_company_code" });
    return;
  }

  const admin = await prisma.user.findUnique({ where: { companyCode: code } });
  if (!admin) {
    await sendMessage(
      TOKEN,
      chatId,
      "❌ Invalid company code. Please ask your manager for the correct link."
    );
    return;
  }

  const existing = await prisma.employee.findUnique({
    where: { telegramChatId: String(chatId) },
  });

  if (existing) {
    await sendMessage(
      TOKEN,
      chatId,
      `✅ Welcome back, ${existing.name}! Send me a voice note after any meeting. 🎙️`
    );
    return;
  }

  await sendMessage(
    TOKEN,
    chatId,
    `👋 Welcome to RepLog AI!\nYou're joining <b>${admin.companyName || "your company"}</b>.\n\nPlease enter your Employee ID:`
  );
  pendingStates.set(chatId, {
    step: "awaiting_employee_id",
    companyCode: code,
    adminId: admin.id,
  });
}

async function handleCompanyCode(chatId: number, code: string) {
  const admin = await prisma.user.findUnique({ where: { companyCode: code } });
  if (!admin) {
    await sendMessage(
      TOKEN,
      chatId,
      "❌ Company code not found. Please check with your manager and try again:"
    );
    return;
  }

  await sendMessage(
    TOKEN,
    chatId,
    `✅ You're joining <b>${admin.companyName || "your company"}</b>!\n\nPlease enter your Employee ID:`
  );
  pendingStates.set(chatId, {
    step: "awaiting_employee_id",
    companyCode: code,
    adminId: admin.id,
  });
}

async function handleEmployeeId(
  chatId: number,
  employeeCode: string,
  state: ConversationState
) {
  const employee = await prisma.employee.findUnique({
    where: {
      adminId_employeeCode: {
        adminId: state.adminId!,
        employeeCode: employeeCode.toUpperCase(),
      },
    },
  });

  if (!employee) {
    const employeeLower = await prisma.employee.findFirst({
      where: {
        adminId: state.adminId!,
        employeeCode: { equals: employeeCode, mode: "insensitive" },
      },
    });

    if (employeeLower) {
      await linkEmployee(chatId, employeeLower);
      return;
    }

    await sendMessage(
      TOKEN,
      chatId,
      `❌ Employee ID "${employeeCode}" not found.\nPlease check with your manager and try again:\n\nType your Employee ID to retry:`
    );
    return;
  }

  await linkEmployee(chatId, employee);
}

async function linkEmployee(
  chatId: number,
  employee: { id: string; name: string; telegramChatId: string | null }
) {
  if (!employee.telegramChatId) {
    await prisma.employee.update({
      where: { id: employee.id },
      data: { telegramChatId: String(chatId) },
    });
  }

  pendingStates.delete(chatId);

  await sendMessage(
    TOKEN,
    chatId,
    `✅ Hi <b>${employee.name}</b>! You're all set.\n\nJust send me a voice note after any meeting and I'll log it to your CRM automatically. 🎙️`
  );
}

async function handleVoice(
  chatId: number,
  voice: { file_id: string; duration: number },
  messageId: number
) {
  const employee = await prisma.employee.findUnique({
    where: { telegramChatId: String(chatId) },
    include: { admin: true },
  });

  if (!employee) {
    await sendMessage(
      TOKEN,
      chatId,
      "❌ You're not registered yet. Please ask your manager for the bot link to get started."
    );
    return;
  }

  await sendMessage(TOKEN, chatId, "🎙️ Processing your meeting notes...");

  try {
    const filePath = await getFile(TOKEN, voice.file_id);
    if (!filePath) {
      await sendMessage(TOKEN, chatId, "❌ Could not download the voice note. Please try again.");
      return;
    }

    const audioBuffer = await downloadFile(TOKEN, filePath);

    const result = await processVoiceFromTelegram(
      employee.adminId,
      employee.id,
      audioBuffer,
      String(chatId)
    );

    if (result.success) {
      await sendMessage(
        TOKEN,
        chatId,
        `✅ Logged by <b>${employee.name}</b>!\n\n📋 Extracted:\n${result.summary || "Entry saved."}`
      );
    } else {
      await sendMessage(
        TOKEN,
        chatId,
        `❌ ${result.error || "Something went wrong. Please try again."}`
      );
    }
  } catch (err) {
    console.error("Voice processing error:", err);
    await sendMessage(TOKEN, chatId, "❌ Processing failed. Please try again later.");
  }
}
