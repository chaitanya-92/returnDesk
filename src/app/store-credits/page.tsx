"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requestsApi, type RequestRecord } from "@/features/requests/api/requests-api";
import { formatCurrencyINR, formatDate } from "@/features/requests/presentation";
import { StatusBadge } from "@/components/requests/status-badge";
import { Pagination } from "@/components/requests/pagination";
import { DataTable, DataTableBody, DataTableCell, DataTableContainer, DataTableHead, DataTableHeader, DataTableRow } from "@/components/ui/data-table";
import { OperationsTableControls, type OperationsSort, type OperationsStatus } from "@/features/shared/components/operations-table-controls";
import { Search, CreditCard, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useDebouncedValue } from "@/features/requests/hooks/use-debounced-value";

const PAGE_SIZE = 10;
type CreditRecord = Pick<RequestRecord, "id" | "reference" | "orderNumber" | "itemName" | "customerName" | "customerEmail" | "status" | "resolution" | "refundAmount" | "createdAt" | "updatedAt">;

export default function StoreCreditsPage() {
  const [rows, setRows] = useState<CreditRecord[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState<OperationsStatus[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [sortBy, setSortBy] = useState<OperationsSort>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: debouncedQuery, page: "1", pageSize: "100" });
      const payload = await requestsApi.list(params);
      setRows((payload.data.items ?? []).filter((r) => r.resolution === "STORE_CREDIT" && (r.status === "APPROVED" || r.status === "COMPLETED")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load store credits.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [query, statuses, fromDate, toDate, amountMin, amountMax, sortBy, sortOrder]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (statuses.length && !statuses.includes(r.status as OperationsStatus)) return false;
    const date = new Date(sortBy === "createdAt" ? r.createdAt : r.updatedAt).getTime();
    if (fromDate && date < new Date(fromDate + "T00:00:00").getTime()) return false;
    if (toDate && date > new Date(toDate + "T23:59:59").getTime()) return false;
    const amount = Number(r.refundAmount ?? 0);
    if (amountMin && amount < Number(amountMin)) return false;
    if (amountMax && amount > Number(amountMax)) return false;
    return true;
  }).slice().sort((a,b) => {
    let value = 0;
    if (sortBy === "amount") value = Number(a.refundAmount ?? 0) - Number(b.refundAmount ?? 0);
    else if (sortBy === "customerName") value = a.customerName.localeCompare(b.customerName);
    else if (sortBy === "reference") value = a.reference.localeCompare(b.reference);
    else value = new Date(sortBy === "createdAt" ? a.createdAt : a.updatedAt).getTime() - new Date(sortBy === "createdAt" ? b.createdAt : b.updatedAt).getTime();
    return sortOrder === "asc" ? value : -value;
  }), [rows, statuses, fromDate, toDate, amountMin, amountMax, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = loading ? [] : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return <AppShell>
    <div aria-busy={loading} className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div><h1 className="text-3xl font-semibold">Store credit</h1><p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Track store credit resolutions issued to customers. Store credit is generally available sooner than bank refunds.</p></div>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm">Refresh</button>
      </header>
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">{error}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xl"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736A]"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search credit reference, customer, or order…" aria-label="Search store credits" className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E]"/></div>
        <OperationsTableControls statuses={statuses} onStatusesChange={setStatuses} fromDate={fromDate} onFromDateChange={setFromDate} toDate={toDate} onToDateChange={setToDate} amountMin={amountMin} onAmountMinChange={setAmountMin} amountMax={amountMax} onAmountMaxChange={setAmountMax} sortBy={sortBy} onSortByChange={setSortBy} sortOrder={sortOrder} onSortOrderChange={setSortOrder} statusLabels={{APPROVED:"Awaiting issuance",COMPLETED:"Issued"}}/>
      </div>
      <section className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white">
        <DataTableContainer><DataTable className="w-full min-w-[760px] text-left text-sm">
          <DataTableHeader className="bg-[#FFF9DC] text-[10px] uppercase tracking-wider text-[#5B4A10]"><DataTableRow><DataTableHead className="px-4 py-3">Credit / order</DataTableHead><DataTableHead className="px-4 py-3">Customer</DataTableHead><DataTableHead className="px-4 py-3">Credit amount</DataTableHead><DataTableHead className="px-4 py-3">Status</DataTableHead><DataTableHead className="px-4 py-3">Updated</DataTableHead><DataTableHead className="px-4 py-3">Action</DataTableHead></DataTableRow></DataTableHeader>
          <DataTableBody className="divide-y divide-[rgb(var(--border))]">
            {shown.map((r) => <DataTableRow key={r.id} className="bg-white hover:bg-[#FFFCF0]"><DataTableCell className="px-4 py-4"><b>{r.reference}</b><p className="mt-1 text-xs text-[#6B685F]">{r.orderNumber} · {r.itemName}</p></DataTableCell><DataTableCell className="px-4 py-4">{r.customerName}<p className="text-xs text-[#6B685F]">{r.customerEmail}</p></DataTableCell><DataTableCell className="px-4 py-4 font-semibold">{r.refundAmount == null ? "—" : formatCurrencyINR(Number(r.refundAmount))}</DataTableCell><DataTableCell className="px-4 py-4"><StatusBadge status={r.status} label={r.status === "APPROVED" ? "Awaiting issuance" : "Issued"}/></DataTableCell><DataTableCell className="px-4 py-4 text-xs">{formatDate(r.updatedAt)}</DataTableCell><DataTableCell className="px-4 py-4"><Link href={"/requests/"+r.id} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">View <ArrowUpRight size={13}/></Link></DataTableCell></DataTableRow>)}
            {loading && Array.from({length:5},(_,i)=><DataTableRow key={i}>{Array.from({length:6},(_,j)=><DataTableCell key={j} className="px-4 py-5"><div className="h-3 w-24 animate-pulse rounded bg-[#EAE7DE]"/></DataTableCell>)}</DataTableRow>)}
            {!loading && shown.length===0 && <DataTableRow><DataTableCell colSpan={6} className="px-4 py-12 text-center"><CreditCard className="mx-auto mb-2"/><p>No store credit records found</p><p className="mt-1 text-xs text-gray-500">Approved returns with a store-credit resolution appear here.</p></DataTableCell></DataTableRow>}
          </DataTableBody>
        </DataTable></DataTableContainer>
        <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} itemLabel="credits" onPageChange={setPage}/>
      </section>
    </div>
  </AppShell>;
}
