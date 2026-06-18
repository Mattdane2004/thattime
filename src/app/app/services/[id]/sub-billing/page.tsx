"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FieldLabel, Toggle } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { MembershipTier, SubscriptionDraft } from "@/lib/store/wizardStore";
import { membershipPlanSentences, normalizeMembershipTiers, subscriptionReadinessIssues } from "@/lib/data/subscriptions";
import { productsCatalog } from "@/lib/data/products";

// Dashboard module — edit subscription billing & terms post-creation.

const PERIODS: MembershipTier["billingPeriod"][] = ["week", "month", "quarter", "year"];

export default function SubBillingRoute({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const allOffers = useOffersStore((s) => s.offers);

  if (!offer?.subscription) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Subscription not found</div>
      </div>
    );
  }

  const sub = offer.subscription;
  const readinessIssues = subscriptionReadinessIssues(offer);
  const tiers = normalizeMembershipTiers(sub);
  const readbacks = membershipPlanSentences(sub, allOffers, (id) => productsCatalog.find((p) => p.id === id)?.name ?? "");

  const patch = (p: Partial<SubscriptionDraft>) =>
    updateOffer(offer.id, { subscription: { ...sub, ...p } });

  const saveTiers = (next: MembershipTier[]) => {
    const prices = next.map((tier) => Number(tier.price)).filter((value) => Number.isFinite(value) && value > 0);
    updateOffer(offer.id, {
      price: prices.length ? String(Math.min(...prices)) : offer.price,
      subscription: { ...sub, tiers: next },
    });
  };

  const patchTier = (id: string, tierPatch: Partial<MembershipTier>) =>
    saveTiers(tiers.map((tier) => (tier.id === id ? { ...tier, ...tierPatch } : tier)));

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="space-y-6 pt-2">

          <div className="rounded-2xl border border-border bg-canvas p-4">
            <div className="pb-3">
              <span className="block text-[14px] font-semibold text-navy">Tier pricing</span>
              <span className="block text-[12px] text-muted">Edit the price and billing period for each tier</span>
            </div>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div key={tier.id} className="rounded-xl border border-border bg-surface p-3">
                  <div className="pb-3 text-[13px] font-semibold text-navy">{tier.name}</div>
                  <label className="block">
                    <FieldLabel>Price (£)</FieldLabel>
                    <input type="number" inputMode="decimal" value={tier.price} placeholder="45"
                      onChange={(e) => patchTier(tier.id, { price: e.target.value })}
                      className="h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
                  </label>
                  <div className="mt-3">
                    <FieldLabel>Billing period</FieldLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {PERIODS.map((p) => (
                        <button key={p} onClick={() => patchTier(tier.id, { billingPeriod: p })}
                          className={`rounded-xl border py-2.5 text-[13px] font-medium capitalize transition-colors ${tier.billingPeriod === p ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Joining fee */}
          <div className="overflow-hidden rounded-xl border border-border">
            <button onClick={() => patch({ joiningFeeEnabled: !sub.joiningFeeEnabled })}
              className="flex w-full items-center justify-between bg-canvas px-4 py-3 text-left">
              <div>
                <span className="block text-[14px] font-medium text-navy">Joining fee</span>
                <span className="block text-[12px] text-muted">One-off charge when a client first joins</span>
              </div>
              <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${sub.joiningFeeEnabled ? "bg-navy" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${sub.joiningFeeEnabled ? "left-[1.125rem]" : "left-0.5"}`} />
              </span>
            </button>
            {sub.joiningFeeEnabled && (
              <div className="border-t border-border px-4 py-3">
                <FieldLabel>Amount (£)</FieldLabel>
                <input type="number" inputMode="decimal" value={sub.joiningFee} placeholder="25"
                  onChange={(e) => patch({ joiningFee: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <button onClick={() => patch({ minimumTermEnabled: !sub.minimumTermEnabled })}
              className="flex w-full items-center justify-between bg-canvas px-4 py-3 text-left">
              <div>
                <span className="block text-[14px] font-medium text-navy">Minimum term</span>
                <span className="block text-[12px] text-muted">Only turn this on when members must stay for a set time</span>
              </div>
              <Toggle on={Boolean(sub.minimumTermEnabled)} />
            </button>
            {sub.minimumTermEnabled && (
              <div className="border-t border-border px-4 py-3">
                <FieldLabel>Minimum term (months)</FieldLabel>
                <input type="number" inputMode="numeric" value={sub.minimumTermMonths} placeholder="3"
                  onChange={(e) => patch({ minimumTermMonths: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
              </div>
            )}
          </div>

          {/* Cancellation rule */}
          <div>
            <FieldLabel>Cancellation</FieldLabel>
            <div className="flex gap-2">
              {([
                { key: "cancel_anytime", label: "Cancel anytime" },
                { key: "after_term", label: "After minimum term" },
              ] as { key: SubscriptionDraft["cancellationRule"]; label: string }[]).map(({ key, label }) => (
                <button key={key} onClick={() => patch({ cancellationRule: key })}
                  className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${sub.cancellationRule === key ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"}`}>
                  {label}
                </button>
              ))}
            </div>
            {sub.cancellationRule === "after_term" && (
              <div className="mt-3">
                <FieldLabel>Notice period (days)</FieldLabel>
                <input type="number" inputMode="numeric" value={sub.cancellationNoticeDays} placeholder="30"
                  onChange={(e) => patch({ cancellationNoticeDays: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
              </div>
            )}
          </div>

          {/* Rollover — sessions only */}
          {sub.benefitType === "sessions" && (
            <button onClick={() => patch({ rollover: !sub.rollover })}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas px-4 py-3 text-left">
              <div>
                <span className="block text-[14px] font-medium text-navy">Rollover unused sessions</span>
                <span className="block text-[12px] text-muted">Unused sessions carry into the next billing period</span>
              </div>
              <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${sub.rollover ? "bg-navy" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${sub.rollover ? "left-[1.125rem]" : "left-0.5"}`} />
              </span>
            </button>
          )}

          <div className="rounded-2xl border border-border bg-canvas px-4 py-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">How clients will understand this</div>
            <div className="mt-3 space-y-2">
              {readbacks.map((line, index) => (
                <p key={index} className="rounded-xl bg-surface px-3 py-2.5 text-[13px] font-medium leading-snug text-navy">{line}</p>
              ))}
            </div>
            {readinessIssues.length > 0 ? (
              <p className="mt-2 text-[12px] leading-snug text-secondary">Finish before publishing: {readinessIssues.join(", ")}.</p>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}

function Header({ onBack, sub }: { onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
        <ChevronLeft size={22} />
      </button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">Billing &amp; terms</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </span>
    </div>
  );
}
