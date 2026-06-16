"use client";

import { useRouter } from "next/navigation";
import { Repeat, CreditCard, BadgePercent, Check } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore, type SubscriptionDraft } from "@/lib/store/wizardStore";

// Subscription wizard 1/3 — type. The card picks a starting `benefitType`
// (the single driver); the benefits step then refines it.

const TYPES: { benefit: SubscriptionDraft["benefitType"]; label: string; desc: string; Icon: typeof Repeat }[] = [
  { benefit: "sessions", label: "Service frequency", desc: "Clients pay a fixed fee and redeem services on a set or unlimited frequency.", Icon: Repeat },
  { benefit: "credit", label: "Store credit", desc: "Clients receive recurring credit to spend on services or products.", Icon: CreditCard },
  { benefit: "discount", label: "Membership benefits", desc: "Clients pay for discounts, member access, and perks.", Icon: BadgePercent },
];

export default function SubscriptionTypePage() {
  const router = useRouter();
  const sub = useWizardStore((s) => s.draft.subscription);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Subscription type" subtitle="Choose the membership model. You can refine limits and rules after setup." />
        <div className="space-y-2 pb-6">
          {TYPES.map(({ benefit, label, desc, Icon }) => {
            const active = sub.benefitType === benefit;
            return (
              <button
                key={benefit}
                onClick={() => updateSubscription({ benefitType: benefit })}
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
