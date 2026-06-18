"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Car, Video, Check, Search, SlidersHorizontal, Globe, Store, Minus, Plus, Link2, MapPin } from "lucide-react";
import { Sheet, Toggle, FieldLabel, fieldInput } from "@/components/ui";
import { businessLocations } from "@/lib/data/locations";
import type { MobileSettings, RemoteSettings, RemotePlatform } from "@/lib/store/wizardStore";

// Shared "where is it offered?" editor used by both the creation wizard (on the
// draft) and the dashboard location route (on the offer). Three multi-select
// mode cards; in-salon / mobile / remote each open a settings sheet.

const shortName = (name: string) => name.replace(/^Salon\s+/, "");

const PLATFORMS: { key: RemotePlatform; label: string; desc: string }[] = [
  { key: "zoom", label: "Zoom", desc: "Zoom meeting link" },
  { key: "google_meet", label: "Google Meet", desc: "Google Meet link" },
  { key: "teams", label: "Microsoft Teams", desc: "Teams meeting link" },
  { key: "phone", label: "Phone call", desc: "You call the client" },
  { key: "custom", label: "Custom link", desc: "Any other video link" },
];
const platformLabel = (k: RemotePlatform) => PLATFORMS.find((p) => p.key === k)?.label ?? "Remote";

export interface LocationValue {
  locationModes: { inSalon: boolean; mobile: boolean; remote: boolean };
  locationIds: string[];
  mobile: MobileSettings;
  remote: RemoteSettings;
}
export type LocationPatch = Partial<LocationValue>;

export function locationComplete(v: LocationValue): boolean {
  return v.locationModes.inSalon || v.locationModes.mobile || v.locationModes.remote;
}

export function LocationEditor({
  value,
  onChange,
  allowMobile = true,
  mobileSub = "Stylist travels to client",
  mobileUnavailableText,
}: {
  value: LocationValue;
  onChange: (patch: LocationPatch) => void;
  allowMobile?: boolean;
  mobileSub?: string;
  mobileUnavailableText?: string;
}) {
  const [inSalonSheet, setInSalonSheet] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [remoteSheet, setRemoteSheet] = useState(false);

  const modes = value.locationModes;
  const toggleMode = (key: keyof typeof modes) => onChange({ locationModes: { ...modes, [key]: !modes[key] } });

  const total = businessLocations.length;
  const ids = value.locationIds;
  const allLocations = ids.length === 0 || ids.length === total;
  const inSalonSummary = allLocations
    ? "All locations"
    : `${businessLocations.filter((l) => ids.includes(l.id)).map((l) => shortName(l.name)).join(" · ")} · ${ids.length} location${ids.length > 1 ? "s" : ""}`;

  const m = value.mobile;
  const feePart = m.travelFee ? `£${m.feeAmount || "0"} ${m.feeType === "flat" ? "flat fee" : "per mile"}` : "No travel fee";
  const mobileSummary = `${m.radiusMiles} miles · ${feePart} · ${m.noticeValue}${m.noticeUnit === "Hours" ? "h" : "d"} notice`;

  const r = value.remote;
  const remoteSummary = r.link ? `${platformLabel(r.platform)} · link set` : `${platformLabel(r.platform)} · add a link`;

  return (
    <>
      <div className="space-y-3 pb-6">
        <ModeCard icon={<Home size={18} className="text-navy" strokeWidth={1.75} />} title="In-salon" sub="At a fixed location"
          on={modes.inSalon} onToggle={() => toggleMode("inSalon")} summary={inSalonSummary} onEdit={() => setInSalonSheet(true)} />
        {allowMobile && (
          <ModeCard icon={<Car size={18} className="text-navy" strokeWidth={1.75} />} title="Mobile" sub={mobileSub}
            on={modes.mobile} onToggle={() => toggleMode("mobile")} summary={mobileSummary} onEdit={() => setMobileSheet(true)} />
        )}
        <ModeCard icon={<Video size={18} className="text-navy" strokeWidth={1.75} />} title="Remote" sub="Video call or online"
          on={modes.remote} onToggle={() => toggleMode("remote")} summary={remoteSummary} onEdit={() => setRemoteSheet(true)} />
        {!allowMobile && mobileUnavailableText && (
          <p className="px-0.5 text-[12px] leading-snug text-muted">{mobileUnavailableText}</p>
        )}
      </div>

      <InSalonSheet open={inSalonSheet} onClose={() => setInSalonSheet(false)} ids={value.locationIds} onChange={(locationIds) => onChange({ locationIds })} />
      <MobileSheet open={mobileSheet} onClose={() => setMobileSheet(false)} mobile={value.mobile} onChange={(mobile) => onChange({ mobile })} />
      <RemoteSheet open={remoteSheet} onClose={() => setRemoteSheet(false)} remote={value.remote} onChange={(remote) => onChange({ remote })} />
    </>
  );
}

