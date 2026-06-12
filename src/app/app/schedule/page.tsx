"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Coffee, CalendarCog, SlidersHorizontal,
  MessageSquare, UserPlus, Ban, Play, ChevronDown, Wrench, ListChecks,
  CalendarDays,
} from "lucide-react";
import { AppHeader, Segmented, Sheet, DarkButton, GhostButton, StatusPill, MiniCalendar } from "@/components/app/ui";
import { UpNextCard, GapSlot } from "@/components/app/UpNextCard";
import { useAppStore } from "@/lib/store/appStore";
import { myDayAgenda, threeDayGrid, teamColumns, masterclass, clientRows, type GridBlock } from "@/lib/data/product";

// Schedule — My Day agenda, 3-day calendar grid, and team columns, with the
// class sheet (attendee check-in) and calendar settings (jump-to-date).
// Tapping any appointment row/block opens the shared appointment sheet.

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_PX = 64;

const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const hhmm = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
const spanLabel = (span: number) => {
  const m = Math.round(span * 60);
  return m % 60 === 0 ? `${m / 60}h` : m > 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
};
const isBreakBlock = (name: string) => name.includes("Break");

function shadeClass(shade: GridBlock["shade"]) {
  switch (shade) {
    case "dark":
      return "bg-[#14181F] text-white";
    case "mid":
      return "bg-[#4A5468] text-white";
    case "muted":
      return "bg-canvas text-muted";
    case "outline":
      return "border-2 border-[#14181F] bg-white text-navy";
    default:
      return "bg-[#ECEDEF] text-secondary";
  }
}

