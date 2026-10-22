"use client";

import { ArrowUpRight, CheckCircle2, Eye, MoreHorizontal, WalletCards } from "lucide-react";
import Link from "next/link";
import { DataTable, DataTableBody, DataTableCell, DataTableContainer, DataTableHead, DataTableHeader, DataTableRow } from "@/components/ui/data-table";
import { Pagination } from "@/components/requests/pagination";
import { StatusBadge } from "@/components/requests/status-badge";
import { formatCurrencyINR, formatDate } from "@/features/requests/presentation";
import type { RefundRequest, RefundSortField, RefundStatus, SortOrder } from "@/features/refunds/refund-utils";

type RefundTableProps = {
  shown: RefundRequest[];
  filtered: RefundRequest[];
  loading: boolean;
  query: string;
  statusFilter: RefundStatus;
  setStatusFilter: (status: RefundStatus) => void;
  filterMenuOpen: boolean;
  setFilterMenuOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  sortBy: RefundSortField;
  sortOrder: SortOrder;
  handleSort: (field: RefundSortField) => void;
  sortIndicator: (field: RefundSortField) => React.ReactNode;
  actionMenuId: string | null;
  setActionMenuId: (id: string | null | ((current: string | null) => string | null)) => void;
  busyId: string;
  setConfirmRefund: (refund: RefundRequest | null) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

const PAGE_SIZE = 10;
const formatCurrency = formatCurrencyINR;

export function RefundTable({
  shown, filtered, loading, query, statusFilter, setStatusFilter,
  filterMenuOpen, setFilterMenuOpen, sortBy, sortOrder, handleSort,
  sortIndicator, actionMenuId, setActionMenuId, busyId, setConfirmRefund,
  page, pageCount, onPageChange,
}: RefundTableProps) {
  return (
<section
          id="refund-table"
          className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white text-[#23221E] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
        >
          <DataTableContainer>
            <DataTable className="w-full min-w-[780px] text-left text-sm">
              <DataTableHeader className="bg-[#FFF9DC] text-[10px] uppercase tracking-wider text-[#5B4A10] dark:bg-[#342C19] dark:text-[#F4D76B]">
                <DataTableRow>
                  <DataTableHead className="px-3 py-2.5">
                    <span className="mb-1 block">Refund / order</span>
                  </DataTableHead>

                  <DataTableHead className="px-3 py-2.5 align-middle">
                    <button
                      type="button"
                      onClick={() => handleSort("customerName")}
                      className="inline-flex items-center gap-1.5 normal-case tracking-normal"
                    >
                      Customer
                      {sortIndicator("customerName")}
                    </button>
                  </DataTableHead>

                  <DataTableHead className="px-3 py-2.5 align-middle">
                    <button
                      type="button"
                      onClick={() => handleSort("refundAmount")}
                      className="inline-flex items-center gap-1.5 normal-case tracking-normal"
                    >
                      Amount
                      {sortIndicator("refundAmount")}
                    </button>
                  </DataTableHead>

                  <DataTableHead className="px-3 py-2.5 align-middle">
                    <span>Status</span>

                    <div className="relative mt-1 normal-case tracking-normal">
                      <button
                        type="button"
                        aria-label="Filter refunds by status"
                        title="Filter refunds by status"
                        aria-expanded={filterMenuOpen}
                        onClick={() => setFilterMenuOpen((open) => !open)}
                        className={`inline-flex size-7 items-center justify-center rounded-md border ${
                          statusFilter !== "ALL"
                            ? "border-[#D7A400] bg-[#FFF0A6] text-[#292821]"
                            : "border-[#E3DDC9] bg-white text-[#292821]"
                        }`}
                      >
                        <Filter size={14} />
                      </button>

                      {filterMenuOpen && (
                        <>
                          <button
                            type="button"
                            aria-label="Close status filter"
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setFilterMenuOpen(false)}
                          />

                          <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border bg-white p-1.5 text-[#23221E] shadow-xl">
                            {REFUND_STATUS_FILTERS.map((filter) => (
                              <button
                                key={filter.value}
                                type="button"
                                onClick={() => {
                                  setStatusFilter(filter.value);
                                  setFilterMenuOpen(false);
                                  setPage(1);
                                }}
                                className={`block w-full rounded px-3 py-2 text-left text-xs ${
                                  statusFilter === filter.value
                                    ? "bg-[#FFF0A6]"
                                    : "hover:bg-[#FFF9DC]"
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </DataTableHead>

                  <DataTableHead className="px-3 py-2.5 align-middle">
                    <button
                      type="button"
                      onClick={() => handleSort("updatedAt")}
                      className="inline-flex items-center gap-1.5 normal-case tracking-normal"
                    >
                      Updated
                      {sortIndicator("updatedAt")}
                    </button>
                  </DataTableHead>

                  <DataTableHead className="px-3 py-2.5">Action</DataTableHead>
                </DataTableRow>
              </DataTableHeader>

              <DataTableBody className="divide-y divide-[rgb(var(--border))]">
                {shown.map((refund) => (
                  <DataTableRow
                    key={refund.id}
                    onClick={() => {
                      window.location.assign(`/requests/${refund.id}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        window.location.assign(`/requests/${refund.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`View details for ${refund.reference}`}
                    className="cursor-pointer bg-white hover:bg-[#FFFCF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D7A400] dark:bg-[rgb(var(--card))] dark:hover:bg-[#302F2A]"
                  >
                    <DataTableCell className="px-4 py-4">
                      <b>{refund.reference}</b>

                      <p className="mt-1 text-xs text-[#6B685F] dark:text-[rgb(var(--muted-foreground))]">
                        {refund.orderNumber} · {refund.itemName}
                      </p>
                    </DataTableCell>

                    <DataTableCell className="px-4 py-4">
                      {refund.customerName}

                      <p className="text-xs text-[#6B685F] dark:text-[rgb(var(--muted-foreground))]">
                        {refund.customerEmail}
                      </p>
                    </DataTableCell>

                    <DataTableCell className="px-4 py-4 font-semibold">
                      {refund.refundAmount == null
                        ? "—"
                        : formatCurrency(Number(refund.refundAmount))}
                    </DataTableCell>

                    <DataTableCell className="px-4 py-4">
                      <StatusBadge status={refund.status} label={refund.status === "APPROVED" ? "Awaiting processing" : "Processed"} />
                    </DataTableCell>

                    <DataTableCell className="px-4 py-4 text-xs">
                      {formatDate(refund.updatedAt)}
                    </DataTableCell>

                    <DataTableCell className="px-4 py-4">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          aria-label={`Actions for ${refund.reference}`}
                          aria-haspopup="menu"
                          aria-expanded={actionMenuId === refund.id}
                          onClick={(event) => {
                            event.stopPropagation();

                            setActionMenuId((current) =>
                              current === refund.id ? null : refund.id,
                            );
                          }}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E1DFD6] bg-white text-[#4B493F] shadow-sm hover:bg-[#FFF9DC] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/50 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {actionMenuId === refund.id && (
                          <>
                            <button
                              type="button"
                              aria-label="Close actions menu"
                              tabIndex={-1}
                              onClick={() => setActionMenuId(null)}
                              className="fixed inset-0 z-40 cursor-default"
                            />

                            <div
                              role="menu"
                              aria-label={`Actions for ${refund.reference}`}
                              className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
                            >
                              <Link
                                role="menuitem"
                                href={`/requests/${refund.id}`}
                                onClick={() => setActionMenuId(null)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#FFF9DC] dark:hover:bg-[rgb(var(--muted))]"
                              >
                                <Eye size={15} />
                                View details
                                <ArrowUpRight size={13} className="ml-auto" />
                              </Link>

                              {refund.status === "APPROVED" && (
                                <button
                                  role="menuitem"
                                  type="button"
                                  disabled={busyId === refund.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setActionMenuId(null);
                                    setConfirmRefund(refund);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#FFF9DC] disabled:opacity-50 dark:hover:bg-[rgb(var(--muted))]"
                                >
                                  <CheckCircle2 size={15} />
                                  {busyId === refund.id
                                    ? "Updating…"
                                    : "Mark processed"}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}

                {!loading && shown.length === 0 && (
                  <DataTableRow>
                    <DataTableCell colSpan={6} className="px-4 py-12 text-center">
                      <WalletCards className="mx-auto mb-2" />

                      <p>No refund requests found</p>

                      <p className="mt-1 text-xs">
                        Refunds appear after a request is approved with the
                        Refund resolution.
                      </p>
                    </DataTableCell>
                  </DataTableRow>
                )}

                {loading &&
                  Array.from({ length: 5 }, (_, rowIndex) => (
                    <DataTableRow key={`refund-skeleton-${rowIndex}`} aria-hidden="true">
                      {Array.from({ length: 6 }, (_, columnIndex) => (
                        <DataTableCell key={columnIndex} className="px-4 py-5">
                          <div
                            className={`h-3 animate-pulse rounded-md bg-[#EAE7DE] dark:bg-[rgb(var(--muted))] ${
                              columnIndex === 0
                                ? "w-28"
                                : columnIndex === 1
                                  ? "w-32"
                                  : columnIndex === 2
                                    ? "w-20"
                                    : columnIndex === 3
                                      ? "w-24"
                                      : columnIndex === 4
                                        ? "w-20"
                                        : "w-8"
                            }`}
                          />

                          {columnIndex < 2 && (
                            <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-[#F0EEE8] dark:bg-[rgb(var(--muted))]" />
                          )}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  ))}
              </DataTableBody>
            </DataTable>
          </DataTableContainer>

          <Pagination
            page={currentPage}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="refunds"
            onPageChange={setPage}
          />
        </section>
  );
}
