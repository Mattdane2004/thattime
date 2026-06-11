"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronRight, Clock, AlertTriangle, CalendarDays,
  Plane, Stethoscope, CalendarOff, LayoutGrid,
} from "lucide-react";
import {
  homeHeader, ownerStats, upNext, needsAttention, teamToday,
  upcomingShifts, timeOff,
} from "@/lib/data/home";

// Home dashboard — the product app's landing (the "Home" tab). Ported from
// the legacy that-time-app /routes/main/Home.jsx. Self-contained: the
// original's location/time-off sheets and shared context are simplified to
// local state pending the shared app-state slice (see PORTING.md).

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-semibold text-navy">{children}</div>;
}

function NeedsAttention() {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-3">
      {needsAttention.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-navy">{item.title}</div>
            <div className="mt-0.5 text-[12px] text-muted">{item.detail}</div>
          </div>
          <button
            onClick={() => setResolved((r) => ({ ...r, [item.id]: true }))}
            disabled={resolved[item.id]}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors ${
              resolved[item.id] ? "border-border bg-canvas text-muted" : "border-border text-navy hover:bg-canvas"
            }`}
          >
            {resolved[item.id] ? item.done : item.action}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const stats = ownerStats;

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-5">
        <div className="text-[17px] font-semibold text-navy">Home</div>
        <Link href="/app/hub" aria-label="Open hub" className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <LayoutGrid size={20} />
        </Link>
      </div>

      <div>
        <div className="px-4 pb-8">
          <button className="flex items-center gap-1 pt-1 text-[12px] font-medium text-muted">
            {homeHeader.location}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>

          {/* Greeting */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
              {homeHeader.userInitials}
            </div>
            <div>
              <div className="text-[20px] font-bold leading-tight text-navy">{homeHeader.greeting}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                <Clock size={12} strokeWidth={1.75} />
                {homeHeader.hours}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 rounded-2xl bg-canvas px-2 py-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center ${i > 0 ? "border-l border-border" : ""}`}>
                <div className="text-[11px] text-muted">{stat.label}</div>
                <div className="mt-1 text-[18px] font-bold text-navy">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Up next */}
          <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
            <SectionLabel>Up Next</SectionLabel>
            <div className="mb-3 mt-0.5 text-[12px] text-muted">{upNext.context}</div>
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-[12px] font-semibold text-muted">
                {upNext.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-navy">{upNext.client}</div>
                <div className="truncate text-[12px] text-muted">{upNext.service}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[13px] font-semibold text-navy">{upNext.time}</div>
                <div className="text-[11px] text-muted">{upNext.countdown}</div>
              </div>
            </div>
            <div className="mt-0.5 flex w-full items-center justify-between pt-3.5 text-[13px] text-muted">
              <span>See your Schedule</span>
              <span className="flex items-center gap-1">{upNext.scheduleCount}<ChevronRight size={14} strokeWidth={1.75} /></span>
            </div>
          </div>

          {/* Needs attention */}
          <div className="mb-3 mt-6 flex items-center gap-1.5">
            <SectionLabel>Needs Attention</SectionLabel>
            <span className="text-[15px] font-semibold text-border">{needsAttention.length}</span>
          </div>
          <NeedsAttention />

          {/* Team today */}
          <div className="mb-3 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SectionLabel>Team Today</SectionLabel>
              <span className="text-[15px] font-semibold text-border">{teamToday.count}</span>
            </div>
            <Link href="/app/team" className="text-[12px] text-muted hover:text-navy">View all</Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {teamToday.members.map((member, i) => (
              <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-semibold text-muted">
                  {member.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-navy">{member.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                    <Clock size={11} strokeWidth={1.75} />{member.detail}
                  </div>
                </div>
                <div className="shrink-0 text-[12px] text-muted">{member.status}</div>
              </div>
            ))}
            <div className="flex w-full items-center gap-2 bg-canvas px-4 py-3 text-[12px] text-secondary">
              <AlertTriangle size={13} strokeWidth={1.75} />{teamToday.warning}
            </div>
          </div>

          {/* Shifts */}
          <div className="mb-3 mt-6"><SectionLabel>Shifts</SectionLabel></div>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="px-4 pb-1 pt-4"><SectionLabel>Upcoming Shifts</SectionLabel></div>
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas">
                    <CalendarDays size={16} className="text-secondary" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-navy">{shift.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{shift.detail}</div>
                  </div>
                  {shift.badge && <span className="shrink-0 rounded-full bg-navy px-2.5 py-1 text-[11px] font-medium text-white">{shift.badge}</span>}
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="px-4 pb-1 pt-4"><SectionLabel>Time Off</SectionLabel></div>
              {timeOff.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas">
                    {item.detail === "Annual Leave" ? <Plane size={16} className="text-secondary" strokeWidth={1.75} />
                      : item.detail === "Doctors" ? <Stethoscope size={16} className="text-secondary" strokeWidth={1.75} />
                      : <CalendarOff size={16} className="text-secondary" strokeWidth={1.75} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-navy">{item.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{item.detail}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    item.badge === "Approved" ? "bg-canvas text-secondary" : "border border-border bg-surface text-muted"
                  }`}>{item.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
