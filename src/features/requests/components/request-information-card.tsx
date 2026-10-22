import { IndianRupee } from "lucide-react";
import type { RequestRecord } from "@/features/requests/api/requests-api";
import {
  formatCurrencyINR,
  formatDate,
  formatRequestStatus,
} from "@/features/requests/presentation";

type RequestInformationCardProps = {
  item: RequestRecord;
};

const pretty = formatRequestStatus;

export function RequestInformationCard({ item }: RequestInformationCardProps) {
  return (
<section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 dark:bg-[rgb(var(--card))]">
          <h2 className="font-semibold">Request details</h2>
          <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">{[["Customer", item.customerName], ["Email", item.customerEmail], ["SKU", item.itemSku], ["Quantity", String(item.quantity)], ["Reason", pretty(item.reason)], ["Created", formatDate(item.createdAt, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })]].map(([k, v]) => <div key={k}>
          <dt className="text-xs text-[rgb(var(--muted-foreground))]">{k}</dt>
          <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>)}</dl>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))] p-3">
          <div>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Product price / refund amount</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{item.refundAmount != null ? formatCurrencyINR(Number(item.refundAmount)) : item.productPrice != null ? formatCurrencyINR(Number(item.productPrice) * item.quantity) : "Not available"}</p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{item.refundAmount != null ? "Saved refund amount" : item.productPrice != null ? "Product price " + formatCurrencyINR(Number(item.productPrice)) + " × quantity " + item.quantity + ". Confirm the eligible amount before approval." : "Product price is not recorded for this request."}</p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#E8D98A] bg-[#FFF9DC] text-[#725500]">
          <IndianRupee size={18}/>
          </span>
          </div>
          <div className="mt-5 border-t border-[rgb(var(--border))] pt-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Description</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{item.description}</p>
          </div>{item.resolution && <div className="mt-5 rounded-xl border border-[#F1D778] bg-[#FFF9DC] p-4 dark:border-[#6E5A20] dark:bg-[#342C19]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#725500] dark:text-[#F4D76B]">Approved resolution</p>
          <p className="mt-1 text-sm font-medium text-[#3C3216] dark:text-[#F4D76B]">{pretty(item.resolution)}</p>{item.resolution === "REFUND" && <div className="mt-3 border-t border-[#E8D78D] pt-3 dark:border-[#6E5A20]">
          <p className="text-xs text-[#725500] dark:text-[#DCCB86]">Refund amount</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[#2E2819] dark:text-[#FFF0A8]">{item.refundAmount != null ? formatCurrencyINR(Number(item.refundAmount)) : "Not set"}</p>
          <p className="mt-1 text-xs text-[#725500] dark:text-[#DCCB86]">Amount saved with the approved request</p>
          </div>}</div>}</section>
  );
}
