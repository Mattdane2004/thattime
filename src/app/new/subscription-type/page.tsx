"use client";

import { useRouter } from "next/navigation";
import { Repeat, CreditCard, BadgePercent, Check } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";

// Subscription wizard 1/3 — type. Ported from that-time-app
// /routes/wizard/SubscriptionType.jsx.

const TYPES: { key: SubscriptionDraft["subType"]; benefit: SubscriptionDraft["benefitType"]; label: string; desc: string; Icon: typeof Repeat }[] = [
  { key: "frequency", benefit: "sessions", label: "Service frequency", desc: "Clients pay a fixed fee and redeem services on a set or unlimited frequency.", Icon: Repeat },
  { key: "credit", benefit: "credit", label: "Store credit", desc: "Clients receive recurring credit to spend on services or products.", Icon: CreditCard },
  { key: "membership", benefit: "discount", label: "Membership benefits", desc: "Clients pay for discounts, member access, and perks.", Icon: BadgePercent },
];

export default function SubscriptionTypePage() {
  const router = useRouter();
  const sub = useWizardStore((s) => s.draft.subscription);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Subscription type</div>
          <div className="mt-1 text-[14px] text-muted">Choose the membership model. You can refine limits and rules after setup.</div>
        </div>
        <div className="space-y-2 pb-6">
          {TYPES.map(({ key, benefit, label, desc, Icon }) => {
            const active = sub.subType === key;
            return (
              <button
                key={key}
                onClick={() => updateSubscription({ subType: key, benefitType: benefit })}
                className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors ${active ? "bg-navy text-white" : "bg-canvas text-navy hover:bg-border/40"}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/10" : "bg-surface"}`}>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">{label}</span>
                  <span className={`mt-0.5 block text-[13px] ${active ? "text-white/70" : "text-muted"}`}>{desc}</span>
                </span>
                {active && <Check size={18} strokeWidth={2.5} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
      <WizardFooter
        step={2}
        total={TOTAL_STEPS.subscription}
        onBack={() => router.push("/new/basics")}
        onNext={() => router.push("/new/subscription-benefits")}
      />
    </>
  );
}
