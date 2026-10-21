"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, PackageCheck, RotateCcw, TrendingUp, Inbox } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

type RequestStatus = "OPEN" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";
type RequestRow = { reference: string; customer: string; item: string; reason: string; status: RequestStatus; date: string };

const statusMeta = [
  { label: "Open", key: "open", detail: "Waiting for review", icon: Clock3 },
  { label: "In review", key: "inReview", detail: "Currently being assessed", icon: RotateCcw },
  { label: "Approved", key: "approved", detail: "Ready for resolution", icon: PackageCheck },
  { label: "Completed", key: "completed", detail: "Successfully resolved", icon: TrendingUp },
] as const;

const statusLabels: Record<RequestStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export default function HomePage() {
  const [data, setData] = useState<{ total: number; open: number; inReview: number; approved: number; completed: number; recent: RequestRow[] } | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/requests?limit=5")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load requests");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        const requests = Array.isArray(payload) ? payload : payload.data ?? payload.requests ?? [];
        const rows: RequestRow[] = requests.map((request: Record<string, unknown>) => ({
          reference: String(request.reference ?? request.id ?? "—"),
          customer: String(request.customerName ?? request.customer ?? "Unknown customer"),
          item: String(request.itemName ?? request.item ?? "—"),
          reason: String(request.reason ?? "—").replaceAll("_", " ").toLowerCase(),
          status: String(request.status ?? "OPEN") as RequestStatus,
          date: request.createdAt ? new Date(String(request.createdAt)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
        }));
        const counts = { total: rows.length, open: 0, inReview: 0, approved: 0, completed: 0 };
        rows.forEach((row) => {
          if (row.status === "OPEN") counts.open++;
          if (row.status === "IN_REVIEW") counts.inReview++;
          if (row.status === "APPROVED") counts.approved++;
          if (row.status === "COMPLETED") counts.completed++;
        });
        setData({ ...counts, recent: rows });
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  const counts = data ?? { total: 0, open: 0, inReview: 0, approved: 0, completed: 0, recent: [] };
  return (
    <AppShell>
      <div id="overview" className="space-y-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7900] dark:text-[#EABF24]">Returns operations <span className="mx-1 text-[rgb(var(--muted-foreground))]">/</span> Overview</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[rgb(var(--foreground))] sm:text-[34px]">Returns overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[rgb(var(--muted-foreground))]">A clear view of incoming requests and their current status.</p>
          </div>
          <a href="#requests" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#EABF24] px-4 py-2.5 text-sm font-semibold text-[#202735] transition-colors hover:bg-[#DDB21A] sm:self-auto">View requests <ArrowUpRight size={16} /></a>
        </section>

        <section id="workflow" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {statusMeta.map((item) => {
            const Icon = item.icon;
            return <article key={item.key} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(20,25,35,0.06)]">
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">{item.label}</span><span className="grid size-9 place-items-center rounded-lg bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"><Icon size={17} strokeWidth={1.8} /></span></div>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[rgb(var(--foreground))]">{data ? counts[item.key] : "—"}</p>
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{item.detail}</p>
            </article>;
          })}
        </section>

        <section id="requests" className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <div className="flex flex-col gap-3 border-b border-[rgb(var(--border))] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><div className="flex items-center gap-2"><h2 className="text-base font-semibold text-[rgb(var(--card-foreground))]">Recent requests</h2><span className="rounded-md bg-[#FBF3C7] px-2 py-1 text-[10px] font-semibold text-[#735B00] dark:bg-[#433819] dark:text-[#F4D76B]">{data ? counts.total : "…" } total</span></div><p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">The latest return requests submitted by customers.</p></div>
            <a href="#requests" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 text-xs font-semibold text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]">All requests <ArrowUpRight size={14} /></a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead><tr className="bg-[rgb(var(--muted))] text-[10px] uppercase tracking-[0.13em] text-[rgb(var(--muted-foreground))]"><th className="px-6 py-3.5 font-semibold">Request</th><th className="px-4 py-3.5 font-semibold">Customer</th><th className="px-4 py-3.5 font-semibold">Reason</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Created</th></tr></thead>
              <tbody>
                {counts.recent.map((row) => <tr key={row.reference} className="border-t border-[rgb(var(--border))] transition-colors hover:bg-[rgb(var(--muted))]">
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-[rgb(var(--foreground))]">{row.reference}</p><p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{row.item}</p></td>
                  <td className="px-4 py-4 text-sm font-medium text-[rgb(var(--card-foreground))]">{row.customer}</td><td className="px-4 py-4 text-sm capitalize text-[rgb(var(--muted-foreground))]">{row.reason}</td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#E7D48B] bg-[#FFF9DF] px-2.5 py-1 text-[11px] font-semibold text-[#725A00] dark:border-[#6B5825] dark:bg-[#342C19] dark:text-[#F4D76B]"><span className="size-1.5 rounded-full bg-current" />{statusLabels[row.status] ?? "Unknown"}</span></td>
                  <td className="px-4 py-4 text-xs text-[rgb(var(--muted-foreground))]">{row.date}</td>
                </tr>)}
                {!data && !loadError && <tr><td colSpan={5} className="px-6 py-14 text-center text-sm text-[rgb(var(--muted-foreground))]">Loading requests…</td></tr>}
                {data && counts.recent.length === 0 && <tr><td colSpan={5} className="px-6 py-14 text-center"><Inbox className="mx-auto mb-3 size-8 text-[rgb(var(--muted-foreground))]" /><p className="text-sm font-medium text-[rgb(var(--foreground))]">No return requests yet</p><p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">New requests will appear here when submitted.</p></td></tr>}
                {loadError && <tr><td colSpan={5} className="px-6 py-14 text-center"><p className="text-sm font-medium text-[rgb(var(--foreground))]">Couldn’t load requests</p><p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Check the API connection and refresh this page.</p></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-[rgb(var(--border))] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-[rgb(var(--muted-foreground))]">{data ? `Showing ${counts.recent.length} of ${counts.total} requests` : "Loading live request data"}</p><span className="inline-flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]"><span className={`size-1.5 rounded-full ${data ? "bg-[#EABF24]" : "bg-[rgb(var(--muted-foreground))]"}`} />{data ? "Live request data" : loadError ? "API unavailable" : "Connecting to API"}</span></div>
        </section>
        <footer className="flex flex-col justify-between gap-2 pb-2 text-xs text-[rgb(var(--muted-foreground))] sm:flex-row"><span>ReturnDesk · Returns operations workspace</span><span>Built for clearer, faster resolutions.</span></footer>
      </div>
    </AppShell>
  );
}