// ---- Mode card -------------------------------------------------------------

function ModeCard({ icon, title, sub, on, onToggle, summary, onEdit }: {
  icon: React.ReactNode; title: string; sub: string; on: boolean; onToggle: () => void; summary?: string; onEdit?: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${on ? "border-navy" : "border-border"}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3.5 p-4 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-navy">{title}</span>
          <span className="block text-[13px] text-muted">{sub}</span>
        </span>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${on ? "bg-navy text-white" : "border-2 border-border"}`}>
          {on && <Check size={14} strokeWidth={3} />}
        </span>
      </button>
      {on && summary && onEdit && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-canvas/50 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-[13px] text-secondary">{summary}</span>
          <button type="button" onClick={onEdit} className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-navy shadow-[0_1px_3px_rgba(8,7,6,0.08)]">
            Edit settings
          </button>
        </div>
      )}
    </div>
  );
}

// ---- In-salon locations sheet ----------------------------------------------

function InSalonSheet({ open, onClose, ids, onChange }: { open: boolean; onClose: () => void; ids: string[]; onChange: (ids: string[]) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const total = businessLocations.length;
  const allOn = ids.length === 0 || ids.length === total;
  const checked = (id: string) => allOn || ids.includes(id);
  const setAll = () => onChange([]);
  const toggleOne = (id: string) => {
    const base = allOn ? businessLocations.map((l) => l.id) : ids;
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    onChange(next.length === total ? [] : next);
  };

  const q = query.trim().toLowerCase();
  const visible = businessLocations.filter((l) => {
    if (selectedOnly && !checked(l.id)) return false;
    return !q || l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
  });

  return (
    <Sheet open={open} onClose={onClose} title="In-salon locations"
      footer={<button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save settings</button>}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search locations…"
              className="h-11 w-full rounded-xl border border-border bg-canvas pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
          </div>
          <button type="button" aria-label="Show selected only" aria-pressed={selectedOnly} onClick={() => setSelectedOnly((v) => !v)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selectedOnly ? "bg-navy text-white" : "bg-canvas text-navy"}`}>
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {(!selectedOnly || allOn) && (
          <button type="button" onClick={setAll}
            className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ${allOn ? "bg-navy text-white" : "border border-border bg-canvas text-navy"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${allOn ? "bg-white/15" : "bg-white"}`}><Globe size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">All locations</span>
              <span className={`block text-[12px] ${allOn ? "text-white/70" : "text-muted"}`}>Available everywhere</span>
            </span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${allOn ? "bg-white text-navy" : "border-2 border-border"}`}>{allOn && <Check size={14} strokeWidth={3} />}</span>
          </button>
        )}

        <div className="flex flex-col gap-2">
          {visible.map((loc) => {
            const on = checked(loc.id);
            return (
              <button key={loc.id} type="button" onClick={() => toggleOne(loc.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${on ? "border-navy bg-canvas" : "border-border bg-canvas"}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white"><Store size={17} className="text-navy" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-navy">{loc.name}</span>
                  <span className="block text-[12px] text-muted">{loc.address}</span>
                </span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={14} strokeWidth={3} />}</span>
              </button>
            );
          })}
          {visible.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No locations match.</p>}
        </div>

        <button type="button" onClick={() => router.push("/app/setup")} className="py-1 text-center text-[13px] font-medium text-navy underline">
          Don&apos;t see a location? Configure now
        </button>
      </div>
    </Sheet>
  );
}

// ---- Mobile settings sheet — map + radius + travel fee ----------------------

