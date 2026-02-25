const TZ = "America/New_York";

export function nowEST(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

export function todayEST(): string {
  const d = nowEST();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function toEST(d: Date): string {
  const est = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  return `${est.getFullYear()}-${String(est.getMonth() + 1).padStart(2, "0")}-${String(est.getDate()).padStart(2, "0")}`;
}

export function startOfDayEST(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00-05:00`);
}

export function endOfDayEST(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999-05:00`);
}

export function daysAgoEST(days: number): string {
  const d = nowEST();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
