"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Scissors, Banknote, MapPin, MessageSquare, RotateCcw, X,
  AlertTriangle, FileText, ChevronLeft, ChevronRight, CheckCircle2, Play, CreditCard,
  Bell, Check, Pencil, Plus,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton, MiniCalendar, TimeChips, StatusPill } from "@/components/app/ui";
import { useAppStore, type ApptStatus } from "@/lib/store/appStore";
import { clientNotes, services } from "@/lib/data/product";

const statusChips: { label: string; live?: ApptStatus }[] = [
  { label: "Upcoming", live: "upcoming" },
  { label: "Arrived", live: "arrived" },
  { label: "In progress", live: "in-progress" },
  { label: "Done", live: "done" },
  { label: "No-show" },
];

/**
 * Appointment details bottom sheet — opened from any appointment card, agenda
 * row or calendar block via `setApptSheet`. When the appointment is the live
 * Up Next one (`live`), its primary action drives the shared lifecycle.
 */
export function AppointmentSheetHost() {
  const router = useRouter();
  const {
    apptSheet, setApptSheet, apptStatus, setApptStatus, movedTo, setMovedTo,
  } = useAppStore();
  const [view, setView] = useState<"details" | "reschedule" | "cancel" | "edit">("details");
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reminded, setReminded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [svcOverride, setSvcOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);

  const open = apptSheet !== null;
  useEffect(() => {
    if (open) {
      setView("details");
      setLocalMoved(null);
      setDay(null);
      setTime(null);
      setReminded(false);
      setLocalStatus(null);
      setSvcOverride(null);
      setExtras([]);
    }
  }, [open]);

  const a = apptSheet;
  const close = () => setApptSheet(null);
  if (!a) return <Sheet open={false} onClose={close}>{null}</Sheet>;

  const moved = a.live ? movedTo : localMoved;
  const status = a.live
    ? apptStatus === "upcoming" ? "Upcoming"
      : apptStatus === "arrived" ? "Arrived"
      : apptStatus === "in-progress" ? "In progress"
      : "Done"
    : localStatus ?? (a.status === "Confirmed" ? "Upcoming" : a.status ?? "Upcoming");

  // Edited booking: service can be swapped and extras added on the fly.
  const svcName = svcOverride ?? a.service;
  const priceOf = (name: string) => services.find((s) => s.name === name)?.price ?? 0;
  const basePrice = svcOverride ? priceOf(svcOverride) : a.price ?? priceOf(a.service);
  const totalPrice = basePrice + extras.reduce((sum, e) => sum + priceOf(e), 0);

  const firstName = a.client.split(" ")[0];
  const slug = firstName.toLowerCase();
  const notes = clientNotes[a.client];

  const liveAction =
    a.live && apptStatus === "upcoming"
      ? { label: "Check In", icon: <CheckCircle2 size={15} />, run: () => setApptStatus("arrived") }
      : a.live && apptStatus === "arrived"
        ? { label: "Start service", icon: <Play size={14} />, run: () => setApptStatus("in-progress") }
        : a.live && apptStatus === "in-progress"
          ? { label: "Checkout", icon: <CreditCard size={15} />, run: () => { close(); router.push("/app/checkout"); } }
          : null;

  return (
    <Sheet
      open={open}
      onClose={close}
      title={
        view === "details" ? (
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[12px] font-bold text-secondary">
              {a.initials}
            </span>
            {a.client}
          </span>
        ) : (
          <button type="button" onClick={() => setView("details")} className="flex items-center gap-1 text-navy">
            <ChevronLeft size={18} strokeWidth={2} />
            {view === "reschedule" ? "Reschedule" : view === "edit" ? "Edit booking" : "Cancel appointment"}
          </button>
        )
      }
      sub={view === "details" ? undefined : `${a.client} · ${a.service} · ${a.staff}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.18 }}
        >
          {view === "details" && (
            <>
              {/* Status is editable inline — fail-safe for early arrivals etc. */}
              <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
                {statusChips.map((c) => {
                  const active = status === c.label;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => {
                        if (a.live && c.live) setApptStatus(c.live);
                        setLocalStatus(c.label);
                      }}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                        active
                          ? c.label === "No-show"
                            ? "border-danger bg-danger text-white"
                            : "border-[#14181F] bg-[#14181F] text-white"
                          : "border-border bg-white text-secondary"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {moved && (
                <div className="pb-3">
                  <StatusPill tone="amber">Moved · {moved}</StatusPill>
                </div>
              )}

              {/* Safety + admin callouts — visible at a glance, never buried */}
              {(notes?.allergies || notes?.formNote) && (
                <div className="flex flex-col gap-2 pb-3">
                  {notes.allergies && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-[#FEF3C7] px-3.5 py-2.5">
                      <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#B45309]" />
                      <p className="text-[12px] font-medium leading-snug text-[#92400E]">
                        <span className="font-bold">Allergies — </span>
                        {notes.allergies.join(" · ")}
                      </p>
                    </div>
                  )}
                  {notes.formNote && (
                    <div className="flex items-center gap-2.5 rounded-xl bg-canvas px-3.5 py-2">
                      <FileText size={14} strokeWidth={1.75} className="shrink-0 text-secondary" />
                      <p className="flex-1 text-[12px] font-medium text-secondary">{notes.formNote}</p>
                      <button
                        type="button"
                        onClick={() => setReminded(true)}
                        disabled={reminded}
                        className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                          reminded ? "bg-white text-muted" : "bg-[#14181F] text-white"
                        }`}
                      >
                        {reminded ? <Check size={11} strokeWidth={2.5} /> : <Bell size={11} strokeWidth={2} />}
                        {reminded ? "Sent" : "Remind"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl bg-canvas">
                {[
                  { icon: <Clock size={15} strokeWidth={1.75} />, main: moved ?? `Today · ${a.time}`, sub: a.duration },
                  {
                    icon: <Scissors size={15} strokeWidth={1.75} />,
                    main: extras.length > 0 ? `${svcName} + ${extras.length} more` : svcName,
                    sub: `with ${a.staff}`,
                  },
                  ...(totalPrice > 0 ? [{ icon: <Banknote size={15} strokeWidth={1.75} />, main: `£${totalPrice}`, sub: "Pay at checkout" }] : []),
                  { icon: <MapPin size={15} strokeWidth={1.75} />, main: "Salon Soho", sub: "Main floor" },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                    <span className="text-secondary">{row.icon}</span>
                    <span className="flex-1 text-[14px] font-semibold text-navy">{row.main}</span>
                    <span className="text-[12px] text-muted">{row.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-3">
                {[
                  {
                    icon: <MessageSquare size={17} strokeWidth={1.7} />, label: "Message",
                    run: () => { close(); router.push(`/app/messages/${slug}`); },
                  },
                  { icon: <RotateCcw size={17} strokeWidth={1.7} />, label: "Reschedule", run: () => setView("reschedule") },
                  { icon: <X size={17} strokeWidth={1.7} />, label: "Cancel", run: () => setView("cancel") },
                ].map((t) => (
                  <motion.button
                    key={t.label}
                    whileTap={{ scale: 0.96 }}
                    onClick={t.run}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-canvas px-2 py-4 text-[12px] font-medium text-navy"
                  >
                    {t.icon}
                    {t.label}
                  </motion.button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setView("edit")}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 text-[14px] font-semibold text-navy"
              >
                <span className="flex items-center gap-2.5">
                  <Pencil size={14} strokeWidth={1.75} className="text-secondary" />
                  Edit booking
                </span>
                <ChevronRight size={15} className="text-muted" />
              </button>

              <button
                type="button"
                onClick={() => { close(); router.push(`/app/clients/${slug}`); }}
                className="mt-2.5 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 text-[14px] font-semibold text-navy"
              >
                View client profile
                <ChevronRight size={15} className="text-muted" />
              </button>

              {liveAction && (
                <div className="pt-4">
                  <DarkButton
                    onClick={() => {
                      liveAction.run();
                      if (liveAction.label !== "Checkout") close();
                    }}
                  >
                    {liveAction.icon}
                    {liveAction.label}
                  </DarkButton>
                </div>
              )}
            </>
          )}

          {view === "reschedule" && (
            <>
              <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
              <MiniCalendar selected={day} onSelect={setDay} />
              <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
              <TimeChips value={time} onSelect={setTime} />
              <div className="pt-6">
                <DarkButton
                  disabled={!day || !time}
                  onClick={() => {
                    const label = `Sat ${day} Mar, ${time}`;
                    if (a.live) setMovedTo(label);
                    else setLocalMoved(label);
                    setView("details");
                  }}
                >
                  {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
                </DarkButton>
              </div>
            </>
          )}

          {view === "edit" && (
            <>
              <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Service</p>
              <div className="overflow-hidden rounded-2xl border border-border">
                {services.map((s, i) => {
                  const active = svcName === s.name;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSvcOverride(s.name)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left ${i > 0 ? "border-t border-border" : ""} ${active ? "bg-canvas" : ""}`}
                    >
                      <span className={`text-[14px] ${active ? "font-bold" : "font-medium"} text-navy`}>{s.name}</span>
                      <span className="flex items-center gap-2 text-[13px] text-secondary">
                        £{s.price}
                        {active && <Check size={14} strokeWidth={2.5} className="text-navy" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Add to this booking</p>
              <div className="flex flex-wrap gap-2">
                {services
                  .filter((s) => s.name !== svcName)
                  .map((s) => {
                    const on = extras.includes(s.name);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setExtras((x) => (on ? x.filter((e) => e !== s.name) : [...x, s.name]))}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                          on ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                        }`}
                      >
                        {on ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2} />}
                        {s.name}
                      </button>
                    );
                  })}
              </div>
              <div className="pt-5">
                <DarkButton onClick={() => setView("details")}>
                  Save changes · £{totalPrice}
                </DarkButton>
              </div>
            </>
          )}

          {view === "cancel" && (
            <>
              <p className="pb-5 text-[14px] leading-relaxed text-secondary">
                {a.client} · {a.service} · {a.staff} at {a.time}. We&rsquo;ll let them know and free
                up the slot.
              </p>
              <DarkButton
                onClick={() => {
                  if (a.live) setApptStatus("cancelled");
                  close();
                }}
              >
                Cancel appointment
              </DarkButton>
              <div className="pt-3">
                <GhostButton onClick={() => setView("details")}>Keep it</GhostButton>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}
