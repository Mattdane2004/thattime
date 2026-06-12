"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Scissors, Banknote, MapPin, MessageSquare, RotateCcw, X,
  AlertTriangle, FileText, ChevronLeft, ChevronRight, CheckCircle2, Play, CreditCard,
  Bell, Check,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton, MiniCalendar, TimeChips, StatusPill } from "@/components/app/ui";
import { useAppStore } from "@/lib/store/appStore";
import { clientNotes } from "@/lib/data/product";

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
  const [view, setView] = useState<"details" | "reschedule" | "cancel">("details");
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reminded, setReminded] = useState(false);

  const open = apptSheet !== null;
  useEffect(() => {
    if (open) {
      setView("details");
      setLocalMoved(null);
      setDay(null);
      setTime(null);
      setReminded(false);
    }
  }, [open]);

  const a = apptSheet;
  const close = () => setApptSheet(null);
  if (!a) return <Sheet open={false} onClose={close}>{null}</Sheet>;

  const moved = a.live ? movedTo : localMoved;
  const status = a.live
    ? apptStatus === "upcoming" ? "Confirmed"
      : apptStatus === "arrived" ? "Arrived"
      : apptStatus === "in-progress" ? "In progress"
      : "Done"
    : a.status ?? "Confirmed";

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
            {view === "reschedule" ? "Reschedule" : "Cancel appointment"}
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
              <div className="flex items-center gap-2 pb-3">
                <StatusPill tone={status === "In progress" ? "dark" : "light"}>{status}</StatusPill>
                {moved && <StatusPill tone="amber">Moved · {moved}</StatusPill>}
              </div>

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
                  { icon: <Scissors size={15} strokeWidth={1.75} />, main: a.service, sub: `with ${a.staff}` },
                  ...(a.price ? [{ icon: <Banknote size={15} strokeWidth={1.75} />, main: `£${a.price}`, sub: "Pay at checkout" }] : []),
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
                onClick={() => { close(); router.push(`/app/clients/${slug}`); }}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 text-[14px] font-semibold text-navy"
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