function MyDayView() {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  return (
    <div className="flex flex-col gap-2.5 px-4 pb-6 pt-4">
      {myDayAgenda.map((row) => {
        switch (row.kind) {
          case "now":
            return (
              <div key={row.id} className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-danger/50" />
                <span className="text-[11px] font-semibold text-danger">Now</span>
                <span className="h-px flex-1 bg-danger/50" />
              </div>
            );
          case "break":
            return (
              <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-[#ECEDEF] px-4 py-3">
                <span className="text-[12px] font-medium text-muted">{row.time}</span>
                <Coffee size={14} className="text-muted" strokeWidth={1.75} />
                <span className="flex-1 text-[13px] font-medium text-secondary">{row.label}</span>
                <span className="text-[11px] text-muted">{row.duration}</span>
              </div>
            );
          case "upnext":
            return <UpNextCard key={row.id} />;
          case "gap":
            return <GapSlot key={row.id} time={row.time} label={row.label} />;
          case "end":
            return (
              <div key={row.id} className="flex items-center gap-3 py-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted">{row.label}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            );
          default:
            return (
              <button
                key={row.id}
                type="button"
                onClick={() =>
                  setApptSheet({
                    client: row.client!,
                    initials: initialsOf(row.client!),
                    service: row.service ?? "Appointment",
                    staff: "Emma S.",
                    time: row.time!,
                    duration: `ends ${row.end}`,
                    status: row.past ? "Done" : "Confirmed",
                  })
                }
                className={`flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)] ${
                  row.past ? "opacity-50" : ""
                }`}
              >
                <span className="w-12 shrink-0">
                  <span className="block text-[14px] font-bold text-navy">{row.time}</span>
                  <span className="block text-[11px] text-muted">{row.end}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-navy">{row.client}</span>
                  <span className="block truncate text-[12px] text-muted">{row.service}</span>
                </span>
                <ChevronRight size={15} className="shrink-0 text-muted" />
              </button>
            );
        }
      })}
    </div>
  );
}

function CalendarGridView({ days }: { days: number }) {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const visibleDays = threeDayGrid.slice(0, days);
  return (
    <div className="px-2 pb-6 pt-2">
      <div className="grid" style={{ gridTemplateColumns: `34px repeat(${days}, 1fr)` }}>
        <span />
        {visibleDays.map((d) => (
          <div key={d.day} className="border-b border-border pb-2 text-center">
            <p className="text-[11px] text-muted">{d.day}</p>
            <p className="text-[14px] font-bold text-navy">{d.date}</p>
          </div>
        ))}
        <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
          {HOURS.map((h, i) => (
            <span key={h} className="absolute -translate-y-1/2 text-[10px] text-muted" style={{ top: i * HOUR_PX + 8 }}>
              {h <= 12 ? `${h} AM` : `${h - 12} PM`}
            </span>
          ))}
        </div>
        {visibleDays.map((d) => (
          <div
            key={d.day}
            role="button"
            tabIndex={0}
            aria-label={`Add to ${d.day} ${d.date}`}
            onClick={() => setQuickAction("choose")}
            onKeyDown={(e) => e.key === "Enter" && setQuickAction("choose")}
            className="relative cursor-pointer border-l border-border"
            style={{ height: HOURS.length * HOUR_PX }}
          >
            {HOURS.map((_, i) => (
              <span key={i} className="pointer-events-none absolute inset-x-0 border-t border-border/60" style={{ top: i * HOUR_PX + 8 }} />
            ))}
            {d.blocks.map((b, i) => (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * i }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isBreakBlock(b.name)) return;
                  setApptSheet({
                    client: b.name,
                    initials: initialsOf(b.name),
                    service: b.service ?? "Appointment",
                    staff: "Emma S.",
                    time: hhmm(b.start),
                    duration: spanLabel(b.span),
                    status: "Confirmed",
                  });
                }}
                className={`absolute inset-x-1 overflow-hidden rounded-xl p-2 text-left ${shadeClass(b.shade)}`}
                style={{ top: (b.start - 8) * HOUR_PX + 8, height: Math.max(30, b.span * HOUR_PX - 4) }}
              >
                <p className="truncate text-[11px] font-bold leading-tight">
                  {b.name === "Lunch Break" && <Coffee size={10} className="mr-1 inline" />}
                  {b.name}
                </p>
                {b.service && <p className="truncate text-[10px] opacity-75">{b.service}</p>}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamView({ onOpenClass, classCancelled }: { onOpenClass: () => void; classCancelled: boolean }) {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  return (
    <div className="px-2 pb-6 pt-2">
      <div className="grid grid-cols-[34px_1fr_1fr_1fr]">
        <span className="self-end pb-2 text-[10px] text-muted">Time</span>
        {teamColumns.map((c) => (
          <div key={c.id} className="border-b border-border pb-2 text-center">
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-secondary">
              {c.initials}
            </span>
            <p className="pt-1 text-[12px] font-bold text-navy">{c.name}</p>
            <p className="truncate text-[10px] text-muted">{c.role}</p>
          </div>
        ))}
        <div className="relative" style={{ height: 8 * HOUR_PX }}>
          {[9, 10, 11, 12, 13, 14, 15, 16].map((h, i) => (
            <span key={h} className="absolute -translate-y-1/2 text-[10px] text-muted" style={{ top: i * HOUR_PX + 8 }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {teamColumns.map((c, col) => (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            aria-label={`Add to ${c.name}'s day`}
            onClick={() => setQuickAction("choose")}
            onKeyDown={(e) => e.key === "Enter" && setQuickAction("choose")}
            className="relative cursor-pointer border-l border-border"
            style={{ height: 8 * HOUR_PX }}
          >
            <span className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-danger" style={{ top: (15 - 9) * HOUR_PX + 8 }}>
              {col === 0 && <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-danger" />}
            </span>
            {c.blocks.map((b, i) => {
              const isClass = b.status === "Class";
              const shade = isClass && classCancelled ? "muted" : b.shade;
              const status = isClass && classCancelled ? "Cancelled" : b.status;
              return (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClass) {
                      onOpenClass();
                      return;
                    }
                    if (isBreakBlock(b.name)) return;
                    setApptSheet({
                      client: b.name,
                      initials: initialsOf(b.name),
                      service: b.service ?? "Appointment",
                      staff: c.name,
                      time: hhmm(b.start),
                      duration: b.price ?? spanLabel(b.span),
                      status: b.status ?? "Confirmed",
                    });
                  }}
                  className={`absolute inset-x-1 overflow-hidden rounded-xl p-2 text-left ${shadeClass(shade)}`}
                  style={{ top: (b.start - 9) * HOUR_PX + 8, height: Math.max(30, b.span * HOUR_PX - 4) }}
                >
                  {status && (
                    <span className="float-right ml-1">
                      <StatusPill tone={shade === "dark" ? "dark" : "light"}>{status}</StatusPill>
                    </span>
                  )}
                  <p className="truncate text-[11px] font-bold leading-tight">
                    {b.name === "Lunch Break" && <Coffee size={10} className="mr-1 inline" />}
                    {b.name}
                  </p>
                  {b.service && <p className="truncate text-[10px] opacity-75">{b.service}</p>}
                  {b.price && <p className="pt-0.5 text-[9px] opacity-60">{b.price}</p>}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassSheet({
  open,
  onClose,
  cancelled,
  onCancelClass,
}: {
  open: boolean;
  onClose: () => void;
  cancelled: boolean;
  onCancelClass: () => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [arrived, setArrived] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [extra, setExtra] = useState<{ id: string; initials: string; name: string; status: string; warn: boolean }[]>([]);
  const arrivedCount = Object.values(arrived).filter(Boolean).length;
  const m = masterclass;
  const attendees = [...m.attendees, ...extra];
  const booked = m.booked + extra.length;

  return (
    <>
    <Sheet
      open={open}
      onClose={onClose}
      full
      title={
        <span className="flex items-center gap-2">
          {m.name}
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-navy">Class</span>
        </span>
      }
      sub={m.sub}
    >
      <div className="flex items-center justify-between pb-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-navy">
          <span>{m.time}</span>
          <span className="text-muted">·</span>
          <span>{m.staff}</span>
          <span className="text-muted">·</span>
          <span>{m.location}</span>
        </span>
        <StatusPill tone={cancelled ? "danger" : "light"}>{cancelled ? "Cancelled" : "Scheduled"}</StatusPill>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className="h-full rounded-full bg-[#14181F]"
          initial={{ width: 0 }}
          animate={{ width: `${(booked / m.capacity) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="pt-1.5 text-right text-[11px] text-muted">
        {booked}/{m.capacity} · {m.capacity - booked} left
      </p>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left"
      >
        <span className="flex -space-x-2">
          {attendees.slice(0, 4).map((a) => (
            <span key={a.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-canvas text-[9px] font-bold text-secondary">
              {a.initials}
            </span>
          ))}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#14181F] text-[9px] font-bold text-white">
            +{attendees.length - 4}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-navy">
            {booked} attendees · {arrivedCount} arrived
          </span>
          <span className="block text-[12px] text-muted">1 unpaid · 1 waiver pending</span>
        </span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="flex text-secondary">
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-3">
              {attendees.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[11px] font-bold text-secondary">
                    {a.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{a.name}</span>
                    <span className={`block text-[11px] ${a.warn ? "font-medium text-warning" : "text-muted"}`}>
                      {a.status}
                    </span>
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setArrived((r) => ({ ...r, [a.id]: !r[a.id] }))}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                      arrived[a.id] ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                    }`}
                  >
                    {arrived[a.id] ? "Arrived" : "Mark arrived"}
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2.5 pt-4">
        {[
          {
            icon: <MessageSquare size={17} strokeWidth={1.7} />, label: "Message all",
            run: () => { onClose(); router.push("/app/messages/team"); },
          },
          { icon: <UserPlus size={17} strokeWidth={1.7} />, label: "Add attendee", run: () => setAddOpen(true) },
          { icon: <Ban size={17} strokeWidth={1.7} />, label: "Cancel class", run: () => setCancelOpen(true) },
        ].map((a) => (
          <motion.button
            key={a.label}
            whileTap={{ scale: 0.96 }}
            onClick={a.run}
            disabled={cancelled && a.label !== "Message all"}
            className="flex flex-col items-center gap-2 rounded-2xl bg-canvas px-2 py-4 text-[12px] font-medium text-navy disabled:opacity-40"
          >
            {a.icon}
            {a.label}
          </motion.button>
        ))}
      </div>

      <p className="flex items-center gap-1.5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <ListChecks size={12} /> Agenda
      </p>
      <div className="overflow-hidden rounded-2xl border border-border">
        {m.agenda.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
              {i + 1}
            </span>
            <span className="text-[14px] text-navy">{step}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-canvas px-4 py-3.5 text-[12px] leading-snug text-secondary">
        <Wrench size={13} className="mt-0.5 shrink-0" strokeWidth={1.75} />
        {m.note}
      </p>

      <div className="sticky bottom-0 -mx-6 mt-4 bg-white px-6 pb-1 pt-3">
        <DarkButton onClick={cancelled ? undefined : onClose} disabled={cancelled}>
          {!cancelled && <Play size={15} />}
          {cancelled ? "Class cancelled" : "Start class"}
        </DarkButton>
      </div>
    </Sheet>

    {/* Add attendee */}
    <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add attendee" sub={`${m.capacity - booked} seats left`}>
      {clientRows
        .filter((c) => !attendees.some((a) => a.name === c.name) && !c.tags.includes("Blocked"))
        .slice(0, 5)
        .map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setExtra((x) => [
                ...x,
                { id: c.id, initials: initialsOf(c.name), name: c.name, status: "Added · collect payment", warn: true },
              ]);
              setExpanded(true);
              setAddOpen(false);
            }}
            className="flex w-full items-center gap-3 border-b border-border py-3.5 text-left last:border-0"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
              {initialsOf(c.name)}
            </span>
            <span className="flex-1 text-[14px] font-semibold text-navy">{c.name}</span>
            <UserPlus size={15} className="text-secondary" />
          </button>
        ))}
    </Sheet>

    {/* Cancel class confirm */}
    <Sheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this class?">
      <p className="pb-5 text-[14px] leading-relaxed text-secondary">
        {m.name} · {m.time} · {booked} attendees. Everyone will be notified and refunded
        automatically.
      </p>
      <DarkButton
        onClick={() => {
          onCancelClass();
          setCancelOpen(false);
        }}
      >
        Cancel class · notify {booked}
      </DarkButton>
      <div className="pt-3">
        <GhostButton onClick={() => setCancelOpen(false)}>Keep it</GhostButton>
      </div>
    </Sheet>
    </>
  );
}

const calendarLayouts = [
  { label: "Day", days: 1 },
  { label: "2 days", days: 2 },
  { label: "3 days", days: 3 },
  { label: "Week", days: 7 },
];

function SettingsSheet({
  open,
  onClose,
  calDays,
  onCalDays,
}: {
  open: boolean;
  onClose: () => void;
  calDays: number;
  onCalDays: (n: number) => void;
}) {
  const [fmt, setFmt] = useState<"12h" | "24h">("12h");
  const dots: Record<number, "g" | "a" | "r"> = {
    1: "r", 2: "g", 3: "a", 5: "g", 6: "g", 7: "r", 8: "a", 9: "g", 10: "g", 11: "g",
    12: "a", 13: "r", 14: "a", 15: "a", 16: "r", 17: "g", 18: "r", 19: "r", 20: "r",
    21: "r", 22: "r", 23: "g", 24: "r", 25: "r", 26: "r", 27: "r", 28: "a", 29: "r",
    30: "g", 31: "a",
  };
  return (
    <Sheet open={open} onClose={onClose} title="Calendar Settings">
      <div className="flex items-center justify-between pb-4">
        <button className="flex items-center gap-2 rounded-full bg-canvas px-4 py-2.5 text-[13px] font-medium text-navy">
          <SlidersHorizontal size={14} strokeWidth={1.75} />
          Filter
          <ChevronDown size={13} className="text-muted" />
        </button>
        <div className="flex rounded-full bg-canvas p-1">
          {(["12h", "24h"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFmt(f)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-semibold ${
                fmt === f ? "bg-white text-navy shadow-[0_1px_3px_rgba(15,26,46,0.12)]" : "text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Calendar layout</p>
      <div className="flex gap-2 pb-5">
        {calendarLayouts.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => onCalDays(l.days)}
            className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold transition-colors ${
              calDays === l.days ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Jump to date</p>
      <MiniCalendar selected={10} onSelect={() => onClose()} dots={dots} />
      <div className="flex items-center justify-center gap-4 pt-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Filling up</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Fully booked</span>
      </div>
    </Sheet>
  );
}

const dayLabels = [
  "Monday 2 March",
  "Tuesday 3 March",
  "Wednesday 4 March",
  "Thursday 5 March",
  "Friday 6 March",
];
const TODAY_IDX = 1; // the schedule demo's "today" — Tuesday 3 March

export default function SchedulePage() {
  const [view, setView] = useState("My Day");
  const [classOpen, setClassOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [classCancelled, setClassCancelled] = useState(false);
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const [calDays, setCalDays] = useState(3);

  return (
    <div className="flex min-h-full flex-col bg-fog">
      <div className="bg-white">
        <AppHeader title="Schedule" />
        <div className="flex items-center gap-2.5 px-4 pb-3">
          <Segmented options={["My Day", "Calendar", "Team"]} value={view} onChange={setView} />
          <button
            type="button"
            aria-label="Calendar settings"
            onClick={() => setSettingsOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <CalendarCog size={17} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-border px-4 pb-3">
          <button
            aria-label="Previous day"
            onClick={() => setDayIdx((d) => Math.max(0, d - 1))}
            className="p-1 text-muted disabled:opacity-30"
            disabled={dayIdx === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={dayIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="text-[15px] font-bold text-navy"
            >
              {dayLabels[dayIdx]}
            </motion.span>
          </AnimatePresence>
          <button
            aria-label="Next day"
            onClick={() => setDayIdx((d) => Math.min(dayLabels.length - 1, d + 1))}
            className="p-1 text-muted disabled:opacity-30"
            disabled={dayIdx === dayLabels.length - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {view === "My Day" && <MyDayView />}
          {view === "Calendar" && <CalendarGridView days={calDays} />}
          {view === "Team" && <TeamView onOpenClass={() => setClassOpen(true)} classCancelled={classCancelled} />}
        </motion.div>
      </AnimatePresence>

      {/* Floating "back to today" pill — appears once you step off today */}
      <AnimatePresence>
        {dayIdx !== TODAY_IDX && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[78px] z-40 flex justify-center">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setDayIdx(TODAY_IDX)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-[#14181F] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_20px_rgba(15,26,46,0.35)]"
            >
              <CalendarDays size={13} strokeWidth={2} />
              Back to today
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <ClassSheet
        open={classOpen}
        onClose={() => setClassOpen(false)}
        cancelled={classCancelled}
        onCancelClass={() => setClassCancelled(true)}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        calDays={calDays}
        onCalDays={(n) => {
          setCalDays(n);
          setView("Calendar");
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
