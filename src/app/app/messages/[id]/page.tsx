"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, Phone, UserRound, AlertTriangle, Scissors, CalendarDays,
  Clock, X, RotateCcw, Plus, Send, CalendarPlus, PoundSterling,
} from "lucide-react";
import { Sheet, DarkButton, MiniCalendar, TimeChips } from "@/components/ui";
import { useAppStore } from "@/lib/store/appStore";
import { conversations } from "@/lib/data/product";

// Conversation thread — pinned appointment card, SMS bubbles, inline
// "Select a date" action, reschedule event, suggestion chips, composer with
// in-thread quick actions.

type Bubble =
  | { kind: "client"; text: string; meta: string }
  | { kind: "business"; text: string; meta: string }
  | { kind: "action"; text: string; meta: string }
  | { kind: "event" };

const initialThread: Bubble[] = [
  { kind: "client", text: "Hi, can I move my April appointment to the week after?", meta: "Today, 09:14 · SMS" },
  { kind: "action", text: "Of course! What date works best?", meta: "Today, 09:31 · SMS" },
  { kind: "client", text: "Maybe Thursday the 9th? I'll confirm later today", meta: "Today, 09:45 · SMS" },
];

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const convo = conversations.find((c) => c.id === params?.id) ?? conversations[2];

  const [thread, setThread] = useState<Bubble[]>(initialThread);
  const [rescheduled, setRescheduled] = useState(false);
  const [resched, setResched] = useState(false);
  const [actions, setActions] = useState(false);
  const [draft, setDraft] = useState("");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const send = (text: string) => {
    if (!text.trim()) return;
    setThread((t) => [...t, { kind: "business", text, meta: "Today, 09:51 · SMS" }]);
    setDraft("");
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-muted">
          {convo.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-navy">{convo.name}</p>
          <p className="text-[12px] text-muted">(555) 012-3456</p>
        </div>
        <button aria-label="Call" className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
          <Phone size={15} strokeWidth={1.75} />
        </button>
        <button
          aria-label="View client"
          onClick={() => router.push("/app/clients/sarah")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"
        >
          <UserRound size={15} strokeWidth={1.75} />
        </button>
      </div>

      {/* Pinned upcoming appointment */}
      <div className="border-b border-border px-4 py-3">
        <p className="pb-2 text-[12px] font-medium text-muted">Upcoming Appointment</p>
        {rescheduled && (
          <p className="mb-2.5 flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-[12px] font-medium text-navy">
            <AlertTriangle size={13} strokeWidth={1.75} />
            Appointment Rescheduled
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-navy">
            <Scissors size={17} strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-navy">Blow Dry & Style</p>
            <p className="flex items-center gap-3 pt-0.5 text-[12px] text-secondary">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} strokeWidth={1.75} />
                {rescheduled ? `${day} March, 2026` : "14 April, 2026"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} strokeWidth={1.75} />
                {rescheduled ? time : "13:00 – 14:00"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 pt-3">
          <button className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-[13px] font-semibold text-navy">
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={() => setResched(true)}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-canvas text-[13px] font-semibold text-navy"
          >
            <RotateCcw size={13} />
            Reschedule
          </button>
        </div>
      </div>

      {/* Thread */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {thread.map((b, i) => {
          if (b.kind === "client")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-[9px] font-bold text-secondary">
                  {convo.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-canvas px-4 py-3">
                  <p className="text-[14px] leading-snug text-navy">{b.text}</p>
                  <p className="pt-1.5 text-[10px] text-muted">{b.meta}</p>
                </div>
              </motion.div>
            );
          if (b.kind === "business")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-md bg-fg-primary px-4 py-3 text-white">
                  <p className="text-[14px] leading-snug">{b.text}</p>
                  <p className="pt-1.5 text-[10px] text-white/50">{b.meta}</p>
                </div>
              </motion.div>
            );
          if (b.kind === "action")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-md bg-fg-primary px-4 py-3 text-white">
                  <p className="text-[14px] font-medium leading-snug">{b.text}</p>
                  <button
                    type="button"
                    onClick={() => setResched(true)}
                    className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-semibold text-navy"
                  >
                    <CalendarDays size={14} strokeWidth={1.75} />
                    Select a date
                  </button>
                  <p className="pt-2 text-[10px] text-white/50">{b.meta}</p>
                </div>
              </motion.div>
            );
          // event
          return (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border p-4">
              <p className="border-b border-border pb-2 text-[12px] font-medium text-muted">Appointment Rescheduled !</p>
              <div className="flex items-center gap-3 pt-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-navy">
                  <Scissors size={15} strokeWidth={1.6} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-navy">Blow Dry & Style</p>
                  <p className="text-[12px] text-muted">£55</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 text-[12px]">
                <span className="text-muted">Previous:</span>
                <span className="text-muted line-through">14 April, 2026 at 13:00</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 text-[12px]">
                <span className="text-muted">New:</span>
                <span className="flex items-center gap-2 font-semibold text-navy">
                  <CalendarDays size={12} /> {day} March, 2026 <Clock size={12} /> {time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Suggestions + composer */}
      <div className="shrink-0 border-t border-border">
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 [scrollbar-width:none]">
          {["Your appointment is tomorrow!", "We have availability this week"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="shrink-0 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-medium text-secondary"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 px-4 pb-5 pt-3">
          <button
            type="button"
            aria-label="Quick actions"
            onClick={() => setActions(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Type a message..."
            className="h-11 min-w-0 flex-1 rounded-full bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Send"
            onClick={() => send(draft)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              draft.trim() ? "bg-fg-primary text-white" : "bg-canvas text-muted"
            }`}
          >
            <Send size={15} strokeWidth={1.75} />
          </motion.button>
        </div>
      </div>

      {/* In-thread quick actions */}
      <Sheet open={actions} onClose={() => setActions(false)}>
        <div className="flex flex-col gap-3 pt-1">
          {[
            { icon: <CalendarPlus size={19} strokeWidth={1.7} />, title: "Add New Appointment", sub: "Schedule a new booking" },
            { icon: <RotateCcw size={18} strokeWidth={1.7} />, title: "Reschedule", sub: "Move their upcoming appointment" },
            { icon: <PoundSterling size={19} strokeWidth={1.7} />, title: "Log Payment", sub: "Record a payment received" },
          ].map((a) => (
            <button
              key={a.title}
              type="button"
              onClick={() => {
                setActions(false);
                if (a.title === "Add New Appointment") useAppStore.getState().setQuickAction("appointment");
                if (a.title === "Reschedule") setResched(true);
                if (a.title === "Log Payment") router.push("/app/checkout");
              }}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">
                {a.icon}
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-navy">{a.title}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{a.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* Reschedule sheet */}
      <Sheet open={resched} onClose={() => setResched(false)} title="Reschedule" sub={`${convo.name} · Blow Dry & Style`} full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
        <MiniCalendar selected={day} onSelect={setDay} />
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
        <TimeChips value={time} onSelect={setTime} />
        <div className="pt-6">
          <DarkButton
            disabled={!day || !time}
            onClick={() => {
              setRescheduled(true);
              setThread((t) => [...t, { kind: "event" }, { kind: "business", text: "Perfect see you then !", meta: "Today, 09:52 · SMS" }]);
              setResched(false);
            }}
          >
            {day && time ? `Confirm · ${day} Mar, ${time}` : "Confirm new time"}
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
