export const REQUEST_STATUSES = ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"] as const;
export const RESOLUTION_TYPES = ["REFUND", "REPLACEMENT", "STORE_CREDIT"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type ResolutionType = (typeof RESOLUTION_TYPES)[number];

export const ACTIVE_STATUSES: RequestStatus[] = ["OPEN", "IN_REVIEW", "APPROVED"];

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

export type RequestDraft = {
  orderNumber: string;
  orderItemId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  reason: string;
  description: string;
};

export type RequestDetailsUpdate = Partial<RequestDraft>;
