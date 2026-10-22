"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRefundTableState } from "@/features/refunds/hooks/use-refund-table-state";
import { AppShell } from "@/components/layout/app-shell";
import { showToast } from "@/components/ui/toaster";
import { requestsApi } from "@/features/requests/api/requests-api";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";
import type { RequestRecord } from "@/features/requests/api/requests-api";
import {
  filterAndSortRefunds,
  selectRefundRequests,
  summarizeRefunds,
  type RefundRequest,
} from "@/features/refunds/refund-utils";
import { RefundTable } from "@/features/refunds/components/refund-table";
import { RefundPageToolbar } from "@/features/refunds/components/refund-page-toolbar";
import { RefundConfirmationDialog } from "@/features/refunds/components/refund-confirmation-dialog";

const PAGE_SIZE = 10;

export default function RefundsPage() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState("");
  const {
    page, setPage, statusFilter, setStatusFilter,
    actionMenuId, setActionMenuId, confirmRefund, setConfirmRefund,
    filterMenuOpen, setFilterMenuOpen, sortBy, sortOrder, handleSort, sortIndicator,
  } = useRefundTableState();

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
  }, [query, statusFilter, setPage]);

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
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filterMenuOpen={filterMenuOpen}
          setFilterMenuOpen={setFilterMenuOpen}
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
