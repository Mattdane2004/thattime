"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, Toggle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useOffersStore, offerFromDraft } from "@/lib/store/offersStore";

// Class wizard final step — "Price" (Figma 12135:44809). Price per person with
// a potential-revenue line for seat-based classes; a single group price for
// private bookings. Creating persists the class and opens its dashboard.

export default function ClassPricingPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const cls = draft.classDetails;
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const offers = useOffersStore((s) => s.offers);
  const addOffer = useOffersStore((s) => s.addOffer);

  const seatBased = cls.bookingStructure === "seat_based";
  const price = Number(draft.price || 0);
  const canCreate = Boolean(draft.price) && (!draft.depositEnabled || Boolean(draft.depositAmount));

  const create = () => {
    if (!canCreate) return;
    const offer = offerFromDraft(draft, offers);
    addOffer(offer);
    resetDraft();
    router.push(`/app/services/${offer.id}?created=1`);
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/staff")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Price" subtitle="How much per booking." />

        <div className="space-y-5 pb-6">
          <label className="block">
            <FieldLabel>{seatBased ? "Price per person (£)" : "Price for the group (£)"}</FieldLabel>
            <input
              type="number"
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => updateDraft({ price: e.target.value })}
              placeholder={seatBased ? "15" : "120"}
              className={fieldInput}
            />
            {seatBased && price > 0 && cls.capacity > 0 && (
              <span className="mt-2 block text-[13px] text-secondary">
                £{price} × {cls.capacity} seats = <span className="font-semibold text-navy">£{price * cls.capacity}</span> potential revenue per session
              </span>
            )}
          </label>

          <button
            onClick={() => updateDraft({ depositEnabled: !draft.depositEnabled })}
            className="flex w-full items-center justify-between rounded-2xl bg-canvas px-4 py-3.5 text-left"
          >
            <span>
              <span className="block text-[14px] font-medium text-navy">Deposit</span>
              <span className="block text-[12px] text-muted">Charge a deposit at booking</span>
            </span>
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
                placeholder="5"
                className={fieldInput}
              />
            </label>
          )}
        </div>
      </div>

      <WizardFooter
        step={6}
        total={TOTAL_STEPS.class}
        onBack={() => router.push("/new/staff")}
        onNext={create}
        nextLabel="Create class"
        disabled={!canCreate}
      />
    </>
  );
}
