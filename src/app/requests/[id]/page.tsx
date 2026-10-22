"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { showToast } from "@/components/ui/toaster";
import {
  requestsApi,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Pencil,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
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

        <aside className="sticky top-4 h-fit space-y-5 self-start">{review && <section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 dark:bg-[rgb(var(--card))]">
          <h2 className="font-semibold">Decision workflow</h2>{item.status === "OPEN" && <button disabled={busy} onClick={() => void transition("IN_REVIEW")} className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm">Move to In Review</button>}{item.status === "IN_REVIEW" && <div className="mt-4 space-y-3">
          <div className="relative">
          <label className="block text-xs font-medium">Resolution</label>
          <button type="button" aria-haspopup="listbox" aria-expanded={resolutionOpen} onClick={() => setResolutionOpen(v => !v)} className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-[#DCDCD5] bg-white px-3 py-2.5 text-left text-sm text-[#23221E] shadow-sm outline-none transition focus:border-[#D7A400] focus:ring-2 focus:ring-[#F2B719]/30">
          <span className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-[#FFF5C2] text-[#725500]">{resolution === "REFUND" ? "₹" : resolution === "REPLACEMENT" ? "↻" : "▣"}</span>{resolution === "REFUND" ? "Refund" : resolution === "REPLACEMENT" ? "Replacement" : "Store credit"}</span>
          <ChevronDown size={16} className={"text-[#6B685F] transition " + (resolutionOpen ? "rotate-180" : "")}/>
          </button>{resolutionOpen && <>
          <button type="button" aria-label="Close resolution options" onClick={() => setResolutionOpen(false)} className="fixed inset-0 z-30 cursor-default">
          </button>
          <div role="listbox" aria-label="Resolution" className="absolute inset-x-0 top-full z-40 mt-1 rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5">{[{ value: "REFUND", label: "Refund", hint: "Return money to the customer", icon: "₹" }, { value: "REPLACEMENT", label: "Replacement", hint: "Send a replacement item", icon: "↻" }, { value: "STORE_CREDIT", label: "Store credit", hint: "Issue account credit", icon: "▣" }].map(option => <button key={option.value} type="button" role="option" aria-selected={resolution === option.value} onClick={() => { setResolution(option.value); setResolutionOpen(false); }} className={"flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition " + (resolution === option.value ? "bg-[#FFF5C2]" : "hover:bg-[#F7F7F5]")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#E8D98A] bg-white text-sm font-semibold text-[#725500]">{option.icon}</span>
          <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{option.label}</span>
          <span className="mt-0.5 block text-xs text-[#77736A]">{option.hint}</span>
          </span>{resolution === option.value && <Check size={16} className="text-[#8B6B00]"/>}</button>)}</div>
          </>}
        </div>{resolution === "REFUND" && <div>
          <label className="block text-xs font-medium">Refund amount (INR)</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#DCDCD5] bg-white px-3 py-2 focus-within:border-[#D7A400] focus-within:ring-2 focus-within:ring-[#F2B719]/20">{editingAmount ? <input autoFocus value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="Enter refund amount" aria-label="Refund amount in INR" className="min-w-0 flex-1 bg-transparent py-1 text-sm text-[#23221E] outline-none"/> : <span className="flex-1 py-1 text-sm font-semibold tabular-nums text-[#23221E]">{amount && Number(amount) > 0 ? Number(amount).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "Enter product refund amount"}</span>}{editingAmount ? <button type="button" aria-label="Finish editing refund amount" onClick={() => setEditingAmount(false)} className="rounded-md p-1.5 text-[#725500] hover:bg-[#FFF5C2]">
          <Check size={16}/>
          </button> : <button type="button" aria-label="Edit refund amount" onClick={() => setEditingAmount(true)} className="rounded-md p-1.5 text-[#6B685F] hover:bg-[#FFF5C2] hover:text-[#725500]">
          <Pencil size={15}/>
          </button>}</div>
          <p className="mt-1.5 text-[11px] leading-4 text-[#77736A]">Confirm the item price before approving. The amount is saved with the decision.</p>
          </div>}<label className="block text-xs font-medium">Decision note<textarea value={decisionNote} onChange={e => setDecisionNote(e.target.value)} rows={2} maxLength={1000} placeholder="Why is this decision appropriate?" className="mt-1.5 w-full rounded-lg border bg-white p-3 text-sm text-[#23221E]"/>
          </label>
          <button disabled={busy || (resolution === "REFUND" && !(Number(amount) > 0))} onClick={() => void transition("APPROVED")} className="w-full rounded-lg bg-[#F2B719] px-3 py-2.5 text-sm font-semibold text-[#23221E] disabled:opacity-50">
          <CheckCircle2 className="mr-1 inline" size={16}/>Approve request</button>
          <button disabled={busy} onClick={() => void transition("REJECTED")} className="mt-2 w-full rounded-lg border border-rose-300 px-3 py-2.5 text-sm font-semibold text-rose-900">
          <XCircle className="mr-1 inline" size={16}/>Reject request</button>
          </div>}</section>}{item.status === "APPROVED" && <section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 dark:bg-[rgb(var(--card))]">
          <h2 className="font-semibold">Fulfilment</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Mark the approved resolution as completed after fulfilment.</p>
          <button disabled={busy} onClick={() => void transition("COMPLETED")} className="mt-4 w-full rounded-lg bg-[#F2B719] px-3 py-2.5 text-sm font-semibold text-[#23221E]">Mark completed</button>
          </section>}<button onClick={() => void load()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
          <RefreshCw size={15}/>Refresh details</button>
          </aside>
          </div>
          </>}
        </div>
      </AppShell>
    );
}
