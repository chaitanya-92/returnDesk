"use client";

import { Search } from "lucide-react";

type RequestFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  createdDate: string;
  onCreatedDateChange: (value: string) => void;
};

export function RequestFilters({
  query,
  onQueryChange,
  createdDate,
  onCreatedDateChange,
}: RequestFiltersProps) {
  const setPage = (_page: number) => {};
  return (
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xl">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                
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
                onCreatedDateChange(e.target.value);
                
              }}
              className="rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[#23221E] outline-none focus:border-[#D7A400]"
            />
          </label>
          {createdDate && (
            <button
              type="button"
              onClick={() => onCreatedDateChange("")}
              className="text-xs font-medium text-[#7A5B00] underline"
            >
              Clear date
            </button>
          )}
        </div>
  );
}
