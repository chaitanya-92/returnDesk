"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  type FormikHelpers,
} from "formik";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Filter,
  Inbox,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/app-shell";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContainer,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/ui/data-table";
import { requestDraftSchema } from "@/features/requests/schemas";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import { formatDate, formatRequestStatus } from "@/features/requests/presentation";
import { StatusBadge } from "@/components/requests/status-badge";
import { Pagination } from "@/components/requests/pagination";
import { ReasonSelect } from "@/features/requests/components/reason-select";
import type { RequestDraft } from "@/features/requests/types";
import {
  EMPTY_REQUEST_DRAFT as initialDraft,
  REQUEST_REASON_OPTIONS as reasons,
  REQUEST_STATUS_FILTER_OPTIONS as statuses,
} from "@/features/requests/request-form-data";
import type { RequestRecord } from "@/features/requests/api/requests-api";

type RequestRow = Pick<
  RequestRecord,
  "id" | "reference" | "orderNumber" | "itemName" | "customerName" |
  "customerEmail" | "reason" | "status" | "createdAt" | "quantity"
>;
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
              <Formik<RequestDraft>
                initialValues={initialDraft}
                validationSchema={requestDraftSchema}
                onSubmit={createRequest}
              >
                {({ isSubmitting, isValid, dirty }) => (
                  <Form
                    className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
                    noValidate
                  >
                    <label className="space-y-1.5 text-xs font-medium">
                      Order number *
                      <Field
                        name="orderNumber"
                        placeholder="e.g. ORD-52001"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="orderNumber"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Order item ID *
                      <Field
                        name="orderItemId"
                        placeholder="e.g. ORD-52001-01"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="orderItemId"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Item name *
                      <Field
                        name="itemName"
                        placeholder="e.g. Everyday Bottle 750 ml"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="itemName"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Item SKU *
                      <Field
                        name="itemSku"
                        placeholder="e.g. BOT-750-BLK"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="itemSku"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Quantity *
                      <Field
                        name="quantity"
                        type="number"
                        min="1"
                        max="1000"
                        className={field}
                      />
                      <ErrorMessage
                        name="quantity"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Customer name *
                      <Field
                        name="customerName"
                        placeholder="Full name"
                        autoComplete="name"
                        className={field}
                      />
                      <ErrorMessage
                        name="customerName"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Customer email *
                      <Field
                        name="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        autoComplete="email"
                        className={field}
                      />
                      <ErrorMessage
                        name="customerEmail"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <div className="space-y-1.5 text-xs font-medium">
                      <label htmlFor="reason-menu-trigger" className="block">
                        Return reason *
                      </label>
                      <ReasonSelect />
                    </div>
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2 lg:col-span-3">
                      Description *
                      <Field
                        as="textarea"
                        name="description"
                        placeholder="Describe the issue and any relevant details…"
                        maxLength={2000}
                        rows={3}
                        className={field}
                      />
                      <ErrorMessage
                        name="description"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
                      <button
                        type="submit"
                        disabled={saving || isSubmitting || !isValid || !dirty}
                        className="rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving || isSubmitting
                          ? "Creating…"
                          : "Create request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        disabled={saving}
                        className="rounded-lg border border-[#DCDCD5] bg-white px-4 py-2.5 text-sm text-[#23221E] hover:bg-[#F7F7F5] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
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
        <section className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white text-[#23221E] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]">
          <DataTableContainer>
            <DataTable className="w-full min-w-[720px] text-left text-sm text-[#23221E] dark:text-[rgb(var(--foreground))]">
              <DataTableHeader className="bg-[#FFF7D6] text-[10px] uppercase tracking-[0.09em] text-[#4C3B08] dark:bg-[#342C19] dark:text-[#F4D76B]">
                <DataTableRow>
                  <DataTableHead className="px-3 py-2.5">
                    <span className="mb-1 block">Request</span>
                  </DataTableHead>
                  <DataTableHead className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("customerName");
                        setSortOrder((v) =>
                          sortBy === "customerName"
                            ? v === "asc"
                              ? "desc"
                              : "asc"
                            : "asc",
                        );
                      }}
                      className="inline-flex items-center gap-2"
                    >
                      Customer{" "}
                      <span>
                        {sortBy === "customerName" ? (
                          sortOrder === "asc" ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    </button>
                  </DataTableHead>
                  <DataTableHead className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span>Reason</span>
                      <button
                        type="button"
                        aria-label="Sort by reason"
                        title="Sort by reason"
                        onClick={() => {
                          setSortBy("reason");
                          setSortOrder((v) =>
                            sortBy === "reason"
                              ? v === "asc"
                                ? "desc"
                                : "asc"
                              : "asc",
                          );
                        }}
                        className="inline-flex items-center rounded-md border border-[#E3DDC9] bg-white px-2 py-1 text-[#292821] hover:bg-[#FFF9DC]"
                      >
                        {sortBy === "reason" ? (
                          sortOrder === "asc" ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </button>
                    </div>
                  </DataTableHead>
                  <DataTableHead className="px-3 py-2.5">
                    <span className="mb-1 block">Status</span>
                    <div className="relative inline-block normal-case tracking-normal">
                      <button
                        type="button"
                        aria-label="Filter by status"
                        title="Filter by status"
                        onClick={() => setStatusMenuOpen((v) => !v)}
                        className={
                          "rounded-md border p-1.5 " +
                          (status !== "ALL"
                            ? "border-[#D7A400] bg-[#FFF0A6] text-[#292821]"
                            : "border-[#E3DDC9] bg-white text-[#292821]")
                        }
                      >
                        <Filter size={14} />
                      </button>
                      {statusMenuOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border bg-white p-1.5 text-[#23221E] shadow-xl">
                          {statuses.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setStatus(s);
                                setStatusMenuOpen(false);
                                setPage(1);
                              }}
                              className={
                                "block w-full rounded px-3 py-2 text-left text-xs " +
                                (status === s
                                  ? "bg-[#FFF0A6]"
                                  : "hover:bg-[#FFF9DC]")
                              }
                            >
                              {s === "ALL" ? "All statuses" : pretty(s)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </DataTableHead>
                  <DataTableHead className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span>Created</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("createdAt");
                          setSortOrder((v) =>
                            sortBy === "createdAt"
                              ? v === "asc"
                                ? "desc"
                                : "asc"
                              : "desc",
                          );
                        }}
                        aria-label="Sort by creation date"
                        className="inline-flex items-center rounded-md border border-[#E3DDC9] bg-white px-2 py-1 text-[#292821] hover:bg-[#FFF9DC]"
                      >
                        {sortBy === "createdAt" ? (
                          sortOrder === "asc" ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </button>
                    </div>
                  </DataTableHead>
                  <DataTableHead className="px-3 py-2.5"></DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody className="divide-y divide-[rgb(var(--border))]">
                {visibleRows.map((r) => (
                  <DataTableRow
                    key={r.id}
                    onClick={() => {
                      window.location.href = "/requests/" + r.id;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        window.location.href = "/requests/" + r.id;
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={"View details for " + r.reference}
                    className="cursor-pointer bg-white text-[#23221E] hover:bg-[#FFFCF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D7A400] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))] dark:hover:bg-[#302F2A]"
                  >
                    <DataTableCell className="px-4 py-4">
                      <p className="font-semibold">{r.reference}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">
                        {r.orderNumber} · {r.itemName}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="px-4 py-4">
                      <p>{r.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">
                        {r.customerEmail}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="px-4 py-4">{pretty(r.reason)}</DataTableCell>
                    <DataTableCell className="px-4 py-4">
                      <StatusBadge status={r.status} />
                    </DataTableCell>
                    <DataTableCell className="px-4 py-4 text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">
                      {formatDate(r.createdAt)}
                    </DataTableCell>
                    <DataTableCell className="px-4 py-4">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          aria-label={"Actions for " + r.reference}
                          aria-haspopup="menu"
                          aria-expanded={actionMenuId === r.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActionMenuId((current) =>
                              current === r.id ? null : r.id,
                            );
                          }}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E1DFD6] bg-white text-[#4B493F] shadow-sm hover:bg-[#FFF9DC] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/50 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {actionMenuId === r.id && (
                          <>
                            <button
                              type="button"
                              aria-label="Close actions menu"
                              tabIndex={-1}
                              onClick={() => setActionMenuId(null)}
                              className="fixed inset-0 z-40 cursor-default"
                            ></button>
                            <div
                              role="menu"
                              aria-label={"Actions for " + r.reference}
                              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
                            >
                              <a
                                role="menuitem"
                                href={"/requests/" + r.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setActionMenuId(null);
                                }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#FFF9DC] dark:hover:bg-[rgb(var(--muted))]"
                              >
                                <Eye size={15} /> View details{" "}
                                <ArrowUpRight size={13} className="ml-auto" />
                              </a>
                              <a
                                role="menuitem"
                                href={"/refunds"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setActionMenuId(null);
                                }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#FFF9DC] dark:hover:bg-[rgb(var(--muted))]"
                              >
                                <WalletCards size={15} /> Refund requests
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <DataTableRow>
                    <DataTableCell colSpan={6} className="px-4 py-12 text-center">
                      <Inbox className="mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">
                        {error ? "Requests unavailable" : "No requests found"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {query || status !== "ALL"
                          ? "Try changing the search or status filter."
                          : "Create your first return request to get started."}
                      </p>
                    </DataTableCell>
                  </DataTableRow>
                )}
                {loading &&
                  Array.from({ length: 5 }, (_, i) => (
                    <DataTableRow key={"skeleton-" + i} aria-hidden="true">
                      {Array.from({ length: 6 }, (_, j) => (
                        <DataTableCell key={j} className="px-4 py-5">
                          <div
                            className={
                              "h-3 animate-pulse rounded-md bg-[#EAE7DE] dark:bg-[rgb(var(--muted))] " +
                              (j === 0
                                ? "w-28"
                                : j === 1
                                  ? "w-32"
                                  : j === 2
                                    ? "w-20"
                                    : j === 3
                                      ? "w-16"
                                      : j === 4
                                        ? "w-20"
                                        : "w-8")
                            }
                          />
                          {j < 2 && (
                            <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-[#F0EEE8] dark:bg-[rgb(var(--muted))]" />
                          )}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  ))}
              </DataTableBody>
            </DataTable>
          </DataTableContainer>
          <Pagination page={page} pageCount={pageCount} total={totalRows} pageSize={pageSize} itemLabel="requests" onPageChange={setPage} />
        </section>
      </div>
    </AppShell>
  );
}
