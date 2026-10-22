"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { showToast } from "@/components/ui/toaster";
import {
  requestsApi,
  type RequestEvent,
  type RequestNote,
  type RequestRecord,
  type TransitionRequestInput,
} from "@/features/requests/api/requests-api";
import { StatusBadge } from "@/components/requests/status-badge";
import { RequestDecisionPanel } from "@/features/requests/components/request-decision-panel";
import { RequestDetailsSkeleton } from "@/features/requests/components/request-details-skeleton";
import { RequestActivityPanel } from "@/features/requests/components/request-activity-panel";
import { RequestInformationCard } from "@/features/requests/components/request-information-card";

type RequestWithActivity = RequestRecord & {
  notes: RequestNote[];
  events: RequestEvent[];
};


export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<RequestWithActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [resolution, setResolution] = useState<"REFUND" | "REPLACEMENT" | "STORE_CREDIT">("REFUND");
  const [amount, setAmount] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await requestsApi.get(id);
      setItem({
        ...data,
        notes: data.notes ?? [],
        events: data.events ?? [],
      });
      setResolution(data.resolution ?? "REFUND");
      setAmount(data.refundAmount == null ? "" : String(data.refundAmount));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);
  async function transition(
    status: "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED",
  ) {
    setBusy(true);
    setError("");

    try {
      const input: TransitionRequestInput = {
        status,
        note: decisionNote.trim() || undefined,
      };

      if (status === "APPROVED") {
        input.resolution = resolution;
        if (resolution === "REFUND") input.refundAmount = Number(amount);
      }

      await requestsApi.transition(id, input);
      setDecisionNote("");
      setToast("Request updated.");
      showToast("Request updated");
      await load();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not update request";
      setError(message);
      showToast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function addNote(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;

    setBusy(true);
    setError("");

    try {
      await requestsApi.addNote(id, note, "Operations team");
      setNote("");
      setToast("Internal note added.");
      showToast("Internal note added");
      await load();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not add note";
      setError(message);
      showToast(message, "error");
    } finally {
      setBusy(false);
    }
  }

    const review = item?.status === "OPEN" || item?.status === "IN_REVIEW";
    const activityItems = [
      ...(item?.events ?? []).map((event) => ({
        id: event.id,
        text: event.message,
        date: event.createdAt,
        kind: "event" as const,
      })),
      ...(item?.notes ?? []).map((requestNote) => ({
        id: requestNote.id,
        text: `Internal note by ${requestNote.author}: ${requestNote.body}`,
        date: requestNote.createdAt,
        kind: "note" as const,
      })),
    ].slice().sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
    return (
      <AppShell>
        <div className="relative min-h-[65vh] space-y-6">
          <button onClick={() => router.push("/requests")} className="inline-flex items-center gap-2 text-sm font-medium text-[#7A5B00]">
          <ArrowLeft size={16}/>Return requests</button>{toast && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">{toast}</div>}{error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">{error}</div>}

        {loading ? <RequestDetailsSkeleton /> : !item ? <p>Request not found.</p> : <>
          <header className="sticky top-0 z-20 flex flex-wrap items-start justify-between gap-3 border-b border-[rgb(var(--border))] bg-white pb-5 pt-2 dark:bg-[rgb(var(--background))]">
          <div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">{item.reference}</p>
          <h1 className="mt-1 text-3xl font-semibold">{item.itemName}</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Order {item.orderNumber} · Item {item.orderItemId}</p>
          </div>
          <StatusBadge status={item.status} className="px-3 py-1.5 text-sm font-semibold" />
          </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]">
          <div className="min-w-0 max-h-[calc(100vh-245px)] space-y-5 overflow-y-auto overscroll-contain pr-3 [scrollbar-width:thin] [scrollbar-color:#C9C4B7_transparent]" style={{ scrollbarGutter: "stable" }}>
                    <RequestInformationCard item={item} />

                  <RequestActivityPanel
            activityItems={activityItems}
            note={note}
            onNoteChange={setNote}
            onAddNote={addNote}
            busy={busy}
          />
          </div>

        <RequestDecisionPanel
          item={item}
          review={review}
          busy={busy}
          resolution={resolution}
          onResolutionChange={setResolution}
          resolutionOpen={resolutionOpen}
          onResolutionOpenChange={setResolutionOpen}
          amount={amount}
          onAmountChange={setAmount}
          decisionNote={decisionNote}
          onDecisionNoteChange={setDecisionNote}
          editingAmount={editingAmount}
          onEditingAmountChange={setEditingAmount}
          onTransition={(status) => void transition(status)}
          onRefresh={() => void load()}
        />
          </div>
          </>}
        </div>
      </AppShell>
    );
}
