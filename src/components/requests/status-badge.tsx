import {
  REQUEST_STATUS_CLASSES,
  REQUEST_STATUS_LABELS,
  formatRequestStatus,
} from "@/features/requests/presentation";
import type { RequestStatus } from "@/features/requests/types";

type StatusBadgeProps = {
  status: RequestStatus | string;
  label?: string;
  className?: string;
};

const STATUS_PREFIX: Record<RequestStatus, string> = {
  OPEN: "open",
  IN_REVIEW: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

/** Consistent status presentation across request, detail, and refund views. */
export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const knownStatus = status in REQUEST_STATUS_CLASSES ? status as RequestStatus : null;
  const classes = knownStatus
    ? `status-badge-${STATUS_PREFIX[knownStatus]} ${REQUEST_STATUS_CLASSES[knownStatus]}`
    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${classes} ${className}`}>
      {label ?? (knownStatus ? REQUEST_STATUS_LABELS[knownStatus] : formatRequestStatus(status))}
    </span>
  );
}
