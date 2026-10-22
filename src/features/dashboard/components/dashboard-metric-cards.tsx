"use client";

import Link from "next/link";
import { AnimatedNumber } from "@/features/refunds/components/animated-number";
import { DASHBOARD_METRIC_CARDS } from "../dashboard-metric-data";

type DashboardMetricValues = {
  open: number;
  inReview: number;
  approved: number;
  completed: number;
};

type DashboardMetricCardsProps = {
  metrics: DashboardMetricValues | null;
  loading: boolean;
};

export function DashboardMetricCards({
  metrics,
  loading,
}: DashboardMetricCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      {DASHBOARD_METRIC_CARDS.map((card) => {
        const value = metrics?.[card.metricKey] ?? 0;

        return (
          <Link
            key={card.id}
            href={card.href}
            className="block rounded-xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#D6A100]"
          >
            <article className="h-full rounded-xl border border-[#D8D2C2] bg-white p-4 transition-shadow hover:shadow-md dark:border-[#514D40] dark:bg-[rgb(var(--card))] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  {card.label}
                </p>
                <span className="grid size-9 place-items-center rounded-lg border border-[#D8D2C2] bg-[#F1EEE5] text-[#292821] dark:border-[#514D40] dark:bg-[#343229] dark:text-[#F2EBD8]">
                  <card.icon size={17} strokeWidth={2.1} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
                {loading && !metrics ? "—" : <AnimatedNumber value={value} />}
              </p>
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {card.helper}
              </p>
            </article>
          </Link>
        );
      })}
    </section>
  );
}
