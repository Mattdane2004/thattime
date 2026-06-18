"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { StaffEditor, staffComplete, staffSelectedLocs, type StaffValue } from "@/components/offer/StaffEditor";

// Wizard step — staff (Figma 12231:52011). Thin wrapper over the shared
// StaffEditor (also used by the dashboard staff route).

export default function StaffPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const isClass = draft.type === "class";

  const value: StaffValue = {
    locationModes: draft.locationModes,
    locationIds: draft.locationIds,
    staffIds: draft.staffIds,
    staffByLocation: draft.staffByLocation,
  };
  const { perLocation } = staffSelectedLocs(value);
  const canContinue = staffComplete(value);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/locations")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle
          title="Who offers it?"
          subtitle={
            perLocation
              ? "Assign staff to each location."
              : isClass
              ? "Pick staff who can teach this class."
              : "Pick staff who can deliver this service."
          }
        />
        <StaffEditor value={value} isClass={isClass} onChange={updateDraft} />
      </div>
      <WizardFooter
        step={isClass ? 6 : 3}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push("/new/locations")}
        onNext={() => canContinue && router.push(isClass ? "/new/class-pricing" : "/new/price")}
        disabled={!canContinue}
      />
    </>
  );
}
