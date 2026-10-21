"use client";

import { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useField, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { Plus, RefreshCw, Search, ArrowUpRight, Inbox, MoreHorizontal, Eye, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

type RequestRow = { id: string; reference: string; orderNumber: string; itemName: string; customerName: string; customerEmail: string; reason: string; status: string; createdAt: string; quantity?: number };
const statuses = ["ALL", "OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];
const reasons = ["DAMAGED", "WRONG_ITEM", "WRONG_SIZE", "NOT_AS_DESCRIBED", "CHANGED_MIND", "MISSING_PARTS", "OTHER"];
type RequestDraft = { orderNumber: string; orderItemId: string; itemName: string; itemSku: string; quantity: number; customerName: string; customerEmail: string; reason: string; description: string };
const initialDraft: RequestDraft = { orderNumber: "", orderItemId: "", itemName: "", itemSku: "", quantity: 1, customerName: "", customerEmail: "", reason: "DAMAGED", description: "" };
const requestSchema = Yup.object({
  orderNumber: Yup.string().trim().max(80, "Use 80 characters or fewer").required("Order number is required"),
  orderItemId: Yup.string().trim().max(100, "Use 100 characters or fewer").required("Order item ID is required"),
  itemName: Yup.string().trim().max(160, "Use 160 characters or fewer").required("Item name is required"),
  itemSku: Yup.string().trim().max(100, "Use 100 characters or fewer").required("Item SKU is required"),
  quantity: Yup.number().typeError("Enter a valid quantity").integer("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(1000, "Quantity cannot exceed 1000").required("Quantity is required"),
  customerName: Yup.string().trim().max(120, "Use 120 characters or fewer").required("Customer name is required"),
  customerEmail: Yup.string().trim().email("Enter a valid email address").required("Customer email is required"),
  reason: Yup.string().oneOf(reasons, "Select a valid return reason").required("Return reason is required"),
  description: Yup.string().trim().max(2000, "Description must be 2000 characters or fewer").required("Description is required")
});
const statusStyle: Record<string, string> = { OPEN: "!border-sky-300 !bg-sky-100 !text-sky-950 dark:!border-sky-800 dark:!bg-sky-950/60 dark:!text-sky-100", IN_REVIEW: "!border-amber-300 !bg-amber-100 !text-amber-950 dark:!border-amber-800 dark:!bg-amber-950/60 dark:!text-amber-100", APPROVED: "!border-violet-300 !bg-violet-100 !text-violet-950 dark:!border-violet-800 dark:!bg-violet-950/60 dark:!text-violet-100", REJECTED: "!border-rose-300 !bg-rose-100 !text-rose-950 dark:!border-rose-800 dark:!bg-rose-950/60 dark:!text-rose-100", COMPLETED: "!border-emerald-300 !bg-emerald-100 !text-emerald-950 dark:!border-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-100" };
const pretty = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^\\w/, (c) => c.toUpperCase());

function ReasonSelect() {
  const [field, meta, helpers] = useField<string>("reason");
  const [open, setOpen] = useState(false);
  return <div className="relative">
    <button id="reason-menu-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between rounded-lg border border-[#DCDCD5] bg-white px-3 py-2.5 text-left text-sm font-normal text-[#23221E] shadow-sm hover:bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/40">
      <span>{pretty(field.value)}</span><span aria-hidden="true" className="text-[#59523D]">⌄</span>
    </button>
    {open && <><button type="button" aria-label="Close return reason menu" tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default"></button><div role="listbox" aria-label="Return reason" className="absolute left-0 top-full z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5">{reasons.map(reason => <button key={reason} type="button" role="option" aria-selected={field.value === reason} onClick={() => { void helpers.setValue(reason); void helpers.setTouched(true); setOpen(false); }} className={"flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " + (field.value === reason ? "bg-[#FFF0A6] text-[#23221E]" : "bg-white text-[#38362F] hover:bg-[#FFF9DC] hover:text-[#23221E]")}>{pretty(reason)}{field.value === reason && <span aria-hidden="true">✓</span>}</button>)}</div></>}
    {meta.touched && meta.error && <span className="mt-1 block text-xs font-medium text-rose-600">{meta.error}</span>}
  </div>;
}

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [status, setStatus] = useState("ALL");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
  useEffect(() => { setPage(1); }, [query, status]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3600); return () => window.clearTimeout(timer); }, [toast]);

  async function createRequest(values: RequestDraft, helpers: FormikHelpers<RequestDraft>) {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Could not create request.");
      setShowCreate(false); setToast({ type: "success", message: "Return request created successfully." });
      helpers.resetForm(); setPage(1); await load();
    } catch (e) { const message = e instanceof Error ? e.message : "Could not create request."; setError(message); setToast({ type: "error", message }); }
    finally { setSaving(false); helpers.setSubmitting(false); }
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const field = "w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2.5 text-sm text-[#23221E] outline-none focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/20";
  return <AppShell><div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 border-b border-[rgb(var(--border))] pb-5 sm:flex-row sm:items-end">
      <div><h1 className="text-3xl font-semibold tracking-tight">Return requests</h1></div>
      <div className="flex gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm"><RefreshCw size={15}/> Refresh</button><button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2 text-sm font-semibold text-[#23221E]"><Plus size={16}/> New request</button></div>
    </header>
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
    {toast && <div role="status" aria-live="polite" className={"fixed right-5 top-5 z-[100] flex w-[min(92vw,380px)] items-start gap-3 rounded-xl border p-4 shadow-xl " + (toast.type === "success" ? "border-emerald-200 bg-white text-emerald-950" : "border-rose-200 bg-white text-rose-950")}><span className={"mt-0.5 " + (toast.type === "success" ? "text-emerald-600" : "text-rose-600")}>{toast.type === "success" ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.type === "success" ? "Success" : "Something went wrong"}</p><p className="mt-1 text-sm">{toast.message}</p></div><button aria-label="Dismiss notification" onClick={() => setToast(null)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={16}/></button></div>}
    {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171714]/55 p-4 backdrop-blur-[2px]" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setShowCreate(false); }}><section role="dialog" aria-modal="true" aria-labelledby="create-request-title" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E8E8E3] bg-white p-5 text-[#23221E] shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4 border-b border-[#ECECE7] pb-4"><div><h2 id="create-request-title" className="text-lg font-semibold">Create return request</h2><p className="mt-1 text-sm text-[#6B685F]">Enter the order and customer details to create a return.</p></div><button type="button" aria-label="Close dialog" disabled={saving} onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={18}/></button></div>
      <Formik<RequestDraft> initialValues={initialDraft} validationSchema={requestSchema} onSubmit={createRequest}>
        {({ isSubmitting, isValid, dirty }) => <Form className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" noValidate>
          <label className="space-y-1.5 text-xs font-medium">Order number *<Field name="orderNumber" placeholder="e.g. ORD-52001" autoComplete="off" className={field}/><ErrorMessage name="orderNumber" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Order item ID *<Field name="orderItemId" placeholder="e.g. ORD-52001-01" autoComplete="off" className={field}/><ErrorMessage name="orderItemId" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Item name *<Field name="itemName" placeholder="e.g. Everyday Bottle 750 ml" autoComplete="off" className={field}/><ErrorMessage name="itemName" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Item SKU *<Field name="itemSku" placeholder="e.g. BOT-750-BLK" autoComplete="off" className={field}/><ErrorMessage name="itemSku" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Quantity *<Field name="quantity" type="number" min="1" max="1000" className={field}/><ErrorMessage name="quantity" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Customer name *<Field name="customerName" placeholder="Full name" autoComplete="name" className={field}/><ErrorMessage name="customerName" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <label className="space-y-1.5 text-xs font-medium">Customer email *<Field name="customerEmail" type="email" placeholder="customer@example.com" autoComplete="email" className={field}/><ErrorMessage name="customerEmail" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <div className="space-y-1.5 text-xs font-medium"><label htmlFor="reason-menu-trigger" className="block">Return reason *</label><ReasonSelect /></div>
          <label className="space-y-1.5 text-xs font-medium sm:col-span-2 lg:col-span-3">Description *<Field as="textarea" name="description" placeholder="Describe the issue and any relevant details…" maxLength={2000} rows={3} className={field}/><ErrorMessage name="description" component="span" className="block text-xs font-medium text-rose-600"/></label>
          <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3"><button type="submit" disabled={saving || isSubmitting || !isValid || !dirty} className="rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] disabled:cursor-not-allowed disabled:opacity-60">{saving || isSubmitting ? "Creating…" : "Create request"}</button><button type="button" onClick={() => setShowCreate(false)} disabled={saving} className="rounded-lg border border-[#DCDCD5] bg-white px-4 py-2.5 text-sm text-[#23221E] hover:bg-[#F7F7F5] disabled:opacity-50">Cancel</button></div>
        </Form>}
      </Formik>
    </section></div>}
    <section className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white text-[#23221E] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]">
      <div className="flex flex-col gap-3 border-b border-[rgb(var(--border))] p-4 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reference, customer, order, item…" className="w-full rounded-lg border border-[rgb(var(--border))] bg-white py-2.5 pl-9 pr-3 text-sm text-[#23221E] outline-none focus:border-[#D7A400] [color-scheme:light]"/></div><div className="relative shrink-0"><button type="button" aria-haspopup="listbox" aria-expanded={statusMenuOpen} onClick={() => setStatusMenuOpen(v => !v)} className="flex min-w-36 items-center justify-between gap-3 rounded-lg border border-[#DCDCD5] bg-white px-3 py-2.5 text-sm font-medium text-[#23221E] shadow-sm hover:bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/40"><span>{status === "ALL" ? "All statuses" : pretty(status)}</span><span aria-hidden="true" className="text-[#59523D]">⌄</span></button>{statusMenuOpen && <><button aria-label="Close status menu" tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setStatusMenuOpen(false)}></button><div role="listbox" aria-label="Filter by status" className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5">{statuses.map(s => <button key={s} type="button" role="option" aria-selected={status === s} onClick={() => { setStatus(s); setStatusMenuOpen(false); }} className={"flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " + (status === s ? "bg-[#FFF0A6] text-[#23221E]" : "bg-white text-[#38362F] hover:bg-[#FFF9DC] hover:text-[#23221E]")}>{s === "ALL" ? "All statuses" : pretty(s)}{status === s && <span aria-hidden="true">✓</span>}</button>)}</div></>}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm text-[#23221E] dark:text-[rgb(var(--foreground))]"><thead className="bg-[#FFF9DC] text-[10px] uppercase tracking-wider text-[#5B4A10] dark:bg-[#342C19] dark:text-[#F4D76B]"><tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-[rgb(var(--border))]">
      {visibleRows.map(r => <tr key={r.id} className="bg-white text-[#23221E] hover:bg-[#FFFCF0] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))] dark:hover:bg-[#302F2A]"><td className="px-4 py-4"><p className="font-semibold">{r.reference}</p><p className="mt-1 text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">{r.orderNumber} · {r.itemName}</p></td><td className="px-4 py-4"><p>{r.customerName}</p><p className="text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">{r.customerEmail}</p></td><td className="px-4 py-4">{pretty(r.reason)}</td><td className="px-4 py-4"><span className={"status-badge-" + ({OPEN:"open",IN_REVIEW:"review",APPROVED:"approved",REJECTED:"rejected",COMPLETED:"completed"}[r.status] ?? "open") + " inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium " + (statusStyle[r.status] ?? "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200")}>{pretty(r.status)}</span></td><td className="px-4 py-4 text-xs text-gray-500 dark:text-[rgb(var(--muted-foreground))]">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td><td className="px-4 py-4"><div className="relative flex justify-end"><button type="button" aria-label={"Actions for " + r.reference} aria-haspopup="menu" aria-expanded={actionMenuId === r.id} onClick={() => setActionMenuId(current => current === r.id ? null : r.id)} className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E1DFD6] bg-white text-[#4B493F] shadow-sm hover:bg-[#FFF9DC] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/50 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"><MoreHorizontal size={18}/></button>{actionMenuId === r.id && <><button type="button" aria-label="Close actions menu" tabIndex={-1} onClick={() => setActionMenuId(null)} className="fixed inset-0 z-40 cursor-default"></button><div role="menu" aria-label={"Actions for " + r.reference} className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"><a role="menuitem" href={"/requests/" + r.id} onClick={() => setActionMenuId(null)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#FFF9DC] dark:hover:bg-[rgb(var(--muted))]"><Eye size={15}/> View details <ArrowUpRight size={13} className="ml-auto"/></a><a role="menuitem" href={"/refunds"} onClick={() => setActionMenuId(null)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#FFF9DC] dark:hover:bg-[rgb(var(--muted))]"><WalletCards size={15}/> Refund requests</a></div></>}</div></td></tr>)}
      {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center"><Inbox className="mx-auto mb-2 text-gray-400"/><p className="font-medium">{error ? "Requests unavailable" : "No requests found"}</p><p className="mt-1 text-xs text-gray-500">{query || status !== "ALL" ? "Try changing the search or status filter." : "Create your first return request to get started."}</p></td></tr>}
      {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-500">Loading requests…</td></tr>}
      </tbody></table></div>
      <div className="flex flex-col gap-3 border-t border-[rgb(var(--border))] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[rgb(var(--muted-foreground))">Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length} requests</p><nav aria-label="Request table pagination" className="flex items-center gap-1.5"><button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="px-2 text-xs text-[rgb(var(--muted-foreground))">Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav></div>
    </section>
  </div></AppShell>;
}
