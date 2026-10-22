"use client";

import {
  ArrowUpRight,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";
import { DashboardMetricCards } from "@/features/dashboard/components/dashboard-metric-cards";
import { DashboardInsights } from "@/features/dashboard/components/dashboard-insights";


export default function HomePage() {
  const { dashboard, loading, error, refresh: loadDashboard } = useDashboardData();
  const metrics = dashboard?.metrics;
  return (
    <AppShell>
      <div className="space-y-6" id="overview">
        <section className="flex flex-col justify-between gap-4 border-b border-[rgb(var(--border))] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[rgb(var(--foreground))] sm:text-[32px]">
              Returns overview
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 text-sm font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            <Link
              href="/requests"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] shadow-sm hover:bg-[#DFAE12]"
            >
              View requests <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">
                Dashboard data could not be loaded
              </p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        <DashboardMetricCards metrics={metrics} loading={loading} />

        <DashboardInsights dashboard={dashboard} loading={loading} error={error} />
        <footer className="flex flex-col justify-between gap-2 pb-2 pt-1 text-xs text-[rgb(var(--muted-foreground))] sm:flex-row">
          <span>ReturnDesk · Returns operations workspace</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldAlert size={13} /> Metrics reflect available request and
            event data.
          </span>
        </footer>
      </div>
    </AppShell>
  );
}
