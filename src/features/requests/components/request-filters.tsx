"use client";

import { Search } from "lucide-react";
import { REQUEST_REASON_OPTIONS } from "@/features/requests/request-form-data";

type RequestFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  createdDate: string;
  onCreatedDateChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
};

export function RequestFilters({
  query,
  onQueryChange,
  createdDate,
  onCreatedDateChange,
  reason,
  onReasonChange,
}: RequestFiltersProps) {
  const fieldClass =
    "min-h-10 rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20 [color-scheme:light]";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xl">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search reference, customer, order, item…"
          aria-label="Search requests"
          className={`${fieldClass} w-full pl-9 pr-3`}
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--muted-foreground))]">
        Reason
        <select
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          aria-label="Filter requests by reason"
          className={fieldClass}
        >
          <option value="ALL">All reasons</option>
          {REQUEST_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--muted-foreground))]">
        Created on
        <input
          type="date"
          aria-label="Filter requests by creation date"
          value={createdDate}
          onChange={(event) => onCreatedDateChange(event.target.value)}
          className={fieldClass}
        />
      </label>

      {(createdDate || reason !== "ALL" || query) && (
        <button
          type="button"
          onClick={() => {
            onQueryChange("");
            onCreatedDateChange("");
            onReasonChange("ALL");
          }}
          className="min-h-10 rounded-lg px-3 text-xs font-semibold text-[#7A5B00] hover:bg-[#FFF9DC]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
