"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Package, Plus, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { ServiceBundleOption } from "@/lib/data/offers";
import { nextId } from "@/lib/ids";
import {
  formatServiceBundleMoney,
  serviceBundleClientLine,
  serviceBundleFullPrice,
  serviceBundlePrice,
  serviceBundleSavings,
  serviceBundleSummary,
} from "@/lib/data/serviceBundles";

export default function ServiceBundlesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [view, setView] = useState<"list" | "edit">("list");
  const [draft, setDraft] = useState<ServiceBundleOption | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Bundles" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  if (offer.type !== "service") {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Bundles" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
        <div className="px-8 pt-16 text-center">
          <div className="text-[16px] font-semibold text-navy">Bundles are for services</div>
          <p className="mt-1 text-[13px] leading-snug text-muted">Use the main bundle offering flow when combining different services.</p>
        </div>
      </div>
    );
  }

  const bundles = offer.serviceBundles ?? [];
  const setBundles = (next: ServiceBundleOption[]) => updateOffer(offer.id, { serviceBundles: next });
  const basePrice = Number(offer.price) || 0;

  const newBundle = () => {
    setDraft({
      id: nextId("sb"),
      name: `${offer.name} bundle`,
      quantity: 10,
      pricingMode: "percent",
      discountPercent: "10",
      fixedPrice: "",
      active: true,
    });
    setView("edit");
  };

  const editBundle = (bundle: ServiceBundleOption) => {
    setDraft({ ...bundle });
    setView("edit");
  };

  const removeBundle = (id: string) => {
    setBundles(bundles.filter((bundle) => bundle.id !== id));
  };

  const saveBundle = () => {
    if (!draft || draft.quantity < 2) return;
    setBundles([...bundles.filter((bundle) => bundle.id !== draft.id), draft]);
    setDraft(null);
    setView("list");
  };

  if (view === "edit" && draft) {
    const setD = (patch: Partial<ServiceBundleOption>) => setDraft({ ...draft, ...patch });
    const full = serviceBundleFullPrice(offer, draft);
    const price = serviceBundlePrice(offer, draft);
    const savings = serviceBundleSavings(offer, draft);
    const invalidFixed = draft.pricingMode === "fixed" && (!draft.fixedPrice || price <= 0 || price >= full);
    const invalidPercent = draft.pricingMode === "percent" && (!draft.discountPercent || Number(draft.discountPercent) <= 0 || Number(draft.discountPercent) > 100);
    const canSave = draft.name.trim() && draft.quantity >= 2 && !invalidFixed && !invalidPercent;

    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Bundle option" sub={offer.name} onBack={() => { setView("list"); setDraft(null); }} />
        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-3">
          <label className="block">
            <FieldLabel>Bundle name</FieldLabel>
            <input
              value={draft.name}
              onChange={(event) => setD({ name: event.target.value })}
              placeholder="10 haircut bundle"
              className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </label>

          <label className="block">
            <FieldLabel>Bookings included</FieldLabel>
            <input
              type="number"
              inputMode="numeric"
              min={2}
              value={draft.quantity}
              onChange={(event) => setD({ quantity: Math.max(2, Number(event.target.value) || 2) })}
              className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </label>

          <div>
            <FieldLabel>Bundle pricing</FieldLabel>
            <div className="flex rounded-xl border border-border bg-canvas p-1">
              {([
                ["percent", "% off total"],
                ["fixed", "Set bundle price"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setD({ pricingMode: value })}
                  className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${draft.pricingMode === value ? "bg-white text-navy shadow-card" : "text-secondary"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {draft.pricingMode === "percent" ? (
            <label className="block">
              <FieldLabel>Discount off total (%)</FieldLabel>
              <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label="Discount off total percentage"
                  min={1}
                  max={100}
                  value={draft.discountPercent}
                  onChange={(event) => setD({ discountPercent: event.target.value })}
                  placeholder="10"
                  className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
                />
                <span className="text-[13px] text-muted">% off</span>
              </div>
              {invalidPercent ? <p className="mt-1 text-[12px] text-danger">Enter a discount from 1% to 100%.</p> : null}
            </label>
          ) : (
            <label className="block">
              <FieldLabel>Bundle price (£)</FieldLabel>
              <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
                <span className="text-[15px] text-muted">£</span>
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label="Bundle price"
                  value={draft.fixedPrice}
                  onChange={(event) => setD({ fixedPrice: event.target.value })}
                  placeholder={String(Math.round(full * 0.9))}
                  className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
                />
              </div>
              {invalidFixed ? <p className="mt-1 text-[12px] text-danger">Set a bundle price below the full price of {formatServiceBundleMoney(full)}.</p> : null}
            </label>
          )}

          <button type="button" onClick={() => setD({ active: !draft.active })} className="flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-[15px] font-semibold text-navy">Available to clients</span>
              <span className="block text-[12px] text-muted">Hide this bundle without deleting it</span>
            </span>
            <Toggle on={draft.active} />
          </button>

          <div className="rounded-2xl border border-border bg-canvas p-4">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Price check</p>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Full price" value={formatServiceBundleMoney(full)} />
              <Stat label="Bundle" value={formatServiceBundleMoney(price)} />
              <Stat label="Saves" value={formatServiceBundleMoney(savings)} />
            </div>
            <p className="mt-3 rounded-xl bg-surface px-3 py-2.5 text-[13px] font-medium leading-snug text-navy">
              {serviceBundleClientLine(offer, draft)}.
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Base service price is {formatServiceBundleMoney(basePrice)}. The bundle covers {draft.quantity} bookings of this same service.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
          <button onClick={() => { setView("list"); setDraft(null); }} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">Back</button>
          <button onClick={saveBundle} disabled={!canSave} className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white disabled:bg-border disabled:text-muted">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Bundles" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)}
        action={bundles.length > 0 ? <button onClick={newBundle} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white"><Plus size={15} strokeWidth={1.75} />Add</button> : undefined} />

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {bundles.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><Package size={28} className="text-muted" strokeWidth={1.5} /></span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No bundles yet</div>
            <div className="mt-1 text-[13px] text-muted">Sell packs of this service, like 10 haircuts with 10% off the total.</div>
            <button onClick={newBundle} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white"><Plus size={16} strokeWidth={1.75} />Set up bundle</button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="rounded-2xl border border-border bg-canvas px-4 py-3">
              <div className="text-[14px] font-semibold text-navy">Bundle options</div>
              <p className="mt-1 text-[12px] leading-snug text-muted">Each option sells a set number of future bookings for this service.</p>
            </div>
            {bundles.map((bundle) => (
              <div key={bundle.id} className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
                <button type="button" onClick={() => editBundle(bundle)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bundle.active ? "bg-navy text-white" : "bg-canvas text-muted"}`}>
                    <Package size={15} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-navy">{bundle.name}</span>
                    <span className="block truncate text-[12px] text-muted">{serviceBundleSummary(offer, bundle)}</span>
                  </span>
                  <span className="shrink-0 text-right text-[13px] font-semibold text-navy">{bundle.active ? "Live" : "Hidden"}</span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
                <button type="button" onClick={() => removeBundle(bundle.id)} aria-label="Remove bundle" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-navy">{value}</div>
    </div>
  );
}

function Header({ title, onBack, sub, action }: { title: string; onBack: () => void; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between px-5">
      <div className="flex items-center">
        <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        <span className="ml-1">
          <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
          {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
        </span>
      </div>
      {action}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}
