import type { RequestRecord } from "@/features/requests/api/requests-api";

export type RefundStatus = "ALL" | "APPROVED" | "COMPLETED";
export type RefundSortField = "customerName" | "refundAmount" | "updatedAt";
export type SortOrder = "asc" | "desc";

export type RefundRequest = Pick<
  RequestRecord,
  | "id"
  | "reference"
  | "orderNumber"
  | "itemName"
  | "customerName"
  | "customerEmail"
  | "status"
  | "resolution"
  | "refundAmount"
  | "updatedAt"
>;

export type RefundSummary = {
  awaitingCount: number;
  processedCount: number;
  totalRefundValue: number;
};

const REFUNDABLE_STATUSES = new Set(["APPROVED", "COMPLETED"]);

/** Select requests that represent an actual refund workflow. */
export function selectRefundRequests(requests: RequestRecord[]): RefundRequest[] {
  return requests.filter(
    (request) =>
      request.resolution === "REFUND" && REFUNDABLE_STATUSES.has(request.status),
  );
}

function compareRefunds(
  left: RefundRequest,
  right: RefundRequest,
  field: RefundSortField,
): number {
  switch (field) {
    case "customerName":
      return left.customerName.localeCompare(right.customerName, undefined, {
        sensitivity: "base",
      });
    case "refundAmount":
      return Number(left.refundAmount ?? 0) - Number(right.refundAmount ?? 0);
    case "updatedAt":
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
  }
}

/** Return a new sorted array; callers' state is never mutated. */
export function filterAndSortRefunds(
  refunds: RefundRequest[],
  status: RefundStatus,
  sortBy: RefundSortField,
  sortOrder: SortOrder,
): RefundRequest[] {
  return refunds
    .filter((refund) => status === "ALL" || refund.status === status)
    .slice()
    .sort((left, right) => {
      const comparison = compareRefunds(left, right, sortBy);
      return sortOrder === "asc" ? comparison : -comparison;
    });
}

export function summarizeRefunds(refunds: RefundRequest[]): RefundSummary {
  return refunds.reduce<RefundSummary>(
    (summary, refund) => ({
      awaitingCount:
        summary.awaitingCount + Number(refund.status === "APPROVED"),
      processedCount:
        summary.processedCount + Number(refund.status === "COMPLETED"),
      totalRefundValue: summary.totalRefundValue + Number(refund.refundAmount ?? 0),
    }),
    { awaitingCount: 0, processedCount: 0, totalRefundValue: 0 },
  );
}

export const REFUND_STATUS_FILTERS: ReadonlyArray<{
  value: RefundStatus;
  label: string;
}> = [
  { value: "ALL", label: "All refunds" },
  { value: "APPROVED", label: "Awaiting" },
  { value: "COMPLETED", label: "Processed" },
];
