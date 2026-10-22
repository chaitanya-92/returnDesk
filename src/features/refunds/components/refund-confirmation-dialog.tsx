"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { RefundRequest } from "@/features/refunds/refund-utils";
import { formatCurrencyINR } from "@/features/requests/presentation";

type RefundConfirmationDialogProps = {
  refund: RefundRequest | null;
  busyId: string;
  onClose: () => void;
  onConfirm: (refund: RefundRequest) => Promise<void>;
};

export function RefundConfirmationDialog({
  refund,
  busyId,
  onClose,
  onConfirm,
}: RefundConfirmationDialogProps) {
  if (!refund) return null;

  const formatCurrency = formatCurrencyINR;
  const confirmRefund = refund;
  return (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-6 pt-24 backdrop-blur-[2px] sm:items-center sm:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyId) {
              onClose();
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-refund-title"
            aria-describedby="confirm-refund-description"
            className="my-auto max-h-[calc(100dvh-7rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[rgb(var(--border))] bg-white p-6 text-[#23221E] shadow-2xl sm:max-h-[calc(100dvh-4rem)]"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle size={21} />
            </div>

            <h2
              id="confirm-refund-title"
              className="mt-4 text-lg font-semibold"
            >
              Mark refund as processed?
            </h2>

            <p
              id="confirm-refund-description"
              className="mt-2 text-sm leading-6 text-[rgb(var(--muted-foreground))]"
            >
              Confirm that the refund for{" "}
              <strong className="text-[rgb(var(--foreground))]">
                {confirmRefund.reference}
              </strong>{" "}
              has actually been processed. This will mark the request as
              completed and record the action in its activity timeline.
            </p>

            <div className="mt-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))] p-3">
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="text-[rgb(var(--muted-foreground))]">
                  Order
                </span>

                <span className="text-right font-medium">
                  {confirmRefund.orderNumber}
                </span>
              </div>

              <div className="mt-2 flex items-start justify-between gap-3 text-sm">
                <span className="text-[rgb(var(--muted-foreground))]">
                  Refund amount
                </span>

                <span className="text-right font-semibold tabular-nums">
                  {confirmRefund.refundAmount == null
                    ? "—"
                    : formatCurrency(Number(confirmRefund.refundAmount))}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => onClose()}
                className="rounded-lg border border-[rgb(var(--border))] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={async () => {
                  const selected = confirmRefund;

                  onClose();

                  await onConfirm(selected);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#29230F] hover:bg-[#E5A900] disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {busyId === confirmRefund.id
                  ? "Processing…"
                  : "Confirm processed"}
              </button>
            </div>
          </section>
        </div>
  );
}
