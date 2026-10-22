"use client";

import Link from "next/link";
import { AnimatedNumber } from "@/features/refunds/components/animated-number";
import { REFUND_SUMMARY_CARDS } from "@/features/refunds/refund-summary-cards";
import type { RefundStatus } from "@/features/refunds/refund-utils";

export type RefundSummaryValues = {
  awaitingCount: number;
  processedCount: number;
  totalRefundValue: number;
};

type RefundSummaryCardsProps = {
  values: RefundSummaryValues;
  loading: boolean;
  onSelectStatus: (status: RefundStatus) => void;
};

export function RefundSummaryCards({
  values,
  loading,
  onSelectStatus,
}: RefundSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {REFUND_SUMMARY_CARDS.map((card) => (
        <Link
          href={card.href}
          key={card.id}
          onClick={() => onSelectStatus(card.status)}
          className="block rounded-xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#D6A100]"
        >
          <article className="group h-full rounded-xl border border-[rgb(var(--border))] bg-white p-4 text-[#23221E] shadow-sm transition hover:shadow-md dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {card.label}
              </p>
              <span className={`grid size-9 place-items-center rounded-lg ${card.tone}`}>
                <card.icon size={17} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              <AnimatedNumber
                value={loading ? 0 : values[card.valueKey]}
                format={card.format}
              />
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}
