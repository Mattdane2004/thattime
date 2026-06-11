"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";
import { demoOffers } from "@/lib/data/offers";

// Bundle wizard 2/2 — pricing. Ported from that-time-app
// /routes/wizard/BundlePricing.jsx. Fixed total price or a package discount
// off the summed service prices. Create routes to the hub for now.

export default function BundlePricingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const bundle = draft.bundle;
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const updateBundle = useWizardStore((s) => s.updateBundle);
  const resetDraft = useWizardStore((s) => s.resetDraft);

  const sumPrice = bundle.serviceIds
    .map((id) => Number(demoOffers.find((o) => o.id === id)?.price || 0))
    .reduce((a, b) => a + b, 0);

  const discounted =
    bundle.priceMode === "discount" && bundle.discountPercent
      ? Math.round(sumPrice * (1 - Number(bundle.discountPercent) / 100))
      : null;

  const canCreate = bundle.priceMode === "fixed" ? Boolean(draft.price) : Boolean(bundle.discountPercent);

  const create = () => {
    if (!canCreate) return;
    resetDraft();
    router.push("/app/hub");
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/bundle-services")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Bundle price</div>
          <div className="mt-1 text-[14px] text-muted">
            {bundle.serviceIds.length} services · £{sumPrice} if bought separately.
          </div>
        </div>

        <div className="mb-5 flex rounded-full bg-canvas p-1">
          {(["fixed", "discount"] as const).map((m) => (
            <button key={m} onClick={() => updateBundle({ priceMode: m })}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium capitalize transition-colors ${bundle.priceMode === m ? "bg-navy text-white" : "text-secondary"}`}>
              {m === "fixed" ? "Fixed price" : "Package discount"}
            </button>
          ))}
        </div>

        <div className="space-y-6 pb-6">
          {bundle.priceMode === "fixed" ? (
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Bundle price (£)</span>
              <input type="number" inputMode="decimal" value={draft.price} placeholder={String(sumPrice)}
                onChange={(e) => updateDraft({ price: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Discount (%)</span>
              <input type="number" inputMode="numeric" value={bundle.discountPercent} placeholder="10"
                onChange={(e) => updateBundle({ discountPercent: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
              {discounted !== null && (
                <span className="mt-2 block text-[13px] text-secondary">Clients pay <span className="font-semibold text-navy">£{discounted}</span></span>
              )}
            </label>
          )}
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={create} disabled={!canCreate}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Create bundle
        </button>
      </div>
    </>
  );
}
