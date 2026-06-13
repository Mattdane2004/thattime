"use client";

import { useRouter } from "next/navigation";
import { Check, Scissors } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { WizardFooter, WizardTitle, FieldLabel, TOTAL_STEPS } from "@/components/app/WizardChrome";
import { useWizardStore, type BundleDraft } from "@/lib/store/wizardStore";
import { useOffersStore } from "@/lib/store/offersStore";
import { offerMeta } from "@/lib/data/offers";

// Bundle wizard — "Included services" (Figma 12135:46994). Pick how the
// bundle works, then choose at least two services from the catalogue.

const KINDS: { key: BundleDraft["kind"]; title: string; body: string }[] = [
  { key: "fixed", title: "Fixed bundle", body: "A set list of services booked together." },
  { key: "flexible", title: "Flexible package", body: "Clients choose from a list of services." },
];

export default function BundleServicesPage() {
  const router = useRouter();
  const bundle = useWizardStore((s) => s.draft.bundle);
  const updateBundle = useWizardStore((s) => s.updateBundle);
  const offers = useOffersStore((s) => s.offers);

  const services = offers.filter((o) => o.type === "service" && o.status === "published");
  const toggle = (id: string) =>
    updateBundle({ serviceIds: bundle.serviceIds.includes(id) ? bundle.serviceIds.filter((x) => x !== id) : [...bundle.serviceIds, id] });

  const canContinue = bundle.serviceIds.length >= 2;

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Included services" subtitle="Choose the services clients buy together in this bundle." />

        <div className="pb-5">
          <div className="flex rounded-2xl bg-canvas p-1">
            {KINDS.map(({ key, title }) => (
              <button
                key={key}
                onClick={() => updateBundle({ kind: key })}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                  bundle.kind === key ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted">{KINDS.find((k) => k.key === bundle.kind)?.body}</div>
        </div>

        <FieldLabel>Services ({bundle.serviceIds.length} selected)</FieldLabel>
        <div className="space-y-2 pb-6">
          {services.map((svc) => {
            const sel = bundle.serviceIds.includes(svc.id);
            return (
              <button
                key={svc.id}
                onClick={() => toggle(svc.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}
              >
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
      </div>

      <WizardFooter
        step={2}
        total={TOTAL_STEPS.bundle}
        onBack={() => router.push("/new/basics")}
        onNext={() => canContinue && router.push("/new/bundle-pricing")}
        nextLabel={canContinue ? "Next" : "Add at least 2 services"}
        disabled={!canContinue}
      />
    </>
  );
}
