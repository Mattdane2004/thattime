"use client";

import { useRouter } from "next/navigation";
import { Plus, Repeat, X } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, TOTAL_STEPS } from "@/components/app/WizardChrome";
import { useWizardStore } from "@/lib/store/wizardStore";

// Class wizard — "Select dates" + times (Figma 12135:47208 / 12135:47381).
// Single day for a one-off class, multi day for a course booked together;
// weekly repeat covers recurring schedules.

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export default function ClassSchedulePage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  const setDate = (index: number, value: string) => {
    const dates = [...cls.dates];
    dates[index] = value;
    updateClass({ dates });
  };

  const canContinue =
    cls.dates.length > 0 && cls.dates.every(Boolean) && Boolean(cls.startTime && cls.endTime) && cls.endTime > cls.startTime;

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
                onClick={() => updateClass({ scheduleMode: mode, dates: cls.dates.slice(0, mode === "single" ? 1 : undefined) })}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                  cls.scheduleMode === mode ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {mode === "single" ? "Single day" : "Multi day"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pb-5">
          <FieldLabel>{cls.scheduleMode === "single" ? "Date" : `Dates (${cls.dates.filter(Boolean).length} selected)`}</FieldLabel>
          {(cls.dates.length ? cls.dates : [""]).map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={d}
                onChange={(e) => (cls.dates.length ? setDate(i, e.target.value) : updateClass({ dates: [e.target.value] }))}
                className={fieldInput}
              />
              {cls.scheduleMode === "multi" && cls.dates.length > 1 && (
                <button
                  onClick={() => updateClass({ dates: cls.dates.filter((_, x) => x !== i) })}
                  aria-label="Remove date"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-canvas"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {cls.scheduleMode === "multi" && (
            <button
              onClick={() => updateClass({ dates: [...(cls.dates.length ? cls.dates : [""]), ""] })}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-medium text-navy hover:bg-canvas"
            >
              <Plus size={14} />Add another date
            </button>
          )}
        </div>

        <div className="flex gap-3 pb-5">
          <label className="block flex-1">
            <FieldLabel>Starts</FieldLabel>
            <input type="time" value={cls.startTime} onChange={(e) => updateClass({ startTime: e.target.value })} className={fieldInput} />
          </label>
          <label className="block flex-1">
            <FieldLabel>Ends</FieldLabel>
            <input type="time" value={cls.endTime} onChange={(e) => updateClass({ endTime: e.target.value })} className={fieldInput} />
          </label>
        </div>

        <div className="space-y-3 pb-6">
          <div className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3.5">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"><Repeat size={15} className="text-navy" /></span>
              <span>
                <span className="block text-[14px] font-medium text-navy">Repeats</span>
                <span className="block text-[12px] text-muted">
                  {cls.repeat === "none"
                    ? "Does not repeat."
                    : `Weekly${cls.dates[0] ? ` on ${fmt(cls.dates[0]).split(" ")[0]}` : ""} · ${cls.repeatWeeks} weeks`}
                </span>
              </span>
            </span>
            <button
              onClick={() => updateClass({ repeat: cls.repeat === "none" ? "weekly" : "none" })}
              className="rounded-full border border-border px-3.5 py-1.5 text-[12px] font-semibold text-navy hover:bg-surface"
            >
              {cls.repeat === "none" ? "Set" : "Clear"}
            </button>
          </div>
          {cls.repeat === "weekly" && (
            <label className="block">
              <FieldLabel>Repeat for (weeks)</FieldLabel>
              <input
                type="number" inputMode="numeric" value={cls.repeatWeeks}
                onChange={(e) => updateClass({ repeatWeeks: Math.max(1, Number(e.target.value) || 1) })}
                className={fieldInput}
              />
            </label>
          )}
        </div>
      </div>

      <WizardFooter
        step={3}
        total={TOTAL_STEPS.class}
        onBack={() => router.push("/new/class-participants")}
        onNext={() => canContinue && router.push("/new/locations")}
        disabled={!canContinue}
      />
    </>
  );
}
