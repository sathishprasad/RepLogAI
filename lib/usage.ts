import { prisma } from "@/lib/prisma";

export async function trackUsage(userId: string, type: "ENTRIES_CREATED" | "AUDIO_SECONDS", quantity: number) {
  await prisma.usageEvent.create({
    data: { userId, type, quantity },
  });
}

function getPlanLimits(plan: string) {
  switch (plan) {
    case "SCALE":
      return { maxEntries: -1, maxAudioSecs: 300, maxReps: 999, updatesPerRepPerDay: -1 };
    case "PRO":
      return { maxEntries: -1, maxAudioSecs: 300, maxReps: 10, updatesPerRepPerDay: -1 };
    default:
      return { maxEntries: -1, maxAudioSecs: 60, maxReps: 3, updatesPerRepPerDay: 10 };
  }
}

export async function checkUsageLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { stripeCustomer: true },
  });

  const plan = user?.stripeCustomer?.plan || "FREE";
  const limits = getPlanLimits(plan);

  if (limits.updatesPerRepPerDay > 0) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const entriesToday = await prisma.voiceEntry.count({
      where: { userId, createdAt: { gte: startOfDay } },
    });

    const repCount = await prisma.employee.count({ where: { adminId: userId } });
    const dailyLimit = limits.updatesPerRepPerDay * Math.max(repCount, 1);

    if (entriesToday >= dailyLimit) {
      return { allowed: false, reason: `Daily limit reached (${dailyLimit} updates for ${repCount} reps). Upgrade to Pro for unlimited updates.` };
    }
  }

  return { allowed: true };
}

export function getMaxAudioSecs(plan: string): number {
  return getPlanLimits(plan).maxAudioSecs;
}

export function getBillingLimits(plan: string) {
  const limits = getPlanLimits(plan);
  return {
    maxReps: limits.maxReps,
    maxAudioSecs: limits.maxAudioSecs,
    updatesPerRepPerDay: limits.updatesPerRepPerDay,
    unlimitedUpdates: limits.updatesPerRepPerDay === -1,
  };
}
