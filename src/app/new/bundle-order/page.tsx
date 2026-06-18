"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore, syncBundleLinks, type BundleLink } from "@/lib/store/wizardStore";
import { useOffersStore } from "@/lib/store/offersStore";
import { BundleOrderEditor } from "@/components/offer/BundleOrderEditor";

// Bundle wizard step 3 — "Order & gaps" (Figma 12231-52864). Order the services,
// add extra time, link two to run together, or split them over separate days.

export default function BundleOrderPage() {
  const router = useRouter();
  const bundle = useWizardStore((s) => s.draft.bundle);
  const updateBundle = useWizardStore((s) => s.updateBundle);
  const offers = useOffersStore((s) => s.offers);

  // Normalise links to the current selection (back-compat for drafts pre-B0).
  const links = syncBundleLinks(bundle.serviceIds, bundle.links);
  const onChange = (serviceIds: string[], next: BundleLink[]) => updateBundle({ serviceIds, links: next });

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/bundle-services")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Order & gaps" subtitle="Drag services into order and add breaks or overlaps between them." />
        {bundle.serviceIds.length < 2 ? (
          <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-[13px] text-muted">
            Add at least two services first.
          </p>
        ) : (
          <div className="pb-6">
            <BundleOrderEditor serviceIds={bundle.serviceIds} links={links} offers={offers} onChange={onChange} />
          </div>
        )}
      </div>

      <WizardFooter
        step={3}
        total={TOTAL_STEPS.bundle}
        onBack={() => router.push("/new/bundle-services")}
        onNext={() => router.push("/new/bundle-pricing")}
        nextLabel="Next"
      />
    </>
  );
}
