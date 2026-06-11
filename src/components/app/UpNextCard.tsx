"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, AlertTriangle, FileText, MessageSquare, RotateCcw, X,
  CheckCircle2, Play, CreditCard, ChevronRight, Plus, CalendarPlus, Link2, Pause,
} from "lucide-react";
import { useAppStore } from "@/lib/store/appStore";
import { Sheet, DarkButton, GhostButton, MiniCalendar, TimeChips } from "@/components/app/ui";

/**
 * The Up Next appointment card and its lifecycle:
 * upcoming → Check In → arrived → Start service → in-progress → Checkout.
 * The ↺ icon opens Reschedule (day + time picker), ✕ opens Cancel.
 */
export function UpNextCard({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const {
    apptStatus, setApptStatus, movedTo, setMovedTo,
  } = useAppStore();
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const pill =
    movedTo ? `Moved · ${movedTo}`
    : apptStatus === "upcoming" ? "In 5min"
    : apptStatus === "arrived" ? "Arrived"
    : apptStatus === "in-progress" ? "In progress"
    : "Done";

  const action =
    apptStatus === "upcoming"
      ? { label: "Check In", icon: <CheckCircle2 size={15} />, onClick: () => setApptStatus("arrived") }
      : apptStatus === "arrived"
        ? { label: "Start service", icon: <Play size={14} />, onClick: () => setApptStatus("in-progress") }
        : apptStatus === "in-progress"
          ? { label: "Checkout", icon: <CreditCard size={15} />, onClick: () => router.push("/app/checkout") }
          : null;

  if (apptStatus === "cancelled") {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-4">
        <p className="text-[14px] font-semibold text-navy">11:00 – 12:30 freed up</p>
        <p className="mt-0.5 text-[12px] text-muted">Sarah Johnson&rsquo;s appointment was cancelled — we let her know.</p>
        <div className="mt-3 flex gap-2.5">
          <GhostButton className="!h-10 flex-1 !text-[13px]" onClick={() => useAppStore.getState().setQuickAction("appointment")}>
            <CalendarPlus size={15} />
            New booking
          </GhostButton>
          <GhostButton className="!h-10 !w-12 shrink-0">
            <Link2 size={15} />
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div layout className="rounded-3xl bg-[#14181F] p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-bold">
            <Clock size={15} strokeWidth={1.75} />
            11:00 AM
            <span className="text-[12px] font-medium text-white/55">· 1h 30m</span>
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={pill}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                apptStatus === "in-progress" ? "bg-white text-navy" : "bg-white/12 text-white"
              }`}
            >
              <Clock size={11} strokeWidth={2} />
              {pill}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
            SJ
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold">Sarah Johnson</p>
            <p className="truncate text-[12px] text-white/55">Cut & Colour · Emma S.</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-white/70">
          <span className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5">
            <AlertTriangle size={11} /> Allergy
          </span>
          <span className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5">
            <FileText size={11} /> Form
          </span>
          <span>Note attached</span>
        </div>

        {!compact && (
          <div className="mt-4 flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label="Message Sarah"
              onClick={() => router.push("/app/messages/sarah")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <MessageSquare size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label="Reschedule"
              onClick={() => setResched(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <RotateCcw size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label="Cancel appointment"
              onClick={() => setCancel(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <X size={15} />
            </motion.button>
            {action && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={action.onClick}
                className={`ml-auto flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ${
                  apptStatus === "upcoming"
                    ? "border border-white/70 bg-transparent text-white"
                    : "bg-white text-navy"
                }`}
              >
                {action.icon}
                {action.label}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* Reschedule sheet */}
      <Sheet
        open={resched}
        onClose={() => setResched(false)}
        title="Reschedule"
        sub="Sarah Johnson · Cut & Colour · Emma S."
        full
      >
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
        <MiniCalendar selected={day} onSelect={setDay} />
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
        <TimeChips value={time} onSelect={setTime} />
        <div className="pt-6">
          <DarkButton
            disabled={!day || !time}
            onClick={() => {
              setMovedTo(`Sat ${day} Mar, ${time}`);
              setResched(false);
            }}
          >
            {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Cancel sheet */}
      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel this appointment?">
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          Sarah Johnson · Cut & Colour · Emma S. at 11:00 AM. We&rsquo;ll let them know and free up the
          slot.
        </p>
        <DarkButton
          onClick={() => {
            setApptStatus("cancelled");
            setCancel(false);
          }}
        >
          Cancel appointment
        </DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setCancel(false)}>Keep it</GhostButton>
        </div>
      </Sheet>
    </>
  );
}

/** "Up Next" section wrapper with the schedule link (Home). */
export function UpNextSection() {
  const router = useRouter();
  const { breakActive, setBreakActive } = useAppStore();
  return (
    <div className="mx-4 rounded-3xl border border-border bg-white p-4">
      <p className="text-[16px] font-bold text-navy">Up Next</p>
      <p className="pb-3 pt-0.5 text-[12px] text-muted">Gap</p>
      <UpNextCard />

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
        <Pause size={15} className="text-secondary" strokeWidth={1.75} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-navy">Lunch Break</p>
          <p className="text-[11px] text-muted">{breakActive ? "10:00 – 11:00 · 34 Min" : "12:00 – 13:00 · 60m"}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBreakActive(!breakActive)}
          className={`flex h-8 items-center gap-1 rounded-full px-3.5 text-[12px] font-bold ${
            breakActive ? "border border-border bg-white text-navy" : "bg-[#14181F] text-white"
          }`}
        >
          {breakActive ? "End" : <><Play size={11} /> Start</>}
        </motion.button>
      </div>

      <button
        type="button"
        onClick={() => router.push("/app/schedule")}
        className="mt-1 flex w-full items-center justify-between pt-3 text-[13px] text-secondary"
      >
        See your Schedule
        <span className="flex items-center gap-1 font-semibold text-navy">
          3 <ChevronRight size={14} strokeWidth={1.75} />
        </span>
      </button>
    </div>
  );
}

/** Dashed gap slot (My Day + gap variant). */
export function GapSlot({ time = "14:00 – 14:30", label = "30min available" }: { time?: string; label?: string }) {
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => setQuickAction("appointment")}
      className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-white px-4 py-3 text-left"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-secondary">
        <Plus size={15} strokeWidth={2} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-navy">{time}</span>
        <span className="block text-[11px] text-muted">{label}</span>
      </span>
    </motion.button>
  );
}
