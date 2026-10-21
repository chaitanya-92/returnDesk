"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Clock3,
  PackageCheck, RefreshCw, RotateCcw, ShieldCheck, TrendingUp, Inbox,
  CircleAlert, CalendarDays,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

type RequestStatus = "OPEN" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";
type DashboardRequest = {
  id: string;
  reference: string;
  customerName: string;
  itemName: string;
  reason: string;
  status?: RequestStatus;
  createdAt: string;
};
type DashboardData = {
  counts: { total: number; open: number; inReview: number; approved: number; rejected: number; completed: number; active: number };
  reasons: { key: string; label: string; count: number }[];
  recent: DashboardRequest[];
  pending: DashboardRequest[];
  weeklyTrend: { label: string; count: number }[];
  resolutionPerformance: { averageDays: number | null; closedCount: number; periodLabel: string };
};

const statusLabels: Record<RequestStatus, string> = {
  OPEN: "Open", IN_REVIEW: "In review", APPROVED: "Approved",
  REJECTED: "Rejected", COMPLETED: "Completed",
};
const statusStyles: Record<RequestStatus, string> = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-800",
  IN_REVIEW: "border-sky-200 bg-sky-50 text-sky-800",
  APPROVED: "border-violet-200 bg-violet-50 text-violet-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};
