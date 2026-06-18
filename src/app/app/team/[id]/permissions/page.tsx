"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { Toggle } from "@/components/ui";
import { ACCESS_LEVELS } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import type { Staff } from "@/lib/types";

// Member permissions — pick an access level preset, then fine-tune the
// per-area flags. Changing a flag makes the level "custom" in spirit but we
// keep the last-selected preset for display simplicity.

const AREAS: { key: keyof Staff["permissions"]; label: string; desc: string }[] = [
  { key: "calendar", label: "Calendar", desc: "View their own calendar" },
  { key: "bookings", label: "Bookings", desc: "Create and edit appointments" },
  { key: "clients", label: "Clients", desc: "View client contact details" },
  { key: "services", label: "Services", desc: "Edit the offering catalogue" },
  { key: "payments", label: "Payments", desc: "Take payments and refunds" },
  { key: "team", label: "Team", desc: "Manage team members and shifts" },
  { key: "reports", label: "Reports", desc: "View performance reports" },
  { key: "settings", label: "Settings", desc: "Change business settings" },
  { key: "scheduleSelfEdit", label: "Edit own schedule", desc: "Change their own working hours" },
  { key: "viewTeamSchedule", label: "See team schedule", desc: "View everyone's shifts, not just their own" },
];

export default function MemberPermissionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const member = useTeamStore((s) => s.members.find((m) => m.id === params.id));
  const setAccessLevel = useTeamStore((s) => s.setAccessLevel);
  const togglePermission = useTeamStore((s) => s.togglePermission);

  if (!member) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Permissions" onBack={() => router.push("/app/team")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Team member not found</div>
      </div>
    );
  }

  const isOwner = member.accessLevel === "owner";

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Permissions" onBack={() => router.push(`/app/team/${member.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Access level</div>
        <div className="space-y-2 pb-5">
          {ACCESS_LEVELS.map((l) => {
            const selected = member.accessLevel === l.key;
            const locked = l.key === "owner" && !isOwner;
            return (
              <button
                key={l.key}
                onClick={() => !locked && setAccessLevel(member.id, l.key)}
                disabled={locked}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selected ? "border-navy" : "border-border hover:bg-canvas"
                } ${locked ? "opacity-50" : ""}`}
              >
                <span>
                  <span className="block text-[14px] font-semibold text-navy">{l.label}</span>
                  <span className="block text-[12px] text-muted">{l.desc}</span>
                </span>
                <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "border-navy bg-navy" : "border-border"}`} />
              </button>
            );
          })}
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Fine-tune</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          {AREAS.map((a, i) => (
            <button
              key={a.key}
              onClick={() => !isOwner && togglePermission(member.id, a.key)}
              disabled={isOwner}
              className={`flex w-full items-center justify-between px-4 py-3 text-left ${i > 0 ? "border-t border-border" : ""} ${isOwner ? "opacity-60" : ""}`}
            >
              <span>
                <span className="block text-[14px] font-medium text-navy">{a.label}</span>
                <span className="block text-[12px] text-muted">{a.desc}</span>
              </span>
              <Toggle on={member.permissions[a.key]} />
            </button>
          ))}
        </div>
        {isOwner && <div className="pt-3 text-center text-[12px] text-muted">Owners always have full access.</div>}
      </div>
    </div>
  );
}
