"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Layers, Clock, Users, CalendarClock, MapPin, Check, Trash2, Plus } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { type OfferVariant, type VariantType } from "@/lib/data/offers";
import { useTeamStore } from "@/lib/store/teamStore";
import { businessLocations } from "@/lib/data/locations";
import { initialsOf } from "@/lib/data/team";
import { nextId } from "@/lib/ids";

// Variants module — a proper setup flow (not a tick list): empty state → pick a
// variant type → configure it → list. Each variant persists to offer.variants.

const TYPES: { key: VariantType; label: string; desc: string; icon: typeof Clock }[] = [
  { key: "duration", label: "Duration", desc: "Charge more for longer or specialist versions", icon: Clock },
  { key: "staff", label: "Staff", desc: "Different price depending on who delivers it", icon: Users },
  { key: "time", label: "Time & day", desc: "Peak / off-peak pricing", icon: CalendarClock },
  { key: "location", label: "Location", desc: "Different price by location", icon: MapPin },
];
const typeMeta = (t: VariantType) => TYPES.find((x) => x.key === t)!;

type View = { mode: "list" } | { mode: "pick" } | { mode: "configure"; type: VariantType };

export default function VariantsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [view, setView] = useState<View>({ mode: "list" });

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Variants" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const variants = offer.variants ?? [];
  const addVariant = (v: OfferVariant) => {
    updateOffer(offer.id, { variants: [...variants, v] });
    setView({ mode: "list" });
  };
  const removeVariant = (id: string) => updateOffer(offer.id, { variants: variants.filter((v) => v.id !== id) });

  if (view.mode === "pick") {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="New variant" onBack={() => setView({ mode: "list" })} />
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
          <p className="px-1 pb-3 text-[13px] text-muted">What kind of variant is this?</p>
          <div className="space-y-2.5">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setView({ mode: "configure", type: t.key })}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-border p-4 text-left hover:bg-canvas"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas">
                  <t.icon size={18} className="text-navy" strokeWidth={1.75} />
                </span>
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

  if (view.mode === "configure") {
    return (
      <ConfigureVariant
        type={view.type}
        basePrice={offer.price}
        onBack={() => setView({ mode: "pick" })}
        onSave={addVariant}
      />
    );
  }

  // list / empty
  return (
    <div className="flex h-full flex-col bg-surface">
      <Header
        title="Variants"
        onBack={() => router.push(`/app/services/${offer.id}`)}
        action={
          variants.length > 0 ? (
            <button onClick={() => setView({ mode: "pick" })} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white">
              <Plus size={15} strokeWidth={1.75} />Add
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {variants.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <Layers size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No variants yet</div>
            <div className="mt-1 text-[13px] text-muted">Start with a type to add pricing variants.</div>
            <button onClick={() => setView({ mode: "pick" })} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white">
              <Plus size={16} strokeWidth={1.75} />Start with a type
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {variants.map((v) => {
              const meta = typeMeta(v.type);
              return (
                <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                    <meta.icon size={16} className="text-navy" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{v.label}</span>
                    <span className="block text-[12px] text-muted">
                      {meta.label}
                      {v.priceDelta && v.priceDelta !== "+0" ? ` · ${v.priceDelta.startsWith("-") ? "−£" + v.priceDelta.slice(1) : "+£" + v.priceDelta.replace("+", "")}` : " · same price"}
                      {v.durationDelta ? ` · ${v.durationDelta > 0 ? "+" : ""}${v.durationDelta}m` : ""}
                    </span>
                  </span>
                  <button onClick={() => removeVariant(v.id)} aria-label="Remove variant" className="shrink-0 text-muted hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Configure step --------------------------------------------------------

function ConfigureVariant({
  type,
  basePrice,
  onBack,
  onSave,
}: {
  type: VariantType;
  basePrice: string;
  onBack: () => void;
  onSave: (v: OfferVariant) => void;
}) {
  const members = useTeamStore((s) => s.members);
  const [label, setLabel] = useState("");
  const [sign, setSign] = useState<"+" | "-">("+");
  const [amount, setAmount] = useState("");
  const [durationDelta, setDurationDelta] = useState("");
  const meta = typeMeta(type);

  // staff / location variants derive their label from a picked entity.
  const needsPick = type === "staff" || type === "location";
  const pickOptions =
    type === "staff"
      ? members.filter((m) => m.bookable).map((m) => ({ id: m.id, name: m.name, sub: m.role, initials: initialsOf(m.name), color: m.avatarColor }))
      : type === "location"
      ? businessLocations.map((l) => ({ id: l.id, name: l.name.replace(/^Salon\s+/, ""), sub: l.address, initials: "", color: "" }))
      : [];

  const canSave = label.trim().length > 0;
  const save = () =>
    canSave &&
    onSave({
      id: nextId("var"),
      type,
      label: label.trim(),
      priceDelta: `${sign}${amount || "0"}`,
      durationDelta: type === "duration" && durationDelta ? Number(durationDelta) : undefined,
    });

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title={`${meta.label} variant`} onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-4">
        {needsPick ? (
          <div>
            <FieldLabel>{type === "staff" ? "Who delivers it" : "Which location"}</FieldLabel>
            <div className="space-y-2">
              {pickOptions.map((o) => {
                const on = label === o.name;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setLabel(o.name)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${on ? "border-navy" : "border-border"}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${o.color || "bg-canvas text-navy"}`}>
                      {o.initials || <MapPin size={15} className="text-navy" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-navy">{o.name}</span>
                      <span className="block text-[12px] text-muted">{o.sub}</span>
                    </span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${on ? "bg-navy text-white" : "border-2 border-border"}`}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <label className="block">
            <FieldLabel>Variant name</FieldLabel>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === "duration" ? "e.g. Long hair" : "e.g. Weekend evenings"}
              className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </label>
        )}

        <div>
          <FieldLabel>Price adjustment</FieldLabel>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-canvas p-1">
              {(["+", "-"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSign(s)}
                  className={`h-10 w-11 rounded-lg text-[18px] font-bold ${sign === s ? "bg-navy text-white" : "text-secondary"}`}
                >
                  {s === "+" ? "＋" : "－"}
                </button>
              ))}
            </div>
            <div className="flex flex-1 items-center rounded-xl border border-border bg-canvas px-4">
              <span className="text-[15px] text-muted">£</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
              />
            </div>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            Base price £{basePrice || "0"} → <span className="font-semibold text-secondary">£{adjustedPrice(basePrice, sign, amount)}</span>
          </p>
        </div>

        {type === "duration" && (
          <label className="block">
            <FieldLabel>Duration change (minutes)</FieldLabel>
            <input
              type="number"
              inputMode="numeric"
              value={durationDelta}
              onChange={(e) => setDurationDelta(e.target.value)}
              placeholder="e.g. 15"
              className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </label>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button
          onClick={save}
          disabled={!canSave}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          Add variant
        </button>
      </div>
    </div>
  );
}

function adjustedPrice(base: string, sign: "+" | "-", amount: string): string {
  const b = Number(base) || 0;
  const a = Number(amount) || 0;
  return String(Math.max(0, sign === "+" ? b + a : b - a));
}

// ---- shared bits -----------------------------------------------------------

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}
