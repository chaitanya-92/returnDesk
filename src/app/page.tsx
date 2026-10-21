import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

const workflow = [
  { label: "Open", count: "12", detail: "Waiting for review", tone: "bg-amber-50 text-amber-800" },
  { label: "In Review", count: "8", detail: "Being assessed", tone: "bg-sky-50 text-sky-800" },
  { label: "Approved", count: "5", detail: "Ready for resolution", tone: "bg-emerald-50 text-emerald-800" },
  { label: "Completed", count: "34", detail: "Resolved requests", tone: "bg-stone-100 text-stone-700" },
];

const sampleRows = [
  { reference: "RT-1048", customer: "Avery Johnson", item: "Everyday Bottle · 750 ml", reason: "Arrived damaged", status: "Open", date: "Oct 21, 2026" },
  { reference: "RT-1047", customer: "Noah Williams", item: "Trail Backpack · 22L", reason: "Wrong size", status: "In Review", date: "Oct 21, 2026" },
  { reference: "RT-1046", customer: "Mia Patel", item: "Insulated Mug · 350 ml", reason: "Changed mind", status: "Approved", date: "Oct 20, 2026" },
  { reference: "RT-1045", customer: "Ethan Brooks", item: "Travel Pouch · Set of 3", reason: "Missing parts", status: "In Review", date: "Oct 20, 2026" },
  { reference: "RT-1044", customer: "Sofia Garcia", item: "Everyday Bottle · 1 L", reason: "Not as described", status: "Open", date: "Oct 19, 2026" },
];

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: "bg-amber-50 text-amber-800 ring-amber-200",
    "In Review": "bg-sky-50 text-sky-800 ring-sky-200",
    Approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Completed: "bg-stone-100 text-stone-700 ring-stone-200",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] ?? "bg-rose-50 text-rose-800 ring-rose-200"}`}>{status}</span>;
}

export default async function HomePage() {
  let live = { total: 0, open: 0, inReview: 0, approved: 0, completed: 0, recent: [] as Array<{ reference: string; customerName: string; itemName: string; reason: string; status: RequestStatus; createdAt: Date }> };
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
  } catch {
    // Keep the dashboard shell renderable until the database is configured.
  }
  const liveWorkflow = workflow.map((item) => ({ ...item, count: String(({ Open: live.open, "In Review": live.inReview, Approved: live.approved, Completed: live.completed } as Record<string, number>)[item.label] ?? 0) }));
  const rows = live.recent.length ? live.recent.map((r) => ({ reference: r.reference, customer: r.customerName, item: r.itemName, reason: r.reason.replaceAll("_", " ").toLowerCase(), status: r.status === "IN_REVIEW" ? "In Review" : r.status.charAt(0) + r.status.slice(1).toLowerCase(), date: r.createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) })) : sampleRows;
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-line bg-white px-5 py-7 lg:flex lg:flex-col">
          <a href="#overview" className="flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-sm font-bold text-white">R</span>
            <span><span className="block text-lg font-semibold tracking-tight">ReturnDesk</span><span className="block text-xs text-muted">Returns operations</span></span>
          </a>
          <p className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Workspace</p>
          <nav className="space-y-1 text-sm">
            <a href="#overview" className="flex items-center gap-3 rounded-xl bg-brand-light px-3 py-2.5 font-semibold text-brand-dark"><span className="text-base">▦</span> Overview</a>
            <a href="#requests" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition hover:bg-canvas hover:text-ink"><span className="text-base">↺</span> Return requests <span className="ml-auto rounded-md bg-canvas px-2 py-0.5 text-xs">25</span></a>
            <a href="#workflow" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition hover:bg-canvas hover:text-ink"><span className="text-base">⌁</span> Workflow</a>
          </nav>
          <div className="mt-auto rounded-2xl bg-canvas p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Operations status</div>
            <p className="text-xs leading-5 text-muted">A single place to review, decide, and resolve customer return requests.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-line bg-white px-4 py-4 sm:px-7 lg:px-9">
            <div className="flex items-center gap-3 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-bold text-white">R</span><span className="font-semibold">ReturnDesk</span></div>
            <div className="hidden text-sm text-muted sm:block">Returns / <span className="font-medium text-ink">Overview</span></div>
            <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-semibold">Operations team</span><span className="block text-xs text-muted">Returns administrator</span></span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e4e9e4] text-xs font-bold text-brand-dark">OT</span></div>
          </header>

          <div id="overview" className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-brand">Tuesday, October 21, 2026</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Returns overview</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">A clear view of what needs attention and where each request stands.</p></div>
              <a href="#requests" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark sm:self-auto"><span className="text-lg leading-none">+</span> Review requests</a>
            </div>

            <div id="workflow" className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
              {liveWorkflow.map((item) => <article key={item.label} className="rounded-2xl border border-line bg-white p-5 shadow-panel"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-muted">{item.label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.tone}`}>Requests</span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{item.count}</p><p className="mt-1 text-xs text-muted">{item.detail}</p></article>)}
            </div>

            <section id="requests" className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
              <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-base font-semibold">Recent requests</h2><p className="mt-1 text-sm text-muted">A quick look at the latest customer submissions.</p></div><div className="flex items-center gap-2"><span className="rounded-lg border border-line px-3 py-2 text-xs text-muted">All statuses ▾</span><span className="rounded-lg border border-line px-3 py-2 text-xs text-muted">Newest first</span></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="bg-[#fafbf9] text-[11px] uppercase tracking-wider text-muted"><th className="px-6 py-3 font-semibold">Request</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Reason</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Created</th></tr></thead><tbody>{rows.map((row) => <tr key={row.reference} className="border-t border-line transition hover:bg-[#fbfcfa]"><td className="px-6 py-4"><p className="text-sm font-semibold text-brand">{row.reference}</p><p className="mt-1 text-xs text-muted">{row.item}</p></td><td className="px-4 py-4 text-sm font-medium">{row.customer}</td><td className="px-4 py-4 text-sm text-muted">{row.reason}</td><td className="px-4 py-4"><StatusPill status={row.status}/></td><td className="px-4 py-4 text-xs text-muted">{row.date}</td></tr>)}</tbody></table></div>
              <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-6"><p className="text-xs text-muted">{live.total ? `Showing ${rows.length} of ${live.total} requests` : "Showing 5 sample requests"}</p><span className="text-xs font-medium text-muted">{live.total ? "Live data from PostgreSQL" : "Configure PostgreSQL to load live data"}</span></div>
            </section>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-[#c9d7cd] bg-[#edf4ef] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-semibold text-brand-dark">Workflow foundation</p><p className="mt-1 text-sm leading-5 text-muted">This dashboard shell is the UI foundation. Live database-backed requests and guarded actions are the next implementation milestone.</p></div><span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand ring-1 ring-inset ring-[#d5e3d9]">Implementation in progress</span></div>
            <footer className="py-8 text-center text-xs text-muted">ReturnDesk · Returns operations workspace</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
