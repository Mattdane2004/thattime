"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Layers, Clock, CalendarClock, Users, MapPin, Briefcase } from "lucide-react";
import { Sheet, Toggle } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import { useTeamStore } from "@/lib/store/teamStore";
import { businessLocations } from "@/lib/data/locations";
import { initialsOf } from "@/lib/data/team";
import { nextId } from "@/lib/ids";
import type { OfferVariant, VariantType, VariantPrice, VariantWhen } from "@/lib/data/offers";
import { PriceAdjust, WhenBlock, DayPills, clientPays, priceDisplay, variantDetail, durLabel, emptyPrice, emptyWhen } from "../variantParts";

const TYPES: { key: VariantType; label: string; desc: string; icon: typeof Clock }[] = [
  { key: "duration", label: "Duration variant", desc: "Shorter or longer versions", icon: Clock },
  { key: "time", label: "Time of day", desc: "Peak hours, weekends, holidays", icon: CalendarClock },
  { key: "role", label: "Job role", desc: "Different prices per role", icon: Briefcase },
  { key: "staff", label: "Specific employee", desc: "Different prices per team member", icon: Users },
  { key: "location", label: "Location", desc: "Different prices per salon", icon: MapPin },
];
const typeMeta = (t: VariantType) => TYPES.find((x) => x.key === t)!;

const PILLS: { key: "all" | VariantType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "duration", label: "Duration" },
  { key: "time", label: "Time & date" },
  { key: "staff", label: "Staff" },
  { key: "role", label: "Role" },
  { key: "location", label: "Location" },
];

type View =
  | { mode: "list" }
  | { mode: "pick" }
  | { mode: "duration" }
  | { mode: "time" }
  | { mode: "entity"; type: "staff" | "location" | "role" };

