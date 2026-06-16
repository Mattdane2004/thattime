"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader, FieldLabel, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";

// Requirements & prerequisites module (class) — eligibility and what to bring.
// Fields persist live to the offer via updateOffer.

const empty = { minAge: "", prerequisites: "", whatToBring: "" };

export default function RequirementsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Requirements" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const req = offer.requirements ?? empty;
  const set = (patch: Partial<typeof empty>) => updateOffer(offer.id, { requirements: { ...req, ...patch } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Requirements" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-4">
        <label className="block">
          <FieldLabel>Minimum age</FieldLabel>
          <input
            type="number"
            inputMode="numeric"
            value={req.minAge}
            onChange={(e) => set({ minAge: e.target.value })}
            placeholder="No minimum"
            className={fieldInput}
          />
        </label>
        <label className="block">
          <FieldLabel>Prerequisites</FieldLabel>
          <textarea
            value={req.prerequisites}
            onChange={(e) => set({ prerequisites: e.target.value })}
            placeholder="Skills, qualifications or experience needed"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </label>
        <label className="block">
          <FieldLabel>What to bring</FieldLabel>
          <textarea
            value={req.whatToBring}
            onChange={(e) => set({ whatToBring: e.target.value })}
            placeholder="Anything attendees should bring with them"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </label>
      </div>
    </div>
  );
}
