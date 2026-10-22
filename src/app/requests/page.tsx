"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormikHelpers } from "formik";
import {
  Filter,
  Search,
} from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/app-shell";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import { formatRequestStatus } from "@/features/requests/presentation";
import { Pagination } from "@/components/requests/pagination";
import type { RequestDraft } from "@/features/requests/types";

import type { RequestRecord } from "@/features/requests/api/requests-api";
import { RequestTableSection, type RequestRow } from "@/features/requests/components/request-table-section";
import { RequestPageHeader } from "@/features/requests/components/request-page-header";

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
        <RequestPageHeader
          loading={loading}
          error={error}
          toast={toast}
          setToast={setToast}
          load={load}
          showCreate={showCreate}
          setShowCreate={setShowCreate}
          saving={saving}
          fieldClassName={field}
          onCreateRequest={createRequest}
        />
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
