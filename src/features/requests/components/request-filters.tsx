"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, X, ArrowDownWideNarrow } from "lucide-react";
import { REQUEST_REASON_OPTIONS, REQUEST_STATUS_FILTER_OPTIONS } from "@/features/requests/request-form-data";
import type { RequestStatusFilter } from "@/features/requests/types";

type SortBy = "createdAt" | "customerName" | "status" | "reason" | "reference";
type Props = {
  query: string; onQueryChange: (value: string) => void;
  createdDate: string; onCreatedDateChange: (value: string) => void;
  reasons: string[]; onReasonsChange: (value: string[]) => void;
  statuses: RequestStatusFilter[]; onStatusesChange: (value: RequestStatusFilter[]) => void;
  sortBy: SortBy; sortOrder: "asc" | "desc";
  onSortByChange: (value: SortBy) => void; onSortOrderChange: (value: "asc" | "desc") => void;
};

export function RequestFilters(props: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filterOpen && !sortOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !dropdownsRef.current?.contains(event.target)) {
        setFilterOpen(false);
        setSortOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setFilterOpen(false); setSortOpen(false); }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen, sortOpen]);
  const field = "min-h-10 rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20";
  const activeCount = props.statuses.length + props.reasons.length + Number(Boolean(props.createdDate));
  const clear = () => { props.onQueryChange(""); props.onStatusesChange([]); props.onReasonsChange([]); props.onCreatedDateChange(""); };
  const toggle = <T extends string>(values: T[], value: T, change: (next: T[]) => void) =>
    change(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  return <div className="rounded-xl border border-[rgb(var(--border))] bg-white p-3">
    <div ref={dropdownsRef} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={props.query} onChange={(e) => props.onQueryChange(e.target.value)} placeholder="Search reference, customer, order, item…" aria-label="Search requests" className={field + " w-full pl-9"}/>
      </div>
      <div className="relative">
        <button type="button" aria-expanded={filterOpen} onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }} className={"inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold " + (activeCount ? "border-[#D7A400] bg-[#FFF7D6] text-[#5B4600]" : "border-[rgb(var(--border))] hover:bg-[#FFFCF0]")}><SlidersHorizontal size={16}/> Filter {activeCount > 0 && <span className="rounded-full bg-[#D7A400] px-1.5 py-0.5 text-xs text-white">{activeCount}</span>}<ChevronDown size={14}/></button>
        {filterOpen && <div className="absolute right-0 z-40 mt-2 max-h-[min(75vh,34rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[#E5E0D2] bg-white p-4 text-[#23221E] shadow-xl">
          <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Filter requests</h3><p className="text-xs text-gray-500">Select one or more values.</p></div><button type="button" aria-label="Close filter menu" onClick={() => setFilterOpen(false)}><X size={16}/></button></div>
          <fieldset className="mb-4"><legend className="mb-2 text-xs font-semibold text-gray-600">Status</legend><div className="grid grid-cols-2 gap-2">{REQUEST_STATUS_FILTER_OPTIONS.filter((s) => s !== "ALL").map((s) => <label key={s} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#FFFCF0]"><input type="checkbox" checked={props.statuses.includes(s as RequestStatusFilter)} onChange={() => toggle(props.statuses, s as RequestStatusFilter, props.onStatusesChange)} className="accent-[#D7A400]"/>{s.replaceAll("_", " ")}</label>)}</div></fieldset>
          <fieldset className="mb-4"><legend className="mb-2 text-xs font-semibold text-gray-600">Reason</legend><div className="space-y-1">{REQUEST_REASON_OPTIONS.map((o) => <label key={o.value} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#FFFCF0]"><input type="checkbox" checked={props.reasons.includes(o.value)} onChange={() => toggle(props.reasons, o.value, props.onReasonsChange)} className="accent-[#D7A400]"/>{o.label}</label>)}</div></fieldset>
          <label className="block text-xs font-semibold text-gray-600">Created date<input type="date" value={props.createdDate} onChange={(e) => props.onCreatedDateChange(e.target.value)} className={field + " mt-1.5 w-full"}/></label>
          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3"><button type="button" onClick={clear} className="min-h-10 flex-1 rounded-lg border border-[rgb(var(--border))] text-sm">Clear all</button><button type="button" onClick={() => setFilterOpen(false)} className="min-h-10 flex-1 rounded-lg bg-[#EAB308] text-sm font-semibold text-[#231F10]">Apply</button></div>
        </div>}
      </div>
      <div className="relative">
        <button type="button" aria-expanded={sortOpen} onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 text-sm font-semibold hover:bg-[#FFFCF0]"><ArrowDownWideNarrow size={16}/> Sort by <ChevronDown size={14}/></button>
        {sortOpen && <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-[#E5E0D2] bg-white p-2 text-[#23221E] shadow-xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Sort field</p>
          {([{value:"createdAt",label:"Created date"},{value:"customerName",label:"Customer"},{value:"status",label:"Status"},{value:"reason",label:"Reason"},{value:"reference",label:"Reference"}] as const).map((option) => <button key={option.value} type="button" onClick={() => props.onSortByChange(option.value)} className={"flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm " + (props.sortBy === option.value ? "bg-[#FFF4C2] font-semibold text-[#5B4600]" : "hover:bg-[#FFF9E6]")}>{option.label}{props.sortBy === option.value && <span aria-hidden="true">✓</span>}</button>)}
          <div className="mt-2 border-t border-gray-100 p-2">
            <p className="mb-2 text-xs font-semibold text-gray-500">Direction</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => props.onSortOrderChange("asc")} className={"rounded-lg border px-3 py-2 text-sm " + (props.sortOrder === "asc" ? "border-[#D7A400] bg-[#FFF4C2] font-semibold" : "border-gray-200 hover:bg-gray-50")}>Ascending</button>
              <button type="button" onClick={() => props.onSortOrderChange("desc")} className={"rounded-lg border px-3 py-2 text-sm " + (props.sortOrder === "desc" ? "border-[#D7A400] bg-[#FFF4C2] font-semibold" : "border-gray-200 hover:bg-gray-50")}>Descending</button>
            </div>
          </div>
          <button type="button" onClick={() => setSortOpen(false)} className="mt-3 min-h-10 w-full rounded-lg bg-[#EAB308] px-3 text-sm font-semibold text-[#231F10] hover:bg-[#F2B719]">Apply</button>
        </div>}
      </div>
      {(props.query || activeCount > 0) && <button type="button" onClick={clear} className="inline-flex min-h-10 items-center gap-1 px-2 text-xs font-semibold text-[#7A5B00]"><X size={13}/> Clear filters</button>}
    </div>
  </div>;
}
