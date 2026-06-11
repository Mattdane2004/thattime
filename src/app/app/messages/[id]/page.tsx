import Link from "next/link";
import { ChevronLeft, Phone, AlertTriangle, CalendarPlus, Send } from "lucide-react";
import { getConversationThread, type ThreadMessage } from "@/lib/data/conversationThreads";

// Conversation thread — ported from the legacy that-time-app
// /routes/main/Conversation.jsx. Server component rendering the message
// history; sending / reschedule actions are backlog (the input bar is inert).

function Bubble({ m }: { m: ThreadMessage }) {
  if (m.from === "system") {
    return (
      <div className="mx-auto my-2 w-full max-w-[85%] rounded-2xl border border-border bg-canvas px-4 py-3 text-center">
        <div className="text-[12px] font-semibold text-navy">{m.title}</div>
        <div className="mt-1 text-[12px] text-secondary">{m.service} · {m.price}</div>
        {m.previous && <div className="mt-1 text-[11px] text-muted line-through">{m.previous}</div>}
        {m.next && <div className="text-[11px] font-medium text-navy">{m.next.date} at {m.next.time}</div>}
      </div>
    );
  }
  const mine = m.from === "business";
  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] ${mine ? "bg-navy text-white" : "bg-canvas text-navy"}`}>
        {m.text}
      </div>
      {m.meta && <div className="mt-0.5 px-1 text-[10px] text-muted">{m.meta}</div>}
    </div>
  );
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const t = getConversationThread(params.id);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Link href="/app/messages" aria-label="Back to messages" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-muted">{t.initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-navy">{t.name}</div>
          <div className="text-[11px] text-muted">{t.phone}</div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-muted"><Phone size={17} /></span>
      </div>

      {/* Appointment banner */}
      <div className="border-b border-border px-4 pb-3 pt-3">
        <div className="mb-2 text-[12px] text-muted">Upcoming Appointment</div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 py-2.5">
          <AlertTriangle size={13} className="shrink-0 text-secondary" strokeWidth={1.75} />
          <span className="text-[12px] font-medium text-secondary">{t.appointment.banner}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <CalendarPlus size={13} />{t.appointment.service} · {t.appointment.date} · {t.appointment.time}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {t.messages.map((m) => <Bubble key={m.id} m={m} />)}
      </div>

      {/* Suggestions + inert input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {t.suggestions.map((s) => (
            <span key={s} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[12px] text-secondary">{s}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-11 flex-1 rounded-full bg-canvas px-4 text-[13px] leading-[2.75rem] text-muted">Message…</div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white"><Send size={17} /></span>
        </div>
      </div>
    </div>
  );
}
