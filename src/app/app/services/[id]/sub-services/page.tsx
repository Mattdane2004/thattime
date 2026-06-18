"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Scissors } from "lucide-react";
import { FieldLabel } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import { offerMeta } from "@/lib/data/offers";
import { subscriptionCoverageLabel, subscriptionPlanSentence } from "@/lib/data/subscriptions";

// Dashboard module — edit which services are included/unlocked by a subscription.

export default function SubServicesRoute({ params }: { params: { id: string } }) {
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
  const services = allOffers.filter((o) => o.type === "service" && o.status === "published");
  const allSelected = sub.includedServiceIds.length === 0;

  const toggleService = (id: string) => {
    const next = sub.includedServiceIds.includes(id)
      ? sub.includedServiceIds.filter((x) => x !== id)
      : [...sub.includedServiceIds, id];
    updateOffer(offer.id, { subscription: { ...sub, includedServiceIds: next } });
  };

  const toggleAllServices = () => {
    updateOffer(offer.id, {
      subscription: { ...sub, includedServiceIds: allSelected ? services.map((s) => s.id) : [] },
    });
  };

  const title =
    sub.benefitType === "access" ? "Unlocked services" :
    sub.benefitType === "credit" && sub.creditSpendMode === "selected" ? "Credit applies to" :
    "Included services";

  const hint =
    sub.benefitType === "access" ? "Select which services this pass unlocks for members." :
    sub.benefitType === "sessions" ? "Sessions can be used across any of these services." :
    sub.benefitType === "discount" ? "Discount applies to these services at checkout." :
    "Credit can be spent on these services.";

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title={title} sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <p className="pb-4 pt-2 text-[13px] text-muted">{hint}</p>

        {sub.benefitType !== "access" && (
          <button onClick={toggleAllServices}
            className={`mb-3 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${allSelected ? "border-navy" : "border-border hover:bg-canvas"}`}>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">All published services</span>
              <span className="block text-[12px] text-muted">
                {allSelected ? "Currently applies to every published service" : "Use every published service instead"}
              </span>
            </span>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${allSelected ? "border-navy bg-navy" : "border-border bg-canvas"}`}>
              {allSelected && <Check size={14} className="text-white" strokeWidth={3} />}
            </span>
          </button>
        )}

        <div className="mb-4 rounded-2xl border border-border bg-canvas px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Current coverage</div>
          <p className="mt-1.5 text-[14px] font-semibold leading-snug text-navy">{subscriptionCoverageLabel(sub, allOffers)}</p>
          <p className="mt-1 text-[12px] leading-snug text-secondary">{subscriptionPlanSentence(sub, offer, allOffers)}</p>
        </div>

        {!allSelected || sub.benefitType === "access" ? (
          <>
            <FieldLabel>{sub.benefitType === "access" ? "Select services" : "Or choose specific services"}</FieldLabel>
            <div className="space-y-2">
              {services.map((svc) => {
                const sel = sub.includedServiceIds.includes(svc.id);
                return (
                  <button key={svc.id} onClick={() => toggleService(svc.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                      <Scissors size={16} className="text-navy" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-navy">{svc.name}</span>
                      <span className="block text-[12px] text-muted">{offerMeta(svc)}</span>
                    </span>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${sel ? "border-navy bg-navy" : "border-border bg-canvas"}`}>
                      {sel && <Check size={14} className="text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Header({ title = "Included services", onBack, sub }: { title?: string; onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
        <ChevronLeft size={22} />
      </button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </span>
    </div>
  );
}
