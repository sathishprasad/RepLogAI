import { prisma } from "@/lib/prisma";

export async function trackUsage(userId: string, type: "ENTRIES_CREATED" | "AUDIO_SECONDS", quantity: number) {
  await prisma.usageEvent.create({
    data: { userId, type, quantity },
  });
}

export async function checkUsageLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { stripeCustomer: true },
  });

  const plan = user?.stripeCustomer?.plan || "FREE";
  const maxEntries = plan === "PRO" ? 1000 : 30;
  const maxAudioSecs = plan === "PRO" ? 300 : 60;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const entriesThisMonth = await prisma.voiceEntry.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  if (entriesThisMonth >= maxEntries) {
    return { allowed: false, reason: `Monthly limit reached (${maxEntries} entries). Upgrade to Pro for more.` };
  }

  return { allowed: true };
}

export function getMaxAudioSecs(plan: string): number {
  return plan === "PRO" ? 300 : 60;
}
