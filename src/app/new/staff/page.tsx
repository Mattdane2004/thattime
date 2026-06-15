"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, SlidersHorizontal } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { initialsOf } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";

// Wizard step — staff (Figma 12216:32064). Searchable, with a role filter;
// classes only show members with the Instructor system role.

export default function StaffPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const members = useTeamStore((s) => s.members);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");

  const isClass = draft.type === "class";
  const eligible = members.filter(
    (m) => m.bookable && (!isClass || m.systemRoles.includes("Instructor")),
  );
  const roles = ["All", ...Array.from(new Set(eligible.map((m) => m.role)))];
  const visible = eligible.filter(
    (m) =>
      m.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (roleFilter === "All" || m.role === roleFilter),
  );

  const toggle = (id: string) =>
    updateDraft({
      staffIds: draft.staffIds.includes(id)
        ? draft.staffIds.filter((x) => x !== id)
        : [...draft.staffIds, id],
    });

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/locations")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle
          title={isClass ? "Who teaches it?" : "Who offers it?"}
          subtitle={isClass ? "Pick the instructors who can lead this class." : "Pick staff who can deliver this service."}
        />

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff"
              className="h-12 w-full rounded-xl bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
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
          {visible.map((m) => {
            const selected = draft.staffIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className="flex w-full items-center gap-3 rounded-2xl py-2 text-left"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${m.avatarColor}`}>{initialsOf(m.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-navy">{m.name}</span>
                  <span className="block text-[12px] text-muted">{m.role}</span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-navy text-white" : "bg-canvas"}`}>
                  {selected && <Check size={16} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <div className="pt-8 text-center text-[13px] text-muted">
              {eligible.length === 0 ? "No eligible team members yet — invite instructors from the Team section." : "No matches"}
            </div>
          )}
        </div>
      </div>
      <WizardFooter
        step={isClass ? 5 : 3}
        total={TOTAL_STEPS[draft.type ?? "service"]}
        onBack={() => router.push("/new/locations")}
        onNext={() => draft.staffIds.length > 0 && router.push(isClass ? "/new/class-pricing" : "/new/price")}
        disabled={draft.staffIds.length === 0}
      />
    </>
  );
}
