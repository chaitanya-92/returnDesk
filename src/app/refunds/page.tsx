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
        <RefundPageToolbar
          loading={loading}
          error={error}
          toast={toast}
          onRefresh={() => void load()}
          awaitingCount={awaitingCount}
          processedCount={processedCount}
          totalRefundValue={totalRefundValue}
          onSelectStatus={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
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
