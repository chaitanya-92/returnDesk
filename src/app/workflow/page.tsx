"use client";

import { ArrowRight, CheckCircle2, Circle, ClipboardCheck, Inbox, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const steps = [
  { status: "OPEN", title: "New request received", description: "A return is submitted and waits in the operations queue.", icon: Inbox },
  { status: "IN_REVIEW", title: "Review the request", description: "Validate order details, item condition, and the customer's reason.", icon: ShieldCheck },
  { status: "APPROVED", title: "Approve with a resolution", description: "Choose refund, replacement, or store credit. Refunds require a positive amount.", icon: ClipboardCheck },
  { status: "COMPLETED", title: "Complete fulfillment", description: "Finish the approved resolution and record the final status.", icon: CheckCircle2 },
];
const rules = [
  ["OPEN", "IN_REVIEW", "Move a newly submitted request into review."],
  ["IN_REVIEW", "APPROVED", "Approve with a required resolution."],
  ["IN_REVIEW", "REJECTED", "Reject a request that does not qualify."],
  ["APPROVED", "COMPLETED", "Mark the approved resolution fulfilled."],
];

export default function WorkflowPage() {
  return <AppShell><div className="space-y-6">
    <header className="border-b border-[rgb(var(--border))] pb-5"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#806000]">Returns operations / Process</p><h1 className="text-3xl font-semibold tracking-tight">Workflow</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--muted-foreground))]">A practical guide to how return requests move from intake through a final decision. Status changes are enforced by the API.</p></header>
    <section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 sm:p-6"><h2 className="font-semibold">Request lifecycle</h2><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{steps.map((step, i) => { const Icon = step.icon; return <article key={step.status} className="rounded-xl border border-[rgb(var(--border))] p-4"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-lg bg-[#FFF4C2] text-[#765900]"><Icon size={19}/></span><span className="text-xs font-semibold text-gray-400">0{i + 1}</span></div><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#806000]">{step.status.replaceAll("_", " ")}</p><h3 className="mt-1 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-5 text-[rgb(var(--muted-foreground))]">{step.description}</p></article>; })}</div></section>
    <section className="rounded-xl border border-[rgb(var(--border))] bg-white"><div className="border-b border-[rgb(var(--border))] p-5"><h2 className="font-semibold">Allowed status transitions</h2><p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">These are the intended transitions; the API remains the source of truth.</p></div><div className="divide-y divide-[rgb(var(--border))]">{rules.map(([from,to,description]) => <div key={from + to} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><span className="rounded-md border px-2 py-1 text-xs font-semibold">{from.replaceAll("_"," ")}</span><ArrowRight size={15} className="text-gray-400"/><span className="rounded-md border border-[#E6CC65] bg-[#FFF9DC] px-2 py-1 text-xs font-semibold text-[#5B4A10]">{to.replaceAll("_"," ")}</span></div><p className="text-sm text-[rgb(var(--muted-foreground))]">{description}</p></div>)}</div></section>
    <section className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#F2E097] bg-[#FFFCF0] p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold">Ready to process requests?</h2><p className="mt-1 text-sm text-gray-600">Open the queue to search requests and create a new return.</p></div><a href="/requests" className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E]">Open request queue <ArrowRight size={15}/></a></section>
  </div></AppShell>;
}
