"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { LocationEditor, locationComplete, type LocationValue } from "@/components/offer/LocationEditor";

// Wizard step — "Where is it offered?" (Figma 12220/12216). Thin wrapper over the
// shared LocationEditor (also used by the dashboard location route).

export default function LocationsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const isClass = draft.type === "class";
  const publicClass = isClass && draft.classDetails.bookingStructure === "seat_based";
  const back = isClass ? "/new/class-times" : "/new/basics";

  useEffect(() => {
    if (publicClass && draft.locationModes.mobile) {
      updateDraft({ locationModes: { ...draft.locationModes, mobile: false } });
    }
  }, [draft.locationModes, publicClass, updateDraft]);

  const value: LocationValue = {
    locationModes: draft.locationModes,
    locationIds: draft.locationIds,
    mobile: draft.mobile,
    remote: draft.remote,
  };
  const anyMode = locationComplete({
    ...value,
    locationModes: publicClass ? { ...value.locationModes, mobile: false } : value.locationModes,
  });

  return (
    <>
      <ScreenHeader onBack={() => router.push(back)} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Where is it offered?" subtitle="Pick one or more. You can set details for each." />
        <LocationEditor
          value={value}
          onChange={updateDraft}
          allowMobile={!publicClass}
          mobileSub={isClass ? "Travel-to-customer" : "Stylist travels to client"}
          mobileUnavailableText={
            publicClass
              ? "Mobile delivery is only available on private classes — switch to a private booking on the previous step to offer travel-to-customer."
              : undefined
          }
        />
      </div>
      <WizardFooter
        step={isClass ? 5 : 2}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push(back)}
        onNext={() => anyMode && router.push("/new/staff")}
        disabled={!anyMode}
      />
    </>
  );
}
