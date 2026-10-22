"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, ArrowDownWideNarrow, X } from "lucide-react";

export type OperationsStatus = "ALL" | "APPROVED" | "COMPLETED";
export type OperationsSort = "createdAt" | "customerName" | "amount" | "updatedAt" | "reference";

type Props = {
  statuses: OperationsStatus[];
  onStatusesChange: (value: OperationsStatus[]) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  sortBy: OperationsSort;
  onSortByChange: (value: OperationsSort) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  amountMin?: string;
  onAmountMinChange?: (value: string) => void;
  amountMax?: string;
  onAmountMaxChange?: (value: string) => void;
  statusLabels?: Partial<Record<OperationsStatus, string>>;
};

const STATUS_OPTIONS: OperationsStatus[] = ["APPROVED", "COMPLETED"];
const SORT_OPTIONS: { value: OperationsSort; label: string }[] = [
  { value: "createdAt", label: "Created date" },
  { value: "updatedAt", label: "Updated date" },
  { value: "customerName", label: "Customer" },
  { value: "amount", label: "Amount" },
  { value: "reference", label: "Reference" },
];

export function OperationsTableControls(props: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filterOpen && !sortOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setFilterOpen(false);
        setSortOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setFilterOpen(false); setSortOpen(false); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen, sortOpen]);
  const field = "mt-1.5 min-h-10 w-full rounded-lg border border-[#E5E0D2] bg-white px-3 text-sm text-[#23221E] outline-none focus:border-[#D7A400]";
  const count = props.statuses.length + Number(Boolean(props.fromDate)) + Number(Boolean(props.toDate)) + Number(Boolean(props.amountMin)) + Number(Boolean(props.amountMax));
  const toggleStatus = (status: OperationsStatus) => props.onStatusesChange(props.statuses.includes(status) ? props.statuses.filter((s) => s !== status) : [...props.statuses, status]);
  const clear = () => {
    props.onStatusesChange([]);
    props.onFromDateChange("");
    props.onToDateChange("");
    props.onAmountMinChange?.("");
    props.onAmountMaxChange?.("");
  };
  return <div ref={rootRef} className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <button type="button" aria-expanded={filterOpen} onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }} className={"inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold " + (count ? "border-[#D7A400] bg-[#FFF7D6] text-[#5B4600]" : "border-[rgb(var(--border))] bg-white hover:bg-[#FFFCF0]")}><SlidersHorizontal size={16}/> Filter {count > 0 && <span className="rounded-full bg-[#D7A400] px-1.5 py-0.5 text-xs text-white">{count}</span>}<ChevronDown size={14}/></button>
      {filterOpen && <div className="absolute right-0 z-50 mt-2 max-h-[min(75vh,34rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[#E5E0D2] bg-white p-4 text-[#23221E] shadow-xl">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Filter records</h3><button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)}><X size={16}/></button></div>
        <fieldset className="mb-4"><legend className="mb-2 text-xs font-semibold text-gray-600">Status</legend><div className="space-y-1">{STATUS_OPTIONS.map((s) => <label key={s} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#FFF9E6]"><input type="checkbox" checked={props.statuses.includes(s)} onChange={() => toggleStatus(s)} className="accent-[#D7A400]"/>{props.statusLabels?.[s] ?? (s === "APPROVED" ? "Awaiting processing" : "Processed")}</label>)}</div></fieldset>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-gray-600">From date<input type="date" value={props.fromDate} onChange={(e) => props.onFromDateChange(e.target.value)} className={field}/></label><label className="text-xs font-semibold text-gray-600">To date<input type="date" value={props.toDate} onChange={(e) => props.onToDateChange(e.target.value)} className={field}/></label></div>
        {props.onAmountMinChange && props.onAmountMaxChange && <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-gray-600">Min amount<input type="number" min="0" value={props.amountMin ?? ""} onChange={(e) => props.onAmountMinChange?.(e.target.value)} className={field}/></label><label className="text-xs font-semibold text-gray-600">Max amount<input type="number" min="0" value={props.amountMax ?? ""} onChange={(e) => props.onAmountMaxChange?.(e.target.value)} className={field}/></label></div>}
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3"><button type="button" onClick={clear} className="min-h-10 flex-1 rounded-lg border border-[rgb(var(--border))] text-sm">Clear all</button><button type="button" onClick={() => setFilterOpen(false)} className="min-h-10 flex-1 rounded-lg bg-[#EAB308] text-sm font-semibold text-[#231F10]">Apply</button></div>
      </div>}
    </div>
    <div className="relative">
      <button type="button" aria-expanded={sortOpen} onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-white px-4 text-sm font-semibold hover:bg-[#FFFCF0]"><ArrowDownWideNarrow size={16}/> Sort by <ChevronDown size={14}/></button>
      {sortOpen && <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-[#E5E0D2] bg-white p-2 text-[#23221E] shadow-xl"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Sort field</p>{SORT_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => props.onSortByChange(option.value)} className={"flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm " + (props.sortBy === option.value ? "bg-[#FFF4C2] font-semibold text-[#5B4600]" : "hover:bg-[#FFF9E6]")}>{option.label}{props.sortBy === option.value && <span>✓</span>}</button>)}<div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 p-2"><button type="button" onClick={() => props.onSortOrderChange("asc")} className={"rounded-lg border px-2 py-2 text-sm " + (props.sortOrder === "asc" ? "border-[#D7A400] bg-[#FFF4C2] font-semibold" : "border-gray-200")}>Ascending</button><button type="button" onClick={() => props.onSortOrderChange("desc")} className={"rounded-lg border px-2 py-2 text-sm " + (props.sortOrder === "desc" ? "border-[#D7A400] bg-[#FFF4C2] font-semibold" : "border-gray-200")}>Descending</button></div><button type="button" onClick={() => setSortOpen(false)} className="mt-2 min-h-10 w-full rounded-lg bg-[#EAB308] text-sm font-semibold text-[#231F10]">Apply</button></div>}
    </div>
    {count > 0 && <button type="button" onClick={clear} className="inline-flex min-h-10 items-center gap-1 px-2 text-xs font-semibold text-[#7A5B00]"><X size={13}/> Clear filters</button>}
  </div>;
}
