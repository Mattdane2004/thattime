"use client";

import { useState } from "react";
import { Check, Search, SlidersHorizontal, ChevronRight, Store } from "lucide-react";
import { Sheet } from "@/components/ui";
import { initialsOf } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import { businessLocations } from "@/lib/data/locations";
import type { Staff } from "@/lib/types";

// Shared staff-assignment editor used by both the creation wizard (on the draft)
// and the dashboard staff route (on the offer). Per-location cards when 2+
// specific salons are selected; a flat searchable list otherwise.

const shortName = (name: string) => name.replace(/^Salon\s+/, "");

export interface StaffValue {
  locationModes: { inSalon: boolean; mobile: boolean; remote: boolean };
  locationIds: string[];
  staffIds: string[];
  staffByLocation: Record<string, string[]>;
}

export type StaffPatch = Partial<Pick<StaffValue, "staffIds" | "staffByLocation">>;

export function staffSelectedLocs(v: StaffValue) {
  const perLocation = v.locationModes.inSalon && v.locationIds.length >= 2;
  return { perLocation, locs: perLocation ? businessLocations.filter((l) => v.locationIds.includes(l.id)) : [] };
}

export function staffComplete(v: StaffValue): boolean {
  const { perLocation, locs } = staffSelectedLocs(v);
  return perLocation ? locs.every((l) => (v.staffByLocation[l.id]?.length ?? 0) > 0) : v.staffIds.length > 0;
}

export function StaffEditor({ value, isClass, onChange }: { value: StaffValue; isClass: boolean; onChange: (patch: StaffPatch) => void }) {
  const members = useTeamStore((s) => s.members);
  const eligible = members.filter((m) => m.bookable && (!isClass || m.systemRoles.includes("Instructor")));
  const { perLocation, locs } = staffSelectedLocs(value);
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const toggleFlat = (id: string) =>
    onChange({ staffIds: value.staffIds.includes(id) ? value.staffIds.filter((x) => x !== id) : [...value.staffIds, id] });
  const locSel = (locId: string) => value.staffByLocation[locId] ?? [];
  const toggleLoc = (locId: string, id: string) => {
    const cur = locSel(locId);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    onChange({ staffByLocation: { ...value.staffByLocation, [locId]: next } });
  };
  const sheetLoc = locs.find((l) => l.id === sheetFor);

  return (
    <>
      {perLocation ? (
        <div className="space-y-3 pb-6">
          {locs.map((loc) => {
            const sel = locSel(loc.id);
            const chosen = eligible.filter((m) => sel.includes(m.id));
            return (
              <div key={loc.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                    <Store size={17} className="text-navy" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-navy">{shortName(loc.name)}</span>
                    <span className="block text-[12px] text-muted">{loc.address}</span>
                  </span>
                  <button type="button" onClick={() => setSheetFor(loc.id)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-canvas px-3.5 py-2 text-[13px] font-medium text-navy">
                    {chosen.length ? `${chosen.length} selected` : "Choose staff"}
                    <ChevronRight size={14} className="text-muted" />
                  </button>
                </div>
                {chosen.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chosen.map((m) => (
                      <span key={m.id} className="flex items-center gap-1.5 rounded-full bg-canvas py-1 pl-1 pr-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${m.avatarColor}`}>{initialsOf(m.name)}</span>
                        <span className="text-[12px] text-secondary">{m.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <FlatStaffList eligible={eligible} isClass={isClass} selectedIds={value.staffIds} onToggle={toggleFlat} />
      )}

      <Sheet
        open={Boolean(sheetFor)}
        onClose={() => setSheetFor(null)}
        title={sheetLoc ? `Staff at ${shortName(sheetLoc.name)}` : "Choose staff"}
        sub={isClass ? "Select everyone who can teach this here." : "Select everyone who can deliver this here."}
        footer={
          <button type="button" onClick={() => setSheetFor(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>
        }
      >
        <StaffPickerList eligible={eligible} isClass={isClass} selectedIds={sheetFor ? locSel(sheetFor) : []} onToggle={(id) => sheetFor && toggleLoc(sheetFor, id)} />
      </Sheet>
    </>
  );
}

function FlatStaffList({ eligible, isClass, selectedIds, onToggle }: { eligible: Staff[]; isClass: boolean; selectedIds: string[]; onToggle: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");
  const roles = ["All", ...Array.from(new Set(eligible.map((m) => m.role)))];
  const visible = eligible.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()) && (roleFilter === "All" || m.role === roleFilter));

  return (
    <>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff"
            className="h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
        </div>
        <button type="button" aria-label="Filter by role" aria-pressed={showFilters} onClick={() => setShowFilters((v) => !v)}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${showFilters || roleFilter !== "All" ? "bg-navy text-white" : "bg-canvas text-navy"}`}>
          <SlidersHorizontal size={18} />
        </button>
      </div>
      {showFilters && roles.length > 1 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4">
          {roles.map((r) => (
            <button key={r} type="button" onClick={() => setRoleFilter(r)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${roleFilter === r ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>{r}</button>
          ))}
        </div>
      )}
      <div className="space-y-2 pb-6">
        {visible.map((m) => <StaffRow key={m.id} member={m} selected={selectedIds.includes(m.id)} onClick={() => onToggle(m.id)} />)}
        {visible.length === 0 && (
          <div className="pt-8 text-center text-[13px] text-muted">
            {eligible.length === 0
              ? isClass ? "No eligible team members yet — invite instructors from the Team section." : "No eligible team members yet — add staff from the Team section."
              : "No matches"}
          </div>
        )}
      </div>
    </>
  );
}

function StaffPickerList({ eligible, isClass, selectedIds, onToggle }: { eligible: Staff[]; isClass: boolean; selectedIds: string[]; onToggle: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = eligible.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff"
          className="h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
      </div>
      {visible.map((m) => <StaffRow key={m.id} member={m} selected={selectedIds.includes(m.id)} onClick={() => onToggle(m.id)} />)}
      {visible.length === 0 && <p className="py-6 text-center text-[13px] text-muted">{eligible.length === 0 ? `No eligible ${isClass ? "instructors" : "staff"} yet.` : "No matches"}</p>}
    </div>
  );
}

function StaffRow({ member, selected, onClick }: { member: Staff; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl py-2 text-left">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${member.avatarColor}`}>{initialsOf(member.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{member.name}</span>
        <span className="block text-[12px] text-muted">{member.role}</span>
      </span>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-navy text-white" : "bg-canvas"}`}>
        {selected && <Check size={16} strokeWidth={3} />}
      </span>
    </button>
  );
}
