"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { WizardFooter, WizardTitle, TOTAL_STEPS } from "@/components/app/WizardChrome";
import { useWizardStore } from "@/lib/store/wizardStore";
import { initialsOf } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";

// Wizard step — staff (Figma 12135:44440 / 12135:44969). Searchable; classes
// only show members with the Instructor system role.

export default function StaffPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const members = useTeamStore((s) => s.members);
  const [query, setQuery] = useState("");

  const isClass = draft.type === "class";
  const eligible = members.filter(
    (m) => m.bookable && (!isClass || m.systemRoles.includes("Instructor")),
  );
  const visible = eligible.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

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
          title={isClass ? "Who teaches it?" : "Who can deliver it?"}
          subtitle={isClass ? "Pick the instructors who can lead this class." : "Pick the team members clients can book with."}
        />

        <div className="relative pb-4">
          <Search size={16} className="absolute left-4 top-3.5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team..."
            className="h-12 w-full rounded-xl bg-canvas pl-11 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="space-y-2 pb-6">
          {visible.map((m) => {
            const selected = draft.staffIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  selected ? "border-navy" : "border-border hover:bg-canvas"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${m.avatarColor}`}>{initialsOf(m.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{m.name}</span>
                  <span className="block text-[12px] text-muted">{m.role}</span>
                </span>
                {selected && <Check size={18} className="shrink-0 text-navy" />}
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
