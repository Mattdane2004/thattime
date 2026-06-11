"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";

// Subscription wizard 3/3 — billing. Ported from that-time-app
// /routes/wizard/SubscriptionBilling.jsx. Create routes to the hub for now.

const PERIODS: SubscriptionDraft["billingPeriod"][] = ["week", "month", "quarter", "year"];

export default function SubscriptionBillingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const sub = draft.subscription;
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);
  const resetDraft = useWizardStore((s) => s.resetDraft);

  const canCreate = Boolean(draft.price);

  const create = () => {
    if (!canCreate) return;
    resetDraft();
    router.push("/app/hub");
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
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={create} disabled={!canCreate}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Create subscription
        </button>
      </div>
    </>
  );
}
