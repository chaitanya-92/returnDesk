"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { Plus, RefreshCw, Search, ArrowUpRight, Inbox } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

type RequestRow = { id: string; reference: string; orderNumber: string; itemName: string; customerName: string; customerEmail: string; reason: string; status: string; createdAt: string; quantity?: number };
const statuses = ["ALL", "OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];
const reasons = ["DAMAGED", "WRONG_ITEM", "WRONG_SIZE", "NOT_AS_DESCRIBED", "CHANGED_MIND", "MISSING_PARTS", "OTHER"];
const pretty = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^\\w/, (c) => c.toUpperCase());

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      const response = await fetch("/api/requests?" + params.toString(), { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Could not load return requests.");
      setRows(Array.isArray(payload.data) ? payload.data : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load return requests."); }
    finally { setLoading(false); }
  }, [status, query]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3600); return () => window.clearTimeout(timer); }, [toast]);

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | number> = Object.fromEntries(form.entries());
    body.quantity = Number(body.quantity);
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Could not create request.");
      setShowCreate(false); setToast({ type: "success", message: "Return request created successfully." }); await load();
    } catch (e) { const message = e instanceof Error ? e.message : "Could not create request."; setError(message); setToast({ type: "error", message }); }
    finally { setSaving(false); }
  }

  const field = "w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2.5 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20";
  return <AppShell><div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 border-b border-[rgb(var(--border))] pb-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#806000]">Returns operations / Workspace</p><h1 className="text-3xl font-semibold tracking-tight">Return requests</h1><p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Search, review, and create return requests from your operations queue.</p></div>
      <div className="flex gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm"><RefreshCw size={15}/> Refresh</button><button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2 text-sm font-semibold text-[#23221E]"><Plus size={16}/> New request</button></div>
    </header>
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
    {toast && <div role="status" aria-live="polite" className={"fixed right-5 top-5 z-[100] flex w-[min(92vw,380px)] items-start gap-3 rounded-xl border p-4 shadow-xl " + (toast.type === "success" ? "border-emerald-200 bg-white text-emerald-950" : "border-rose-200 bg-white text-rose-950")}><span className={"mt-0.5 " + (toast.type === "success" ? "text-emerald-600" : "text-rose-600")}>{toast.type === "success" ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.type === "success" ? "Success" : "Something went wrong"}</p><p className="mt-1 text-sm">{toast.message}</p></div><button aria-label="Dismiss notification" onClick={() => setToast(null)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={16}/></button></div>}
    {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171714]/55 p-4 backdrop-blur-[2px]" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setShowCreate(false); }}><section role="dialog" aria-modal="true" aria-labelledby="create-request-title" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E8E8E3] bg-white p-5 text-[#23221E] shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4 border-b border-[#ECECE7] pb-4"><div><h2 id="create-request-title" className="text-lg font-semibold">Create return request</h2><p className="mt-1 text-sm text-[#6B685F]">Enter the order and customer details to create a return.</p></div><button type="button" aria-label="Close dialog" disabled={saving} onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={18}/></button></div>
      <form onSubmit={createRequest} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5 text-xs font-medium">Order number *<input name="orderNumber" required maxLength={80} className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Order item ID *<input name="orderItemId" required maxLength={100} className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Item name *<input name="itemName" required className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Item SKU *<input name="itemSku" required maxLength={100} className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Quantity *<input name="quantity" type="number" min="1" max="1000" defaultValue="1" required className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Customer name *<input name="customerName" required className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Customer email *<input name="customerEmail" type="email" required className={field}/></label>
        <label className="space-y-1.5 text-xs font-medium">Return reason *<select name="reason" required className={field}>{reasons.map(r => <option key={r} value={r}>{pretty(r)}</option>)}</select></label>
        <label className="space-y-1.5 text-xs font-medium sm:col-span-2 lg:col-span-3">Description *<textarea name="description" required maxLength={2000} rows={3} className={field}/></label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button disabled={saving} className="rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] disabled:opacity-60">{saving ? "Creating…" : "Create request"}</button><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2.5 text-sm">Cancel</button></div>
      </form>
    </section></div>}
    <section className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white">
      <div className="flex flex-col gap-3 border-b border-[rgb(var(--border))] p-4 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reference, customer, order, item…" className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E] outline-none focus:border-[#D7A400] [color-scheme:light]"/></div><select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[#23221E] [color-scheme:light]">{statuses.map(s => <option key={s} value={s}>{s === "ALL" ? "All statuses" : pretty(s)}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#FFF9DC] text-[10px] uppercase tracking-wider text-[#5B4A10]"><tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-[rgb(var(--border))]">
      {rows.map(r => <tr key={r.id} className="hover:bg-[#FFFCF0]"><td className="px-4 py-4"><p className="font-semibold">{r.reference}</p><p className="mt-1 text-xs text-gray-500">{r.orderNumber} · {r.itemName}</p></td><td className="px-4 py-4"><p>{r.customerName}</p><p className="text-xs text-gray-500">{r.customerEmail}</p></td><td className="px-4 py-4">{pretty(r.reason)}</td><td className="px-4 py-4"><span className="rounded-md border px-2 py-1 text-xs">{pretty(r.status)}</span></td><td className="px-4 py-4 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td><td className="px-4 py-4"><a href={"/requests/" + r.id} className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A5B00]">Details <ArrowUpRight size={13}/></a></td></tr>)}
      {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center"><Inbox className="mx-auto mb-2 text-gray-400"/><p className="font-medium">{error ? "Requests unavailable" : "No requests found"}</p><p className="mt-1 text-xs text-gray-500">{query || status !== "ALL" ? "Try changing the search or status filter." : "Create your first return request to get started."}</p></td></tr>}
      {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-500">Loading requests…</td></tr>}
      </tbody></table></div>
      <div className="border-t border-[rgb(var(--border))] px-4 py-3 text-xs text-gray-500">{rows.length} request{rows.length === 1 ? "" : "s"} shown</div>
    </section>
  </div></AppShell>;
}
