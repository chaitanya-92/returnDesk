"use client";

import {
  Inbox,
} from "lucide-react";
import { DataTable, DataTableBody, DataTableCell, DataTableContainer, DataTableHead, DataTableHeader, DataTableRow } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/requests/status-badge";
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
};

const pretty = formatRequestStatus;

export function RequestTableSection({
  visibleRows,
  loading,
  error,
  query,
  status,
}: RequestTableSectionProps) {
  return (
<section className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white text-[#23221E] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]">
          <DataTableContainer>
            <DataTable className="w-full min-w-[720px] text-left text-sm text-[#23221E] dark:text-[rgb(var(--foreground))]">
              <DataTableHeader className="bg-[#FFF7D6] text-[10px] uppercase tracking-[0.09em] text-[#4C3B08] dark:bg-[#342C19] dark:text-[#F4D76B]">
                <DataTableRow><DataTableHead className="px-3 py-2.5">Request</DataTableHead><DataTableHead className="px-3 py-2.5">Customer</DataTableHead><DataTableHead className="px-3 py-2.5">Reason</DataTableHead><DataTableHead className="px-3 py-2.5">Status</DataTableHead><DataTableHead className="px-3 py-2.5">Created</DataTableHead></DataTableRow>              </DataTableHeader>
              <DataTableBody className="divide-y divide-[rgb(var(--border))]">
                {visibleRows.map((r) => (
                  <DataTableRow
                    key={r.id}
                    onClick={() => {
                      window.location.href = "/requests/" + r.id + window.location.search;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        window.location.href = "/requests/" + r.id + window.location.search;
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

                  </DataTableRow>
                ))}
                {!loading && visibleRows.length === 0 && (
                  <DataTableRow>
                    <DataTableCell colSpan={5} className="px-4 py-12 text-center">
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
                      {Array.from({ length: 5 }, (_, j) => (
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
        </section>
  );
}
