"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { Sheet, WizardFooter, WizardTitle, TOTAL_STEPS, FieldLabel } from "@/components/ui";
import {
  starterMembershipTier,
  type MembershipTier,
} from "@/lib/store/wizardStore";
import { useWizardStore } from "@/lib/store/wizardStore";
import { normalizeMembershipTiers, tierInheritanceLabel, tierPlanSentence } from "@/lib/data/subscriptions";
import { useOffersStore } from "@/lib/store/offersStore";

const PERIODS: MembershipTier["billingPeriod"][] = ["week", "month", "quarter", "year"];
const tierName = (index: number) => ["Starter", "Silver", "Gold", "VIP"][index] ?? `Tier ${index + 1}`;

export default function SubscriptionTypePage() {
  const router = useRouter();
  const sub = useWizardStore((s) => s.draft.subscription);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);
  const offers = useOffersStore((s) => s.offers);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const tiers = normalizeMembershipTiers(sub);
  const editingTier = tiers.find((tier) => tier.id === editingTierId);

  const saveTiers = (next: MembershipTier[]) => updateSubscription({ tiers: next });
  const patchTier = (id: string, patch: Partial<MembershipTier>) =>
    saveTiers(tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)));

  const addTier = () => {
    const parent = tiers[tiers.length - 1];
    const next = starterMembershipTier();
    next.id = `tier_${Date.now()}`;
    next.name = tierName(tiers.length);
    next.serviceBookingsEnabled = false;
    if (parent) {
      next.inheritsFromTierId = parent.id;
      next.inheritServiceBookings = true;
      next.inheritClassBookings = true;
      next.inheritDiscounts = true;
      next.inheritAccess = true;
    }
    saveTiers([...tiers, next]);
    setEditingTierId(next.id);
  };

  const removeTier = (id: string) => {
    const next = tiers
      .filter((tier) => tier.id !== id)
      .map((tier) => (tier.inheritsFromTierId === id ? { ...tier, inheritsFromTierId: "" } : tier));
    saveTiers(next);
    if (editingTierId === id) setEditingTierId(null);
  };

  const canContinue = tiers.length > 0 && tiers.every((tier) => tier.name.trim() && tier.price);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Membership tiers" subtitle="Start with your price levels. Edit details in a sheet so the setup stays light." />

        <div className="space-y-3 pb-6">
          {tiers.map((tier, index) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setEditingTierId(tier.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-canvas px-4 py-3.5 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-[13px] font-bold text-navy">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-navy">{tier.name || "Unnamed tier"}</span>
                <span className="block truncate text-[12px] text-muted">
                  {tier.price ? `£${tier.price}/${tier.billingPeriod}` : "Set price"} · {tierInheritanceLabel(tier, tiers)}
                </span>
                {tier.description ? <span className="mt-0.5 block truncate text-[12px] text-secondary">{tier.description}</span> : null}
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
          ))}

          <button
            type="button"
            onClick={addTier}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface text-[14px] font-semibold text-navy hover:bg-canvas"
          >
            <Plus size={16} /> Add another tier
          </button>
        </div>
      </div>

      <WizardFooter
        step={2}
        total={TOTAL_STEPS.subscription}
        onBack={() => router.push("/new/basics")}
        onNext={() => canContinue && router.push("/new/subscription-benefits")}
        disabled={!canContinue}
      />

      <Sheet
        open={Boolean(editingTier)}
        onClose={() => setEditingTierId(null)}
        title={editingTier?.name || "Edit tier"}
        sub="Name, price and inheritance"
        footer={
          <button
            type="button"
            onClick={() => setEditingTierId(null)}
            className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white"
          >
            Done
          </button>
        }
      >
        {editingTier && (
          <div className="space-y-4">
            <label className="block">
              <FieldLabel>Tier name</FieldLabel>
              <input
                value={editingTier.name}
                onChange={(e) => patchTier(editingTier.id, { name: e.target.value })}
                placeholder="Gold"
                className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
              />
            </label>

            <label className="block">
              <FieldLabel>Price (£)</FieldLabel>
              <input
                type="number"
                inputMode="decimal"
                value={editingTier.price}
                onChange={(e) => patchTier(editingTier.id, { price: e.target.value })}
                placeholder="89"
                className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
              />
            </label>

            <div>
              <FieldLabel>Billing period</FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {PERIODS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => patchTier(editingTier.id, { billingPeriod: period })}
                    className={`rounded-xl border py-2.5 text-[13px] font-medium capitalize transition-colors ${editingTier.billingPeriod === period ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary hover:bg-border/40"}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <FieldLabel>Short description (optional)</FieldLabel>
              <input
                value={editingTier.description}
                onChange={(e) => patchTier(editingTier.id, { description: e.target.value })}
                placeholder="Best for regular clients"
                className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
              />
            </label>

            {tiers.length > 1 && (
              <div className="rounded-2xl border border-border bg-canvas p-3">
                <FieldLabel>Inherits from</FieldLabel>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => patchTier(editingTier.id, {
                      inheritsFromTierId: "",
                      inheritServiceBookings: false,
                      inheritClassBookings: false,
                      inheritDiscounts: false,
                      inheritAccess: false,
                    })}
                    className={`flex h-11 w-full items-center rounded-xl border px-3 text-[13px] font-semibold ${!editingTier.inheritsFromTierId ? "border-navy bg-navy text-white" : "border-border bg-surface text-secondary"}`}
                  >
                    Nothing
                  </button>
                  {tiers.filter((tier) => tier.id !== editingTier.id).map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => patchTier(editingTier.id, { inheritsFromTierId: tier.id })}
                      className={`flex h-11 w-full items-center rounded-xl border px-3 text-[13px] font-semibold ${editingTier.inheritsFromTierId === tier.id ? "border-navy bg-navy text-white" : "border-border bg-surface text-secondary"}`}
                    >
                      {tier.name || "Unnamed tier"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-canvas px-3 py-2.5 text-[12px] leading-snug text-secondary">
              {tierPlanSentence(editingTier, offers, undefined, tiers)}
            </div>

            {tiers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTier(editingTier.id)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-[13px] font-semibold text-danger"
              >
                <Trash2 size={15} /> Remove tier
              </button>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
