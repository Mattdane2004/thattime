"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, Toggle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";

// Wizard final step (service path) — "Price & duration" (Figma 12216:32064).
// Creating persists the offer and opens its dashboard as the success state.

export default function PricePage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const hours = Math.floor(draft.durationMin / 60);
  const mins = draft.durationMin % 60;
  const setHours = (h: number) => updateDraft({ durationMin: Math.max(0, h) * 60 + mins });
  const setMins = (mn: number) => updateDraft({ durationMin: hours * 60 + Math.min(59, Math.max(0, mn)) });

  const canCreate = Boolean(draft.price && draft.durationMin > 0 && (!draft.depositEnabled || draft.depositAmount));

  const create = () => {
    if (!canCreate) return;
    const offer = offerFromDraft(draft, offers);
    addOffer(offer);
    resetDraft();
    router.push(`/app/services/${offer.id}?created=1`);
  };

  return (
    <>
      <ScreenHeader onClose={() => router.push("/app/hub")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Price & duration" subtitle="How much, and how long?" />

        <div className="space-y-6 pb-6">
          <div>
            <FieldLabel>Price</FieldLabel>
            <div className="flex items-baseline gap-1.5 rounded-2xl bg-canvas px-4 py-4">
              <span className="text-[18px] text-muted">£</span>
              <input
                type="number"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => updateDraft({ price: e.target.value })}
                placeholder="0"
                className="w-full bg-transparent text-[28px] font-bold text-navy outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Duration</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-baseline rounded-2xl bg-canvas px-4 py-4">
                <input
                  type="number"
                  inputMode="numeric"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-[28px] font-bold text-navy outline-none"
                />
                <span className="shrink-0 text-[13px] text-muted">hours</span>
              </div>
              <div className="flex items-baseline rounded-2xl bg-canvas px-4 py-4">
                <input
                  type="number"
                  inputMode="numeric"
                  step={5}
                  value={mins}
                  onChange={(e) => setMins(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-[28px] font-bold text-navy outline-none"
                />
                <span className="shrink-0 text-[13px] text-muted">min</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateDraft({ depositEnabled: !draft.depositEnabled })}
            className="flex w-full items-center justify-between rounded-2xl bg-canvas px-4 py-4 text-left"
          >
            <div>
              <div className="text-[15px] font-semibold text-navy">Deposit</div>
              <div className="text-[12px] text-muted">Charge a deposit at booking</div>
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
