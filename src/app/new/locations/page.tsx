"use client";

import { useRouter } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { businessLocations } from "@/lib/data/locations";

// Wizard step — locations (Figma 12135:45510). Shared by the service (step 2)
// and class (step 4) paths.

export default function LocationsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const isClass = draft.type === "class";
  const allSelected = draft.locationIds.length === businessLocations.length;

  const toggle = (id: string) =>
    updateDraft({
      locationIds: draft.locationIds.includes(id)
        ? draft.locationIds.filter((x) => x !== id)
        : [...draft.locationIds, id],
    });

  return (
    <>
      <ScreenHeader
        onBack={() => router.push(isClass ? "/new/class-schedule" : "/new/basics")}
        rightAction={<span className="text-[13px] text-muted">Help</span>}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Where is it offered?" subtitle="Pick the locations clients can book this at." />
        <div className="space-y-3 pb-6">
          <button
            onClick={() => updateDraft({ locationIds: allSelected ? [] : businessLocations.map((l) => l.id) })}
            className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${
              allSelected ? "border-navy" : "border-border hover:bg-canvas"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas"><MapPin size={18} className="text-navy" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-navy">All locations</span>
              <span className="block text-[13px] text-muted">{businessLocations.length} locations</span>
            </span>
            {allSelected && <Check size={18} className="shrink-0 text-navy" />}
          </button>
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
      <WizardFooter
        step={isClass ? 4 : 2}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push(isClass ? "/new/class-schedule" : "/new/basics")}
        onNext={() => draft.locationIds.length > 0 && router.push("/new/staff")}
        disabled={draft.locationIds.length === 0}
      />
    </>
  );
}
