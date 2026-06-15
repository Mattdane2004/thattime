"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Car, Video, Check, Search, SlidersHorizontal, Globe, Store, Minus, Plus } from "lucide-react";
import { ScreenHeader, Sheet, Toggle } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { businessLocations } from "@/lib/data/locations";

// Wizard step — "Where is it offered?" (Figma 12216:32064). Three modes
// (in-salon / mobile / remote) are multi-select cards; in-salon and mobile each
// open a settings bottom sheet for their details.

const shortName = (name: string) => name.replace(/^Salon\s+/, "");

export default function LocationsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const [inSalonSheet, setInSalonSheet] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);

  const isClass = draft.type === "class";
  const modes = draft.locationModes;
  const back = isClass ? "/new/class-schedule" : "/new/basics";
  const anyMode = modes.inSalon || modes.mobile || modes.remote;

  const toggleMode = (key: keyof typeof modes) =>
    updateDraft({ locationModes: { ...modes, [key]: !modes[key] } });

  const total = businessLocations.length;
  const ids = draft.locationIds;
  const allLocations = ids.length === 0 || ids.length === total;
  const inSalonSummary = allLocations
    ? "All locations"
    : `${businessLocations.filter((l) => ids.includes(l.id)).map((l) => shortName(l.name)).join(" · ")} · ${ids.length} location${ids.length > 1 ? "s" : ""}`;

  const m = draft.mobile;
  const feePart = m.travelFee ? `£${m.feeAmount || "0"} ${m.feeType === "flat" ? "flat fee" : "per mile"}` : "No travel fee";
  const mobileSummary = `${m.radiusMiles} miles · ${feePart} · ${m.noticeValue}${m.noticeUnit === "Hours" ? "h" : "d"} notice`;

  return (
    <>
      <ScreenHeader onBack={() => router.push(back)} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Where is it offered?" subtitle="Pick one or more. You can set details for each." />

        <div className="space-y-3 pb-6">
          <ModeCard
            icon={<Home size={18} className="text-navy" strokeWidth={1.75} />}
            title="In-salon"
            sub="At a fixed location"
            on={modes.inSalon}
            onToggle={() => toggleMode("inSalon")}
            summary={inSalonSummary}
            onEdit={() => setInSalonSheet(true)}
          />
          <ModeCard
            icon={<Car size={18} className="text-navy" strokeWidth={1.75} />}
            title="Mobile"
            sub="Stylist travels to client"
            on={modes.mobile}
            onToggle={() => toggleMode("mobile")}
            summary={mobileSummary}
            onEdit={() => setMobileSheet(true)}
          />
          <ModeCard
            icon={<Video size={18} className="text-navy" strokeWidth={1.75} />}
            title="Remote"
            sub="Video call or online"
            on={modes.remote}
            onToggle={() => toggleMode("remote")}
          />
        </div>
      </div>

      <WizardFooter
        step={isClass ? 4 : 2}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push(back)}
        onNext={() => anyMode && router.push("/new/staff")}
        disabled={!anyMode}
      />

      <InSalonSheet open={inSalonSheet} onClose={() => setInSalonSheet(false)} />
      <MobileSheet open={mobileSheet} onClose={() => setMobileSheet(false)} />
    </>
  );
}

// ---- Mode card -------------------------------------------------------------

