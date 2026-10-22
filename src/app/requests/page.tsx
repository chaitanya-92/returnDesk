"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormikHelpers } from "formik";
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/app-shell";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import { formatRequestStatus } from "@/features/requests/presentation";
import { Pagination } from "@/components/requests/pagination";
import { RequestCreateForm } from "@/features/requests/components/request-create-form";
import type { RequestDraft } from "@/features/requests/types";
import {
  EMPTY_REQUEST_DRAFT as initialDraft,
} from "@/features/requests/request-form-data";
import type { RequestRecord } from "@/features/requests/api/requests-api";
import { RequestTableSection, type RequestRow } from "@/features/requests/components/request-table-section";

const pretty = formatRequestStatus;

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const [status, setStatus] = useState<RequestStatusFilter>(() => {
    if (typeof window === "undefined") return "ALL";
    const initial = new URLSearchParams(window.location.search).get("status");
    return ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"].includes(
      initial ?? "",
    )
      ? initial!
      : "ALL";
  });
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalRows, setTotalRows] = useState(0);
  const [sortBy, setSortBy] = useState<
    "createdAt" | "customerName" | "status" | "reason" | "reference"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [reason, setReason] = useState("ALL");
  const [createdDate, setCreatedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (reason !== "ALL") params.set("reason", reason);
      if (createdDate) params.set("date", createdDate);
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      const payload = await requestsApi.list(params);
      setRows(Array.isArray(payload.data.items) ? payload.data.items : []);
      setTotalRows(Number(payload.data.total ?? 0));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load return requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    status,
    debouncedQuery,
    reason,
    createdDate,
    page,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [query, status, reason, createdDate, sortBy, sortOrder]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function createRequest(
    values: RequestDraft,
    helpers: FormikHelpers<RequestDraft>,
  ) {
    setSaving(true);
    setError("");
    try {
      const payload = await requestsApi.create(values);
      setShowCreate(false);
      setToast({
        type: "success",
        message: "Return request created successfully.",
      });
      showToast(
        "Return request created",
        "success",
        payload.data?.reference
          ? `Reference ${payload.data.reference}`
          : undefined,
      );
      helpers.resetForm();
      setPage(1);
      await load();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not create request.";
      setError(message);
      setToast({ type: "error", message });
      showToast("Could not create request", "error", message);
    } finally {
      setSaving(false);
      helpers.setSubmitting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const visibleRows = rows;
  const field =
    "w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2.5 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20";
  return (
    <AppShell>
      <div aria-busy={loading} className="space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-[rgb(var(--border))] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Return requests
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2 text-sm font-semibold text-[#23221E]"
            >
              <Plus size={16} /> New request
            </button>
          </div>
        </header>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            {error}
          </div>
        )}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={
              "fixed right-5 top-5 z-[100] flex w-[min(92vw,380px)] items-start gap-3 rounded-xl border p-4 shadow-xl " +
              (toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-950"
                : "border-rose-200 bg-white text-rose-950")
            }
          >
            <span
              className={
                "mt-0.5 " +
                (toast.type === "success"
                  ? "text-emerald-600"
                  : "text-rose-600")
              }
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {toast.type === "success" ? "Success" : "Something went wrong"}
              </p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {showCreate && (
          <div
            className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center overflow-y-auto bg-[#171714]/60 p-4 backdrop-blur-[3px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !saving) setShowCreate(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-request-title"
              className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-[#E8E8E3] bg-white p-5 text-[#23221E] shadow-2xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#ECECE7] pb-4">
                <div>
                  <h2
                    id="create-request-title"
                    className="text-lg font-semibold"
                  >
                    Create return request
                  </h2>
                  <p className="mt-1 text-sm text-[#6B685F]">
                    Enter the order and customer details to create a return.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  disabled={saving}
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <RequestCreateForm
                initialValues={initialDraft}
                fieldClassName={field}
                saving={saving}
                onCancel={() => setShowCreate(false)}
                onSubmit={createRequest}
              />
            </section>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xl">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference, customer, order, item…"
              aria-label="Search requests"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E] outline-none focus:border-[#D7A400] [color-scheme:light]"
            />
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-[rgb(var(--muted-foreground))] sm:ml-auto">
            Created on{" "}
            <input
              type="date"
              aria-label="Filter requests by creation date"
              value={createdDate}
              onChange={(e) => {
                setCreatedDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[#23221E] outline-none focus:border-[#D7A400]"
            />
          </label>
          {createdDate && (
            <button
              type="button"
              onClick={() => setCreatedDate("")}
              className="text-xs font-medium text-[#7A5B00] underline"
            >
              Clear date
            </button>
          )}
        </div>
        <RequestTableSection
          visibleRows={visibleRows}
          loading={loading}
          error={error}
          query={query}
          status={status}
          statusMenuOpen={statusMenuOpen}
          actionMenuId={actionMenuId}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          setStatusMenuOpen={setStatusMenuOpen}
          setStatus={setStatus}
          setPage={setPage}
          setActionMenuId={setActionMenuId}
        />
        <Pagination page={page} pageCount={pageCount} total={totalRows} pageSize={pageSize} itemLabel="requests" onPageChange={setPage} />
      </div>
    </AppShell>
  );
}
