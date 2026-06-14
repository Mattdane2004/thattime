"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, Toggle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";

// Wizard final step (service path) — "Price & duration" (Figma 12135:44758).
// Creating persists the offer and opens its dashboard as the success state.

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function PricePage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const canCreate = Boolean(draft.price && draft.durationMin > 0 && (!draft.depositEnabled || draft.depositAmount));

  const create = () => {
    if (!canCreate) return;
    const offer = offerFromDraft(draft, offers);
    addOffer(offer);
    resetDraft();
    router.push(`/app/services/${offer.id}?created=1`);
  };

  const stepDuration = (delta: number) =>
    updateDraft({ durationMin: Math.max(15, draft.durationMin + delta) });

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/staff")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Price & duration" subtitle="How much, how long, and what to charge up front." />

        <div className="space-y-6 pb-6">
          <label className="block">
            <FieldLabel>Price (£)</FieldLabel>
            <input
              type="number"
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => updateDraft({ price: e.target.value })}
              placeholder="35"
              className={fieldInput}
            />
          </label>

          <div>
            <FieldLabel>Duration</FieldLabel>
            <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
              <button onClick={() => stepDuration(-15)} aria-label="Less" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-navy hover:bg-border/40">
                <Minus size={16} />
              </button>
              <span className="text-[15px] font-semibold text-navy">{draft.durationMin} min</span>
              <button onClick={() => stepDuration(15)} aria-label="More" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-navy hover:bg-border/40">
                <Plus size={16} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => updateDraft({ durationMin: d })}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    draft.durationMin === d ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => updateDraft({ depositEnabled: !draft.depositEnabled })}
            className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left"
          >
            <div>
              <div className="text-[14px] font-medium text-navy">Require a deposit</div>
              <div className="text-[12px] text-muted">Charge part of the price up front</div>
            </div>
            <Toggle on={draft.depositEnabled} />
          </button>

          {draft.depositEnabled && (
            <label className="block">
              <FieldLabel>Deposit amount (£)</FieldLabel>
              <input
                type="number"
                inputMode="decimal"
                value={draft.depositAmount}
                onChange={(e) => updateDraft({ depositAmount: e.target.value })}
                placeholder="10"
                className={fieldInput}
              />
            </label>
          )}
        </div>
      </div>

      <WizardFooter
        step={4}
        total={TOTAL_STEPS.service}
        onBack={() => router.push("/new/staff")}
        onNext={create}
        nextLabel="Create service"
        disabled={!canCreate}
      />
    </>
  );
}
