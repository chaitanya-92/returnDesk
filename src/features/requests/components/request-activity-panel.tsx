"use client";

import { useState, type FormEvent } from "react";
import { Clock3, MessageSquare, Send } from "lucide-react";
import { formatDate } from "@/features/requests/presentation";

type ActivityItem = {
  id: string;
  text: string;
  date: string;
  kind: "event" | "note";
};

type RequestActivityPanelProps = {
  activityItems: ActivityItem[];
  note: string;
  onNoteChange: (value: string) => void;
  onAddNote: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
};

export function RequestActivityPanel({
  activityItems,
  note,
  onNoteChange,
  onAddNote,
  busy,
}: RequestActivityPanelProps) {
  return (
<section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 dark:bg-[rgb(var(--card))]">
          <h2 className="flex items-center gap-2 font-semibold">
          <Clock3 size={18}/>Activity timeline</h2>
          <ol className="mt-4 space-y-4">{activityItems.map((activity) => <li key={activity.id} className="flex gap-3">
          <span className="mt-1 size-2 rounded-full bg-[#D6A100]"/>
          <div>
          <p className="text-sm">{activity.text}</p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{formatDate(activity.date, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          </li>)}</ol>
          </section>

        <section className="rounded-xl border border-[rgb(var(--border))] bg-white p-5 dark:bg-[rgb(var(--card))]">
          <h2 className="flex items-center gap-2 font-semibold">
          <MessageSquare size={18}/>Internal notes</h2>
          <form onSubmit={onAddNote} className="mt-4 space-y-3">
          <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} maxLength={2000} rows={3} placeholder="Record a customer conversation or internal update…" className="w-full rounded-lg border border-[rgb(var(--border))] bg-white p-3 text-sm text-[#23221E] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--foreground))]"/>
          <button disabled={busy || !note.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] disabled:opacity-50">
          <Send size={15}/>Add internal note</button>
          </form>
          </section>
  );
}
