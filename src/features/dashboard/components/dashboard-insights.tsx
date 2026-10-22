"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Inbox,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContainer,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/ui/data-table";
import { AnimatedNumber } from "@/features/refunds/components/animated-number";
import {
  DASHBOARD_REASON_COLORS,
  DASHBOARD_STATUS_CLASSES,
  formatDashboardDate,
  formatDurationHours,
  getMaximumReasonCount,
  getReasonBarWidth,
  humanizeDashboardValue,
} from "@/features/dashboard/dashboard-utils";
import type { DashboardData } from "@/features/dashboard/types";

function Panel({
  title,
  description,
  children,
  action
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white dark:bg-[rgb(var(--card))]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgb(var(--border))] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-[rgb(var(--muted-foreground))]">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

type DashboardInsightsProps = {
  dashboard: DashboardData | null;
  loading: boolean;
  error: string;
};

export function DashboardInsights({ dashboard, loading, error }: DashboardInsightsProps) {
  const recent = dashboard?.recent ?? [];
  const metrics = dashboard?.metrics;
  const delta = metrics ? metrics.current30Days - metrics.previous30Days : 0;
  const maxReason = useMemo(
    () => getMaximumReasonCount(dashboard?.reasons ?? []),
    [dashboard?.reasons],
  );

  return (
    <>
<section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title="Pending approvals"
            description="Oldest requests waiting for a decision."
            action={
              <span className="rounded-md bg-[#FFF0A6] px-2 py-1 text-[10px] font-semibold text-[#594300] dark:bg-[#433819] dark:text-[#F4D76B]">
                {metrics?.inReview ?? 0} in review
              </span>
            }
          >
            {!dashboard && loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-12 animate-pulse rounded-lg bg-[rgb(var(--muted))]"
                  />
                ))}
              </div>
            ) : dashboard?.pendingApprovals.length ? (
              <div className="divide-y divide-[rgb(var(--border))]">
                {dashboard.pendingApprovals.map((request) => (
                  <Link
                    key={request.id}
                    href={"/requests/" + request.id}
                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[rgb(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A100] first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[rgb(var(--foreground))]">
                        {request.reference}
                      </p>
                      <p className="mt-1 truncate text-xs text-[rgb(var(--muted-foreground))]">
                        {request.customerName} · {request.itemName}
                      </p>
                      <p className="mt-1 text-[11px] text-[rgb(var(--muted-foreground))]">
                        {humanizeDashboardValue(request.reason)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="dashboard-status dashboard-status-review inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold">
                        In review
                      </span>
                      <p className="mt-1 text-[10px] text-[rgb(var(--muted-foreground))]">
                        {formatDashboardDate(request.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center">
                <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
                <p className="mt-2 text-sm font-semibold text-[rgb(var(--foreground))]">
                  Nothing waiting for approval
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                  New requests needing review will appear here.
                </p>
              </div>
            )}
          </Panel>

          <Panel
            title="Return reasons"
            description="Distribution across current, non-archived requests."
          >
            {!dashboard && loading ? (
              <div className="h-44 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
            ) : dashboard?.reasons.length ? (
              <div className="space-y-4">
                {dashboard.reasons.slice(0, 6).map((item, index) => (
                  <div key={item.reason}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-medium text-[rgb(var(--foreground))]">
                        {item.reason}
                      </span>
                      <span className="shrink-0 tabular-nums text-[rgb(var(--muted-foreground))]">
                        {item.count} ·{" "}
                        {metrics?.total
                          ? Math.round((item.count / metrics.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#F4F1E7] dark:bg-[#34332D]">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: getReasonBarWidth(item.count, maxReason),
                          backgroundColor:
                            DASHBOARD_REASON_COLORS[index % DASHBOARD_REASON_COLORS.length]
}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[rgb(var(--muted-foreground))]">
                No return reasons to display yet.
              </div>
            )}
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel
            title="Resolution performance"
            description="Calculated from recorded terminal status-change events."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#D8D2C2] border-l-4 border-l-[#D6A100] bg-white p-4 dark:border-[#514D40] dark:border-l-[#E9B51B] dark:bg-[rgb(var(--card))]">
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Average resolution
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
                  {loading && !metrics
                    ? "—"
                    : formatDurationHours(metrics?.averageResolutionHours ?? null)}
                </p>
                <p className="mt-1 text-[10px] text-[rgb(var(--muted-foreground))]">
                  From request creation
                </p>
              </div>
              <div className="rounded-xl border border-[#D8D2C2] border-l-4 border-l-[#D6A100] bg-white p-4 dark:border-[#514D40] dark:border-l-[#E9B51B] dark:bg-[rgb(var(--card))]">
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Resolved events
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
                  {loading && !metrics ? (
                    "—"
                  ) : (
                    <AnimatedNumber value={metrics?.resolvedCount ?? 0} />
                  )}
                </p>
                <p className="mt-1 text-[10px] text-[rgb(var(--muted-foreground))]">
                  Completed or rejected
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#B98A00]" />
                <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
                  Request volume · last 30 days
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-2xl font-semibold text-[rgb(var(--foreground))]">
                  {loading && !metrics ? (
                    "—"
                  ) : (
                    <AnimatedNumber value={metrics?.current30Days ?? 0} />
                  )}
                </p>
                {metrics && (
                  <span className="rounded-md bg-[rgb(var(--muted))] px-2 py-1 text-[10px] font-semibold text-[rgb(var(--foreground))]">
                    {delta > 0 ? "+" : ""}
                    {delta} vs previous 30 days
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                Previous period:{" "}
                {metrics ? (
                  <AnimatedNumber value={metrics.previous30Days} />
                ) : (
                  "—"
                )}{" "}
                requests
              </p>
            </div>
          </Panel>

          <Panel
            title="Recent requests"
            description="Latest requests from the live database."
            action={
              <span className="rounded-md bg-[#FFF0A6] px-2 py-1 text-[10px] font-semibold text-[#594300] dark:bg-[#433819] dark:text-[#F4D76B]">
                {metrics?.total ?? 0} total
              </span>
            }
          >
            <DataTableContainer>
              <DataTable className="w-full min-w-[540px] border-collapse text-left">
                <DataTableHeader>
                  <DataTableRow className="bg-[#FFF9DC] text-[10px] uppercase tracking-[0.1em] text-[#5B4A10] dark:bg-[#342C19] dark:text-[#F4D76B]">
                    <DataTableHead className="rounded-l-md px-3 py-3 font-semibold">
                      Request
                    </DataTableHead>
                    <DataTableHead className="px-3 py-3 font-semibold">Customer</DataTableHead>
                    <DataTableHead className="px-3 py-3 font-semibold">Status</DataTableHead>
                    <DataTableHead className="rounded-r-md px-3 py-3 font-semibold">
                      Created
                    </DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {recent.map((row) => (
                    <DataTableRow
                      key={row.id}
                      onClick={() =>
                        window.location.assign("/requests/" + row.id)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          window.location.assign("/requests/" + row.id);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={"View request " + row.reference}
                      className="cursor-pointer border-b border-[rgb(var(--border))] transition-colors hover:bg-[#FFFBE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D6A100] dark:hover:bg-[#34301F] last:border-0"
                    >
                      <DataTableCell className="px-3 py-3">
                        <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
                          {row.reference}
                        </p>
                        <p className="mt-1 max-w-40 truncate text-[10px] text-[rgb(var(--muted-foreground))]">
                          {row.itemName}
                        </p>
                      </DataTableCell>
                      <DataTableCell className="px-3 py-3">
                        <p className="max-w-32 truncate text-xs text-[rgb(var(--foreground))]">
                          {row.customerName}
                        </p>
                        <p className="mt-1 max-w-32 truncate text-[10px] text-[rgb(var(--muted-foreground))]">
                          {humanizeDashboardValue(row.reason)}
                        </p>
                      </DataTableCell>
                      <DataTableCell className="px-3 py-3">
                        <span
                          className={
                            "inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-bold shadow-sm " +
                            (DASHBOARD_STATUS_CLASSES[row.status] ?? "")
                          }
                        >
                          {humanizeDashboardValue(row.status)}
                        </span>
                      </DataTableCell>
                      <DataTableCell className="whitespace-nowrap px-3 py-3 text-[10px] text-[rgb(var(--muted-foreground))]">
                        {formatDashboardDate(row.createdAt)}
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                  {loading && !dashboard && (
                    <DataTableRow>
                      <DataTableCell
                        colSpan={4}
                        className="px-3 py-10 text-center text-xs text-[rgb(var(--muted-foreground))]"
                      >
                        Loading live data…
                      </DataTableCell>
                    </DataTableRow>
                  )}
                  {!loading && !error && recent.length === 0 && (
                    <DataTableRow>
                      <DataTableCell colSpan={4} className="px-3 py-10 text-center">
                        <Inbox className="mx-auto size-7 text-[rgb(var(--muted-foreground))]" />
                        <p className="mt-2 text-xs font-semibold text-[rgb(var(--foreground))]">
                          No return requests yet
                        </p>
                        <p className="mt-1 text-[10px] text-[rgb(var(--muted-foreground))]">
                          Create a request to start tracking returns.
                        </p>
                      </DataTableCell>
                    </DataTableRow>
                  )}
                </DataTableBody>
              </DataTable>
            </DataTableContainer>
          </Panel>
        </section>
    </>
  );
}
