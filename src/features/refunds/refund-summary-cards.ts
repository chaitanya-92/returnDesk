import { CheckCircle2, Clock3, IndianRupee } from "lucide-react";
import type { RefundStatus } from "./refund-utils";

export const REFUND_SUMMARY_CARDS = [
  {
    id: "awaiting",
    label: "Awaiting processing",
    valueKey: "awaitingCount",
    icon: Clock3,
    tone: "border border-amber-200 bg-amber-100 text-amber-950",
    href: "/refunds?status=APPROVED#refund-table",
    status: "APPROVED",
  },
  {
    id: "processed",
    label: "Processed",
    valueKey: "processedCount",
    icon: CheckCircle2,
    tone: "border border-emerald-200 bg-emerald-100 text-emerald-950",
    href: "/refunds?status=COMPLETED#refund-table",
    status: "COMPLETED",
  },
  {
    id: "total-value",
    label: "Total refund value",
    valueKey: "totalRefundValue",
    icon: IndianRupee,
    tone: "border border-amber-200 bg-amber-100 text-amber-950",
    href: "/refunds#refund-table",
    status: "ALL",
    format: (value: number) =>
      value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  valueKey: "awaitingCount" | "processedCount" | "totalRefundValue";
  icon: typeof Clock3;
  tone: string;
  href: string;
  status: RefundStatus;
  format?: (value: number) => string;
}>;
