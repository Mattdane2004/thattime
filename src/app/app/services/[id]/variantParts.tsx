"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTeamStore } from "@/lib/store/teamStore";
import { businessLocations } from "@/lib/data/locations";
import { initialsOf } from "@/lib/data/team";
import type { VariantPrice, VariantWhen, OfferVariant } from "@/lib/data/offers";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const emptyPrice = (): VariantPrice => ({ mode: "add", unit: "fixed", amount: "" });
export const emptyWhen = (): VariantWhen => ({ staffIds: [], days: [], timeFrom: "09:00", timeTo: "17:00", allDayWhen: true, locationIds: [] });

export function clientPays(base: string, price: VariantPrice): number {
  const b = Number(base) || 0;
  const a = Number(price.amount) || 0;
  const delta = price.unit === "percent" ? (b * a) / 100 : a;
  return Math.max(0, Math.round(price.mode === "discount" ? b - delta : b + delta));
}

/** Compact price label for the variants list row. */
export function priceDisplay(v: OfferVariant, base: string): string {
  if (v.type === "duration") return `£${clientPays(base, v.price)}`;
  const sign = v.price.mode === "discount" ? "−" : "+";
  if (!v.price.amount) return "Same as base";
  return v.price.unit === "percent" ? `${sign}${v.price.amount}%` : `${sign}£${v.price.amount}`;
}

export function variantDetail(v: OfferVariant): string {
  switch (v.type) {
    case "duration": return `Duration · ${durLabel(v.durationMin ?? 0)}`;
    case "time": return `Time & date · ${(v.days && v.days.length ? v.days.join(", ") : "Any day")}`;
    case "staff": return `Staff · ${v.entityLabel ?? ""}`;
    case "location": return `Location · ${v.entityLabel ?? ""}`;
    case "role": return `Job role · ${v.entityLabel ?? ""}`;
    default: return "";
  }
}

export function durLabel(min: number): string {
  if (!min) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60); const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

// ---- Price adjustment (Add / Discount + £/% + Client pays) ------------------

export function PriceAdjust({ price, onChange, base }: { price: VariantPrice; onChange: (p: VariantPrice) => void; base: string }) {
  return (
    <div>
      <div className="mb-2 flex rounded-xl border border-border bg-canvas p-1">
        {(["add", "discount"] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => onChange({ ...price, mode })}
            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold capitalize ${price.mode === mode ? "bg-white text-navy shadow-card" : "text-secondary"}`}>
            {mode}
          </button>
        ))}
      </div>
      <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
        {price.unit === "fixed" && <span className="text-[15px] text-muted">£</span>}
        <input type="number" inputMode="decimal" value={price.amount} placeholder="0"
          onChange={(e) => onChange({ ...price, amount: e.target.value })}
          className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
        {price.unit === "percent" && <span className="mr-2 text-[15px] text-muted">%</span>}
        <button type="button" onClick={() => onChange({ ...price, unit: price.unit === "fixed" ? "percent" : "fixed" })}
          className="text-[13px] font-medium text-navy">
          {price.unit === "fixed" ? "Use %" : "Use £"}
        </button>
      </div>
      <p className="mt-1.5 text-[12px] text-muted">Client pays: <span className="font-semibold text-secondary">£{clientPays(base, price)}</span></p>
    </div>
  );
}

// ---- Day pills -------------------------------------------------------------

export function DayPills({ days, onChange }: { days: string[]; onChange: (d: string[]) => void }) {
  const toggle = (d: string) => onChange(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((d) => {
        const on = days.includes(d);
        return (
          <button key={d} type="button" onClick={() => toggle(d)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${on ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>{d}</button>
        );
      })}
    </div>
  );
}

// ---- "Only available when…" optional restrictions --------------------------

export function WhenBlock({ when, onChange }: { when: VariantWhen; onChange: (w: VariantWhen) => void }) {
  const [open, setOpen] = useState<null | "staff" | "days" | "locations">(null);
  const members = useTeamStore((s) => s.members).filter((m) => m.bookable);
  const set = (patch: Partial<VariantWhen>) => onChange({ ...when, ...patch });

  const staffN = when.staffIds.length;
  const daysN = when.days.length;
  const locN = when.locationIds.length;

  const Row = ({ id, label, summary }: { id: "staff" | "days" | "locations"; label: string; summary: string }) => (
    <button type="button" onClick={() => setOpen(open === id ? null : id)}
      className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left">
      <span className="text-[14px] font-medium text-navy">{label}</span>
      <span className="flex items-center gap-2 text-[13px] text-muted">{summary}<ChevronDown size={16} className={`transition-transform ${open === id ? "rotate-180" : ""}`} /></span>
    </button>
  );

  return (
    <div>
      <div className="mb-2 text-[13px] font-medium text-secondary">Only available when… <span className="text-muted">(optional)</span></div>
      <div className="space-y-2">
        <Row id="staff" label="Specific staff" summary={staffN ? `${staffN} selected` : "Any"} />
        {open === "staff" && (
          <div className="space-y-1.5 rounded-xl border border-border p-2">
            {members.map((m) => {
              const on = when.staffIds.includes(m.id);
              return (
                <button key={m.id} type="button" onClick={() => set({ staffIds: on ? when.staffIds.filter((x) => x !== m.id) : [...when.staffIds, m.id] })}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold ${m.avatarColor}`}>{initialsOf(m.name)}</span>
                  <span className="flex-1 text-[14px] text-navy">{m.name}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded ${on ? "bg-navy text-white" : "border border-border"}`}>{on && <Check size={12} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        )}

        <Row id="days" label="Specific days or times" summary={daysN ? `${daysN} day${daysN > 1 ? "s" : ""}` : "Any"} />
        {open === "days" && (
          <div className="space-y-3 rounded-xl border border-border p-3">
            <DayPills days={when.days} onChange={(days) => set({ days })} />
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-secondary">All day</span>
              <button type="button" onClick={() => set({ allDayWhen: !when.allDayWhen })}
                className={`relative h-6 w-10 rounded-full ${when.allDayWhen ? "bg-navy" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${when.allDayWhen ? "left-[1.125rem]" : "left-0.5"}`} />
              </button>
            </div>
            {!when.allDayWhen && (
              <div className="grid grid-cols-2 gap-2">
                <input type="time" value={when.timeFrom} onChange={(e) => set({ timeFrom: e.target.value })} className="h-11 rounded-xl border border-border bg-canvas px-3 text-[14px] text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy" />
                <input type="time" value={when.timeTo} onChange={(e) => set({ timeTo: e.target.value })} className="h-11 rounded-xl border border-border bg-canvas px-3 text-[14px] text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy" />
              </div>
            )}
          </div>
        )}

        <Row id="locations" label="Specific locations" summary={locN ? `${locN} selected` : "Any"} />
        {open === "locations" && (
          <div className="space-y-1.5 rounded-xl border border-border p-2">
            {businessLocations.map((l) => {
              const on = when.locationIds.includes(l.id);
              return (
                <button key={l.id} type="button" onClick={() => set({ locationIds: on ? when.locationIds.filter((x) => x !== l.id) : [...when.locationIds, l.id] })}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left">
                  <span className="flex-1 text-[14px] text-navy">{l.name.replace(/^Salon\s+/, "")}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded ${on ? "bg-navy text-white" : "border border-border"}`}>{on && <Check size={12} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
