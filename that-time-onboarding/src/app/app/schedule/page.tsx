"use client";

import { ChevronLeft, ChevronRight, Plus, GraduationCap } from "lucide-react";
import { scheduleDate, myDayTimeline, type TimelineItem } from "@/lib/data/schedule";

// Schedule — "My Day" agenda, a functional port of the legacy that-time-app
// /routes/main/Schedule.jsx (an 841-line screen). The week / 3-day / team-column
// calendar views and booking sheets are backlog — see PORTING.md.

function AppointmentCard({ item }: { item: TimelineItem }) {
  const past = item.kind === "past";
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${past ? "border-border bg-canvas" : "border-border bg-surface"}`}>
      <div className="w-12 shrink-0 text-[12px] font-semibold text-navy">{item.time ?? item.start}</div>
      <div className="min-w-0 flex-1">
        <div className={`text-[14px] font-semibold ${past ? "text-secondary" : "text-navy"}`}>{item.client}</div>
        <div className="truncate text-[12px] text-muted">{item.service}</div>
      </div>
      {item.badge && <span className="shrink-0 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-secondary">{item.badge}</span>}
      {item.end && <span className="shrink-0 text-[11px] text-muted">{item.start}–{item.end}</span>}
    </div>
  );
}

function Row({ item }: { item: TimelineItem }) {
  switch (item.kind) {
    case "past":
    case "appointment":
      return <AppointmentCard item={item} />;
    case "now":
      return (
        <div className="flex items-center gap-2 py-1">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-danger">Now</span>
          <span className="h-px flex-1 bg-danger/30" />
        </div>
      );
    case "upNext":
      return (
        <div className="rounded-2xl border border-navy/15 bg-navy/[0.03] px-4 py-2 text-[12px] font-semibold text-navy">Up next</div>
      );
    case "break":
      return (
        <div className="flex items-center gap-3 px-3 py-2 text-[12px] text-muted">
          <span className="w-12 shrink-0 font-medium text-secondary">{item.time}</span>
          {item.label}{item.duration ? ` · ${item.duration}` : ""}
        </div>
      );
    case "gap":
      return (
        <button className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-left text-[12px] text-muted hover:bg-canvas">
          <span className="w-12 shrink-0 font-medium">{item.time}</span>
          <Plus size={13} />{item.label}
        </button>
      );
    case "class":
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas"><GraduationCap size={16} className="text-navy" /></span>
          <span className="text-[13px] font-medium text-navy">{item.label}</span>
        </div>
      );
    case "end":
      return <div className="py-2 text-center text-[11px] uppercase tracking-wide text-muted">{item.label}</div>;
    default:
      return null;
  }
}

export default function SchedulePage() {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="text-[17px] font-semibold text-navy">Schedule</div>
        <div className="flex items-center gap-1 text-muted">
          <button aria-label="Previous day" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas"><ChevronLeft size={18} /></button>
          <span className="text-[13px] font-medium text-navy">{scheduleDate}</span>
          <button aria-label="Next day" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {myDayTimeline.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
