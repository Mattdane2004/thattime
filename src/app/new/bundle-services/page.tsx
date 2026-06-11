"use client";

import { useRouter } from "next/navigation";
import { Check, Package, LayoutGrid } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore, type BundleDraft } from "@/lib/store/wizardStore";
import { demoOffers } from "@/lib/data/offers";

// Bundle wizard 1/2 — kind + included services. Ported from that-time-app
// /routes/wizard/BundleServices.jsx (the drag-to-order BundleOrderGaps step is
// deferred — see PORTING.md). Services come from the existing offer catalogue.

const KINDS: { key: BundleDraft["kind"]; title: string; body: string; Icon: typeof Package }[] = [
  { key: "fixed", title: "Fixed bundle", body: "A set list of services sold together.", Icon: Package },
  { key: "flexible", title: "Flexible package", body: "Clients choose from a list of services.", Icon: LayoutGrid },
];

export default function BundleServicesPage() {
  const router = useRouter();
  const bundle = useWizardStore((s) => s.draft.bundle);
  const updateBundle = useWizardStore((s) => s.updateBundle);

  const services = demoOffers.filter((o) => o.type === "service");
  const toggle = (id: string) =>
    updateBundle({ serviceIds: bundle.serviceIds.includes(id) ? bundle.serviceIds.filter((x) => x !== id) : [...bundle.serviceIds, id] });

  const canContinue = bundle.serviceIds.length >= 2;

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Build the bundle</div>
          <div className="mt-1 text-[14px] text-muted">Pick how it works, then add the services.</div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-5">
          {KINDS.map(({ key, title, body, Icon }) => {
            const active = bundle.kind === key;
            return (
              <button key={key} onClick={() => updateBundle({ kind: key })}
                className={`rounded-2xl border p-4 text-left transition-colors ${active ? "border-navy bg-navy text-white" : "border-border bg-surface text-navy hover:bg-canvas"}`}>
                <Icon size={20} strokeWidth={1.75} />
                <div className="mt-3 text-[14px] font-semibold leading-tight">{title}</div>
                <div className={`mt-1 text-[12px] ${active ? "text-white/70" : "text-muted"}`}>{body}</div>
              </button>
            );
          })}
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Services</div>
        <div className="space-y-2 pb-6">
          {services.map((svc) => {
            const sel = bundle.serviceIds.includes(svc.id);
            return (
              <button key={svc.id} onClick={() => toggle(svc.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{svc.name}</span>
                  <span className="block text-[12px] text-muted">{svc.category} · £{svc.price}</span>
                </span>
                {sel && <Check size={18} className="shrink-0 text-navy" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={() => canContinue && router.push("/new/bundle-pricing")} disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          {bundle.serviceIds.length < 2 ? "Add at least 2 services" : "Continue"}
        </button>
      </div>
    </>
  );
}
