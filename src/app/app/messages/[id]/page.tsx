"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, Phone, UserRound, AlertTriangle, Scissors, CalendarDays,
  Clock, X, RotateCcw, Plus, Send, CalendarPlus, PoundSterling,
  Image as ImageIcon, Video, FileText, Play, Megaphone, Archive, Users,
} from "lucide-react";
import { Sheet, DarkButton, MiniCalendar, TimeChips } from "@/components/ui";
import { useAppStore } from "@/lib/store/appStore";
import { conversations, contactFor, clientRows, teamColumns, type Conversation } from "@/lib/data/product";

// Conversation thread. Renders four shapes from one screen:
//  • client   — pinned appointment card, SMS bubbles, in-thread booking actions
//  • group    — internal salon team chat (sender-labelled bubbles)
//  • class     — auto-managed class broadcast (active = read-write, ended = archived)
//  • business — supplier / partner chat
// The composer "+" opens a single sheet split into Send (photo/video/file) and
// Actions (booking + payment link, client-only). Payment links capture an amount
// before they're sent.

type Attachment = { type: "photo" | "video" | "file"; name: string; meta?: string };

type Bubble =
  | { kind: "client"; text: string; meta: string; from?: { name: string; initials: string }; attachments?: Attachment[] }
  | { kind: "business"; text: string; meta: string; attachments?: Attachment[] }
  | { kind: "action"; text: string; meta: string }
  | { kind: "payment"; meta: string; amount: string; note: string }
  | { kind: "event" };

const QUICK_AMOUNTS = ["20", "35", "55", "85"];

// Resolve the route id to a conversation — falling back to a fresh 1:1 for any
// client or team member reached via Compose, or an appointment's name-slug, that
// has no saved thread yet. A non-empty unknown id always opens a fresh thread for
// THAT person (name decoded from the slug) — never another client's conversation.
function resolveConvo(id?: string): Conversation & { fresh?: boolean } {
  if (id) {
    const existing = conversations.find((c) => c.id === id);
    if (existing) return existing;
    const client = clientRows.find((c) => c.id === id);
    if (client) return { id: client.id, name: client.name, preview: "", time: "", unread: 0, kind: "client", fresh: true };
    const member = teamColumns.find((t) => t.id === id);
    if (member) return { id: member.id, name: member.name, preview: "", time: "", unread: 0, kind: "group", fresh: true, sub: member.role };
    const name = id.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
    return { id, name, preview: "", time: "", unread: 0, kind: "client", fresh: true };
  }
  return conversations[0];
}

const initialsOf = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2);

// Seeded history per conversation. Fresh composes start empty.
function seedThread(convo: Conversation & { fresh?: boolean }): Bubble[] {
  if (convo.fresh) return [];
  switch (convo.id) {
    case "team":
      return [
        { kind: "client", from: { name: "Emma S.", initials: "ES" }, text: "Morning all! Who can take the 2pm colour? I'm running behind on the balayage.", meta: "Today, 09:48 · Chat" },
        { kind: "business", text: "I can shuffle the front desk — give me ten minutes.", meta: "Today, 09:55 · Chat" },
        { kind: "client", from: { name: "Emma S.", initials: "ES" }, text: "I'll cover the 2pm colour 👍", meta: "Today, 10:02 · Chat" },
      ];
    case "supplier":
      return [
        { kind: "business", text: "Hi — can we reorder the 6% developer, 4 boxes please?", meta: "2 Mar, 11:10 · Chat" },
        { kind: "client", from: { name: "Bloom", initials: "BS" }, text: "Of course! Your colour stock order ships Monday.", meta: "2 Mar, 11:24 · Chat" },
      ];
    case "cls-colour":
      return [
        { kind: "business", text: "Hi everyone! Quick reminder that the Colour Masterclass is today at 5pm in the Main Studio.", meta: "Today, 09:05 · Class" },
        { kind: "client", from: { name: "Maya Patel", initials: "MP" }, text: "Can't wait! Do we need to bring anything?", meta: "Today, 09:12 · Class" },
        { kind: "business", text: "Just your own tint brushes — kits and models are provided 🎨", meta: "Today, 09:16 · Class" },
        { kind: "business", text: "Doors open at 4:45 — see you all soon!", meta: "Today, 09:20 · Class" },
      ];
    case "cls-bridal":
      return [
        { kind: "business", text: "Thanks for joining the Bridal Hair Workshop today, everyone!", meta: "28 Feb, 16:40 · Class" },
        { kind: "client", from: { name: "Holly Day", initials: "HD" }, text: "It was brilliant — thank you so much!", meta: "28 Feb, 16:52 · Class" },
        { kind: "business", text: "Thank you all — the recording is in your inbox 💐", meta: "28 Feb, 17:10 · Class" },
      ];
    default:
      // Client booking conversation — the reschedule showcase.
      return [
        { kind: "client", text: "Hi, can I move my April appointment to the week after?", meta: "Today, 09:14 · SMS" },
        { kind: "action", text: "Of course! What date works best?", meta: "Today, 09:31 · SMS" },
        { kind: "client", text: "Maybe Thursday the 9th? I'll confirm later today", meta: "Today, 09:45 · SMS" },
      ];
  }
}