function ModeCard({
  icon,
  title,
  sub,
  on,
  onToggle,
  summary,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
  summary?: string;
  onEdit?: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${on ? "border-navy" : "border-border"}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3.5 p-4 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-navy">{title}</span>
          <span className="block text-[13px] text-muted">{sub}</span>
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            on ? "bg-navy text-white" : "border-2 border-border"
          }`}
        >
          {on && <Check size={14} strokeWidth={3} />}
        </span>
      </button>
      {on && summary && onEdit && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-canvas/50 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-[13px] text-secondary">{summary}</span>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-navy shadow-[0_1px_3px_rgba(8,7,6,0.08)]"
          >
            Edit settings
          </button>
        </div>
      )}
    </div>
  );
}

// ---- In-salon locations sheet ----------------------------------------------

function InSalonSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const [query, setQuery] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const total = businessLocations.length;
  const ids = draft.locationIds;
  const allOn = ids.length === 0 || ids.length === total;
  const checked = (id: string) => allOn || ids.includes(id);

  const setAll = () => updateDraft({ locationIds: [] });
  const toggleOne = (id: string) => {
    const base = allOn ? businessLocations.map((l) => l.id) : ids;
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    updateDraft({ locationIds: next.length === total ? [] : next });
  };

  const q = query.trim().toLowerCase();
  const visible = businessLocations.filter((l) => {
    if (selectedOnly && !checked(l.id)) return false;
    return !q || l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
  });

  return (
    <Sheet open={open} onClose={onClose} title="In-salon locations">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search locations…"
              className="h-11 w-full rounded-xl bg-canvas pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </div>
          <button
            type="button"
            aria-label="Show selected only"
            aria-pressed={selectedOnly}
            onClick={() => setSelectedOnly((v) => !v)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              selectedOnly ? "bg-navy text-white" : "bg-canvas text-navy"
            }`}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {(!selectedOnly || allOn) && (
          <button
            type="button"
            onClick={setAll}
            className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ${
              allOn ? "bg-navy text-white" : "bg-canvas text-navy"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${allOn ? "bg-white/15" : "bg-white"}`}>
              <Globe size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">All locations</span>
              <span className={`block text-[12px] ${allOn ? "text-white/70" : "text-muted"}`}>Available everywhere</span>
            </span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${allOn ? "bg-white text-navy" : "border-2 border-border"}`}>
              {allOn && <Check size={14} strokeWidth={3} />}
            </span>
          </button>
        )}

        <div className="flex flex-col gap-2">
          {visible.map((loc) => {
            const on = checked(loc.id);
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => toggleOne(loc.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-canvas p-4 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                  <Store size={17} className="text-navy" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-navy">{loc.name}</span>
                  <span className="block text-[12px] text-muted">{loc.address}</span>
                </span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted">No locations match.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/app/setup")}
          className="py-1 text-center text-[13px] font-medium text-navy underline"
        >
          Don&apos;t see a location? Configure now
        </button>

        <div className="sticky bottom-0 -mx-6 -mb-8 bg-white px-6 pb-8 pt-2">
          <button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
            Save settings
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Mobile settings sheet -------------------------------------------------

function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const m = useWizardStore((s) => s.draft.mobile);
  const updateMobile = useWizardStore((s) => s.updateMobile);

  const stepNotice = (delta: number) => updateMobile({ noticeValue: Math.max(1, m.noticeValue + delta) });
  const stepRadius = (delta: number) => updateMobile({ radiusMiles: Math.max(1, m.radiusMiles + delta) });

  return (
    <Sheet open={open} onClose={onClose} title="Mobile settings">
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center justify-between pb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Travel fee</span>
            <button type="button" onClick={() => updateMobile({ travelFee: !m.travelFee })}>
              <Toggle on={m.travelFee} />
            </button>
          </div>

          {m.travelFee && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: "flat", t: "Flat rate", s: "Per booking" },
                  { v: "per_mile", t: "Per mile", s: "By distance" },
                ] as const).map((o) => {
                  const on = m.feeType === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => updateMobile({ feeType: o.v })}
                      className={`rounded-xl border-2 px-4 py-3 text-left ${on ? "border-navy bg-canvas" : "border-border"}`}
                    >
                      <span className="block text-[14px] font-semibold text-navy">{o.t}</span>
                      <span className="block text-[12px] text-muted">{o.s}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center rounded-xl bg-canvas px-4">
                <span className="text-[15px] text-muted">£</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={m.feeAmount}
                  onChange={(e) => updateMobile({ feeAmount: e.target.value })}
                  placeholder="15"
                  className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
                />
                <span className="text-[13px] text-muted">{m.feeType === "flat" ? "per booking" : "per mile"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-canvas p-4">
          <p className="pb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Travel radius</p>
          <div className="flex items-center justify-between">
            <button onClick={() => stepRadius(-5)} aria-label="Less" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy">
              <Minus size={16} />
            </button>
            <span className="text-[15px] font-semibold text-navy">{m.radiusMiles} miles</span>
            <button onClick={() => stepRadius(5)} aria-label="More" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-canvas p-4">
          <p className="pb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Minimum booking notice</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white px-2 py-1.5">
              <button onClick={() => stepNotice(-1)} aria-label="Less" className="flex h-8 w-8 items-center justify-center rounded-lg text-navy">
                <Minus size={16} />
              </button>
              <span className="w-5 text-center text-[15px] font-semibold text-navy">{m.noticeValue}</span>
              <button onClick={() => stepNotice(1)} aria-label="More" className="flex h-8 w-8 items-center justify-center rounded-lg text-navy">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-1 rounded-xl bg-white p-1">
              {(["Days", "Hours"] as const).map((u) => {
                const on = m.noticeUnit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => updateMobile({ noticeUnit: u })}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${on ? "bg-navy text-white" : "text-secondary"}`}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="pt-3 text-[12px] text-muted">
            Clients must book at least <span className="font-semibold text-secondary">{m.noticeValue} {m.noticeUnit.toLowerCase()}</span> in advance
          </p>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-8 bg-white px-6 pb-8 pt-2">
          <button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
            Save settings
          </button>
        </div>
      </div>
    </Sheet>
  );
}
