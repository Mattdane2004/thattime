"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Plus, ArrowUpRight, Trash2 } from "lucide-react";
import { demoOffers, offerMeta } from "@/lib/data/offers";
import { useOffersStore } from "@/lib/store/offersStore";

// Related services module — cross-sell setup flow (empty → pick services → list
// of suggestions). Persists to offer.relatedIds via updateOffer.

export default function RelatedModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [picking, setPicking] = useState(false);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Related" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const selected = offer.relatedIds ?? [];
  const options = demoOffers.filter((o) => o.id !== params.id);
  const toggle = (id: string) =>
    updateOffer(offer.id, { relatedIds: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });
  const chosen = options.filter((o) => selected.includes(o.id));

  if (picking) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Suggest services" onBack={() => setPicking(false)} />
        <p className="px-5 pb-2 pt-1 text-[13px] text-muted">Pick services to suggest at checkout.</p>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {options.map((o) => {
            const sel = selected.includes(o.id);
            return (
              <button key={o.id} onClick={() => toggle(o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{o.name}</span>
                  <span className="block text-[12px] text-muted">{o.category} · {offerMeta(o)}</span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{sel ? <Check size={15} /> : <Plus size={15} />}</span>
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
          <button onClick={() => setPicking(false)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
            Done{selected.length ? ` · ${selected.length} suggested` : ""}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header
        title="Related"
        onBack={() => router.push(`/app/services/${offer.id}`)}
        action={chosen.length > 0 ? (
          <button onClick={() => setPicking(true)} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white">
            <Plus size={15} strokeWidth={1.75} />Add
          </button>
        ) : undefined}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {chosen.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <ArrowUpRight size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No related services yet</div>
            <div className="mt-1 text-[13px] text-muted">Suggest other services to clients at checkout.</div>
            <button onClick={() => setPicking(true)} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white">
              <Plus size={16} strokeWidth={1.75} />Add suggestions
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {chosen.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><ArrowUpRight size={16} className="text-navy" strokeWidth={1.75} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-navy">{o.name}</span>
                  <span className="block text-[12px] text-muted">{o.category} · {offerMeta(o)}</span>
                </span>
                <button onClick={() => toggle(o.id)} aria-label="Remove suggestion" className="shrink-0 text-muted hover:text-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between px-5">
      <div className="flex items-center">
        <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">{title}</span>
      </div>
      {action}
    </div>
  );
}
