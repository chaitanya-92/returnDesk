"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft, ArrowUpRight, Plus, Search, RefreshCw, X, Inbox } from "lucide-react";

type Row = {
  id: string; reference: string; orderNumber: string; itemName: string; customerName: string;
  customerEmail: string; reason: string; status: "OPEN" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string; quantity: number;
};
const statuses = ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"] as const;
const statusLabel: Record<string,string> = { OPEN:"Open", IN_REVIEW:"In review", APPROVED:"Approved", REJECTED:"Rejected", COMPLETED:"Completed" };
const statusStyle: Record<string,string> = {
  OPEN:"border-amber-200 bg-amber-50 text-amber-800", IN_REVIEW:"border-sky-200 bg-sky-50 text-sky-800",
  APPROVED:"border-violet-200 bg-violet-50 text-violet-800", REJECTED:"border-rose-200 bg-rose-50 text-rose-800",
  COMPLETED:"border-emerald-200 bg-emerald-50 text-emerald-800"
};
const reasonOptions = ["DAMAGED","WRONG_ITEM","WRONG_SIZE","NOT_AS_DESCRIBED","CHANGED_MIND","MISSING_PARTS","OTHER"];
function pretty(value:string){return value.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}
function Field({label,name,type="text",required=true,placeholder}:{label:string;name:string;type?:string;required?:boolean;placeholder?:string}) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[#575348]">{label}{required ? " *" : ""}</span><input name={name} type={type} required={required} placeholder={placeholder} className="h-10 w-full rounded-lg border border-[#E5E2D8] bg-white px-3 text-sm text-[#23221E] outline-none transition focus:border-[#D7A50E] focus:ring-2 focus:ring-[#F7E8AE]" /></label>;
}

