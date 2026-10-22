import { apiRequest } from "@/lib/client-api";
import type { RequestStatus, ResolutionType } from "../types";

export type RequestNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};

export type RequestEvent = {
  id: string;
  message: string;
  createdAt: string;
};

export type RequestRecord = {
  id: string;
  reference: string;
  orderNumber: string;
  orderItemId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  reason: string;
  description: string;
  status: RequestStatus;
  resolution: ResolutionType | null;
  refundAmount: string | number | null;
  createdAt: string;
  updatedAt: string;
  notes?: RequestNote[];
  events?: RequestEvent[];
};

export type RequestListResult = {
  items: RequestRecord[];
  total: number;
};

export type TransitionRequestInput = {
  status: RequestStatus;
  resolution?: ResolutionType;
  refundAmount?: number;
  note?: string;
};

const json = (method: "POST" | "PATCH", body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const requestsApi = {
  get(id: string) {
    return apiRequest<RequestRecord>(`/api/requests/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
  },

  list(query: URLSearchParams, signal?: AbortSignal) {
    return apiRequest<RequestListResult>(`/api/requests?${query.toString()}`, {
      cache: "no-store",
      signal,
    });
  },

  create(input: Record<string, unknown>) {
    return apiRequest<RequestRecord>("/api/requests", json("POST", input));
  },

  update(id: string, input: Record<string, unknown>) {
    return apiRequest<RequestRecord>(
      `/api/requests/${encodeURIComponent(id)}`,
      { ...json("PATCH", input) },
    );
  },

  transition(id: string, input: TransitionRequestInput) {
    return apiRequest<RequestRecord>(
      `/api/requests/${encodeURIComponent(id)}/transition`,
      json("POST", input),
    );
  },

  addNote(id: string, body: string, author = "Operations team") {
    return apiRequest<RequestNote>(
      `/api/requests/${encodeURIComponent(id)}/notes`,
      json("POST", { body, author }),
    );
  },

  archive(id: string) {
    return apiRequest<{ id: string; archived: boolean }>(
      `/api/requests/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};
