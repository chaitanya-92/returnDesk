"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  IndianRupee,
  MoreHorizontal,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";

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
import { showToast } from "@/components/ui/toaster";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import { formatCurrencyINR } from "@/features/requests/presentation";
import type { RequestRecord } from "@/features/requests/api/requests-api";
import {
  filterAndSortRefunds,
  REFUND_STATUS_FILTERS,
  selectRefundRequests,
  summarizeRefunds,
  type RefundRequest,
  type RefundSortField,
  type RefundStatus,
  type SortOrder,
} from "@/features/refunds/refund-utils";
import { RefundSummaryCards } from "@/features/refunds/components/refund-summary-cards";
import { RefundTable } from "@/features/refunds/components/refund-table";
import { RefundConfirmationDialog } from "@/features/refunds/components/refund-confirmation-dialog";

const PAGE_SIZE = 10;

function getInitialStatusFilter(): RefundStatus {
  if (typeof window === "undefined") {
    return "ALL";
  }

  const status = new URLSearchParams(window.location.search).get("status");

  if (status === "APPROVED" || status === "COMPLETED") {
    return status;
  }

  return "ALL";
}

const formatCurrency = formatCurrencyINR;

export default function RefundsPage() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState("");
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<RefundStatus>(
    getInitialStatusFilter,
  );

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<RefundRequest | null>(
    null,
  );
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [sortBy, setSortBy] = useState<RefundSortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        page: "1",
        pageSize: "100",
      });

      const payload = await requestsApi.list(params);

      const items: RequestRecord[] = payload.data.items ?? [];

      setRows(
        selectRefundRequests(items),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load refunds");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const processed = async (refund: RefundRequest) => {
    setBusyId(refund.id);
    setError("");
    setToast("");

    try {
      await requestsApi.transition(refund.id, {
        status: "COMPLETED",
        note: "Refund marked as processed by operations.",
      });

      setToast(`Refund ${refund.reference} marked processed.`);

      showToast("Refund marked processed", "success", refund.reference);

      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update refund";

      setError(message);
      showToast(message, "error");
    } finally {
      setBusyId("");
    }
  };

  const filtered = useMemo(() => filterAndSortRefunds(rows, statusFilter, sortBy, sortOrder), [rows, statusFilter, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, pageCount);

  const shown = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const { awaitingCount, processedCount, totalRefundValue } = useMemo(() => summarizeRefunds(rows), [rows]);



  const handleSort = (field: RefundSortField) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortOrder(field === "updatedAt" ? "desc" : "asc");
  };

  const sortIndicator = (field: RefundSortField) => {
    if (sortBy !== field) {
      return <span>↕</span>;
    }

    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <AppShell>
      <div aria-busy={loading} className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
          <div>
            <h1 className="text-3xl font-semibold">Refund requests</h1>

            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Track refunds approved by operations and record processing
              completion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950"
          >
            {error}
          </div>
        )}

        {toast && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"
          >
            <CheckCircle2 className="mr-2 inline" size={16} />
            {toast}
          </div>
        )}

        <RefundSummaryCards
          values={{ awaitingCount, processedCount, totalRefundValue }}
          loading={loading}
          onSelectStatus={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xl">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736A]"
            />

            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search refund reference, customer, or order…"
              aria-label="Search refund requests"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E] placeholder:text-[#77736A] focus:border-[#D7A400] focus:outline-none dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
            />
          </div>
        </div>

        <RefundTable
          shown={shown}
          filtered={filtered}
          loading={loading}
          query={query}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filterMenuOpen={filterMenuOpen}
          setFilterMenuOpen={setFilterMenuOpen}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          sortIndicator={sortIndicator}
          actionMenuId={actionMenuId}
          setActionMenuId={setActionMenuId}
          busyId={busyId}
          setConfirmRefund={setConfirmRefund}
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>

      <RefundConfirmationDialog
        refund={confirmRefund}
        busyId={busyId}
        onClose={() => setConfirmRefund(null)}
        onConfirm={processed}
      />
    </AppShell>
  );
}
