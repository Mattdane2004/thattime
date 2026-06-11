"use client";

import Link from "next/link";
import { ChevronLeft, UserPlus } from "lucide-react";
import { teamRoster, STATUS_LABEL, initialsOf } from "@/lib/data/team";

// Team roster — a functional port of the legacy that-time-app /routes/Team.jsx
// (the original is a large multi-tab interface; the members list is ported
// here, the schedule/pay tabs are backlog — see PORTING.md). Validates the
// shared Staff SystemRole / StaffStatus enums via the typed roster.

const STATUS_STYLE: Record<string, string> = {
  active: "bg-canvas text-secondary",
  pending: "border border-border bg-surface text-muted",
  needs_setup: "bg-warning/15 text-warning",
};

export default function TeamPage() {
  const bookable = teamRoster.filter((m) => m.bookable).length;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center">
          <Link href="/app/hub" aria-label="Back to hub" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </Link>
          <span className="ml-1 text-[17px] font-semibold text-navy">Team</span>
        </div>
        <button className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
          <UserPlus size={15} strokeWidth={1.75} />Invite
        </button>
      </div>

      <div className="px-4 pb-2 text-[12px] text-muted">
        {teamRoster.length} members · {bookable} bookable
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {teamRoster.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${m.avatarColor}`}>
              {initialsOf(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-navy">{m.name}</span>
                {m.systemRoles.includes("Manager") && (
                  <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-medium text-white">Manager</span>
                )}
                {m.systemRoles.includes("Instructor") && (
                  <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-secondary">Instructor</span>
                )}
              </div>
              <div className="mt-0.5 text-[12px] text-muted">
                {m.role} · {m.services} service{m.services === 1 ? "" : "s"}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[m.status]}`}>
              {STATUS_LABEL[m.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
