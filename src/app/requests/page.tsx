"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormikHelpers } from "formik";

import { showToast } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/app-shell";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import { Pagination } from "@/components/requests/pagination";
import type { RequestDraft, RequestStatusFilter } from "@/features/requests/types";

import { RequestTableSection, type RequestRow } from "@/features/requests/components/request-table-section";
import { RequestPageHeader } from "@/features/requests/components/request-page-header";
import { RequestFilters } from "@/features/requests/components/request-filters";


export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);

  const [statuses, setStatuses] = useState<RequestStatusFilter[]>([]);
  const [resolutionView, setResolutionView] = useState<"all" | "refunds" | "store-credits" | "replacements">("all");
  const [statusReady, setStatusReady] = useState(false);
  const requestSequence = useRef(0);
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
  const [reasons, setReasons] = useState<string[]>([]);
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
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      statuses.forEach((value) => params.append("status", value));
      if (resolutionView !== "all") params.set("resolution", resolutionView === "refunds" ? "REFUND" : resolutionView === "store-credits" ? "STORE_CREDIT" : "REPLACEMENT");
      reasons.forEach((value) => params.append("reason", value));
      if (createdDate) params.set("date", createdDate);
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      const payload = await requestsApi.list(params);
      if (requestId !== requestSequence.current) return;
      setRows(Array.isArray(payload.data.items) ? payload.data.items : []);
      setTotalRows(Number(payload.data.total ?? 0));
    } catch (e) {
      if (requestId === requestSequence.current) {
        setError(e instanceof Error ? e.message : "Could not load return requests.");
      }
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [
    statuses,
    resolutionView,
    debouncedQuery,
    reasons,
    createdDate,
    page,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const allowed: RequestStatusFilter[] = ["OPEN", "IN_REVIEW", "APPROVED", "PROCESSING", "REJECTED", "COMPLETED"];
    const initialStatus = params.get("status");
    const initialView = params.get("view");
    if (initialView === "refunds" || initialView === "store-credits" || initialView === "replacements") setResolutionView(initialView);
    const restoredStatuses = params.getAll("statusFilter").filter((value): value is RequestStatusFilter => allowed.includes(value as RequestStatusFilter));
    setStatuses(restoredStatuses.length ? restoredStatuses : initialStatus && allowed.includes(initialStatus as RequestStatusFilter) ? [initialStatus as RequestStatusFilter] : []);
    setReasons(params.getAll("reasonFilter"));
    setCreatedDate(params.get("createdDate") ?? "");
    setQuery(params.get("q") ?? "");
    const sortField = params.get("sortBy");
    const validSortFields = ["createdAt", "customerName", "status", "reason", "reference"];
    if (sortField && validSortFields.includes(sortField)) setSortBy(sortField as "createdAt" | "customerName" | "status" | "reason" | "reference");
    const direction = params.get("sortOrder");
    if (direction === "asc" || direction === "desc") setSortOrder(direction);
    const initialPage = Number(params.get("page"));
    if (Number.isInteger(initialPage) && initialPage > 0) setPage(initialPage);
    setStatusReady(true);
  }, []);

  useEffect(() => {
    if (!statusReady) return;
    const params = new URLSearchParams();
    statuses.forEach((value) => params.append("statusFilter", value));
    reasons.forEach((value) => params.append("reasonFilter", value));
    if (createdDate) params.set("createdDate", createdDate);
    if (resolutionView !== "all") params.set("view", resolutionView);
    if (query.trim()) params.set("q", query.trim());
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page > 1) params.set("page", String(page));
    const next = params.toString();
    const current = window.location.search.slice(1);
    if (next !== current) window.history.replaceState(null, "", next ? window.location.pathname + "?" + next : window.location.pathname);
  }, [statusReady, statuses, reasons, createdDate, query, sortBy, sortOrder, page, resolutionView]);

  useEffect(() => {
    if (statusReady) void load();
  }, [load, statusReady]);
  useEffect(() => {
    setPage(1);
  }, [query, statuses, reasons, createdDate, sortBy, sortOrder, resolutionView]);
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
showToast("Could not create request", "error", message);
    } finally {
      setSaving(false);
      helpers.setSubmitting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const visibleRows = loading ? [] : rows;
  const field =
    "w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2.5 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20";
  return (
    <AppShell>
      <div aria-busy={loading} className="space-y-6">
        <RequestPageHeader
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
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Request views">
          {[{value:"all",label:"All requests"},{value:"refunds",label:"Refunds"},{value:"store-credits",label:"Store credits"},{value:"replacements",label:"Replacements"}].map((view) => (
            <button key={view.value} type="button" role="tab" aria-selected={resolutionView === view.value} onClick={() => { setResolutionView(view.value as typeof resolutionView); setPage(1); }} className={"rounded-lg border px-4 py-2 text-sm font-medium transition " + (resolutionView === view.value ? "border-[#D7A400] bg-[#FFF4C2] text-[#5B4600]" : "border-[rgb(var(--border))] bg-white hover:bg-[#FFFCF0]")}>{view.label}</button>
          ))}
        </div>
        <RequestFilters
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          createdDate={createdDate}
          onReasonsChange={(value) => { setReasons(value); setPage(1); }}
          reasons={reasons}
          onCreatedDateChange={(value) => { setCreatedDate(value); setPage(1); }}
          statuses={statuses}
          onStatusesChange={(value) => { setStatuses(value); setPage(1); }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={(value) => { setSortBy(value); setPage(1); }}
          onSortOrderChange={(value) => { setSortOrder(value); setPage(1); }}
        />
        <RequestTableSection
          visibleRows={visibleRows}
          loading={loading}
          error={error}
          query={query}
          status={statuses.length === 1 ? statuses[0] : "ALL"}
          actionMenuId={actionMenuId}
          setActionMenuId={setActionMenuId}
        />
        <Pagination page={page} pageCount={pageCount} total={totalRows} pageSize={pageSize} itemLabel="requests" onPageChange={setPage} />
      </div>
    </AppShell>
  );
}
