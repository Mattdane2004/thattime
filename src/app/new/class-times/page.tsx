"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";

// Figma screen reference: ThatTime Internal / Classes / "Set the times".
// Set one default time, then override specific course dates only when needed.

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function durationLabel(start: string, end: string) {
  if (!start || !end || end <= start) return "Check time";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const min = eh * 60 + em - (sh * 60 + sm);
  if (min <= 0) return "Check time";
  const hours = Math.floor(min / 60);
  const mins = min % 60;
  if (!hours) return `${mins}m`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function ClassTimesPage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  const selectedDates = cls.dates.filter(Boolean);
  const validDefault = Boolean(cls.startTime && cls.endTime && cls.endTime > cls.startTime);
  const validOverrides = Object.values(cls.dateTimes).every((time) => time.startTime && time.endTime && time.endTime > time.startTime);
  const canContinue = selectedDates.length > 0 && validDefault && validOverrides;

  const setDefault = (patch: Partial<Pick<typeof cls, "startTime" | "endTime">>) => updateClass(patch);
  const setOverride = (date: string, patch: { startTime?: string; endTime?: string }) => {
    const current = cls.dateTimes[date] ?? { startTime: cls.startTime, endTime: cls.endTime };
    updateClass({ dateTimes: { ...cls.dateTimes, [date]: { ...current, ...patch } } });
  };
  const clearOverride = (date: string) => {
    const next = { ...cls.dateTimes };
    delete next[date];
    updateClass({ dateTimes: next });
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/class-schedule")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Set the times" subtitle="Set the usual time once, then only adjust dates that run differently." />

        <div className="rounded-3xl bg-canvas px-4 py-4">
          <div className="pb-4 text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Original week</div>
            <div className="mt-1 text-[17px] font-semibold text-navy">
              {selectedDates.length ? `${fmtDate(selectedDates[0])}${selectedDates.length > 1 ? ` - ${fmtDate(selectedDates[selectedDates.length - 1])}` : ""}` : "No dates selected"}
            </div>
          </div>

          <div className="rounded-2xl bg-surface px-4 py-4">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Default time</div>
            <p className="mt-1 text-[13px] leading-snug text-secondary">Every selected date uses this time unless you override it below.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <FieldLabel>Starts</FieldLabel>
                <input type="time" value={cls.startTime} onChange={(e) => setDefault({ startTime: e.target.value })} className={fieldInput} />
              </label>
              <label className="block">
                <FieldLabel>Ends</FieldLabel>
                <input type="time" value={cls.endTime} onChange={(e) => setDefault({ endTime: e.target.value })} className={fieldInput} />
              </label>
            </div>
            <div className="mt-3 text-[13px] text-secondary">
              Class duration <span className="ml-3 font-semibold text-navy">{durationLabel(cls.startTime, cls.endTime)}</span>
            </div>
          </div>
        </div>

        <div className="pb-6 pt-5">
          <FieldLabel>Course dates</FieldLabel>
          <p className="pb-3 text-[12px] text-muted">All dates use the default time unless you set a custom time.</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {selectedDates.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-muted">Choose dates before setting times.</p>
            ) : (
              selectedDates.map((date, index) => {
                const custom = cls.dateTimes[date];
                const time = custom ?? { startTime: cls.startTime, endTime: cls.endTime };
                return (
                  <div key={date} className={index > 0 ? "border-t border-border" : ""}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <span>
                        <span className="block text-[14px] font-semibold text-navy">Day {index + 1}</span>
                        <span className="block text-[12px] text-muted">{fmtDate(date)} · {time.startTime}-{time.endTime}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => (custom ? clearOverride(date) : setOverride(date, {}))}
                        className="shrink-0 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-semibold text-navy"
                      >
                        {custom ? "Default" : "Custom"}
                      </button>
                    </div>
                    {custom && (
                      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                        <label className="block">
                          <FieldLabel>Starts</FieldLabel>
                          <input type="time" value={custom.startTime} onChange={(e) => setOverride(date, { startTime: e.target.value })} className={fieldInput} />
                        </label>
                        <label className="block">
                          <FieldLabel>Ends</FieldLabel>
                          <input type="time" value={custom.endTime} onChange={(e) => setOverride(date, { endTime: e.target.value })} className={fieldInput} />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <WizardFooter
        step={4}
        total={TOTAL_STEPS.class}
        onBack={() => router.push("/new/class-schedule")}
        onNext={() => canContinue && router.push("/new/locations")}
        disabled={!canContinue}
      />
    </>
  );
}