export default function RequestsPage(){
 const [rows,setRows]=useState<Row[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [status,setStatus]=useState("");
 const [showCreate,setShowCreate]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const load=useCallback(async()=>{
   setLoading(true);setError("");
   try{
     const params=new URLSearchParams();
     if(search.trim())params.set("q",search.trim());
     if(status)params.set("status",status);
     const response=await fetch("/api/requests?"+params.toString(),{cache:"no-store"});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error??"Could not load requests.");
     setRows(payload.data??[]);
   }catch(e){setError(e instanceof Error?e.message:"Could not load requests.");}
   finally{setLoading(false);}
 },[search,status]);
 useEffect(()=>{const timer=setTimeout(()=>{void load()},250);return()=>clearTimeout(timer)},[load]);
 async function create(event:FormEvent<HTMLFormElement>){
   event.preventDefault();setSaving(true);setMessage("");
   const form=new FormData(event.currentTarget);
   const body=Object.fromEntries(form.entries());
   body.quantity=Number(body.quantity);
   try{
     const response=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error??payload.issues?.join(", ")??"Could not create request.");
     setShowCreate(false);setMessage("Return request created successfully.");event.currentTarget.reset();await load();
   }catch(e){setMessage(e instanceof Error?e.message:"Could not create request.");}
   finally{setSaving(false);}
 }
 return <AppShell><main className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
   <div><a href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#777469] hover:text-[#23221E]"><ArrowLeft size={13}/> Overview</a><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#806000]">Returns operations</p><h1 className="mt-2 text-[32px] font-semibold tracking-[-.045em] text-[#23221E]">Return requests</h1><p className="mt-2 text-sm text-[#777469]">Search, review, and create customer return requests.</p></div>
   <button onClick={()=>{setShowCreate(true);setMessage("")}} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#F2B719] px-4 text-sm font-semibold text-[#23221E] hover:bg-[#E2AA0E]"><Plus size={16}/> New request</button>
  </div>
  {message&&<div role="status" className="rounded-lg border border-[#E9D994] bg-[#FFFAE8] px-4 py-3 text-sm text-[#5D4A0C]">{message}</div>}
  <section className="overflow-hidden rounded-2xl border border-[#EAE8E1] bg-white">
   <div className="flex flex-col gap-3 border-b border-[#F0EEE8] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
    <div className="relative w-full sm:max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969184]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reference, order, or customer" className="h-10 w-full rounded-lg border border-[#E5E2D8] pl-9 pr-3 text-sm outline-none focus:border-[#D7A50E]"/></div>
    <div className="flex items-center gap-2"><select aria-label="Filter by status" value={status} onChange={e=>setStatus(e.target.value)} className="h-10 min-w-36 rounded-lg border border-[#E5E2D8] bg-white px-3 text-sm text-[#454239]"><option value="">All statuses</option>{statuses.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}</select><button onClick={()=>void load()} aria-label="Refresh requests" className="grid size-10 place-items-center rounded-lg border border-[#E5E2D8] text-[#6D6A60] hover:bg-[#F8F7F2]"><RefreshCw size={15}/></button></div>
   </div>
   {error&&<div role="alert" className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
   <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[#FBFAF6] text-[10px] uppercase tracking-[.12em] text-[#777469]"><th className="px-5 py-3 font-semibold">Request / item</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Reason</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Created</th><th className="px-4 py-3"></th></tr></thead><tbody>
   {loading&&<tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777469]"><RefreshCw className="mx-auto mb-2 animate-spin" size={16}/>Loading requests…</td></tr>}
   {!loading&&rows.map(r=><tr key={r.id} className="border-t border-[#F0EEE8] hover:bg-[#FDFCF9]"><td className="px-5 py-4"><a href={`/requests/${r.id}`} className="text-xs font-semibold text-[#343229] hover:underline">{r.reference}</a><p className="mt-1 max-w-52 truncate text-[11px] text-[#777469]">{r.itemName} · {r.orderNumber}</p></td><td className="px-4 py-4"><p className="text-xs font-medium text-[#454239]">{r.customerName}</p><p className="mt-1 text-[11px] text-[#969184]">{r.customerEmail}</p></td><td className="px-4 py-4 text-xs text-[#777469]">{pretty(r.reason)}</td><td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-semibold ${statusStyle[r.status]}`}>{statusLabel[r.status]}</span></td><td className="px-4 py-4 text-xs text-[#777469]">{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td className="px-4 py-4"><a href={`/requests/${r.id}`} aria-label={`Open ${r.reference}`} className="grid size-8 place-items-center rounded-lg text-[#777469] hover:bg-[#F4F1E8]"><ArrowUpRight size={15}/></a></td></tr>)}
   {!loading&&rows.length===0&&<tr><td colSpan={6}><div className="flex flex-col items-center py-12 text-center"><Inbox size={24} className="text-[#969184]"/><p className="mt-3 text-sm font-semibold text-[#343229]">No matching requests</p><p className="mt-1 text-xs text-[#777469]">Try a different search or create a new request.</p></div></td></tr>}
   </tbody></table></div>
   <div className="border-t border-[#F0EEE8] px-5 py-3 text-xs text-[#777469]">{loading?"Loading…":`${rows.length} request${rows.length===1?"":"s"} shown · maximum 100 results`}</div>
  </section>
  {showCreate&&<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#171612]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false)}}><section role="dialog" aria-modal="true" aria-labelledby="create-title" className="my-6 w-full max-w-2xl rounded-2xl border border-[#EAE8E1] bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#F0EEE8] px-5 py-4 sm:px-6"><div><h2 id="create-title" className="text-lg font-semibold text-[#23221E]">Create return request</h2><p className="mt-1 text-xs text-[#777469]">Add the order, product, and customer details.</p></div><button onClick={()=>setShowCreate(false)} aria-label="Close form" className="grid size-8 place-items-center rounded-lg text-[#777469] hover:bg-[#F8F7F2]"><X size={17}/></button></div><form onSubmit={create} className="space-y-5 p-5 sm:p-6">
   <div className="grid gap-4 sm:grid-cols-2"><Field label="Order number" name="orderNumber" placeholder="ORD-52031"/><Field label="Order item ID" name="orderItemId" placeholder="ITEM-52031-A"/><Field label="Item name" name="itemName" placeholder="Everyday Bottle"/><Field label="Item SKU" name="itemSku" placeholder="BOT-750-OLV"/><Field label="Customer name" name="customerName"/><Field label="Customer email" name="customerEmail" type="email"/><Field label="Quantity" name="quantity" type="number" placeholder="1"/><label className="block"><span className="mb-1.5 block text-xs font-medium text-[#575348]">Return reason *</span><select name="reason" required className="h-10 w-full rounded-lg border border-[#E5E2D8] bg-white px-3 text-sm">{reasonOptions.map(r=><option key={r} value={r}>{pretty(r)}</option>)}</select></label></div>
   <label className="block"><span className="mb-1.5 block text-xs font-medium text-[#575348]">Description *</span><textarea name="description" required rows={3} placeholder="Describe the issue or reason for return…" className="w-full rounded-lg border border-[#E5E2D8] px-3 py-2.5 text-sm outline-none focus:border-[#D7A50E]"/></label>
   {message&&<p role="alert" className="text-xs text-rose-700">{message}</p>}
   <div className="flex justify-end gap-2 border-t border-[#F0EEE8] pt-4"><button type="button" onClick={()=>setShowCreate(false)} className="h-10 rounded-lg border border-[#E5E2D8] px-4 text-sm font-medium text-[#454239] hover:bg-[#F8F7F2]">Cancel</button><button disabled={saving} className="h-10 rounded-lg bg-[#F2B719] px-4 text-sm font-semibold text-[#23221E] hover:bg-[#E2AA0E] disabled:opacity-60">{saving?"Creating…":"Create request"}</button></div>
  </form></section></div>}
 </main></AppShell>
}
