export type PlanType = "FREE" | "PRO" | "SCALE";

export interface PlanLimits {
  maxEntries: number;
  maxAudioSecs: number;
  maxReps: number;
  updatesPerRepPerDay: number;
}

export function getPlanLimits(plan: string | PlanType): PlanLimits {
  switch (plan) {
    case "SCALE":
      return { maxEntries: -1, maxAudioSecs: 300, maxReps: 999, updatesPerRepPerDay: -1 };
    case "PRO":
      return { maxEntries: -1, maxAudioSecs: 300, maxReps: 10, updatesPerRepPerDay: -1 };
    default:
      return { maxEntries: -1, maxAudioSecs: 60, maxReps: 3, updatesPerRepPerDay: 10 };
  }
}