function MobileSheet({ open, onClose, mobile, onChange }: { open: boolean; onClose: () => void; mobile: MobileSettings; onChange: (m: MobileSettings) => void }) {
  const m = mobile;
  const set = (patch: Partial<MobileSettings>) => onChange({ ...m, ...patch });
  const stepNotice = (delta: number) => set({ noticeValue: Math.max(1, m.noticeValue + delta) });

  return (
    <Sheet open={open} onClose={onClose} title="Mobile settings" sub="Where you'll travel and what you charge."
      footer={<button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save settings</button>}>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-canvas p-4">
          <div className="flex items-baseline justify-between pb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Travel radius</span>
            <span className="text-[15px] font-semibold text-navy">{m.radiusMiles} miles</span>
          </div>
          <MapRadius miles={m.radiusMiles} />
          <input type="range" min={1} max={50} value={m.radiusMiles} onChange={(e) => set({ radiusMiles: Number(e.target.value) })} aria-label="Travel radius in miles" className="w-full accent-navy" />
          <div className="flex justify-between pt-1 text-[11px] text-muted"><span>1 mile</span><span>50 miles</span></div>
        </div>

        <div className="rounded-2xl border border-border bg-canvas p-4">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Travel fee</span>
            <button type="button" onClick={() => set({ travelFee: !m.travelFee })}><Toggle on={m.travelFee} /></button>
          </div>
          {m.travelFee && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {([{ v: "flat", t: "Flat rate", s: "Per booking" }, { v: "per_mile", t: "Per mile", s: "By distance" }] as const).map((o) => {
                  const on = m.feeType === o.v;
                  return (
                    <button key={o.v} type="button" onClick={() => set({ feeType: o.v })} className={`rounded-xl border-2 px-4 py-3 text-left ${on ? "border-navy bg-white" : "border-border bg-white"}`}>
                      <span className="block text-[14px] font-semibold text-navy">{o.t}</span>
                      <span className="block text-[12px] text-muted">{o.s}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center rounded-xl border border-border bg-white px-4">
                <span className="text-[15px] text-muted">£</span>
                <input type="number" inputMode="decimal" value={m.feeAmount} onChange={(e) => set({ feeAmount: e.target.value })} placeholder="15"
                  className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
                <span className="text-[13px] text-muted">{m.feeType === "flat" ? "per booking" : "per mile"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-canvas p-4">
          <p className="pb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Minimum booking notice</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white px-2 py-1.5">
              <button onClick={() => stepNotice(-1)} aria-label="Less" className="flex h-8 w-8 items-center justify-center rounded-lg text-navy"><Minus size={16} /></button>
              <span className="w-5 text-center text-[15px] font-semibold text-navy">{m.noticeValue}</span>
              <button onClick={() => stepNotice(1)} aria-label="More" className="flex h-8 w-8 items-center justify-center rounded-lg text-navy"><Plus size={16} /></button>
            </div>
            <div className="flex flex-1 rounded-xl bg-white p-1">
              {(["Days", "Hours"] as const).map((u) => {
                const on = m.noticeUnit === u;
                return <button key={u} type="button" onClick={() => set({ noticeUnit: u })} className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${on ? "bg-navy text-white" : "text-secondary"}`}>{u}</button>;
              })}
            </div>
          </div>
          <p className="pt-3 text-[12px] text-muted">Clients must book at least <span className="font-semibold text-secondary">{m.noticeValue} {m.noticeUnit.toLowerCase()}</span> in advance</p>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Remote settings sheet — platform + link -------------------------------

function RemoteSheet({ open, onClose, remote, onChange }: { open: boolean; onClose: () => void; remote: RemoteSettings; onChange: (r: RemoteSettings) => void }) {
  const r = remote;
  const set = (patch: Partial<RemoteSettings>) => onChange({ ...r, ...patch });
  const needsLink = r.platform !== "phone";

  return (
    <Sheet open={open} onClose={onClose} title="Remote settings" sub="Choose where remote sessions take place."
      footer={<button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save settings</button>}>
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Platform</FieldLabel>
          <div className="overflow-hidden rounded-2xl border border-border">
            {PLATFORMS.map((p, i) => {
              const on = r.platform === p.key;
              return (
                <button key={p.key} type="button" onClick={() => set({ platform: p.key })}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? "border-t border-border" : ""} ${on ? "bg-canvas" : "bg-white"}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas"><Link2 size={16} className="text-navy" strokeWidth={1.75} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-navy">{p.label}</span>
                    <span className="block text-[12px] text-muted">{p.desc}</span>
                  </span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={14} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        </div>
        {needsLink ? (
          <label className="block">
            <FieldLabel>{platformLabel(r.platform)} link</FieldLabel>
            <input type="url" inputMode="url" value={r.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" className={fieldInput} />
            <span className="mt-1.5 block text-[12px] text-muted">Shared with the client when they book.</span>
          </label>
        ) : (
          <div className="rounded-xl border border-border bg-canvas px-4 py-3 text-[13px] text-secondary">You&apos;ll call the client at their booking time — no link needed.</div>
        )}
      </div>
    </Sheet>
  );
}

// ---- Mock map with a radius ring scaling with the travel radius -------------

function MapRadius({ miles }: { miles: number }) {
  const d = Math.round(28 + (Math.min(50, Math.max(1, miles)) / 50) * 122);
  return (
    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl border border-border bg-[#EAE2D6]">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(0deg, rgba(8,7,6,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(8,7,6,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <span className="absolute left-[38%] top-0 h-full w-[3px] bg-white/70" />
      <span className="absolute left-0 top-[44%] h-[3px] w-full bg-white/70" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy/50 bg-navy/10" style={{ width: d, height: d }} />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><MapPin size={20} className="fill-navy text-white" strokeWidth={1.75} /></span>
      <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-navy shadow-sm">{miles} mi</span>
    </div>
  );
}