const reasonColors = ["bg-[#E7B21A]", "bg-[#8E9B73]", "bg-[#6D8CA5]", "bg-[#B6A0C8]", "bg-[#D98C72]", "bg-[#B6B3A8]"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function titleCase(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MetricCard({ label, value, detail, icon: Icon, tone }: {
  label: string; value: number; detail: string; icon: typeof Clock3; tone: string;
}) {
  return (
    <article className="rounded-2xl border border-[#EAE8E1] bg-white p-5 shadow-[0_2px_8px_rgba(35,34,30,0.025)] transition-shadow hover:shadow-[0_8px_24px_rgba(35,34,30,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6D6A60]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#23221E]">{value.toLocaleString("en-IN")}</p>
        </div>
        <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={19} strokeWidth={1.8} /></span>
      </div>
      <p className="mt-3 text-xs text-[#777469]">{detail}</p>
    </article>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-2xl border border-[#EAE8E1] bg-white shadow-[0_2px_8px_rgba(35,34,30,0.025)] ${className}`}>{children}</section>;
}
function PanelHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0EEE8] px-5 py-4 sm:px-6"><div><h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#23221E]">{title}</h2><p className="mt-1 text-xs leading-5 text-[#777469]">{description}</p></div>{action}</div>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex flex-col items-center justify-center px-6 py-10 text-center"><span className="grid size-10 place-items-center rounded-xl bg-[#F7F6F1] text-[#777469]"><Inbox size={19} /></span><p className="mt-3 text-sm font-medium text-[#3C3A33]">{title}</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#777469]">{description}</p></div>;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load dashboard data.");
      if (!payload.data) throw new Error("The dashboard returned an unexpected response.");
      setData(payload.data as DashboardData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const maxWeekly = Math.max(1, ...(data?.weeklyTrend.map((week) => week.count) ?? [1]));
  const maxReason = Math.max(1, ...(data?.reasons.map((reason) => reason.count) ?? [1]));
  const counts = data?.counts;

  return (
    <AppShell>
      <div id="overview" className="mx-auto w-full max-w-[1440px] space-y-6 pb-5">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#806000]"><span className="size-1.5 rounded-full bg-[#E7B21A]" /> Returns operations</div>
            <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#23221E] sm:text-[34px]">Returns overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777469]">A live view of return activity, decisions waiting on your team, and resolution performance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E5E2D8] bg-white px-3 text-sm font-medium text-[#454239] transition-colors hover:bg-[#F8F7F2] disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button>
            <a href="#requests" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2B719] px-4 text-sm font-semibold text-[#23221E] shadow-sm transition-colors hover:bg-[#E2AA0E]">View requests <ArrowUpRight size={16} /></a>
          </div>
        </section>

        {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CircleAlert size={18} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold">Dashboard data couldn't be loaded</p><p className="mt-1 text-xs leading-5">{error} Check the database connection and try again.</p></div></div><button type="button" onClick={() => void loadDashboard()} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold hover:bg-rose-100 sm:self-auto">Try again <RefreshCw size={13} /></button></div>}

        <section id="workflow" aria-label="Request status summary" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open requests" value={counts?.open ?? 0} detail="Waiting for initial review" icon={Clock3} tone="bg-[#FFF5D6] text-[#846000]" />
          <MetricCard label="In review" value={counts?.inReview ?? 0} detail="Being assessed by the team" icon={RotateCcw} tone="bg-[#EAF3F8] text-[#35647E]" />
          <MetricCard label="Approved" value={counts?.approved ?? 0} detail="Approved for resolution" icon={ShieldCheck} tone="bg-[#F1ECF8] text-[#70558D]" />
          <MetricCard label="Completed" value={counts?.completed ?? 0} detail="Successfully resolved" icon={PackageCheck} tone="bg-[#EAF4EA] text-[#477A4A]" />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <PanelHeading title="Request activity" description="New requests created over the last six weeks." action={<span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8F7F2] px-2.5 py-1.5 text-[11px] font-medium text-[#6D6A60]"><CalendarDays size={13} /> Last 6 weeks</span>} />
            <div className="px-5 pb-5 pt-6 sm:px-6">
              {loading && !data ? <div className="flex h-44 items-end gap-3">{[38, 58, 44, 76, 52, 65].map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full animate-pulse rounded-t-md bg-[#F5E8B7]" style={{ height: `${height}%` }} /><span className="text-[10px] text-[#969184]">—</span></div>)}</div> :
                !data || data.weeklyTrend.every((week) => week.count === 0) ? <EmptyState title="No recent activity" description="New requests will appear here as they are created." /> :
                <div className="flex h-44 items-end gap-2.5 sm:gap-4">{data.weeklyTrend.map((week, index) => <div key={week.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[11px] font-semibold tabular-nums text-[#5B574B]">{week.count}</span><div className="flex h-[118px] w-full items-end overflow-hidden rounded-t-md bg-[#F8F6EF]"><div title={`${week.count} requests`} className={`w-full rounded-t-md transition-all duration-500 ${index === data.weeklyTrend.length - 1 ? "bg-[#E7B21A]" : "bg-[#D9D4C4]"}`} style={{ height: `${Math.max(week.count ? 8 : 0, (week.count / maxWeekly) * 100)}%` }} /></div><span className="truncate text-[10px] text-[#777469] sm:text-[11px]">{week.label}</span></div>)}</div>}
              <div className="mt-4 flex items-center justify-between border-t border-[#F0EEE8] pt-4 text-xs"><span className="text-[#777469]">All active and closed requests</span><span className="font-semibold text-[#3D3A32]">{loading && !data ? "…" : (counts?.total ?? 0).toLocaleString("en-IN")} total</span></div>
            </div>
          </Panel>

          <Panel>
            <PanelHeading title="Return reasons" description="What customers report most often." action={<span className="text-[11px] text-[#777469]">By volume</span>} />
            <div className="space-y-4 px-5 py-5 sm:px-6">
              {loading && !data ? <div className="space-y-5">{[0, 1, 2, 3].map((item) => <div key={item} className="animate-pulse"><div className="mb-2 h-3 w-2/3 rounded bg-[#F0EEE8]" /><div className="h-2 rounded-full bg-[#F0EEE8]" /></div>)}</div> :
                !data?.reasons.length ? <EmptyState title="No reasons recorded" description="Reason analytics will appear when requests are available." /> :
                data.reasons.map((reason, index) => <div key={reason.key}><div className="mb-2 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-sm ${reasonColors[index % reasonColors.length]}`} /><span className="truncate text-xs font-medium text-[#4A473E]">{reason.label}</span></div><span className="shrink-0 text-xs tabular-nums text-[#777469]">{reason.count} <span className="text-[#A29D91]">· {counts?.total ? Math.round(reason.count / counts.total * 100) : 0}%</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#F3F1EB]"><div className={`h-full rounded-full ${reasonColors[index % reasonColors.length]}`} style={{ width: `${(reason.count / maxReason) * 100}%` }} /></div></div>)}
            </div>
            <div className="border-t border-[#F0EEE8] px-5 py-3.5 text-[11px] text-[#777469] sm:px-6">Percentages are calculated against all non-archived requests.</div>
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel>
            <PanelHeading title="Pending approvals" description="Requests waiting for a team decision." action={<span className="rounded-lg bg-[#FFF5D6] px-2.5 py-1.5 text-[11px] font-semibold text-[#846000]">{loading && !data ? "…" : data?.counts.inReview ?? 0} in review</span>} />
            {loading && !data ? <div className="space-y-4 p-5">{[0, 1, 2].map((item) => <div key={item} className="flex animate-pulse gap-3"><div className="size-10 rounded-xl bg-[#F0EEE8]" /><div className="flex-1 space-y-2 py-1"><div className="h-3 w-1/2 rounded bg-[#F0EEE8]" /><div className="h-3 w-2/3 rounded bg-[#F0EEE8]" /></div></div>)}</div> :
              !data?.pending.length ? <EmptyState title="You're all caught up" description="There are no requests waiting for review right now." /> :
              <div className="divide-y divide-[#F0EEE8]">{data.pending.map((request) => <div key={request.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FFF5D6] text-[#846000]"><Clock3 size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#343229]">{request.reference}</p><p className="mt-1 truncate text-xs text-[#777469]">{request.customerName} · {request.itemName}</p><p className="mt-1 text-[10px] capitalize text-[#9A9487]">{titleCase(request.reason)} · {formatDate(request.createdAt)}</p></div><a href={`/requests/${request.id}`} aria-label={`Review ${request.reference}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#777469] transition-colors hover:bg-[#F8F7F2] hover:text-[#23221E]"><ArrowRight size={16} /></a></div>)}</div>}
            <div className="border-t border-[#F0EEE8] px-5 py-3.5 sm:px-6"><a href="#requests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#705600] hover:text-[#3D3000]">View recent requests <ArrowRight size={13} /></a></div>
          </Panel>

          <Panel>
            <PanelHeading title="Resolution performance" description="How long requests take to reach a final decision." action={<span className="inline-flex items-center gap-1 text-[11px] text-[#777469]"><TrendingUp size={13} /> From status history</span>} />
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="border-b border-[#F0EEE8] px-5 py-5 sm:border-b-0 sm:border-r sm:px-6"><p className="text-xs font-medium text-[#777469]">Average time to close</p><div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-[-0.04em] text-[#23221E]">{loading && !data ? "—" : data?.resolutionPerformance.averageDays == null ? "—" : data.resolutionPerformance.averageDays}</span><span className="text-xs text-[#777469]">{data?.resolutionPerformance.averageDays == null ? "days unavailable" : "days"}</span></div><p className="mt-2 text-[11px] leading-5 text-[#777469]">Calculated from recorded terminal status-change events.</p></div>
              <div className="px-5 py-5 sm:px-6"><p className="text-xs font-medium text-[#777469]">Requests closed with history</p><div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-[-0.04em] text-[#23221E]">{loading && !data ? "—" : (data?.resolutionPerformance.closedCount ?? 0).toLocaleString("en-IN")}</span><span className="text-xs text-[#777469]">tracked</span></div><p className="mt-2 text-[11px] leading-5 text-[#777469]">Completed or rejected requests with a recorded final status change.</p></div>
            </div>
            <div className="flex items-start gap-2 border-t border-[#F0EEE8] bg-[#FBFAF6] px-5 py-3.5 text-[11px] leading-5 text-[#777469] sm:px-6"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#8E9B73]" /><p>Performance figures use event history rather than assuming the last-updated timestamp is the resolution date.</p></div>
          </Panel>
        </section>

        <Panel id="requests">
          <PanelHeading title="Recent requests" description="The latest customer return requests across all statuses." action={<span className="inline-flex items-center gap-1.5 text-[11px] text-[#777469]"><span className={`size-1.5 rounded-full ${error ? "bg-rose-500" : "bg-[#8E9B73]"}`} />{error ? "Connection issue" : "Database-backed"}</span>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="bg-[#FBFAF6] text-[10px] uppercase tracking-[0.12em] text-[#777469]"><th className="px-5 py-3.5 font-semibold sm:px-6">Request</th><th className="px-4 py-3.5 font-semibold">Customer</th><th className="px-4 py-3.5 font-semibold">Reason</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Created</th><th className="px-4 py-3.5 font-semibold"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>
                {loading && !data && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[#777469]"><RefreshCw size={16} className="mx-auto mb-2 animate-spin" />Loading live requests…</td></tr>}
                {!loading && data?.recent.map((request) => <tr key={request.id} className="border-t border-[#F0EEE8] transition-colors hover:bg-[#FDFCF9]"><td className="px-5 py-4 sm:px-6"><p className="text-xs font-semibold text-[#343229]">{request.reference}</p><p className="mt-1 max-w-[190px] truncate text-[11px] text-[#777469]">{request.itemName}</p></td><td className="px-4 py-4"><p className="text-xs font-medium text-[#454239]">{request.customerName}</p></td><td className="px-4 py-4 text-xs text-[#777469]">{titleCase(request.reason)}</td><td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold ${statusStyles[request.status ?? "OPEN"]}`}><span className="size-1.5 rounded-full bg-current" />{statusLabels[request.status ?? "OPEN"]}</span></td><td className="px-4 py-4 text-xs tabular-nums text-[#777469]">{formatFullDate(request.createdAt)}</td><td className="px-4 py-4"><a href={`/requests/${request.id}`} aria-label={`Open ${request.reference}`} className="grid size-8 place-items-center rounded-lg text-[#777469] hover:bg-[#F4F1E8] hover:text-[#23221E]"><ArrowUpRight size={15} /></a></td></tr>)}
                {!loading && data && data.recent.length === 0 && <tr><td colSpan={6}><EmptyState title="No return requests yet" description="Create a request to start tracking returns and see dashboard insights here." /></td></tr>}
                {error && !data && <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[#777469]">Data is unavailable. Use “Try again” above after checking your database connection.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-[#F0EEE8] px-5 py-3.5 text-[11px] text-[#777469] sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>{data ? `Showing ${data.recent.length} of ${data.counts.total} non-archived requests` : "Waiting for dashboard data"}</span><span>All values reflect the current database snapshot.</span></div>
        </Panel>

        <footer className="flex flex-col justify-between gap-2 pt-1 text-[11px] text-[#969184] sm:flex-row"><span>ReturnDesk · Returns operations workspace</span><span className="inline-flex items-center gap-1.5"><ArrowDownRight size={12} /> Clearer decisions, faster resolutions.</span></footer>
      </div>
    </AppShell>
  );
}
