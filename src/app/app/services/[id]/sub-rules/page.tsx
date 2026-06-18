"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FieldLabel } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { SubscriptionDraft } from "@/lib/store/wizardStore";

// Dashboard module — booking rules: cooldown between uses, session rollover,
// and member pause settings. These are deferred from the wizard.

export default function SubRulesRoute({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer?.subscription) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Subscription not found</div>
      </div>
    );
  }

  const sub = offer.subscription;
  const patch = (p: Partial<SubscriptionDraft>) =>
    updateOffer(offer.id, { subscription: { ...sub, ...p } });

  const isSessionsBenefit = sub.benefitType === "sessions";

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="space-y-5 pt-2">

          {/* Cooldown — sessions only */}
          {isSessionsBenefit && (
            <div className="overflow-hidden rounded-xl border border-border">
              <button onClick={() => patch({ sessionCooldownEnabled: !sub.sessionCooldownEnabled })}
                className="flex w-full items-center justify-between bg-canvas px-4 py-3 text-left">
                <div>
                  <span className="block text-[14px] font-medium text-navy">Session cooldown</span>
                  <span className="block text-[12px] text-muted">Minimum days between redemptions</span>
                </div>
                <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${sub.sessionCooldownEnabled ? "bg-navy" : "bg-border"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${sub.sessionCooldownEnabled ? "left-[1.125rem]" : "left-0.5"}`} />
                </span>
              </button>
              {sub.sessionCooldownEnabled && (
                <div className="border-t border-border px-4 py-3">
                  <FieldLabel>Minimum days between uses</FieldLabel>
                  <input type="number" inputMode="numeric" min={1} value={sub.sessionCooldownDays} placeholder="7"
                    onChange={(e) => patch({ sessionCooldownDays: Math.max(1, Number(e.target.value) || 1) })}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
                </div>
              )}
            </div>
          )}

          {/* Rollover — sessions only */}
          {isSessionsBenefit && (
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

          {/* Pause rules */}
          <div className="overflow-hidden rounded-xl border border-border">
            <button onClick={() => patch({ pauseEnabled: !sub.pauseEnabled })}
              className="flex w-full items-center justify-between bg-canvas px-4 py-3 text-left">
              <div>
                <span className="block text-[14px] font-medium text-navy">Allow membership pause</span>
                <span className="block text-[12px] text-muted">Members can request a temporary hold on their membership</span>
              </div>
              <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${sub.pauseEnabled ? "bg-navy" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${sub.pauseEnabled ? "left-[1.125rem]" : "left-0.5"}`} />
              </span>
            </button>
            {sub.pauseEnabled && (
              <div className="space-y-4 border-t border-border px-4 py-4">
                <label className="block">
                  <FieldLabel>Maximum pause duration (days)</FieldLabel>
                  <input type="number" inputMode="numeric" value={sub.pauseMaxDays} placeholder="30"
                    onChange={(e) => patch({ pauseMaxDays: e.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
                </label>
                <label className="block">
                  <FieldLabel>Notice required before pausing (days)</FieldLabel>
                  <input type="number" inputMode="numeric" value={sub.pauseNoticeDays} placeholder="7"
                    onChange={(e) => patch({ pauseNoticeDays: e.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
                </label>
              </div>
            )}
          </div>

          {!isSessionsBenefit && (
            <p className="rounded-xl bg-canvas px-4 py-3 text-[12px] text-muted">
              Cooldown and rollover only apply to session-based memberships.
            </p>
          )}
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
        <span className="block text-[17px] font-semibold leading-tight text-navy">Booking rules</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </span>
    </div>
  );
}
