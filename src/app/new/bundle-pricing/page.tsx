"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";

// Bundle wizard final step — pricing. Fixed total price or a package discount
// off the summed service prices. Creating persists the bundle and opens its
// dashboard.

export default function BundlePricingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const bundle = draft.bundle;
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const updateBundle = useWizardStore((s) => s.updateBundle);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const sumPrice = bundle.serviceIds
    .map((id) => Number(offers.find((o) => o.id === id)?.price || 0))
    .reduce((a, b) => a + b, 0);

  const discounted =
    bundle.priceMode === "discount" && bundle.discountPercent
      ? Math.round(sumPrice * (1 - Number(bundle.discountPercent) / 100))
      : null;

  const canCreate = bundle.priceMode === "fixed" ? Boolean(draft.price) : Boolean(bundle.discountPercent);

  const create = () => {
    if (!canCreate) return;
    const offer = offerFromDraft(draft, offers);
    addOffer(offer);
    resetDraft();
    router.push(`/app/services/${offer.id}?created=1`);
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/bundle-services")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle
          title="Bundle price"
          subtitle={`${bundle.serviceIds.length} services · £${sumPrice} if bought separately.`}
        />

        <div className="mb-5 flex rounded-full bg-canvas p-1">
          {(["fixed", "discount"] as const).map((m) => (
            <button key={m} onClick={() => updateBundle({ priceMode: m })}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors ${bundle.priceMode === m ? "bg-navy text-white" : "text-secondary"}`}>
              {m === "fixed" ? "Fixed price" : "Package discount"}
            </button>
          ))}
        </div>

        <div className="space-y-6 pb-6">
          {bundle.priceMode === "fixed" ? (
            <label className="block">
              <FieldLabel>Bundle price (£)</FieldLabel>
              <input type="number" inputMode="decimal" value={draft.price} placeholder={String(sumPrice)}
                onChange={(e) => updateDraft({ price: e.target.value })}
                className={fieldInput} />
              {draft.price && Number(draft.price) < sumPrice && (
                <span className="mt-2 block text-[13px] text-secondary">
                  Clients save <span className="font-semibold text-navy">£{sumPrice - Number(draft.price)}</span>
                </span>
              )}
            </label>
          ) : (
            <label className="block">
              <FieldLabel>Discount (%)</FieldLabel>
              <input type="number" inputMode="numeric" value={bundle.discountPercent} placeholder="10"
                onChange={(e) => updateBundle({ discountPercent: e.target.value })}
                className={fieldInput} />
              {discounted !== null && (
                <span className="mt-2 block text-[13px] text-secondary">Clients pay <span className="font-semibold text-navy">£{discounted}</span></span>
              )}
            </label>
          )}
        </div>
      </div>

      <WizardFooter
        step={3}
        total={TOTAL_STEPS.bundle}
        onBack={() => router.push("/new/bundle-services")}
        onNext={create}
        nextLabel="Create bundle"
        disabled={!canCreate}
      />
    </>
  );
}
