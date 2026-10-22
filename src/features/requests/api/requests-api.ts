import { apiRequest } from "@/lib/client-api";
import type {
  RequestDraft,
  RequestReason,
  RequestStatus,
  ResolutionType,
} from "../types";

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
  reason: RequestReason;
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

const CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

function invalidateRequestCache() {
  responseCache.clear();
  inFlight.clear();
}

function cachedRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value as T);
  if (cached) responseCache.delete(key);

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const pending = request()
    .then((value) => {
      responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, pending);
  return pending;
}

const json = (method: "POST" | "PATCH", body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const requestsApi = {
  get(id: string) {
    const key = `request:${id}`;
    return cachedRequest(key, () =>
      apiRequest<RequestRecord>(`/api/requests/${encodeURIComponent(id)}`, {
        cache: "no-store",
      }),
    );
  },

  list(query: URLSearchParams, signal?: AbortSignal) {
    const key = `requests:list:${query.toString()}`;
    // Avoid sharing an in-flight request tied to a caller's abort signal.
    if (signal) {
      return apiRequest<RequestListResult>(`/api/requests?${query.toString()}`, {
        cache: "no-store",
        signal,
      });
    }
    return cachedRequest(key, () =>
      apiRequest<RequestListResult>(`/api/requests?${query.toString()}`, {
        cache: "no-store",
      }),
    );
  },

  async create(input: RequestDraft) {
    const result = await apiRequest<RequestRecord>("/api/requests", json("POST", input));
    invalidateRequestCache();
    return result;
  },

  async update(id: string, input: Partial<RequestDraft>) {
    const result = await apiRequest<RequestRecord>(
      `/api/requests/${encodeURIComponent(id)}`,
      { ...json("PATCH", input) },
    );
    invalidateRequestCache();
    return result;
  },

  async transition(id: string, input: TransitionRequestInput) {
    const result = await apiRequest<RequestRecord>(
      `/api/requests/${encodeURIComponent(id)}/transition`,
      json("POST", input),
    );
    invalidateRequestCache();
    return result;
  },

  async addNote(id: string, body: string, author = "Operations team") {
    const result = await apiRequest<RequestNote>(
      `/api/requests/${encodeURIComponent(id)}/notes`,
      json("POST", { body, author }),
    );
    invalidateRequestCache();
    return result;
  },

  async archive(id: string) {
    const result = await apiRequest<{ id: string; archived: boolean }>(
      `/api/requests/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    invalidateRequestCache();
    return result;
  },
};
