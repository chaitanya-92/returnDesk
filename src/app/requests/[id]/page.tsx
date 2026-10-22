"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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
  const returnToRequests = () => "/requests" + (typeof window !== "undefined" ? window.location.search : "");

  const [item, setItem] = useState<RequestWithActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("Returning to requests…");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState<"REFUND" | "REPLACEMENT" | "STORE_CREDIT">("REFUND");
  const [amount, setAmount] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const autoReviewAttempted = useRef<string | null>(null);

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
      setAmount(data.refundAmount == null ? (data.productPrice == null ? "" : String(Number(data.productPrice) * data.quantity)) : String(data.refundAmount));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!item || item.status !== "OPEN" || autoReviewAttempted.current === id) return;
    autoReviewAttempted.current = id;
    let cancelled = false;
    async function startReviewOnOpen() {
      setBusy(true);
      setError("");
      try {
        await requestsApi.transition(id, { status: "IN_REVIEW" });
        if (cancelled) return;
        showToast("Request moved to In Review", "success");
        await load();
      } catch (cause) {
        if (cancelled) return;
        const message = cause instanceof Error ? cause.message : "Could not start request review";
        setError(message);
        showToast(message, "error");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void startReviewOnOpen();
    return () => { cancelled = true; };
  }, [item, id, load]);

  async function returnToRequestsAfterToast(message: string) {
    setRedirectMessage(message);
    setRedirecting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1600));
    router.push(returnToRequests());
  }

  async function transition(
    status: "IN_REVIEW" | "APPROVED" | "PROCESSING" | "REJECTED" | "COMPLETED",
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

      if (status === "IN_REVIEW") {
        showToast("Request moved to In Review", "success");
        await load();
        return;
      }

      if (status === "APPROVED") {
        showToast("Request approved", "success", "Opening the requests table…");
        await returnToRequestsAfterToast("Approved successfully. Returning to requests…");
        return;
      }

      if (status === "PROCESSING") {
        showToast("Fulfilment started", "success", "Complete the resolution after it succeeds.");
        await load();
        return;
      }

      if (status === "REJECTED") {
        showToast("Request rejected", "success", "Returning to the requests table…");
        await returnToRequestsAfterToast("Request rejected. Returning to requests…");
        return;
      }

      showToast("Request marked completed", "success");
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
        <div className="relative min-w-0 space-y-5 pb-8">
          {redirecting && <div role="status" aria-live="polite" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]">
            <div className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-xl dark:bg-[rgb(var(--card))]">
              <span className="h-9 w-9 shrink-0 animate-spin rounded-full border-4 border-[#F2B719]/25 border-t-[#B8872C]" />
              <div><p className="font-semibold text-[rgb(var(--foreground))]">{redirectMessage}</p><p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Please wait while we return you to the correct table view.</p></div>
            </div>
          </div>}
          <button onClick={() => router.push(returnToRequests())} className="inline-flex items-center gap-2 text-sm font-medium text-[#7A5B00]">
          <ArrowLeft size={16}/>Return requests</button>{error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">{error}</div>}

        {loading ? <RequestDetailsSkeleton /> : !item ? <p>Request not found.</p> : <>
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgb(var(--border))] bg-white pb-5 pt-1">
          <div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">{item.reference}</p>
          <h1 className="mt-1 text-3xl font-semibold">{item.itemName}</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Order {item.orderNumber} · Item {item.orderItemId}</p>
          </div>
          <StatusBadge status={item.status} className="px-3 py-1.5 text-sm font-semibold" />
          </header>

        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <div className="min-w-0 space-y-5">
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
