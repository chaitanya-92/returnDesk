import { REQUEST_REASONS, REQUEST_STATUSES, type RequestDraft, type RequestStatusFilter } from "./types";
import { formatRequestStatus } from "./presentation";

export const REQUEST_STATUS_FILTER_OPTIONS: readonly RequestStatusFilter[] = [
  "ALL",
  ...REQUEST_STATUSES,
];

export const REQUEST_REASON_OPTIONS = REQUEST_REASONS.map((reason) => ({
  value: reason,
  label: formatRequestStatus(reason),
}));

export const EMPTY_REQUEST_DRAFT: RequestDraft = {
  orderNumber: "",
  orderItemId: "",
  itemName: "",
  itemSku: "",
  productPrice: null,
  quantity: 1,
  customerName: "",
  customerEmail: "",
  reason: "DAMAGED",
  description: "",
};
