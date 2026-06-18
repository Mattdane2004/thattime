"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS, FieldLabel, Toggle } from "@/components/ui";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";
import { membershipPlanSentences, subscriptionReadinessIssues } from "@/lib/data/subscriptions";
import { productsCatalog } from "@/lib/data/products";

export default function SubscriptionBillingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const sub = draft.subscription;
  const updateSubscription = useWizardStore((s) => s.updateSubscription);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const readinessIssues = subscriptionReadinessIssues({ price: draft.price, subscription: sub });
  const canCreate = readinessIssues.length === 0;
  const readbacks = membershipPlanSentences(sub, offers, (id) => productsCatalog.find((p) => p.id === id)?.name ?? "");

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
        <WizardTitle title="Terms &amp; review" subtitle="Set the joining rules and check how every tier will read to clients." />

        <div className="space-y-5 pb-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-canvas">
            <button
              type="button"
              onClick={() => updateSubscription({ joiningFeeEnabled: !sub.joiningFeeEnabled })}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span>
                <span className="block text-[14px] font-semibold text-navy">Joining fee</span>
                <span className="block text-[12px] text-muted">A one-off charge when a client first signs up</span>
              </span>
              <Toggle on={sub.joiningFeeEnabled} />
            </button>
            {sub.joiningFeeEnabled && (
              <div className="border-t border-border px-4 py-3">
                <FieldLabel>Joining fee amount (£)</FieldLabel>
                <input
                  type="number"
                  inputMode="decimal"
                  value={sub.joiningFee}
                  placeholder="25"
                  onChange={(e) => updateSubscription({ joiningFee: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
                />
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-canvas">
            <button
              type="button"
              onClick={() => updateSubscription({ minimumTermEnabled: !sub.minimumTermEnabled })}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span>
                <span className="block text-[14px] font-semibold text-navy">Minimum term</span>
                <span className="block text-[12px] text-muted">Only turn this on if members must stay for a set time</span>
              </span>
              <Toggle on={Boolean(sub.minimumTermEnabled)} />
            </button>
            {sub.minimumTermEnabled && (
              <div className="border-t border-border px-4 py-3">
                <FieldLabel>Minimum term (months)</FieldLabel>
                <input
                  type="number"
                  inputMode="numeric"
                  value={sub.minimumTermMonths}
                  placeholder="3"
                  onChange={(e) => updateSubscription({ minimumTermMonths: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
                />
              </div>
            )}
          </div>

          <div>
            <FieldLabel>Cancellation</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "cancel_anytime", label: "Cancel anytime" },
                { key: "after_term", label: "After minimum term" },
              ] as { key: SubscriptionDraft["cancellationRule"]; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSubscription({ cancellationRule: key })}
                  className={`rounded-xl border py-2.5 text-[13px] font-semibold transition-colors ${sub.cancellationRule === key ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary hover:bg-border/40"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {sub.cancellationRule === "after_term" && (
              <label className="mt-3 block">
                <FieldLabel>Cancellation notice (days, optional)</FieldLabel>
                <input
                  type="number"
                  inputMode="numeric"
                  value={sub.cancellationNoticeDays}
                  placeholder="30"
                  onChange={(e) => updateSubscription({ cancellationNoticeDays: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
                />
              </label>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-canvas px-4 py-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Review</div>
            <div className="mt-3 space-y-2">
              {readbacks.map((line, index) => (
                <p key={index} className="rounded-xl bg-surface px-3 py-2.5 text-[13px] font-medium leading-snug text-navy">
                  {line}
                </p>
              ))}
            </div>
            {readinessIssues.length > 0 && (
              <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] leading-snug text-secondary">
                Finish before creating: {readinessIssues.join(", ")}.
              </div>
            )}
          </div>
        </div>
      </div>

      <WizardFooter
        step={4}
        total={TOTAL_STEPS.subscription}
        onBack={() => router.push("/new/subscription-benefits")}
        onNext={create}
        nextLabel="Create membership"
        disabled={!canCreate}
      />
    </>
  );
}
