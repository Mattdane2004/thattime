"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";
import { teamRoster, initialsOf } from "@/lib/data/team";

// Wizard step — staff. Functional port of the legacy that-time-app
// /routes/wizard/Staff.jsx. Reuses the shared team roster; only bookable
// members can deliver an offer.

export default function StaffPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const bookable = teamRoster.filter((m) => m.bookable);

  const toggle = (id: string) =>
    updateDraft({
      staffIds: draft.staffIds.includes(id)
        ? draft.staffIds.filter((x) => x !== id)
        : [...draft.staffIds, id],
    });

  const canContinue = draft.staffIds.length > 0;

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/locations")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Who can deliver it?</div>
          <div className="mt-1 text-[14px] text-muted">Pick the team members clients can book with.</div>
        </div>
        <div className="space-y-2 pb-6">
          {bookable.map((m) => {
            const selected = draft.staffIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  selected ? "border-navy" : "border-border hover:bg-canvas"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${m.avatarColor}`}>{initialsOf(m.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{m.name}</span>
                  <span className="block text-[12px] text-muted">{m.role}</span>
                </span>
                {selected && <Check size={18} className="shrink-0 text-navy" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button
          onClick={() => canContinue && router.push("/new/price")}
          disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          Continue
        </button>
      </div>
    </>
  );
}
