"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { WizardFooter, TOTAL_STEPS } from "@/components/app/WizardChrome";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";

// Subscription wizard final step — billing. Creating persists the membership
// and opens its dashboard.

const PERIODS: SubscriptionDraft["billingPeriod"][] = ["week", "month", "quarter", "year"];

export default function SubscriptionBillingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const sub = draft.subscription;
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const canCreate = Boolean(draft.price);

  const create = () => {
    if (!canCreate) return;
    const offer = offerFromDraft(draft, offers);
    addOffer(offer);
    resetDraft();
    router.push(`/app/services/${offer.id}?created=1`);
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/subscription-benefits")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Billing</div>
          <div className="mt-1 text-[14px] text-muted">How much, how often, and any joining terms.</div>
        </div>

        <div className="space-y-6 pb-6">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Price (£)</span>
            <input type="number" inputMode="decimal" value={draft.price} placeholder="45"
              onChange={(e) => updateDraft({ price: e.target.value })}
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>

          <div>
            <span className="mb-2 block text-[13px] font-medium text-secondary">Billing period</span>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => updateSubscription({ billingPeriod: p })}
                  className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium capitalize ${sub.billingPeriod === p ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Joining fee (£, optional)</span>
            <input type="number" inputMode="decimal" value={sub.joiningFee} placeholder="0"
              onChange={(e) => updateSubscription({ joiningFee: e.target.value })}
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Minimum term (months, optional)</span>
            <input type="number" inputMode="numeric" value={sub.minimumTermMonths} placeholder="0"
              onChange={(e) => updateSubscription({ minimumTermMonths: e.target.value })}
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>
        </div>
      </div>
      <WizardFooter
        step={4}
        total={TOTAL_STEPS.subscription}
        onBack={() => router.push("/new/subscription-benefits")}
        onNext={create}
        nextLabel="Create subscription"
        disabled={!canCreate}
      />
    </>
  );
}
