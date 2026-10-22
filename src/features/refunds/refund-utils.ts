import type { RequestRecord } from "@/features/requests/api/requests-api";
export type RefundStatus = "ALL" | "APPROVED" | "COMPLETED";
export type RefundSortField = "customerName" | "refundAmount" | "updatedAt";
export type SortOrder = "asc" | "desc";
export type RefundRequest = Pick<RequestRecord, "id" | "reference" | "orderNumber" | "itemName" | "customerName" | "customerEmail" | "status" | "resolution" | "refundAmount" | "updatedAt">;
export type RefundSummary = { awaitingCount: number; processedCount: number; totalRefundValue: number };

export function selectRefundRequests(requests: RequestRecord[]): RefundRequest[] {
  return requests.filter((request) => request.resolution === "REFUND" && (request.status === "APPROVED" || request.status === "COMPLETED"));
}

export function filterAndSortRefunds(refunds: RefundRequest[], status: RefundStatus, sortBy: RefundSortField, sortOrder: SortOrder): RefundRequest[] {
  return refunds.filter((refund) => status === "ALL" || refund.status === status).slice().sort((a, b) => {
    let comparison = 0;
    if (sortBy === "customerName") comparison = a.customerName.localeCompare(b.customerName, undefined, { sensitivity: "base" });
    else if (sortBy === "refundAmount") comparison = Number(a.refundAmount ?? 0) - Number(b.refundAmount ?? 0);
    else comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortOrder === "asc" ? comparison : -comparison;
  });
}

export function summarizeRefunds(refunds: RefundRequest[]): RefundSummary {
  return refunds.reduce<RefundSummary>((summary, refund) => {
    if (refund.status === "APPROVED") summary.awaitingCount += 1;
    if (refund.status === "COMPLETED") summary.processedCount += 1;
    summary.totalRefundValue += Number(refund.refundAmount ?? 0);
    return summary;
  }, { awaitingCount: 0, processedCount: 0, totalRefundValue: 0 });
}
