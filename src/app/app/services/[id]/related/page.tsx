"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Plus, Check, Search, Trash2, ArrowUpRight } from "lucide-react";
import { Toggle } from "@/components/ui";
import { demoOffers } from "@/lib/data/offers";
import { useOffersStore } from "@/lib/store/offersStore";
import { nextId } from "@/lib/ids";
import type { UpsellGroup, UpsellAudience } from "@/lib/data/offers";

const AUDIENCE: { key: keyof UpsellAudience; label: string; options: string[] }[] = [
  { key: "gender", label: "Gender", options: ["Female", "Male", "Non-binary"] },
  { key: "history", label: "Client history", options: ["New", "Returning", "VIP"] },
  { key: "engagement", label: "Engagement", options: ["Booked recently", "Hasn't booked in 3m+"] },
];

const emptyGroup = (id: string): UpsellGroup => ({ id, name: "", serviceIds: [], discountOn: true, discountAmount: "", discountUnit: "percent", socialProof: true, audience: { gender: [], history: [], engagement: [] } });

export default function RelatedModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [draft, setDraft] = useState<UpsellGroup | null>(null);
  const [step, setStep] = useState(1);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Related services" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const groups = offer.upsellGroups ?? [];
  const options = demoOffers.filter((o) => o.type === "service" && o.id !== params.id);
  const setD = (patch: Partial<UpsellGroup>) => draft && setDraft({ ...draft, ...patch });
  const startNew = () => { setDraft(emptyGroup(nextId("ups"))); setStep(1); };
  const editGroup = (g: UpsellGroup) => { setDraft({ ...g, audience: { ...g.audience } }); setStep(1); };
  const close = () => { setDraft(null); setStep(1); };
  const save = () => { if (!draft) return; updateOffer(offer.id, { upsellGroups: [...groups.filter((g) => g.id !== draft.id), draft] }); close(); };
  const removeGroup = (id: string) => updateOffer(offer.id, { upsellGroups: groups.filter((g) => g.id !== id) });

  // ---- 3-step wizard ----
  if (draft) {
    const total = draft.serviceIds.reduce((sum, id) => sum + (Number(demoOffers.find((o) => o.id === id)?.price) || 0), 0);
    const saves = draft.discountOn ? (draft.discountUnit === "percent" ? (total * (Number(draft.discountAmount) || 0)) / 100 : Number(draft.discountAmount) || 0) : 0;
    const after = Math.max(0, total - saves);
    const canNext = step === 1 ? Boolean(draft.name.trim() && draft.serviceIds.length) : true;
    const next = () => (step < 3 ? setStep(step + 1) : save());
    const back = () => (step > 1 ? setStep(step - 1) : close());

    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-14 items-center justify-between px-5">
          <button onClick={back} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">{step === 1 ? <X size={20} /> : <ChevronLeft size={22} />}</button>
          <span className="text-[13px] text-muted">Help</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {step === 1 && <Step1 draft={draft} setD={setD} options={options} />}
          {step === 2 && <Step2 draft={draft} setD={setD} total={total} after={after} saves={saves} />}
          {step === 3 && <Step3 draft={draft} setD={setD} />}
        </div>
        <div className="shrink-0 border-t border-border px-5 pb-4 pt-3">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[12px] text-muted">Step <span className="font-semibold text-navy">{step}</span> of 3</span>
            <div className="flex gap-1.5">{[1, 2, 3].map((i) => <span key={i} className={`h-1 w-7 rounded-full ${i <= step ? "bg-navy" : "bg-border"}`} />)}</div>
          </div>
          <button onClick={next} disabled={!canNext} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white disabled:bg-border disabled:text-muted">{step === 3 ? "Save" : "Next"}</button>
        </div>
      </div>
    );
  }

  // ---- List / empty ----
  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Related services" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)}
        action={groups.length > 0 ? <button onClick={startNew} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white"><Plus size={15} strokeWidth={1.75} />Add</button> : undefined} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><ArrowUpRight size={28} className="text-muted" strokeWidth={1.5} /></span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No related services yet</div>
            <div className="mt-1 text-[13px] text-muted">Group services into an upsell or discounted combo at checkout.</div>
            <button onClick={startNew} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white"><Plus size={16} strokeWidth={1.75} />Create a group</button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {groups.map((g) => {
              const audienceNarrowed = g.audience.gender.length || g.audience.history.length || g.audience.engagement.length;
              const disc = g.discountOn && g.discountAmount ? (g.discountUnit === "percent" ? `−${g.discountAmount}%` : `−£${g.discountAmount}`) : "Upsell";
              return (
                <button key={g.id} onClick={() => editGroup(g)} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{g.name}</span>
                    <span className="block text-[12px] text-muted">{g.serviceIds.length} option{g.serviceIds.length === 1 ? "" : "s"} · {audienceNarrowed ? "Targeted" : "Anyone"}</span>
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold text-navy">{disc}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Step 1: name & services -----------------------------------------------

function Step1({ draft, setD, options }: { draft: UpsellGroup; setD: (p: Partial<UpsellGroup>) => void; options: typeof demoOffers }) {
  const [query, setQuery] = useState("");
  const cats = Array.from(new Set(options.map((o) => o.category)));
  const toggle = (id: string) => setD({ serviceIds: draft.serviceIds.includes(id) ? draft.serviceIds.filter((x) => x !== id) : [...draft.serviceIds, id] });
  const q = query.trim().toLowerCase();

  return (
    <div className="pb-6">
      <h1 className="pb-1 pt-2 text-[26px] font-bold tracking-tight text-navy">Name &amp; services</h1>
      <p className="pb-5 text-[14px] text-muted">Pick services that should share this discount and audience.</p>
      <label className="block pb-5">
        <FieldLabel>Group name</FieldLabel>
        <input value={draft.name} onChange={(e) => setD({ name: e.target.value })} placeholder="e.g. Hair add-ons"
          className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
      </label>
      <FieldLabel>Services in this group</FieldLabel>
      <div className="relative pb-3">
        <Search size={16} className="absolute left-3.5 top-[34%] -translate-y-1/2 text-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your services"
          className="h-11 w-full rounded-xl border border-border bg-canvas pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
      </div>
      {cats.map((c) => {
        const items = options.filter((o) => o.category === c && (!q || o.name.toLowerCase().includes(q)));
        if (!items.length) return null;
        return (
          <div key={c} className="pb-3">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{c}</p>
            <div className="space-y-2">
              {items.map((o) => {
                const on = draft.serviceIds.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle(o.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${on ? "border-navy" : "border-border"}`}>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-navy">{o.name}</span>
                      <span className="block text-[12px] text-muted">{o.category}</span>
                    </span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={15} strokeWidth={3} />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Step 2: discount + social proof ---------------------------------------

function Step2({ draft, setD, total, after, saves }: { draft: UpsellGroup; setD: (p: Partial<UpsellGroup>) => void; total: number; after: number; saves: number }) {
  return (
    <div className="pb-6">
      <h1 className="pb-1 pt-2 text-[26px] font-bold tracking-tight text-navy">Discount</h1>
      <p className="pb-5 text-[14px] text-muted">Set the discount when any service in this group is added to a booking.</p>
      <div className="flex items-center justify-between pb-3">
        <span className="text-[15px] font-semibold text-navy">Discount</span>
        <button onClick={() => setD({ discountOn: !draft.discountOn })}><Toggle on={draft.discountOn} /></button>
      </div>
      {draft.discountOn && (
        <>
          <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
            {draft.discountUnit === "fixed" && <span className="text-[15px] text-muted">£</span>}
            <input type="number" inputMode="decimal" value={draft.discountAmount} onChange={(e) => setD({ discountAmount: e.target.value })} placeholder="0"
              className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
            {draft.discountUnit === "percent" && <span className="mr-2 text-[15px] text-muted">%</span>}
            <button onClick={() => setD({ discountUnit: draft.discountUnit === "fixed" ? "percent" : "fixed" })} className="text-[13px] font-medium text-navy">{draft.discountUnit === "fixed" ? "Use %" : "Use £"}</button>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
            <span><span className="block text-[11px] text-muted">Bundle total</span><span className="text-[16px] font-bold text-navy">£{after.toFixed(2)} <span className="text-[12px] font-normal text-muted line-through">£{total.toFixed(2)}</span></span></span>
            <span className="text-right"><span className="block text-[11px] text-muted">Client saves</span><span className="text-[16px] font-bold text-navy">£{saves.toFixed(2)}</span></span>
          </div>
          <p className="pt-2 text-[12px] text-muted">Applies to any service in this group when added to a booking.</p>
        </>
      )}
      <p className="pb-2 pt-6 text-[11px] font-semibold uppercase tracking-wider text-muted">Social proof</p>
      <div className="rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <span><span className="block text-[14px] font-medium text-navy">Show % who book this combo</span><span className="block text-[12px] text-muted">Pulls from your real booking data</span></span>
          <button onClick={() => setD({ socialProof: !draft.socialProof })}><Toggle on={draft.socialProof} /></button>
        </div>
        {draft.socialProof && <div className="mt-3 rounded-xl bg-canvas px-3 py-2.5 text-[12px] text-secondary">Preview: <span className="font-semibold">&ldquo;68% of clients add this&rdquo;</span></div>}
      </div>
    </div>
  );
}

// ---- Step 3: audience ------------------------------------------------------

function Step3({ draft, setD }: { draft: UpsellGroup; setD: (p: Partial<UpsellGroup>) => void }) {
  const toggle = (key: keyof UpsellAudience, opt: string) => {
    const cur = draft.audience[key];
    const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
    setD({ audience: { ...draft.audience, [key]: next } });
  };
  const clear = (key: keyof UpsellAudience) => setD({ audience: { ...draft.audience, [key]: [] } });

  return (
    <div className="pb-6">
      <h1 className="pb-1 pt-2 text-[26px] font-bold tracking-tight text-navy">Audience</h1>
      <p className="pb-1 text-[14px] text-muted">Narrow who sees this group at booking.</p>
      <p className="pb-5 text-[13px] text-muted">Pick one or more to narrow the audience.</p>
      {AUDIENCE.map(({ key, label, options }) => {
        const sel = draft.audience[key];
        return (
          <div key={key} className="pb-5">
            <p className="pb-2 text-[14px] font-medium text-secondary">{label}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => clear(key)} className={`rounded-full px-4 py-2 text-[13px] font-medium ${sel.length === 0 ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>Anyone</button>
              {options.map((o) => {
                const on = sel.includes(o);
                return <button key={o} onClick={() => toggle(key, o)} className={`rounded-full px-4 py-2 text-[13px] font-medium ${on ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>{o}</button>;
              })}
            </div>
          </div>
        );
      })}
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