export default function VariantsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [view, setView] = useState<View>({ mode: "list" });
  const [query, setQuery] = useState("");
  const [pill, setPill] = useState<"all" | VariantType>("all");

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Variants" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const variants = offer.variants ?? [];
  const setVariants = (next: OfferVariant[]) => updateOffer(offer.id, { variants: next });
  const addMany = (vs: OfferVariant[]) => { setVariants([...variants, ...vs]); setView({ mode: "list" }); };
  const remove = (id: string) => setVariants(variants.filter((v) => v.id !== id));
  /** Upsert a per-entity variant (staff/location/role); empty amount removes it. */
  const upsertEntity = (type: VariantType, entityId: string, build: () => OfferVariant) => {
    const without = variants.filter((v) => !(v.type === type && v.entityId === entityId));
    const v = build();
    setVariants(v.price.amount ? [...without, v] : without);
  };

  // ---- Type picker (also the empty state) ----
  if (view.mode === "pick" || (variants.length === 0 && view.mode === "list")) {
    const isEmpty = variants.length === 0;
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Variants" onBack={() => (isEmpty ? router.push(`/app/services/${offer.id}`) : setView({ mode: "list" }))} sub={offer.name} />
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {isEmpty && (
            <div className="flex flex-col items-center px-6 pb-2 pt-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><Layers size={28} className="text-muted" strokeWidth={1.5} /></span>
              <div className="mt-4 text-[18px] font-bold text-navy">No variants yet</div>
              <div className="mt-1 text-[13px] text-muted">Charge differently for the same service based on staff, timing, duration, or location.</div>
            </div>
          )}
          <p className="px-1 pb-3 pt-6 text-[12px] font-semibold uppercase tracking-wider text-muted">Start with a type</p>
          <div className="space-y-2.5">
            {TYPES.map((t) => (
              <button key={t.key} onClick={() => setView({ mode: t.key === "staff" || t.key === "location" || t.key === "role" ? "entity" : t.key, type: t.key } as View)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-border p-4 text-left hover:bg-canvas">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas"><t.icon size={18} className="text-navy" strokeWidth={1.75} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-navy">{t.label}</span>
                  <span className="block text-[12px] text-muted">{t.desc}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view.mode === "duration") return <DurationSetup base={offer.price} onBack={() => setView({ mode: "pick" })} onSave={addMany} />;
  if (view.mode === "time") return <TimeSetup base={offer.price} onBack={() => setView({ mode: "pick" })} onSave={(v) => addMany([v])} />;
  if (view.mode === "entity") return <EntityList type={view.type} base={offer.price} variants={variants} onBack={() => setView({ mode: "pick" })} onUpsert={upsertEntity} onDone={() => setView({ mode: "list" })} />;

  // ---- List ----
  const counts = (k: "all" | VariantType) => (k === "all" ? variants.length : variants.filter((v) => v.type === k).length);
  const visible = variants.filter((v) => (pill === "all" || v.type === pill) && v.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Variants" onBack={() => router.push(`/app/services/${offer.id}`)} sub={offer.name} />
      <div className="px-4 pb-2 pt-1">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search variants"
            className="h-11 w-full rounded-xl border border-border bg-canvas pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
        </div>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {PILLS.map((p) => (
            <button key={p.key} onClick={() => setPill(p.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${pill === p.key ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>
              {p.label}<span className={`rounded-full px-1.5 text-[11px] ${pill === p.key ? "bg-white/20" : "bg-surface"}`}>{counts(p.key)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4 pt-1">
        {visible.map((v) => {
          const meta = typeMeta(v.type);
          return (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><meta.icon size={16} className="text-navy" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-navy">{v.name || meta.label}</span>
                <span className="block truncate text-[12px] text-muted">{variantDetail(v)}</span>
              </span>
              <span className="shrink-0 text-[14px] font-semibold text-navy">{priceDisplay(v, offer.price)}</span>
              <button onClick={() => remove(v.id)} aria-label="Remove variant" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
            </div>
          );
        })}
        {visible.length === 0 && <p className="pt-10 text-center text-[13px] text-muted">No variants match.</p>}
      </div>
      <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">Back</button>
        <button onClick={() => setView({ mode: "pick" })} className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white">Add</button>
      </div>
    </div>
  );
}

// ---- Duration setup (multi-tier) -------------------------------------------

interface Tier { name: string; durationMin: string; price: VariantPrice; }

function DurationSetup({ base, onBack, onSave }: { base: string; onBack: () => void; onSave: (vs: OfferVariant[]) => void }) {
  const [tiers, setTiers] = useState<Tier[]>([{ name: "", durationMin: "60", price: emptyPrice() }]);
  const [when, setWhen] = useState<VariantWhen>(emptyWhen());
  const setTier = (i: number, patch: Partial<Tier>) => setTiers(tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  const canSave = tiers.every((t) => t.durationMin);

  const save = () => canSave && onSave(tiers.map((t) => ({
    id: nextId("var"), type: "duration", name: t.name.trim() || `${durLabel(Number(t.durationMin))} version`,
    price: t.price, durationMin: Number(t.durationMin) || 0, when,
  })));

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Duration" onBack={onBack} sub="Duration tiers" />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <p className="px-1 text-[12px] font-semibold uppercase tracking-wider text-muted">Duration tiers</p>
        {tiers.map((t, i) => (
          <div key={i} className="rounded-2xl border border-border bg-canvas p-4">
            <div className="flex items-center justify-between pb-3">
              <input value={t.name} onChange={(e) => setTier(i, { name: e.target.value })} placeholder={`+ Tier ${i + 1} name`}
                className="flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none placeholder:font-medium placeholder:text-muted" />
              {tiers.length > 1 && <button onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))} aria-label="Remove tier" className="text-muted hover:text-danger"><Trash2 size={15} /></button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-baseline rounded-xl border border-border bg-white px-3 py-2.5">
                <input type="number" inputMode="numeric" value={t.durationMin} onChange={(e) => setTier(i, { durationMin: e.target.value })}
                  className="w-full bg-transparent text-[18px] font-semibold text-navy outline-none" />
                <span className="text-[12px] text-muted">min</span>
              </div>
              <div className="rounded-xl border border-border bg-white px-3 py-1.5">
                <PriceAdjustCompact price={t.price} onChange={(p) => setTier(i, { price: p })} base={base} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setTiers([...tiers, { name: "", durationMin: "60", price: emptyPrice() }])}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-[14px] font-medium text-navy">
          <Plus size={16} /> Add another tier
        </button>
        <WhenBlock when={when} onChange={setWhen} />
      </div>
      <SaveBar disabled={!canSave} onSave={save} />
    </div>
  );
}

// compact price box used inside a duration tier (£/% + amount only)
function PriceAdjustCompact({ price, onChange, base }: { price: VariantPrice; onChange: (p: VariantPrice) => void; base: string }) {
  return (
    <div>
      <div className="flex items-center">
        {price.unit === "fixed" && <span className="text-[13px] text-muted">£</span>}
        <input type="number" inputMode="decimal" value={price.amount} placeholder="0" onChange={(e) => onChange({ ...price, amount: e.target.value })}
          className="w-full bg-transparent px-1 text-[18px] font-semibold text-navy outline-none placeholder:font-normal" />
        <button type="button" onClick={() => onChange({ ...price, unit: price.unit === "fixed" ? "percent" : "fixed" })} className="text-[12px] font-medium text-navy">{price.unit === "fixed" ? "£" : "%"}</button>
      </div>
      <span className="text-[10px] text-muted">Pays £{clientPays(base, price)}</span>
    </div>
  );
}

// ---- Time & day setup ------------------------------------------------------

function TimeSetup({ base, onBack, onSave }: { base: string; onBack: () => void; onSave: (v: OfferVariant) => void }) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [allDay, setAllDay] = useState(true);
  const [timeFrom, setTimeFrom] = useState("09:00");
  const [timeTo, setTimeTo] = useState("17:00");
  const [price, setPrice] = useState<VariantPrice>(emptyPrice());
  const [when, setWhen] = useState<VariantWhen>(emptyWhen());
  const canSave = days.length > 0 && Boolean(price.amount);

  const save = () => canSave && onSave({ id: nextId("var"), type: "time", name: name.trim() || "Time rule", price, days, allDay, timeFrom, timeTo, when });

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="New time rule" onBack={onBack} sub="" />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-3">
        <label className="block">
          <FieldLabel>Name</FieldLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend rate"
            className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
        </label>
        <div>
          <FieldLabel>Days</FieldLabel>
          <DayPills days={days} onChange={setDays} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <FieldLabel>Time of day</FieldLabel>
            <button type="button" onClick={() => setAllDay(!allDay)} className="pb-2 text-[13px] font-medium text-navy">{allDay ? "Set hours" : "All day"}</button>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="h-12 rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none" />
              <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="h-12 rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none" />
            </div>
          )}
        </div>
        <div>
          <FieldLabel>Price adjustment</FieldLabel>
          <PriceAdjust price={price} onChange={setPrice} base={base} />
        </div>
        <WhenBlock when={when} onChange={setWhen} />
      </div>
      <SaveBar disabled={!canSave} onSave={save} />
    </div>
  );
}

// ---- Entity list (staff / location / role) + edit sheet --------------------

function EntityList({ type, base, variants, onBack, onUpsert, onDone }: {
  type: "staff" | "location" | "role"; base: string; variants: OfferVariant[];
  onBack: () => void; onUpsert: (type: VariantType, entityId: string, build: () => OfferVariant) => void; onDone: () => void;
}) {
  const members = useTeamStore((s) => s.members).filter((m) => m.bookable);
  const [editing, setEditing] = useState<{ id: string; label: string; sub: string } | null>(null);

  const entities: { id: string; label: string; sub: string }[] =
    type === "staff" ? members.map((m) => ({ id: m.id, label: m.name, sub: m.role }))
    : type === "location" ? businessLocations.map((l) => ({ id: l.id, label: l.name.replace(/^Salon\s+/, ""), sub: l.address }))
    : Array.from(new Set(members.map((m) => m.role))).map((r) => ({ id: r, label: r, sub: "Job role" }));

  const titleMap = { staff: "Staff pricing", location: "Location pricing", role: "Job role pricing" };
  const existing = (id: string) => variants.find((v) => v.type === type && v.entityId === id);

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title={titleMap[type]} onBack={onBack} sub="Tap to set custom pricing for this service." />
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6 pt-2">
        {entities.map((e) => {
          const v = existing(e.id);
          return (
            <button key={e.id} onClick={() => setEditing(e)} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left">
              {type === "staff" ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-semibold text-navy">{initialsOf(e.label)}</span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">{type === "location" ? <MapPin size={16} className="text-navy" /> : <Briefcase size={16} className="text-navy" />}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-navy">{e.label}</span>
                <span className="block text-[12px] text-muted">{e.sub}</span>
              </span>
              <span className={`shrink-0 text-[13px] font-medium ${v ? "text-navy" : "text-muted"}`}>{v ? priceDisplay(v, base) : "Same as base"}</span>
            </button>
          );
        })}
      </div>
      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={onDone} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>
      </div>

      <EntitySheet
        open={Boolean(editing)} entity={editing} base={base} existing={editing ? existing(editing.id) : undefined}
        onClose={() => setEditing(null)}
        onSave={(price, durationOverride, durationMin, when) => {
          if (!editing) return;
          const e = editing;
          onUpsert(type, e.id, () => ({ id: existing(e.id)?.id ?? nextId("var"), type, name: e.label, entityId: e.id, entityLabel: e.label, entitySub: e.sub, price, durationOverride, durationMin, when }));
          setEditing(null);
        }}
      />
    </div>
  );
}

function EntitySheet({ open, entity, base, existing, onClose, onSave }: {
  open: boolean; entity: { id: string; label: string; sub: string } | null; base: string; existing?: OfferVariant;
  onClose: () => void; onSave: (price: VariantPrice, durationOverride: boolean, durationMin: number | undefined, when: VariantWhen) => void;
}) {
  const [price, setPrice] = useState<VariantPrice>(existing?.price ?? emptyPrice());
  const [durOverride, setDurOverride] = useState(existing?.durationOverride ?? false);
  const [durMin, setDurMin] = useState(String(existing?.durationMin ?? ""));
  const [when, setWhen] = useState<VariantWhen>(existing?.when ?? emptyWhen());

  // re-seed when a different entity opens
  const [seenId, setSeenId] = useState<string | null>(null);
  if (open && entity && seenId !== entity.id) {
    setSeenId(entity.id);
    setPrice(existing?.price ?? emptyPrice());
    setDurOverride(existing?.durationOverride ?? false);
    setDurMin(String(existing?.durationMin ?? ""));
    setWhen(existing?.when ?? emptyWhen());
  }
  if (!open && seenId) setSeenId(null);

  return (
    <Sheet open={open} onClose={onClose} title={entity?.label ?? ""} sub={entity?.sub}
      footer={<button type="button" onClick={() => onSave(price, durOverride, durOverride ? Number(durMin) || undefined : undefined, when)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save</button>}>
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>Price</FieldLabel>
          <PriceAdjust price={price} onChange={setPrice} base={base} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-navy">Duration</span>
            <button type="button" onClick={() => setDurOverride(!durOverride)}><Toggle on={durOverride} /></button>
          </div>
          {durOverride ? (
            <div className="mt-2 flex items-baseline rounded-xl border border-border bg-canvas px-4 py-3">
              <input type="number" inputMode="numeric" value={durMin} onChange={(e) => setDurMin(e.target.value)} placeholder="60" className="w-full bg-transparent text-[16px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
              <span className="text-[12px] text-muted">min</span>
            </div>
          ) : <p className="mt-1 text-[12px] text-muted">Same as base duration</p>}
        </div>
        <WhenBlock when={when} onChange={setWhen} />
      </div>
    </Sheet>
  );
}

// ---- shared chrome ---------------------------------------------------------

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

function SaveBar({ disabled, onSave }: { disabled: boolean; onSave: () => void }) {
  return (
    <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
      <button onClick={onSave} disabled={disabled} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted">Save</button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}
