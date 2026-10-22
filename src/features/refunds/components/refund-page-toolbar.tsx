"use client";

import { CheckCircle2, RefreshCw, Search } from "lucide-react";
import { RefundSummaryCards } from "@/features/refunds/components/refund-summary-cards";
import type { RefundStatus } from "@/features/refunds/refund-utils";

type RefundPageToolbarProps = {
  loading: boolean;
  error: string;
  toast: string;
  onRefresh: () => void;
  awaitingCount: number;
  processedCount: number;
  totalRefundValue: number;
  onSelectStatus: (status: RefundStatus) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

export function RefundPageToolbar({
  loading, error, toast, onRefresh, awaitingCount, processedCount,
  totalRefundValue, onSelectStatus, query, onQueryChange,
}: RefundPageToolbarProps) {
  const setStatusFilter = onSelectStatus;
  const setQuery = onQueryChange;
  const load = onRefresh;
  return (
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
                
              }}
              placeholder="Search refund reference, customer, or order…"
              aria-label="Search refund requests"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E] placeholder:text-[#77736A] focus:border-[#D7A400] focus:outline-none dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"
            />
          </div>
        </div>
  );
}
