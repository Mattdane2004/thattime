"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Repeat, X } from "lucide-react";
import { ScreenHeader, Sheet } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";

// Figma screen reference: ThatTime Internal / Classes / "Select dates".
// Pick one date for a one-off class, multiple dates for a course, then use the
// repeat sheet for weekly patterns.

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const isoFor = (year: number, monthIndex: number, day: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const parseIso = (iso: string) => new Date(`${iso}T00:00:00`);

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

const weekdaysFromDates = (dates: string[]) => {
  const keys = dates
    .filter(Boolean)
    .map((iso) => DAY_KEYS[(parseIso(iso).getDay() + 6) % 7]);
  return Array.from(new Set(keys));
};

function repeatSummary(repeat: string, days: string[]) {
  if (repeat === "none") return "Does not repeat";
  const readable = days.map((day) => DAY_NAMES[day] ?? day).join(", ");
  return readable ? `Weekly on ${readable}.` : "Weekly";
}

export default function ClassSchedulePage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);
  const [month, setMonth] = useState(() => (cls.dates[0] ? parseIso(cls.dates[0]) : new Date("2026-05-01T00:00:00")));
  const [repeatOpen, setRepeatOpen] = useState(false);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const selected = new Set(cls.dates.filter(Boolean));
  const canContinue = cls.dates.length > 0 && cls.dates.every(Boolean);

  const setMode = (mode: "single" | "multi") => {
    const nextDates = mode === "single" ? cls.dates.slice(0, 1) : cls.dates;
    updateClass({ scheduleMode: mode, dates: nextDates, dateTimes: {} });
  };

  const toggleDate = (iso: string) => {
    if (cls.scheduleMode === "single") {
      updateClass({ dates: [iso], dateTimes: {} });
      return;
    }
    const next = selected.has(iso)
      ? cls.dates.filter((date) => date !== iso)
      : [...cls.dates, iso].sort();
    const dateTimes = Object.fromEntries(Object.entries(cls.dateTimes).filter(([date]) => next.includes(date)));
    updateClass({ dates: next, dateTimes });
  };

  const openRepeat = () => {
    const repeatDays = cls.repeatDays.length ? cls.repeatDays : weekdaysFromDates(cls.dates);
    updateClass({ repeat: "weekly", repeatDays });
    setRepeatOpen(true);
  };

  const changeMonth = (delta: number) => {
    setMonth(new Date(year, monthIndex + delta, 1));
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/class-participants")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Select dates" subtitle="Pick one date for a one-off class, or multiple dates for a course booked together." />

        <div className="pb-5">
          <div className="flex rounded-2xl bg-canvas p-1">
            {(["single", "multi"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                  cls.scheduleMode === mode ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {mode === "single" ? "Single day" : "Multi day"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-canvas px-4 py-4">
          <div className="flex items-center justify-between">
            <span>
              <span className="block text-[17px] font-semibold text-navy">{monthLabel(month)}</span>
              <span className="block text-[13px] text-muted">
                {cls.dates.length ? `${cls.dates.length} date${cls.dates.length > 1 ? "s" : ""} selected` : "No dates selected"}
              </span>
            </span>
            <span className="flex gap-2">
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-navy">
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-navy">
                <ChevronRight size={18} />
              </button>
            </span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center">
            {DAY_KEYS.map((day) => (
              <span key={day} className="text-[11px] font-semibold text-muted">{day[0]}</span>
            ))}
            {Array.from({ length: startOffset }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const iso = isoFor(year, monthIndex, day);
              const on = selected.has(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => toggleDate(iso)}
                  className={`flex aspect-square items-center justify-center rounded-xl text-[14px] font-semibold ${
                    on ? "bg-navy text-white shadow-card" : "bg-surface text-navy hover:bg-border/50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-canvas">
          <button type="button" onClick={openRepeat} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-navy">
              <Repeat size={16} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-navy">Repeats</span>
              <span className="block truncate text-[13px] text-muted">{repeatSummary(cls.repeat, cls.repeatDays)}</span>
            </span>
            <span className="text-[13px] font-semibold text-navy">Set</span>
          </button>
        </div>
      </div>

      <WizardFooter
        step={3}
        total={TOTAL_STEPS.class}
        onBack={() => router.push("/new/class-participants")}
        onNext={() => canContinue && router.push("/new/class-times")}
        nextLabel="Set times"
        disabled={!canContinue}
      />

      <RepeatSheet open={repeatOpen} onClose={() => setRepeatOpen(false)} />
    </>
  );
}

function RepeatSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  const toggleDay = (day: string) => {
    const next = cls.repeatDays.includes(day)
      ? cls.repeatDays.filter((value) => value !== day)
      : [...cls.repeatDays, day].sort((a, b) => DAY_KEYS.indexOf(a) - DAY_KEYS.indexOf(b));
    updateClass({ repeat: next.length ? "weekly" : "none", repeatDays: next });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Repeat settings"
      footer={<button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>}
    >
      <div className="space-y-5">
        <label className="block">
          <FieldLabel>Frequency</FieldLabel>
          <div className="flex h-12 items-center rounded-xl bg-canvas px-4 text-[15px] font-semibold text-navy">Weekly</div>
        </label>

        <div>
          <FieldLabel>Repeats on</FieldLabel>
          <div className="flex gap-2">
            {DAY_KEYS.map((day) => {
              const on = cls.repeatDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold ${
                    on ? "bg-navy text-white" : "bg-canvas text-secondary"
                  }`}
                >
                  {day[0]}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[12px] text-muted">{cls.repeatDays.map((day) => DAY_NAMES[day]).join(", ") || "Choose repeat days"}</div>
        </div>

        <label className="block">
          <FieldLabel>Ends</FieldLabel>
          <div className="flex h-12 items-center justify-between rounded-xl bg-canvas px-4 text-[15px] font-semibold text-navy">
            Never
            <X size={16} className="text-muted" />
          </div>
        </label>
      </div>
    </Sheet>
  );
}
