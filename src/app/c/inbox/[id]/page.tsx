"use client";

// Message thread — bubbles, inline booking cards, quick replies, composer.
// Tab bar auto-hides on this route (see ClientTabBar).

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Phone,
  Info,
  Camera,
  Plus,
  Send,
  CalendarCheck,
  ImagePlus,
  CalendarPlus,
  ChevronRight,
} from "lucide-react";
import { getConversation, getSalon, getBooking, type ChatMessage } from "@/lib/data/b2c";
import { Sheet } from "@/components/ui";
import { Avatar } from "@/components/ui/consumer";

const QUICK_REPLIES = ["Thanks!", "Can I reschedule?", "Running 5 min late"];

function BookingCard({ bookingId }: { bookingId: string }) {
  const booking = getBooking(bookingId);
  if (!booking) return null;
  return (
    <div className="mb-1.5 w-full overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative h-20 w-full bg-border">
        <Image src={booking.image} alt={booking.offerName} fill sizes="240px" className="object-cover" />
      </div>
      <div className="px-3.5 py-3">
        <p className="text-[13px] font-bold text-navy">{booking.offerName}</p>
        <p className="text-[12px] text-secondary">
          {booking.date} · {booking.time} · {booking.staff}
        </p>
        <Link
          href={`/c/bookings/${booking.id}`}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-coral"
        >
          View booking
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const me = msg.from === "me";
  return (
    <div className={`flex flex-col ${me ? "items-end" : "items-start"}`}>
      <div className={`max-w-[78%] ${msg.bookingId ? "w-[78%]" : ""}`}>
        {msg.bookingId && <BookingCard bookingId={msg.bookingId} />}
        <div
          className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
            me ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-border bg-surface text-navy"
          }`}
        >
          {msg.text}
        </div>
      </div>
      <span className="mt-1 px-1 text-[11px] text-muted">{msg.time}</span>
    </div>
  );
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const conversation = getConversation(id);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);
  const [draft, setDraft] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);

  if (!conversation) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-canvas">
        <p className="text-[15px] font-bold text-navy">Conversation not found</p>
        <Link href="/c/inbox" className="text-[13px] font-semibold text-coral">
          Back to inbox
        </Link>
      </div>
    );
  }

  const salonCategory = getSalon(conversation.salonId)?.category;

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((prev) => [...prev, { id: `local-${prev.length}`, from: "me", text: t, time: "Now" }]);
    setDraft("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <Link href={`/c/salon/${conversation.salonId}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar initials={conversation.avatar} category={salonCategory} size={38} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-navy">{conversation.salonName}</p>
            <p className="text-[11px] text-secondary">Usually replies within 1h</p>
          </div>
        </Link>
        <button type="button" aria-label="Call" className="p-1.5 text-navy">
          <Phone size={20} strokeWidth={1.75} />
        </button>
        <Link href={`/c/salon/${conversation.salonId}`} aria-label="Info" className="p-1.5 text-navy">
          <Info size={20} strokeWidth={1.75} />
        </Link>
      </div>

      {/* messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
      </div>

      {/* quick replies */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {QUICK_REPLIES.map((r) => (
          <motion.button
            key={r}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => send(r)}
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium text-navy"
          >
            {r}
          </motion.button>
        ))}
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
        <button type="button" aria-label="More" onClick={() => setPlusOpen(true)} className="p-1.5 text-navy">
          <Plus size={20} strokeWidth={1.75} />
        </button>
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-canvas px-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Message…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none"
          />
          <button type="button" aria-label="Camera" className="shrink-0 text-muted">
            <Camera size={20} strokeWidth={1.75} />
          </button>
        </div>
        <motion.button
          type="button"
          aria-label="Send"
          whileTap={{ scale: 0.97 }}
          onClick={() => send(draft)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            draft.trim() ? "bg-coral text-white" : "bg-canvas text-muted"
          }`}
        >
          <Send size={18} strokeWidth={1.75} />
        </motion.button>
      </div>

      {/* plus sheet */}
      <Sheet open={plusOpen} onClose={() => setPlusOpen(false)} title="Add to conversation">
        <div className="flex flex-col">
          {[
            { icon: <CalendarCheck size={20} strokeWidth={1.75} />, label: "Share a booking", sub: "Send one of your upcoming bookings" },
            { icon: <ImagePlus size={20} strokeWidth={1.75} />, label: "Send photo", sub: "Camera roll or take a new one" },
            { icon: <CalendarPlus size={20} strokeWidth={1.75} />, label: "Request appointment", sub: "Ask about a date and time" },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => setPlusOpen(false)}
              className="flex items-center gap-3.5 border-b border-border py-4 text-left last:border-b-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-navy">
                {row.icon}
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-navy">{row.label}</span>
                <span className="block text-[12px] text-secondary">{row.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
