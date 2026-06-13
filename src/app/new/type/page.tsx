"use client";

import { useRouter } from "next/navigation";
import { Scissors, Users, Package, Repeat, ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { OfferType } from "@/lib/types";

// Wizard type selector — "What are you adding?" (Figma 12135:45323). Each
// type branches into its own step sequence from /new/basics.

const TYPES: { key: OfferType; label: string; desc: string; Icon: typeof Scissors }[] = [
  { key: "service", label: "Service", desc: "A one-on-one appointment", Icon: Scissors },
  { key: "class", label: "Class", desc: "Courses, workshops, and group training", Icon: Users },
  { key: "bundle", label: "Bundle", desc: "Multiple services sold together", Icon: Package },
  { key: "subscription", label: "Subscription", desc: "Recurring access — memberships", Icon: Repeat },
];

export default function TypeSelectorPage() {
  const router = useRouter();
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const pick = (key: OfferType) => {
    resetDraft();
    updateDraft({ type: key });
    router.push("/new/basics");
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new")} onClose={() => router.push("/app/hub")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-7 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">What are you adding?</div>
          <div className="mt-1 text-[14px] text-muted">You can change this later.</div>
        </div>
        <div className="space-y-3">
          {TYPES.map(({ key, label, desc, Icon }) => (
            <button
              key={key}
              onClick={() => pick(key)}
              className="flex w-full items-center gap-4 rounded-2xl bg-canvas p-4 text-left transition-colors hover:bg-border/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface">
                <Icon size={20} className="text-secondary" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-medium text-navy">{label}</div>
                <div className="mt-0.5 text-[13px] text-muted">{desc}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
