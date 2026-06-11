"use client";

import { useRouter } from "next/navigation";
import { Scissors, CreditCard, TicketPercent, LockKeyhole, Check } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";

// Subscription wizard 2/3 — benefits. Ported from that-time-app
// /routes/wizard/SubscriptionBenefits.jsx.

const BENEFITS: { key: SubscriptionDraft["benefitType"]; label: string; Icon: typeof Scissors }[] = [
  { key: "sessions", label: "Included sessions", Icon: Scissors },
  { key: "credit", label: "Store credit", Icon: CreditCard },
  { key: "discount", label: "Member discount", Icon: TicketPercent },
  { key: "access", label: "Access pass", Icon: LockKeyhole },
];

export default function SubscriptionBenefitsPage() {
  const router = useRouter();
  const sub = useWizardStore((s) => s.draft.subscription);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);

  const canContinue =
    sub.benefitType === "access" ||
    (sub.benefitType === "credit" && Boolean(sub.storeCreditAmount)) ||
    (sub.benefitType === "discount" && Boolean(sub.memberDiscountPercent)) ||
    (sub.benefitType === "sessions" && (sub.unlimitedUsage || sub.includedSessions > 0));

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/subscription-type")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">What do members get?</div>
          <div className="mt-1 text-[14px] text-muted">Pick the benefit and set its limit.</div>
        </div>

        <div className="space-y-2 pb-4">
          {BENEFITS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => updateSubscription({ benefitType: key })}
              className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors ${sub.benefitType === key ? "bg-navy text-white" : "bg-canvas text-navy hover:bg-border/40"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sub.benefitType === key ? "bg-white/10" : "bg-surface"}`}><Icon size={17} strokeWidth={1.75} /></span>
              <span className="flex-1 text-[15px] font-medium">{label}</span>
              {sub.benefitType === key && <Check size={16} strokeWidth={2.5} />}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-6">
          {sub.benefitType === "sessions" && (
            <>
              <button
                onClick={() => updateSubscription({ unlimitedUsage: !sub.unlimitedUsage })}
                className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left"
              >
                <span className="text-[14px] font-medium text-navy">Unlimited sessions</span>
                <span className={`relative h-6 w-10 rounded-full ${sub.unlimitedUsage ? "bg-navy" : "bg-border"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${sub.unlimitedUsage ? "left-[1.125rem]" : "left-0.5"}`} />
                </span>
              </button>
              {!sub.unlimitedUsage && (
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-secondary">Sessions per billing period</span>
                  <input type="number" inputMode="numeric" value={sub.includedSessions}
                    onChange={(e) => updateSubscription({ includedSessions: Number(e.target.value) || 0 })}
                    className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
                </label>
              )}
            </>
          )}
          {sub.benefitType === "credit" && (
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Store credit per period (£)</span>
              <input type="number" inputMode="decimal" value={sub.storeCreditAmount} placeholder="50"
                onChange={(e) => updateSubscription({ storeCreditAmount: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
            </label>
          )}
          {sub.benefitType === "discount" && (
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Member discount (%)</span>
              <input type="number" inputMode="numeric" value={sub.memberDiscountPercent} placeholder="10"
                onChange={(e) => updateSubscription({ memberDiscountPercent: e.target.value })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
            </label>
          )}
          {sub.benefitType === "access" && (
            <div className="rounded-xl bg-canvas px-4 py-3 text-[13px] text-secondary">Members get access to member-only services and perks. No numeric limit needed.</div>
          )}
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={() => canContinue && router.push("/new/subscription-billing")} disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Continue
        </button>
      </div>
    </>
  );
}
