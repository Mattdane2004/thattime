"use client";

import { useRouter } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";
import { businessLocations } from "@/lib/data/locations";

// Wizard step — locations. Functional port of the legacy that-time-app
// /routes/wizard/Locations.jsx (in-salon location selection; the mobile/remote
// delivery panels are backlog).

export default function LocationsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const toggle = (id: string) =>
    updateDraft({
      locationIds: draft.locationIds.includes(id)
        ? draft.locationIds.filter((x) => x !== id)
        : [...draft.locationIds, id],
    });

  const canContinue = draft.locationIds.length > 0;

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Where is it offered?</div>
          <div className="mt-1 text-[14px] text-muted">Pick the locations clients can book this at.</div>
        </div>
        <div className="space-y-3 pb-6">
          {businessLocations.map((loc) => {
            const selected = draft.locationIds.includes(loc.id);
            return (
              <button
                key={loc.id}
                onClick={() => toggle(loc.id)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${
                  selected ? "border-navy" : "border-border hover:bg-canvas"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas"><MapPin size={18} className="text-navy" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-navy">{loc.name}</span>
                  <span className="block text-[13px] text-muted">{loc.address}</span>
                </span>
                {selected && <Check size={18} className="shrink-0 text-navy" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button
          onClick={() => canContinue && router.push("/new/staff")}
          disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          Continue
        </button>
      </div>
    </>
  );
}
