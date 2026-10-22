import type { RequestStatus } from "@/features/requests/types";

export const DASHBOARD_STATUS_CLASSES: Record<RequestStatus, string> = {
  OPEN: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300",
  IN_REVIEW: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  APPROVED: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export const DASHBOARD_REASON_COLORS = [
  "#B8872C",
  "#9A7B42",
  "#78815B",
  "#9B8064",
  "#60777E",
  "#A58D51",
] as const;

export function humanizeDashboardValue(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function formatDashboardDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDurationHours(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours)) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;

  const days = hours / 24;
  return `${days.toFixed(days >= 10 ? 0 : 1)}d`;
}

export function getMaximumReasonCount(
  reasons: ReadonlyArray<{ count: number }>,
): number {
  return reasons.reduce(
    (maximum, { count }) => Math.max(maximum, count),
    1,
  );
}

export function getReasonBarWidth(count: number, maximum: number): string {
  const safeMaximum = Math.max(1, maximum);
  const percentage = (count / safeMaximum) * 100;
  return `${Math.min(100, Math.max(0, percentage))}%`;
}
