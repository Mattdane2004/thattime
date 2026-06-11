"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Pencil, Star, CalendarPlus, MessageSquare, Phone, Plus,
  RotateCcw, X, Search, SlidersHorizontal, ChevronDown, FileText, Eye, Bell,
  Send, MapPin, Mail,
} from "lucide-react";
import { Segmented, DarkButton, GhostButton, Sheet, MiniCalendar, TimeChips } from "@/components/app/ui";
import { pastAppointments, clientForms, clientReviews } from "@/lib/data/product";

// Client detail — Overview / Bookings / Forms / Reviews tabs (Figma → Client).

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "fill-navy text-navy" : "text-border"} />
      ))}
    </span>
  );
}

function NextAppointmentCard({ onReschedule, onCancel, moved }: { onReschedule: () => void; onCancel: () => void; moved: string | null }) {
  return (
    <div className="rounded-3xl bg-[#14181F] p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold">
          {moved ? `Moved · ${moved}` : "Next appointment"}
        </span>
        <ChevronDown size={15} className="-rotate-90 text-white/50" />
      </div>
      <p className="pt-3 text-[18px] font-bold">Cut & Style</p>
      <p className="pt-0.5 text-[13px] text-white/60">18 Mar 2026 · Emma S. · 60min · £85</p>
      <div className="flex gap-2.5 pt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onReschedule}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/12 text-[13px] font-semibold"
        >
          <RotateCcw size={13} />
          Reschedule
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCancel}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/12 text-[13px] font-semibold"
        >
          <X size={14} />
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [moved, setMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="bg-white pb-3">
        <div className="flex items-center justify-between px-4 pt-4">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Edit client" className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
            <Pencil size={15} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex items-center gap-4 px-4 pt-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-[18px] font-semibold text-muted">
            SJ
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-navy">Sarah Johnson</h1>
              <span className="rounded-full bg-[#14181F] px-2.5 py-0.5 text-[10px] font-semibold text-white">Active</span>
            </div>
            <span className="mt-1 flex items-center gap-1 text-[13px] font-medium text-navy">
              <Star size={13} className="fill-current" /> 4.8
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 px-4 pt-4">
          <DarkButton className="!h-11 flex-[1.2] !text-[14px]">
            <CalendarPlus size={15} />
            Book
          </DarkButton>
          <GhostButton className="!h-11 flex-1 !text-[14px]" onClick={() => router.push("/app/messages/sarah")}>
            <MessageSquare size={15} />
            Message
          </GhostButton>
          <GhostButton className="!h-11 !w-12 shrink-0">
            <Phone size={15} />
          </GhostButton>
        </div>

        <div className="px-4 pt-4">
          <Segmented options={["Overview", "Bookings", "Forms", "Reviews"]} value={tab} onChange={setTab} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="px-4 pt-4"
        >
          {tab === "Overview" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  ["Last Visit", "3 Mar 2026"],
                  ["Total Bookings", "24"],
                  ["Client Since", "Jan 2024"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white p-3.5 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                    <p className="text-[11px] text-muted">{k}</p>
                    <p className="pt-1 text-[14px] font-bold text-navy">{v}</p>
                  </div>
                ))}
              </div>
              {!cancelled && (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-muted">Allergies and preferences</p>
                  <Plus size={15} className="text-muted" />
                </div>
                <div className="flex gap-2 pt-3">
                  {["Sensitive scalp", "PPD allergy"].map((c) => (
                    <span key={c} className="rounded-full border border-border px-3.5 py-1.5 text-[12px] font-medium text-navy">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <p className="pb-2 text-[13px] font-medium text-muted">Contact</p>
                {[
                  [<Phone key="p" size={14} strokeWidth={1.75} />, "(555) 234-5678"],
                  [<Mail key="m" size={14} strokeWidth={1.75} />, "sarah.j@email.com"],
                  [<MapPin key="a" size={14} strokeWidth={1.75} />, "14 Maple Lane, London"],
                ].map(([icon, v], i) => (
                  <p key={i} className="flex items-center gap-3 py-1.5 text-[14px] text-navy">
                    <span className="text-secondary">{icon}</span>
                    {v}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tab === "Bookings" && (
            <div className="flex flex-col gap-3">
              {!cancelled && (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}
              <div className="relative">
                <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  placeholder="Search service, date, staff..."
                  className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-[13px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)] focus:outline-none"
                />
              </div>
              <button className="flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <SlidersHorizontal size={13} strokeWidth={1.75} />
                All
                <ChevronDown size={12} className="text-muted" />
              </button>
              <p className="text-[12px] text-muted">4 past appointments</p>
              {pastAppointments.map((p) => (
                <div key={p.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-navy">{p.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        p.status === "Completed" ? "bg-[#E8F6EE] text-[#157347]" : "bg-canvas text-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[12px] text-muted">{p.meta}</p>
                    {p.docs > 0 && (
                      <span className="flex gap-1 text-muted">
                        {Array.from({ length: p.docs }, (_, i) => (
                          <FileText key={i} size={12} strokeWidth={1.75} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Forms" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted">4 forms across all appointments</p>
                <span className="flex gap-1.5">
                  <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">1 pending</span>
                  <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted">1 not sent</span>
                </span>
              </div>
              {clientForms.map((f) => (
                <div key={f.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <FileText size={17} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{f.name}</span>
                    <span className="block pt-0.5 text-[12px] text-muted">{f.meta}</span>
                    <span className="block pt-1 text-[11px] text-muted">⎘ {f.appt}</span>
                  </span>
                  {f.state === "view" && (
                    <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-semibold text-navy">
                      <Eye size={12} strokeWidth={2} /> View
                    </button>
                  )}
                  {f.state === "remind" && (
                    <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3.5 py-1.5 text-[12px] font-semibold text-[#B45309]">
                      <Bell size={12} strokeWidth={2} /> Remind
                    </button>
                  )}
                  {f.state === "not-sent" && (
                    <span className="shrink-0 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-medium text-muted">Not Sent</span>
                  )}
                </div>
              ))}
              <DarkButton>
                <Send size={15} />
                Send New Form
              </DarkButton>
            </div>
          )}

          {tab === "Reviews" && (
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-[15px] font-bold text-navy">
                <Star size={15} className="fill-current" />
                4.7 <span className="font-normal text-muted">(3 reviews)</span>
              </p>
              {clientReviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <div className="flex items-center gap-2.5">
                    <Stars n={r.stars} />
                    <span className="text-[11px] text-muted">{r.date}</span>
                  </div>
                  <p className="pt-2 text-[14px] leading-snug text-navy">{r.text}</p>
                  <p className="pt-1.5 text-[12px] text-muted">{r.service}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reschedule */}
      <Sheet open={resched} onClose={() => setResched(false)} title="Reschedule" sub="Sarah Johnson · Cut & Style · Emma S." full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
        <MiniCalendar selected={day} onSelect={setDay} />
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
        <TimeChips value={time} onSelect={setTime} />
        <div className="pt-6">
          <DarkButton
            disabled={!day || !time}
            onClick={() => {
              setMoved(`Sat ${day} Mar, ${time}`);
              setResched(false);
            }}
          >
            {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Cancel */}
      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel this appointment?">
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          Sarah Johnson · Cut & Style · Emma S. on 18 Mar. We&rsquo;ll let them know and free up the slot.
        </p>
        <DarkButton
          onClick={() => {
            setCancelled(true);
            setCancel(false);
          }}
        >
          Cancel appointment
        </DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setCancel(false)}>Keep it</GhostButton>
        </div>
      </Sheet>
    </div>
  );
}
