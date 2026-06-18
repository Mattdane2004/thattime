"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Plus, FileText, X } from "lucide-react";
import { formsCatalog } from "@/lib/data/modules";
import { useOffersStore } from "@/lib/store/offersStore";
import { inheritedForms } from "@/lib/data/bundles";

// Forms module — assign intake/consent forms, each toggleable Required/Optional
// (Figma 40138). Persists offer.forms ({id, required}). For bundles, also shows
// the forms inherited from the component services (read-only) above its own.

const catForm = (id: string) => formsCatalog.find((f) => f.id === id);

export default function FormsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const allOffers = useOffersStore((s) => s.offers);
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [picking, setPicking] = useState(false);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Forms" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const forms = offer.forms ?? [];
  const has = (id: string) => forms.some((f) => f.id === id);
  const togglePick = (id: string) => updateOffer(offer.id, { forms: has(id) ? forms.filter((f) => f.id !== id) : [...forms, { id, required: false }] });
  const setRequired = (id: string, required: boolean) => updateOffer(offer.id, { forms: forms.map((f) => (f.id === id ? { ...f, required } : f)) });

  if (picking) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Select forms" sub={offer.name} onBack={() => setPicking(false)} />
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6 pt-2">
          {formsCatalog.map((f) => {
            const on = has(f.id);
            return (
              <button key={f.id} onClick={() => togglePick(f.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${on ? "border-navy" : "border-border"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><FileText size={17} className="text-navy" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{f.name}</span>
                  <span className="block truncate text-[12px] text-muted">{f.fieldCount} fields · {f.description}</span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${on ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{on ? <Check size={15} /> : <Plus size={15} />}</span>
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
          <button onClick={() => setPicking(false)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done{forms.length ? ` · ${forms.length} attached` : ""}</button>
        </div>
      </div>
    );
  }

  const isBundle = offer.type === "bundle";
  const inherited = isBundle ? inheritedForms(offer.bundle?.serviceIds ?? [], allOffers) : [];

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Forms" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {isBundle && inherited.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Inherited from services</div>
            <div className="space-y-2">
              {inherited.map((f, i) => {
                const cf = catForm(f.id);
                return (
                  <div key={`${f.id}-${i}`} className="flex items-center gap-3 rounded-2xl border border-border bg-canvas px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface"><FileText size={15} className="text-secondary" strokeWidth={1.75} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-navy">{cf?.name}</span>
                      <span className="block truncate text-[12px] text-muted">From {f.from} · {f.required ? "Required" : "Optional"}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isBundle && (
          <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Bundle forms</div>
        )}

        {forms.length === 0 ? (
          isBundle ? (
            <button onClick={() => setPicking(true)} className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-4 text-[14px] font-semibold text-secondary"><Plus size={16} strokeWidth={1.75} />Add bundle forms</button>
          ) : (
            <div className="flex flex-col items-center px-6 pt-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><FileText size={28} className="text-muted" strokeWidth={1.5} /></span>
              <div className="mt-4 text-[16px] font-semibold text-navy">No forms yet</div>
              <div className="mt-1 text-[13px] text-muted">Attach intake or consent forms clients fill before booking.</div>
              <button onClick={() => setPicking(true)} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white"><Plus size={16} strokeWidth={1.75} />Add forms</button>
            </div>
          )
        ) : (
          <div className="space-y-2">
            {forms.map((f) => {
              const cf = catForm(f.id);
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{cf?.name}</span>
                    <span className="block text-[12px] text-muted">{cf?.fieldCount} fields · {f.required ? "Required" : "Optional"}</span>
                  </span>
                  <button onClick={() => setRequired(f.id, !f.required)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${f.required ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>
                    {f.required ? "Required" : "Optional"}
                  </button>
                  <button onClick={() => togglePick(f.id)} aria-label="Remove form" className="shrink-0 text-muted hover:text-danger"><X size={17} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {forms.length > 0 && (
        <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
          <button onClick={() => setPicking(true)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Edit selection</button>
        </div>
      )}
    </div>
  );
}

function Header({ title, onBack, sub }: { title: string; onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
        {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
      </span>
    </div>
  );
}
