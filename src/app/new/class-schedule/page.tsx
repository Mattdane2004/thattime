"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";

// Class wizard 2/2 — schedule. Functional port of that-time-app
// /routes/wizard/ClassSchedule.jsx (single-session date + time; the recurring/
// multi-session course builder is deferred). Continues to the shared
// locations → staff → price steps.

export default function ClassSchedulePage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  const canContinue = Boolean(cls.date && cls.startTime && cls.endTime);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/class-participants")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">When is it?</div>
          <div className="mt-1 text-[14px] text-muted">Set the date and time for this class.</div>
        </div>

        <div className="space-y-5 pb-6">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Date</span>
            <input type="date" value={cls.date}
              onChange={(e) => updateClass({ date: e.target.value })}
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Starts</span>
              <input type="time" value={cls.startTime}
                onChange={(e) => updateClass({ startTime: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
            </label>
            <label className="block flex-1">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Ends</span>
              <input type="time" value={cls.endTime}
                onChange={(e) => updateClass({ endTime: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
            </label>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={() => canContinue && router.push("/new/locations")} disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Continue
        </button>
      </div>
    </>
  );
}
