import type { RequestStatus } from "./types";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export const REQUEST_STATUS_CLASSES: Record<RequestStatus, string> = {
  OPEN: "border-sky-300 bg-sky-100 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100",
  IN_REVIEW: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
  APPROVED: "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100",
  REJECTED: "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
  COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
};

/** Convert enum-like values into readable UI labels. */
export function formatRequestStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());
}

export function formatCurrencyINR(value: number): string {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

export function formatDurationHours(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours)) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;

  const days = hours / 24;
  return `${days.toFixed(days >= 10 ? 0 : 1)}d`;
}

export function formatInteger(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

export function formatCurrencyINR(value: number | string | null | undefined): string {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "—";

  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}
