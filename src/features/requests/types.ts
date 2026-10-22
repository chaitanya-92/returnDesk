export const REQUEST_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "APPROVED",
  "PROCESSING",
  "REJECTED",
  "COMPLETED",
] as const;
export const RESOLUTION_TYPES = [
  "REFUND",
  "REPLACEMENT",
  "STORE_CREDIT",
] as const;

export const REQUEST_REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "WRONG_SIZE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "MISSING_PARTS",
  "OTHER",
] as const;

export type RequestReason = (typeof REQUEST_REASONS)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestStatusFilter = "ALL" | RequestStatus;
export type ResolutionType = (typeof RESOLUTION_TYPES)[number];

export type RequestResolution = {
  resolution: ResolutionType | undefined;
  refundAmount: number | null;
};

export const ACTIVE_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "APPROVED",
] as const satisfies readonly RequestStatus[];

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

export type RequestDraft = {
  orderNumber: string;
  orderItemId: string;
  itemName: string;
  itemSku: string;
  productPrice?: number | null;
  quantity: number;
  customerName: string;
  customerEmail: string;
  reason: RequestReason;
  description: string;
};

export type RequestDetailsUpdate = Partial<RequestDraft>;
