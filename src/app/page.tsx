import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowUpRight, Clock3, PackageCheck, RotateCcw, TrendingUp } from "lucide-react";

const statusMeta = [
  { label: "Open", key: "open", detail: "Waiting for review", icon: Clock3, tone: "bg-amber-50 text-amber-800" },
  { label: "In review", key: "inReview", detail: "Being assessed", icon: RotateCcw, tone: "bg-blue-50 text-blue-800" },
  { label: "Approved", key: "approved", detail: "Ready for resolution", icon: PackageCheck, tone: "bg-emerald-50 text-emerald-800" },
  { label: "Completed", key: "completed", detail: "Successfully resolved", icon: TrendingUp, tone: "bg-stone-100 text-stone-700" },
] as const;

const sampleRows = [
  { reference: "RT-1048", customer: "Avery Johnson", item: "Everyday Bottle · 750 ml", reason: "Arrived damaged", status: "OPEN" as RequestStatus, date: "Oct 21, 2026" },
  { reference: "RT-1047", customer: "Noah Williams", item: "Trail Backpack · 22L", reason: "Wrong size", status: "IN_REVIEW" as RequestStatus, date: "Oct 21, 2026" },
  { reference: "RT-1046", customer: "Mia Patel", item: "Insulated Mug · 350 ml", reason: "Changed mind", status: "APPROVED" as RequestStatus, date: "Oct 20, 2026" },
  { reference: "RT-1045", customer: "Ethan Brooks", item: "Travel Pouch · Set of 3", reason: "Missing parts", status: "IN_REVIEW" as RequestStatus, date: "Oct 20, 2026" },
  { reference: "RT-1044", customer: "Sofia Garcia", item: "Everyday Bottle · 1 L", reason: "Not as described", status: "OPEN" as RequestStatus, date: "Oct 19, 2026" },
];

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    OPEN: "bg-amber-50 text-amber-800 ring-amber-200",
    IN_REVIEW: "bg-blue-50 text-blue-800 ring-blue-200",
    APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
    COMPLETED: "bg-stone-100 text-stone-700 ring-stone-200",
  };
  const label = status === "IN_REVIEW" ? "In review" : status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[status]}`}><span className="mr-1.5 mt-[5px] size-1.5 rounded-full bg-current" />{label}</span>;
}

export default async function HomePage() {
  let live = { total: 0, open: 0, inReview: 0, approved: 0, completed: 0, recent: [] as Array<{ reference: string; customerName: string; itemName: string; reason: string; status: RequestStatus; createdAt: Date }> };
  let connected = false;
  try {
    const [total, open, inReview, approved, completed, recent] = await Promise.all([
      prisma.returnRequest.count({ where: { archivedAt: null } }),
      prisma.returnRequest.count({ where: { archivedAt: null, status: "OPEN" } }),
      prisma.returnRequest.count({ where: { archivedAt: null, status: "IN_REVIEW" } }),
      prisma.returnRequest.count({ where: { archivedAt: null, status: "APPROVED" } }),
      prisma.returnRequest.count({ where: { archivedAt: null, status: "COMPLETED" } }),
      prisma.returnRequest.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 5, select: { reference: true, customerName: true, itemName: true, reason: true, status: true, createdAt: true } }),
    ]);
    live = { total, open, inReview, approved, completed, recent };
    connected = true;
  } catch {
    // The navigation and dashboard shell can still render while the database is unavailable.
  }
  const rows = live.recent.length ? live.recent.map((r) => ({ reference: r.reference, customer: r.customerName, item: r.itemName, reason: r.reason.replaceAll("_", " ").toLowerCase(), status: r.status, date: r.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) })) : sampleRows;
  const counts: Record<string, number> = { open: live.open, inReview: live.inReview, approved: live.approved, completed: live.completed };
  return (
    <AppShell>
      <div id="overview" className="space-y-7">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8610]">Returns operations / overview</p><h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#252419] sm:text-3xl">Good evening, team <span aria-hidden="true">✳</span></h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#77766b]">Everything happening with your returns, all in one place.</p></div>
          <a href="#requests" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#f4d84b] px-4 py-2.5 text-sm font-semibold text-[#24220f] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#edcf2e] sm:self-auto">View requests <ArrowUpRight size={16} /></a>
        </section>
        <section id="workflow" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {statusMeta.map((item) => { const Icon = item.icon; return <article key={item.key} className="group rounded-2xl border border-[#eeece1] bg-white p-5 shadow-[0_2px_8px_rgba(34,32,17,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-[#e5d778] hover:shadow-[0_10px_28px_rgba(34,32,17,0.06)]"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#77766b]">{item.label}</span><span className={`grid size-9 place-items-center rounded-xl ${item.tone}`}><Icon size={17} /></span></div><p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[#252419]">{counts[item.key]}</p><p className="mt-1 text-xs text-[#929184]">{item.detail}</p></article>; })}
        </section>
        <section id="requests" className="overflow-hidden rounded-2xl border border-[#eeece1] bg-white shadow-[0_2px_8px_rgba(34,32,17,0.025)]">
          <div className="flex flex-col gap-3 border-b border-[#eeece1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><div className="flex items-center gap-2"><h2 className="text-base font-semibold tracking-tight">Recent requests</h2><span className="rounded-md bg-[#fbf6d8] px-2 py-0.5 text-[10px] font-semibold text-[#88730b]">{live.total || rows.length} total</span></div><p className="mt-1 text-sm text-[#858477]">The latest return requests submitted by customers.</p></div><a href="#requests" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#e9e6d9] px-3 text-xs font-semibold text-[#4f4d40] transition hover:bg-[#fbf9ec]">All requests <ArrowUpRight size={14} /></a></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left"><thead><tr className="bg-[#fcfbf6] text-[10px] uppercase tracking-[0.13em] text-[#929184]"><th className="px-6 py-3.5 font-semibold">Request</th><th className="px-4 py-3.5 font-semibold">Customer</th><th className="px-4 py-3.5 font-semibold">Reason</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Created</th></tr></thead><tbody>{rows.map((row) => <tr key={row.reference} className="border-t border-[#f0eee5] transition-colors hover:bg-[#fffef8]"><td className="px-6 py-4"><p className="text-sm font-semibold text-[#62550c]">{row.reference}</p><p className="mt-1 text-xs text-[#8d8b7e]">{row.item}</p></td><td className="px-4 py-4 text-sm font-medium text-[#3a392f]">{row.customer}</td><td className="px-4 py-4 text-sm text-[#77766b]">{row.reason}</td><td className="px-4 py-4"><StatusBadge status={row.status} /></td><td className="px-4 py-4 text-xs text-[#858477]">{row.date}</td></tr>)}</tbody></table></div>
          <div className="flex flex-col gap-2 border-t border-[#eeece1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-[#858477]">{live.total ? `Showing ${rows.length} of ${live.total} requests` : "Showing sample requests"}</p><span className="inline-flex items-center gap-2 text-xs text-[#77766b]"><span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />{connected ? "Connected to PostgreSQL" : "Showing preview data"}</span></div>
        </section>
        <footer className="flex flex-col justify-between gap-2 pb-2 text-xs text-[#9a998d] sm:flex-row"><span>ReturnDesk · Returns operations workspace</span><span>Built for clearer, faster resolutions.</span></footer>
      </div>
    </AppShell>
  );
}
