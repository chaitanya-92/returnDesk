"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Inbox,
  MoreHorizontal,
  WalletCards,
} from "lucide-react";
import { DataTable, DataTableBody, DataTableCell, DataTableContainer, DataTableHead, DataTableHeader, DataTableRow } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/requests/status-badge";
import { REQUEST_STATUS_FILTER_OPTIONS } from "@/features/requests/request-form-data";
import { formatDate, formatRequestStatus } from "@/features/requests/presentation";
import type { RequestRecord } from "@/features/requests/api/requests-api";

export type RequestRow = Pick<
  RequestRecord,
  "id" | "reference" | "orderNumber" | "itemName" | "customerName" |
  "customerEmail" | "reason" | "status" | "createdAt" | "quantity"
>;

type RequestTableSectionProps = {
  visibleRows: RequestRow[];
  loading: boolean;
  error: string;
  query: string;
  status: string;
  statusMenuOpen: boolean;
  actionMenuId: string | null;
  sortBy: "createdAt" | "customerName" | "status" | "reason" | "reference";
  sortOrder: "asc" | "desc";
  setSortBy: (value: RequestTableSectionProps["sortBy"]) => void;
  setSortOrder: (value: "asc" | "desc" | ((current: "asc" | "desc") => "asc" | "desc")) => void;
  setStatusMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  setStatus: (value: any) => void;
  setPage: (value: number) => void;
  setActionMenuId: (value: string | null | ((current: string | null) => string | null)) => void;
};

const pretty = formatRequestStatus;
const statuses = REQUEST_STATUS_FILTER_OPTIONS;

export function RequestTableSection({
  visibleRows,
  loading,
  error,
  query,
  status,
  statusMenuOpen,
  actionMenuId,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  setStatusMenuOpen,
  setStatus,
  setPage,
  setActionMenuId,
}: RequestTableSectionProps) {
  return (
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
  );
}
