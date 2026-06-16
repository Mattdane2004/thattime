"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, SlidersHorizontal, ChevronRight, Store } from "lucide-react";
import { ScreenHeader, Sheet } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { initialsOf } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import { businessLocations } from "@/lib/data/locations";
import type { Staff } from "@/lib/types";

// Wizard step — staff (Figma 12231:52011). Searchable, role-filtered. When more
// than one in-salon location is selected, staff are assigned per location.

const shortName = (name: string) => name.replace(/^Salon\s+/, "");

export default function StaffPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const members = useTeamStore((s) => s.members);

  const isClass = draft.type === "class";
  const eligible = members.filter((m) => m.bookable && (!isClass || m.systemRoles.includes("Instructor")));

  // Per-location assignment only when the user explicitly picked 2+ specific
  // salons. "All locations" (empty ids) and a single salon use the flat list.
  const ids = draft.locationIds;
  const perLocation = draft.locationModes.inSalon && ids.length >= 2;
  const selectedLocs = perLocation ? businessLocations.filter((l) => ids.includes(l.id)) : [];

  // Per-location assignment sheet target (location id), or "flat" picker target.
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const flatSelected = draft.staffIds;
  const toggleFlat = (id: string) =>
    updateDraft({ staffIds: flatSelected.includes(id) ? flatSelected.filter((x) => x !== id) : [...flatSelected, id] });

  const locSelected = (locId: string) => draft.staffByLocation[locId] ?? [];
  const toggleLoc = (locId: string, id: string) => {
    const cur = locSelected(locId);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    updateDraft({ staffByLocation: { ...draft.staffByLocation, [locId]: next } });
  };

  const canContinue = perLocation
    ? selectedLocs.every((l) => locSelected(l.id).length > 0)
    : flatSelected.length > 0;

  const sheetLoc = selectedLocs.find((l) => l.id === sheetFor);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/locations")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle
          title={isClass ? "Who teaches it?" : "Who offers it?"}
          subtitle={
            perLocation
              ? "Assign staff to each location."
              : isClass
              ? "Pick the instructors who can lead this class."
              : "Pick staff who can deliver this service."
          }
        />

        {perLocation ? (
          <div className="space-y-3 pb-6">
            {selectedLocs.map((loc) => {
              const sel = locSelected(loc.id);
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
                    <button
                      type="button"
                      onClick={() => setSheetFor(loc.id)}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-canvas px-3.5 py-2 text-[13px] font-medium text-navy"
                    >
                      {chosen.length ? `${chosen.length} assigned` : "Assign staff"}
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
          <FlatStaffList
            eligible={eligible}
            isClass={isClass}
            selectedIds={flatSelected}
            onToggle={toggleFlat}
          />
        )}
      </div>

      <WizardFooter
        step={isClass ? 5 : 3}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push("/new/locations")}
        onNext={() => canContinue && router.push(isClass ? "/new/class-pricing" : "/new/price")}
        disabled={!canContinue}
      />

      {/* Per-location staff picker */}
      <Sheet
        open={Boolean(sheetFor)}
        onClose={() => setSheetFor(null)}
        title={sheetLoc ? `Staff at ${shortName(sheetLoc.name)}` : "Choose staff"}
        sub="Select everyone who can deliver this here."
        footer={
          <button type="button" onClick={() => setSheetFor(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
            Done
          </button>
        }
      >
        <StaffPickerList
          eligible={eligible}
          isClass={isClass}
          selectedIds={sheetFor ? locSelected(sheetFor) : []}
          onToggle={(id) => sheetFor && toggleLoc(sheetFor, id)}
        />
      </Sheet>
    </>
  );
}

// ---- Flat searchable list (single location / mobile / remote) --------------

function FlatStaffList({
  eligible,
  isClass,
  selectedIds,
  onToggle,
}: {
  eligible: Staff[];
  isClass: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = ["All", ...Array.from(new Set(eligible.map((m) => m.role)))];
  const visible = eligible.filter(
    (m) => m.name.toLowerCase().includes(query.trim().toLowerCase()) && (roleFilter === "All" || m.role === roleFilter),
  );

  return (
    <>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff"
            className="h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
        <button
          type="button"
          aria-label="Filter by role"
          aria-pressed={showFilters}
          onClick={() => setShowFilters((v) => !v)}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            showFilters || roleFilter !== "All" ? "bg-navy text-white" : "bg-canvas text-navy"
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && roles.length > 1 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                roleFilter === r ? "bg-navy text-white" : "bg-canvas text-secondary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 pb-6">
        {visible.map((m) => (
          <StaffRow key={m.id} member={m} selected={selectedIds.includes(m.id)} onClick={() => onToggle(m.id)} />
        ))}
        {visible.length === 0 && (
          <div className="pt-8 text-center text-[13px] text-muted">
            {eligible.length === 0
              ? isClass
                ? "No eligible team members yet — invite instructors from the Team section."
                : "No eligible team members yet — add staff from the Team section."
              : "No matches"}
          </div>
        )}
      </div>
    </>
  );
}

// ---- Picker list (inside the per-location sheet) ---------------------------

function StaffPickerList({
  eligible,
  isClass,
  selectedIds,
  onToggle,
}: {
  eligible: Staff[];
  isClass: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = eligible.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff"
          className="h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
        />
      </div>
      {visible.map((m) => (
        <StaffRow key={m.id} member={m} selected={selectedIds.includes(m.id)} onClick={() => onToggle(m.id)} />
      ))}
      {visible.length === 0 && (
        <p className="py-6 text-center text-[13px] text-muted">
          {eligible.length === 0 ? `No eligible ${isClass ? "instructors" : "staff"} yet.` : "No matches"}
        </p>
      )}
    </div>
  );
}

function StaffRow({ member, selected, onClick }: { member: Staff; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl py-2 text-left">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${member.avatarColor}`}>
        {initialsOf(member.name)}
      </span>
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
