"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ArrowDownWideNarrow, ChevronDown, X } from "lucide-react";
import { REQUEST_REASON_OPTIONS } from "@/features/requests/request-form-data";
import { REQUEST_STATUS_FILTER_OPTIONS } from "@/features/requests/request-form-data";
import type { RequestStatusFilter } from "@/features/requests/types";

type SortBy = "createdAt" | "customerName" | "status" | "reason" | "reference";
type RequestFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  createdDate: string;
  onCreatedDateChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  status: RequestStatusFilter;
  onStatusChange: (value: RequestStatusFilter) => void;
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: SortBy) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
};

export function RequestFilters({
  query, onQueryChange, createdDate, onCreatedDateChange, reason, onReasonChange,
  status, onStatusChange, sortBy, sortOrder, onSortByChange, onSortOrderChange,
}: RequestFiltersProps) {
  const [open, setOpen] = useState(false);
  const fieldClass = "min-h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2.5 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20 [color-scheme:light]";
  const activeCount = [status !== "ALL", reason !== "ALL", Boolean(createdDate)].filter(Boolean).length;
  const clear = () => {
    onQueryChange("");
    onStatusChange("ALL");
    onReasonChange("ALL");
    onCreatedDateChange("");
    onSortByChange("createdAt");
    onSortOrderChange("desc");
  };

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-white p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search reference, customer, order, item…" aria-label="Search requests"
            className={fieldClass + " pl-9"} />
        </div>
        <div className="relative">
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}
            aria-controls="request-filter-panel"
            className={"inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition " +
              (open || activeCount ? "border-[#D7A400] bg-[#FFF7D6] text-[#5B4600]" : "border-[rgb(var(--border))] bg-white text-[#343229] hover:bg-[#FFFCF0]")}>
            <SlidersHorizontal size={16} /> Filter
            {activeCount > 0 && <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#D7A400] text-[11px] text-white">{activeCount}</span>}
            <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {open && (
            <>
              <button type="button" aria-label="Close filter menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
              <div id="request-filter-panel" className="absolute right-0 top-full z-40 mt-2 w-[min( calc(100vw - 2rem), 22rem)] rounded-xl border border-[#E5E0D2] bg-white p-4 text-[#23221E] shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div><h3 className="text-sm font-semibold">Filter and sort requests</h3><p className="mt-0.5 text-xs text-gray-500">Combine options, then apply.</p></div>
                  <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-gray-100"><X size={16}/></button>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-600">Status
                    <select value={status} onChange={(event) => onStatusChange(event.target.value as RequestStatusFilter)} className={fieldClass + " mt-1.5"}>
                      {REQUEST_STATUS_FILTER_OPTIONS.map((value) => <option key={value} value={value}>{value === "ALL" ? "All statuses" : value.replaceAll("_", " ")}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-gray-600">Reason
                    <select value={reason} onChange={(event) => onReasonChange(event.target.value)} className={fieldClass + " mt-1.5"}>
                      <option value="ALL">All reasons</option>
                      {REQUEST_REASON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-gray-600">Created date
                    <input type="date" value={createdDate} onChange={(event) => onCreatedDateChange(event.target.value)} aria-label="Filter requests by creation date" className={fieldClass + " mt-1.5"}/>
                  </label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <label className="block text-xs font-medium text-gray-600">Sort by
                      <select value={sortBy} onChange={(event) => onSortByChange(event.target.value as SortBy)} className={fieldClass + " mt-1.5"}>
                        <option value="createdAt">Created date</option><option value="customerName">Customer</option><option value="status">Status</option><option value="reason">Reason</option><option value="reference">Reference</option>
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-gray-600">Order
                      <button type="button" onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} className="mt-1.5 flex min-h-10 w-24 items-center justify-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 text-sm hover:bg-gray-50">
                        <ArrowDownWideNarrow size={15} className={sortOrder === "asc" ? "rotate-180" : ""}/>{sortOrder === "asc" ? "Oldest" : "Newest"}
                      </button>
                    </label>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button type="button" onClick={clear} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-[rgb(var(--border))] px-3 text-sm font-medium hover:bg-gray-50">Clear all</button>
                  <button type="button" onClick={() => setOpen(false)} className="min-h-10 flex-1 rounded-lg bg-[#EAB308] px-3 text-sm font-semibold text-[#231F10] hover:bg-[#D9A307]">Apply filters</button>
                </div>
              </div>
            </>
          )}
        </div>
        {(query || activeCount > 0) && <button type="button" onClick={clear} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg px-3 text-xs font-semibold text-[#7A5B00] hover:bg-[#FFF9DC]"><X size={13}/> Clear all</button>}
      </div>
    </div>
  );
}