function Attachments({ items, outgoing }: { items: Attachment[]; outgoing: boolean }) {
  const tile = outgoing ? "bg-white/15 text-white" : "bg-white text-secondary";
  const chip = outgoing ? "bg-white/10 text-white" : "bg-white text-navy";
  return (
    <div className="flex flex-wrap gap-2 pb-1.5">
      {items.map((a, i) =>
        a.type === "file" ? (
          <span key={i} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${chip}`}>
            <FileText size={18} strokeWidth={1.7} />
            <span className="min-w-0">
              <span className="block max-w-[150px] truncate text-[13px] font-semibold">{a.name}</span>
              {a.meta && <span className={`block text-[10px] ${outgoing ? "text-white/60" : "text-muted"}`}>{a.meta}</span>}
            </span>
          </span>
        ) : (
          <span key={i} className={`relative flex h-24 w-28 items-center justify-center rounded-xl ${tile}`}>
            {a.type === "video" ? <Play size={22} strokeWidth={1.7} /> : <ImageIcon size={22} strokeWidth={1.6} />}
            {a.type === "video" && a.meta && (
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold text-white">{a.meta}</span>
            )}
          </span>
        )
      )}
    </div>
  );
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const convo = resolveConvo(params?.id);
  const isClient = convo.kind === "client";
  const isClass = convo.kind === "class";
  const archived = !!convo.archived;
  const hasMembers = !!convo.members?.length;
  const channel = isClient ? "SMS" : isClass ? "Class" : "Chat";
  const phone = isClient ? contactFor(convo.name).phone : null;

  const [thread, setThread] = useState<Bubble[]>(() => seedThread(convo));
  const [rescheduled, setRescheduled] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [resched, setResched] = useState(false);
  const [actions, setActions] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState(isClient ? "Blow Dry & Style" : "");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [draft, setDraft] = useState("");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const send = (text: string) => {
    if (!text.trim() && pending.length === 0) return;
    setThread((t) => [
      ...t,
      { kind: "business", text: text.trim(), meta: `Now · ${channel}`, attachments: pending.length ? pending : undefined },
    ]);
    setPending([]);
    setDraft("");
  };

  const attach = (type: Attachment["type"]) => {
    const mock: Record<Attachment["type"], Attachment> = {
      photo: { type: "photo", name: "Photo", meta: "IMG_0421.jpg" },
      video: { type: "video", name: "Video", meta: "0:12" },
      file: { type: "file", name: "Aftercare-guide.pdf", meta: "248 KB" },
    };
    setPending((p) => [...p, mock[type]]);
    setActions(false);
  };

  const sendPaymentLink = () => {
    const amount = `£${parseFloat(payAmount).toFixed(2)}`;
    setThread((t) => [...t, { kind: "payment", amount, note: payNote.trim() || "Payment", meta: `Now · ${channel}` }]);
    setPayOpen(false);
    setPayAmount("");
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        {hasMembers ? (
          <span className="relative block h-10 w-10 shrink-0">
            <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-canvas text-[8px] font-bold text-secondary">{convo.members![0]?.initials}</span>
            {convo.members![1] && <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-canvas text-[7px] font-bold text-secondary">{convo.members![1].initials}</span>}
          </span>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-muted">
            {initialsOf(convo.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-navy">{convo.name}</p>
          <p className="truncate text-[12px] text-muted">{isClient ? phone ?? convo.preview : convo.sub ?? convo.preview}</p>
        </div>
        {phone && (
          <a aria-label={`Call ${convo.name}`} href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
            <Phone size={15} strokeWidth={1.75} />
          </a>
        )}
        {isClient && (
          <button
            aria-label="View client"
            onClick={() => router.push(`/app/clients/${convo.id}`)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <UserRound size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Pinned upcoming appointment — client conversations only */}
      {isClient && !convo.fresh && (
        <div className="border-b border-border px-4 py-3">
          <p className="pb-2 text-[12px] font-medium text-muted">Upcoming Appointment</p>
          {(rescheduled || cancelled) && (
            <p className={`mb-2.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium ${cancelled ? "bg-danger/10 text-danger" : "bg-canvas text-navy"}`}>
              <AlertTriangle size={13} strokeWidth={1.75} />
              {cancelled ? "Appointment cancelled" : "Appointment rescheduled"}
            </p>
          )}
          <div className={`flex items-center gap-3 ${cancelled ? "opacity-50" : ""}`}>
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
          {!cancelled && (
            <div className="flex gap-2.5 pt-3">
              <button
                onClick={() => {
                  setCancelled(true);
                  setThread((t) => [...t, { kind: "action", text: "Appointment cancelled — the slot has been freed up.", meta: "Now · SMS" }]);
                }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-[13px] font-semibold text-navy"
              >
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
          )}
        </div>
      )}

      {/* Class context banner */}
      {isClass && (
        <div className={`flex items-center gap-2.5 border-b border-border px-4 py-3 text-[12px] ${archived ? "text-muted" : "text-secondary"}`}>
          {archived ? <Archive size={15} strokeWidth={1.75} /> : <Megaphone size={15} strokeWidth={1.75} />}
          <span className="font-medium">
            {archived ? "This class has ended — the group chat is read-only." : `Messages are sent to everyone booked on this class (${convo.members?.length ?? 0}).`}
          </span>
        </div>
      )}

      {/* Thread */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {thread.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-[16px] font-semibold text-muted">
              {initialsOf(convo.name)}
            </span>
            <p className="text-[14px] font-semibold text-navy">{convo.name}</p>
            <p className="pt-1 text-[12px] text-muted">This is the start of your conversation. Say hello below.</p>
          </div>
        )}
        {thread.map((b, i) => {
          if (b.kind === "client")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-[9px] font-bold text-secondary">
                  {b.from?.initials ?? initialsOf(convo.name)}
                </span>
                <div className="max-w-[78%]">
                  {b.from && <p className="pb-1 pl-1 text-[10px] font-semibold text-muted">{b.from.name}</p>}
                  <div className="rounded-2xl rounded-bl-md bg-canvas px-4 py-3">
                    {b.attachments && <Attachments items={b.attachments} outgoing={false} />}
                    {b.text && <p className="text-[14px] leading-snug text-navy">{b.text}</p>}
                    <p className="pt-1.5 text-[10px] text-muted">{b.meta}</p>
                  </div>
                </div>
              </motion.div>
            );
          if (b.kind === "business")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-md bg-fg-primary px-4 py-3 text-white">
                  {b.attachments && <Attachments items={b.attachments} outgoing />}
                  {b.text && <p className="text-[14px] leading-snug">{b.text}</p>}
                  <p className="pt-1.5 text-[10px] text-white/50">{b.meta}</p>
                </div>
              </motion.div>
            );
          if (b.kind === "payment")
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md border border-border bg-white p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                    <PoundSterling size={12} strokeWidth={2} /> Payment request
                  </p>
                  <p className="pt-1.5 text-[24px] font-bold leading-none text-navy">{b.amount}</p>
                  <p className="pt-1 text-[13px] text-secondary">{b.note}</p>
                  <button type="button" disabled className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-fg-primary text-[13px] font-semibold text-white opacity-90">
                    Pay now
                  </button>
                  <p className="flex items-center gap-1.5 pt-2.5 text-[11px] text-muted">
                    <Clock size={12} strokeWidth={1.75} /> Awaiting payment · {b.meta}
                  </p>
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
              <p className="border-b border-border pb-2 text-[12px] font-medium text-muted">Appointment rescheduled</p>
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

      {/* Composer — archived class chats are read-only */}
      {archived ? (
        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-border px-4 py-5 text-[12px] font-medium text-muted">
          <Archive size={14} strokeWidth={1.75} /> This conversation is archived
        </div>
      ) : (
        <div className="shrink-0 border-t border-border">
          {isClient && !convo.fresh && (
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
          )}

          {/* Pending attachments staged before send */}
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {pending.map((a, i) => (
                <span key={i} className="flex items-center gap-2 rounded-xl bg-canvas py-1.5 pl-2.5 pr-1.5 text-[12px] font-medium text-navy">
                  {a.type === "file" ? <FileText size={14} strokeWidth={1.7} /> : a.type === "video" ? <Video size={14} strokeWidth={1.7} /> : <ImageIcon size={14} strokeWidth={1.7} />}
                  <span className="max-w-[120px] truncate">{a.name === "Photo" || a.name === "Video" ? a.meta : a.name}</span>
                  <button type="button" aria-label="Remove attachment" onClick={() => setPending((p) => p.filter((_, j) => j !== i))} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-muted">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 px-4 pb-5 pt-3">
            <button
              type="button"
              aria-label="Attach and actions"
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
                draft.trim() || pending.length ? "bg-fg-primary text-white" : "bg-canvas text-muted"
              }`}
            >
              <Send size={15} strokeWidth={1.75} />
            </motion.button>
          </div>
        </div>
      )}

      {/* "+" sheet — Send (media) + Actions (client booking) */}
      <Sheet open={actions} onClose={() => setActions(false)} title="Add to message">
        <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Send</p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { type: "photo" as const, icon: <ImageIcon size={20} strokeWidth={1.7} />, label: "Photo" },
            { type: "video" as const, icon: <Video size={20} strokeWidth={1.7} />, label: "Video" },
            { type: "file" as const, icon: <FileText size={20} strokeWidth={1.7} />, label: "File" },
          ].map((m) => (
            <button
              key={m.type}
              type="button"
              onClick={() => attach(m.type)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white py-4 text-[12px] font-semibold text-navy"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-navy">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {isClient && (
          <>
            <p className="px-1 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Actions</p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: <CalendarPlus size={19} strokeWidth={1.7} />, title: "New appointment", sub: "Schedule a new booking" },
                // Reschedule presumes an upcoming appointment — only offer it when one is surfaced.
                ...(!convo.fresh ? [{ icon: <RotateCcw size={18} strokeWidth={1.7} />, title: "Reschedule", sub: "Move their upcoming appointment" }] : []),
                { icon: <PoundSterling size={19} strokeWidth={1.7} />, title: "Send payment link", sub: "Request a card payment in chat" },
                { icon: <PoundSterling size={19} strokeWidth={1.7} />, title: "Log payment", sub: "Record a payment received in person" },
              ].map((a) => (
                <button
                  key={a.title}
                  type="button"
                  onClick={() => {
                    setActions(false);
                    if (a.title === "New appointment") useAppStore.getState().setQuickAction("appointment");
                    if (a.title === "Reschedule") setResched(true);
                    if (a.title === "Send payment link") setPayOpen(true);
                    if (a.title === "Log payment") {
                      const owed = clientRows.find((c) => c.id === convo.id)?.outstanding;
                      useAppStore.getState().startCheckoutFor({ name: convo.name, initials: initialsOf(convo.name), outstanding: owed });
                      router.push("/app/checkout");
                    }
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">{a.icon}</span>
                  <span>
                    <span className="block text-[15px] font-semibold text-navy">{a.title}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{a.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        {!isClient && (
          <p className="flex items-center gap-1.5 px-1 pt-4 text-[11px] text-muted">
            <Users size={12} />
            Booking and payment actions are available in client conversations.
          </p>
        )}
      </Sheet>

      {/* Send payment link — capture amount + what it's for */}
      <Sheet open={payOpen} onClose={() => setPayOpen(false)} title="Send payment link" sub={`To ${convo.name}`}>
        <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount</p>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4">
          <span className="text-[20px] font-bold text-navy">£</span>
          <input
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            placeholder="0.00"
            className="h-14 min-w-0 flex-1 bg-transparent text-[20px] font-bold text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-2.5">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setPayAmount(a)}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${payAmount === a ? "bg-fg-primary text-white" : "bg-canvas text-secondary"}`}
            >
              £{a}
            </button>
          ))}
        </div>
        <p className="px-1 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">For</p>
        <input
          value={payNote}
          onChange={(e) => setPayNote(e.target.value)}
          placeholder="e.g. Deposit, Blow Dry & Style"
          className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="pt-6">
          <DarkButton disabled={!(parseFloat(payAmount) > 0)} onClick={sendPaymentLink}>
            {parseFloat(payAmount) > 0 ? `Send link · £${parseFloat(payAmount).toFixed(2)}` : "Enter an amount"}
          </DarkButton>
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
              setThread((t) => [...t, { kind: "event" }, { kind: "business", text: "Perfect, see you then!", meta: "Now · SMS" }]);
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
