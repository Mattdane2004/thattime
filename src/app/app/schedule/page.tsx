"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Coffee, CalendarCog, SlidersHorizontal,
  MessageSquare, UserPlus, Ban, Play, ChevronDown, Wrench, ListChecks,
  CalendarDays, X, Clock, Check, Calendar as CalendarIcon, Users,
  Lock, Layers, Pencil, Settings2, CalendarClock, Tag as TagIcon,
} from "lucide-react";
import { AppHeader, Segmented, Sheet, DarkButton, GhostButton, StatusPill, MiniCalendar } from "@/components/ui";
import { UpNextCard, GapSlot } from "@/components/app/UpNextCard";
import { useAppStore } from "@/lib/store/appStore";
import {
  myDayAgenda, threeDayGrid, teamColumns, masterclass, clientRows, services,
  serviceCategories, bundleBookings, type GridBlock,
} from "@/lib/data/product";
import { defaultCategories } from "@/lib/tokens/categories";

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

// Time formatting honours the 12h/24h setting everywhere on this page.
const to12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m ?? 0).padStart(2, "0")} ${ap}`;
};
const fmtT = (t: string | undefined, fmt: string) => (!t ? "" : fmt === "12h" ? to12(t) : t);
const fmtHour = (h: number, fmt: string) =>
  fmt === "12h" ? (h < 12 ? `${h} AM` : `${h === 12 ? 12 : h - 12} PM`) : `${String(h).padStart(2, "0")}:00`;
const catOf = (svc?: string) => services.find((s) => s.name === svc)?.category ?? "Other";
const catColor = (svc?: string) => defaultCategories.find((c) => c.name === catOf(svc))?.color ?? "#080706";

function shadeClass(shade: GridBlock["shade"]) {
  switch (shade) {
    case "dark":
      return "bg-fg-primary text-white";
    case "mid":
      return "bg-[#5C5753] text-white";
    case "muted":
      return "bg-canvas text-muted";
    case "outline":
      return "border-2 border-fg-primary bg-white text-navy";
    default:
      return "bg-[#F0E6DC] text-secondary";
  }
}

type GBlock = GridBlock & { price?: string };
type Density = "full" | "compact" | "minimal";

const isAttentionStatus = (s?: string) =>
  s === "No-show" || s === "Cancelled" || s === "Unconfirmed";

// Tap routing for any calendar block — a class opens the class sheet, a bundle
// opens the booking sheet in bundle mode, a break/blocked block opens the
// blocked-time setup sheet for editing, everything else is an appointment.
function useBlockTap() {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const setBlockEdit = useAppStore((s) => s.setBlockEdit);
  return (b: GBlock, staff: string, onOpenClass?: () => void) => {
    if (b.status === "Class") { onOpenClass?.(); return; }
    if (b.kind === "bundle" && b.bundleId && bundleBookings[b.bundleId]) {
      const bun = bundleBookings[b.bundleId];
      setApptSheet({
        client: bun.client, initials: bun.initials, service: bun.name, staff: bun.staff,
        time: hhmm(b.start), duration: spanLabel(b.span), status: "Confirmed",
        kind: "bundle", bundleId: b.bundleId,
      });
      return;
    }
    if (b.kind === "break" || b.kind === "blocked" || isBreakBlock(b.name)) {
      setBlockEdit({
        title: b.name,
        blockType: b.kind === "blocked" ? "custom" : "break",
        time: hhmm(b.start),
        duration: spanLabel(b.span),
      });
      setQuickAction("block");
      return;
    }
    setApptSheet({
      client: b.name, initials: initialsOf(b.name), service: b.service ?? "Appointment",
      staff, time: hhmm(b.start), duration: b.price ?? spanLabel(b.span), status: b.status ?? "Confirmed",
    });
  };
}

// Systematically scales the information shown per the available space: tall/wide
// blocks (day view) get the full picture, narrow ones (week, busy team views) the
// essentials — a category colour bar + name + an attention dot.
function CalendarBlock({
  block, density, top, heightPx, shade, status, delay, onTap,
}: {
  block: GBlock;
  density: Density;
  top: number;
  heightPx: number;
  shade: GridBlock["shade"];
  status?: string;
  delay: number;
  onTap: () => void;
}) {
  let d: Density = density;
  if (heightPx < 38) d = "minimal";
  else if (heightPx < 60 && d === "full") d = "compact";

  const isBreak = block.kind === "break" || isBreakBlock(block.name);
  const isBlocked = block.kind === "blocked";
  const isBundle = block.kind === "bundle";
  const showAccent = !isBreak && !isBlocked;
  const accent = catColor(block.service);
  const icon = isBreak ? <Coffee size={10} className="mr-1 inline shrink-0" />
    : isBlocked ? <Lock size={10} className="mr-1 inline shrink-0" />
      : isBundle ? <Layers size={10} className="mr-1 inline shrink-0" /> : null;
  const attention = !!status && isAttentionStatus(status);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={(e) => { e.stopPropagation(); onTap(); }}
      className={`absolute inset-x-1 overflow-hidden rounded-xl text-left ${shadeClass(shade)} ${d === "minimal" ? "px-1.5 py-1" : "p-2"}`}
      style={{ top, height: heightPx }}
    >
      {showAccent && <span className="absolute inset-y-1 left-1 w-[3px] rounded-full" style={{ background: accent }} />}
      {/* Status is noise when it's the expected "Confirmed" — only ever flag the
          exceptions, and as a corner dot so it never steals the name's width. */}
      {attention && (
        <span
          className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${status === "Unconfirmed" ? "bg-warning" : "bg-danger"}`}
          title={status}
        />
      )}
      <div className={showAccent ? "pl-2.5" : ""}>
        <p className={`truncate text-[11px] font-bold leading-tight ${attention ? "pr-3" : ""}`}>{icon}{block.name}</p>
        {d !== "minimal" && block.service && heightPx > 40 && (
          <p className="truncate pt-0.5 text-[10px] leading-tight opacity-75">{block.service}</p>
        )}
        {d === "full" && block.price && <p className="truncate pt-0.5 text-[9px] opacity-60">{block.price}</p>}
      </div>
    </motion.button>
  );
}

function MyDayView({ filterCat, timeFmt }: { filterCat: string; timeFmt: string }) {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const customAppts = useAppStore((s) => s.customAppts);
  return (
    <div className="flex flex-col gap-2.5 px-4 pb-6 pt-4">
      {customAppts.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() =>
            setApptSheet({
              client: a.client,
              initials: initialsOf(a.client),
              service: a.service,
              staff: a.staff,
              time: a.time ?? "TBC",
              duration: a.day ? `${a.day} Mar` : "today",
              status: "Confirmed",
            })
          }
          className="flex w-full items-center gap-3 rounded-2xl border border-fg-primary/20 bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(8,7,6,0.04)]"
        >
          <span className="w-12 shrink-0">
            <span className="block text-[14px] font-bold text-navy">{fmtT(a.time ?? "", timeFmt)}</span>
            <span className="block text-[11px] text-muted">{a.day ? `${a.day} Mar` : "today"}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-navy">{a.client}</span>
            <span className="block truncate text-[12px] text-muted">{a.service}</span>
          </span>
          <StatusPill tone="amber">New</StatusPill>
        </button>
      ))}
      {myDayAgenda.map((row) => {
        if (row.kind === "appt" && filterCat !== "All" && catOf(row.service) !== filterCat) return null;
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
              <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-[#F0E6DC] px-4 py-3">
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
                className={`flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(8,7,6,0.04)] ${
                  row.past ? "opacity-50" : ""
                }`}
              >
                <span className="w-12 shrink-0">
                  <span className="block text-[14px] font-bold text-navy">{fmtT(row.time, timeFmt)}</span>
                  <span className="block text-[11px] text-muted">{fmtT(row.end, timeFmt)}</span>
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

function CalendarGridView({ days, filterCat, timeFmt }: { days: number; filterCat: string; timeFmt: string }) {
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const openBlock = useBlockTap();
  const visibleDays = threeDayGrid.slice(0, days);
  const density: Density = days === 1 ? "full" : days <= 3 ? "compact" : "minimal";
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
              {fmtHour(h, timeFmt)}
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
            {d.blocks.map((b, i) => {
              const special = b.kind || isBreakBlock(b.name);
              if (!special && filterCat !== "All" && catOf(b.service) !== filterCat) return null;
              return (
                <CalendarBlock
                  key={i}
                  block={b}
                  density={density}
                  top={(b.start - 8) * HOUR_PX + 8}
                  heightPx={Math.max(30, b.span * HOUR_PX - 4)}
                  shade={b.shade}
                  status={b.status}
                  delay={0.03 * i}
                  onTap={() => openBlock(b, "Emma S.")}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamView({ onOpenClass, classCancelled, timeFmt, selectedStaff }: { onOpenClass: () => void; classCancelled: boolean; timeFmt: string; selectedStaff: string[] }) {
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const openBlock = useBlockTap();
  const visibleColumns = teamColumns.filter((c) => selectedStaff.includes(c.id));
  const density: Density = visibleColumns.length <= 1 ? "full" : visibleColumns.length <= 3 ? "compact" : "minimal";

  if (visibleColumns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <Users size={22} strokeWidth={1.6} className="text-muted" />
        <p className="text-[14px] font-semibold text-navy">No team members selected</p>
        <p className="text-[12px] text-muted">Open settings and pick who to show.</p>
      </div>
    );
  }

  return (
    <div className="px-2 pb-6 pt-2">
      <div className="grid" style={{ gridTemplateColumns: `34px repeat(${visibleColumns.length}, 1fr)` }}>
        <span className="self-end pb-2 text-[10px] text-muted">Time</span>
        {visibleColumns.map((c) => (
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
              {fmtHour(h, timeFmt)}
            </span>
          ))}
        </div>
        {visibleColumns.map((c, col) => (
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
                <CalendarBlock
                  key={i}
                  block={b}
                  density={density}
                  top={(b.start - 9) * HOUR_PX + 8}
                  heightPx={Math.max(30, b.span * HOUR_PX - 4)}
                  shade={shade}
                  status={status}
                  delay={0.03 * i}
                  onTap={() => openBlock(b, c.name, onOpenClass)}
                />
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
  // Editing a class hands off to its offer dashboard (the single source for
  // schedule, pricing, capacity and the rest).
  const manage = () => { onClose(); router.push(`/app/services/${m.offerId}`); };

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          key="class-page"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          className="absolute inset-0 z-[80] flex flex-col bg-fog"
        >
          {/* ── Header: what the class is and where it stands ── */}
          <div className="shrink-0 bg-white px-4 pb-4 pt-4">
            <div className="flex items-start justify-between">
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[18px] font-bold text-navy">{m.name}</span>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-navy">Class</span>
                </span>
                <span className="block pt-0.5 text-[12px] text-muted">{m.sub}</span>
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Manage class"
                  onClick={() => manage()}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3 text-[12px] font-semibold text-navy"
                >
                  <Settings2 size={14} strokeWidth={1.9} /> Manage
                </button>
                <button type="button" aria-label="Close class" onClick={onClose} className="-mr-1 p-2 text-navy">
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-navy">
                <span>{m.time}</span>
                <span className="text-muted">·</span>
                <span>{m.staff}</span>
                <span className="text-muted">·</span>
                <span>{m.location}</span>
              </span>
              <StatusPill tone={cancelled ? "danger" : "light"}>{cancelled ? "Cancelled" : "Scheduled"}</StatusPill>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">

      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className="h-full rounded-full bg-fg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(booked / m.capacity) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="pt-1.5 text-right text-[11px] text-muted">
        {booked}/{m.capacity} · {m.capacity - booked} left
      </p>

      {/* ── Manage the class — hands off to the class set-up (offer dashboard) ── */}
      <p className="px-1 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Manage class</p>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
        {[
          { icon: <CalendarClock size={16} strokeWidth={1.8} />, t: "Schedule & times", s: m.time },
          { icon: <TagIcon size={16} strokeWidth={1.8} />, t: "Pricing & deposit", s: m.sub },
          { icon: <Users size={16} strokeWidth={1.8} />, t: "Capacity & participants", s: `${m.capacity} seats` },
          { icon: <Pencil size={16} strokeWidth={1.8} />, t: "Class details", s: "Name, category, agenda" },
        ].map((r, i) => (
          <button
            key={r.t}
            type="button"
            onClick={manage}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left ${i > 0 ? "border-t border-border" : ""}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-secondary">{r.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-navy">{r.t}</span>
              <span className="block truncate text-[12px] text-muted">{r.s}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </button>
        ))}
      </div>

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
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-fg-primary text-[9px] font-bold text-white">
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
                      arrived[a.id] ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
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
            run: () => { onClose(); router.push("/app/messages"); },
          },
          { icon: <UserPlus size={17} strokeWidth={1.7} />, label: "Add attendee", run: () => setAddOpen(true) },
          { icon: <Ban size={17} strokeWidth={1.7} />, label: "Cancel class", run: () => setCancelOpen(true) },
        ].map((a) => (
          <motion.button
            key={a.label}
            whileTap={{ scale: 0.96 }}
            onClick={a.run}
            disabled={cancelled && a.label !== "Message all"}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-[12px] font-medium text-navy shadow-[0_1px_4px_rgba(8,7,6,0.04)] disabled:opacity-40"
          >
            {a.icon}
            {a.label}
          </motion.button>
        ))}
      </div>

      <p className="flex items-center gap-1.5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <ListChecks size={12} /> Agenda
      </p>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
        {m.agenda.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
              {i + 1}
            </span>
            <span className="text-[14px] text-navy">{step}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white px-4 py-3.5 text-[12px] leading-snug text-secondary shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
        <Wrench size={13} className="mt-0.5 shrink-0" strokeWidth={1.75} />
        {m.note}
      </p>

          </div>

          <div className="shrink-0 border-t border-border bg-white px-5 pb-6 pt-3">
            <DarkButton onClick={cancelled ? undefined : onClose} disabled={cancelled}>
              {!cancelled && <Play size={15} />}
              {cancelled ? "Class cancelled" : "Start class"}
            </DarkButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

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

// Calendar-view options (Calendar tab only) — matches the Figma cards.
const calendarViews = [
  { label: "Day", days: 1 },
  { label: "3 Day", days: 3 },
  { label: "Week", days: 7 },
];

const SECTION_LABEL = "pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted";

// 12h / 24h segmented toggle (shared by every view).
function TimeFormatToggle({ timeFmt, onTimeFmt }: { timeFmt: "12h" | "24h"; onTimeFmt: (f: "12h" | "24h") => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <Clock size={15} strokeWidth={1.75} className="text-muted" />
      <div className="flex rounded-full bg-canvas p-1">
        {(["12h", "24h"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onTimeFmt(f)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              timeFmt === f ? "bg-white text-navy shadow-sm" : "text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

// Filter dropdown — a selection panel (not pills), opens inline below the row.
function FilterDropdown({ filterCat, onFilterCat }: { filterCat: string; onFilterCat: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = filterCat !== "All";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
          active ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
        }`}
      >
        <SlidersHorizontal size={14} strokeWidth={1.9} />
        {active ? filterCat : "Filter"}
        <ChevronDown size={14} strokeWidth={2} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute left-0 top-[calc(100%+8px)] z-20 max-h-60 w-56 overflow-y-auto rounded-2xl border border-border bg-white py-1 shadow-lg">
            {serviceCategories.map((c) => {
              const sel = filterCat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onFilterCat(c); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] ${sel ? "font-semibold text-navy" : "text-secondary"}`}
                >
                  {c === "All" ? "All appointments" : c}
                  {sel && <Check size={15} strokeWidth={2.5} className="text-navy" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const JUMP_DOTS: Record<number, "g" | "a" | "r"> = {
  1: "r", 2: "g", 3: "a", 5: "g", 6: "g", 7: "r", 8: "a", 9: "g", 10: "g", 11: "g",
  12: "a", 13: "r", 14: "a", 15: "a", 16: "r", 17: "g", 18: "r", 19: "r", 20: "r",
  21: "r", 22: "r", 23: "g", 24: "r", 25: "r", 26: "r", 27: "r", 28: "a", 29: "r",
  30: "g", 31: "a",
};

/**
 * Calendar settings — one sheet, view-specific content. Every view shares the
 * Filter dropdown + 12h/24h toggle + jump-to-date; Calendar adds a view-layout
 * selector and Team adds a team-member filter (matches the three Figma designs).
 */
function SettingsSheet({
  open,
  onClose,
  view,
  calDays,
  onCalDays,
  timeFmt,
  onTimeFmt,
  filterCat,
  onFilterCat,
  selectedStaff,
  onToggleStaff,
  onSelectAllStaff,
  selectedDay,
  onJumpDate,
}: {
  open: boolean;
  onClose: () => void;
  view: string;
  calDays: number;
  onCalDays: (n: number) => void;
  timeFmt: "12h" | "24h";
  onTimeFmt: (f: "12h" | "24h") => void;
  filterCat: string;
  onFilterCat: (c: string) => void;
  selectedStaff: string[];
  onToggleStaff: (id: string) => void;
  onSelectAllStaff: () => void;
  selectedDay: number;
  onJumpDate: (d: number) => void;
}) {
  const allSelected = selectedStaff.length === teamColumns.length;
  return (
    <Sheet open={open} onClose={onClose} title="Calendar Settings">
      {/* Calendar view layout — Calendar tab only */}
      {view === "Calendar" && (
        <>
          <p className={SECTION_LABEL}>Calendar view</p>
          <div className="grid grid-cols-3 gap-2.5 pb-5">
            {calendarViews.map((l) => {
              const sel = calDays === l.days;
              return (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => onCalDays(l.days)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border py-4 text-[13px] font-semibold transition-colors ${
                    sel ? "border-2 border-fg-primary text-navy" : "border border-border text-secondary"
                  }`}
                >
                  <CalendarIcon size={20} strokeWidth={1.75} />
                  {l.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Team filter — Team tab only */}
      {view === "Team" && (
        <>
          <div className="flex items-center justify-between pb-2">
            <p className={`${SECTION_LABEL} pb-0`}>
              Team view <span className="ml-1 normal-case tracking-normal text-secondary">{selectedStaff.length}/{teamColumns.length} selected</span>
            </p>
            <button
              type="button"
              onClick={onSelectAllStaff}
              className="rounded-full bg-canvas px-3 py-1.5 text-[12px] font-semibold text-navy"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="-mx-6 overflow-x-auto pb-5 [scrollbar-width:none]">
            <div className="flex w-max gap-2.5 px-6">
              {teamColumns.map((c) => {
                const sel = selectedStaff.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggleStaff(c.id)}
                    className={`flex w-[112px] shrink-0 flex-col items-center gap-1.5 rounded-2xl py-4 transition-colors ${
                      sel ? "border-2 border-fg-primary bg-white" : "border border-border bg-canvas"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[12px] font-bold text-secondary">
                      {c.initials}
                    </span>
                    <span className="text-[13px] font-semibold text-navy">{c.name}</span>
                    <span className="text-[11px] text-muted">{c.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Filter + time format — shared by every view */}
      <div className="flex items-center justify-between pb-5">
        <FilterDropdown filterCat={filterCat} onFilterCat={onFilterCat} />
        <TimeFormatToggle timeFmt={timeFmt} onTimeFmt={onTimeFmt} />
      </div>

      <p className={SECTION_LABEL}>Jump to date</p>
      <MiniCalendar selected={selectedDay} onSelect={(d) => onJumpDate(d)} dots={JUMP_DOTS} />
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
  const [timeFmt, setTimeFmt] = useState<"12h" | "24h">("24h");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState<string[]>(teamColumns.map((c) => c.id));

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
          {filterCat !== "All" && (
            <button
              type="button"
              onClick={() => setFilterCat("All")}
              className="mx-4 mt-3 flex items-center gap-2 rounded-full border border-fg-primary bg-fg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white"
            >
              <SlidersHorizontal size={11} strokeWidth={2} />
              Showing {filterCat} only · clear
            </button>
          )}
          {view === "My Day" && <MyDayView filterCat={filterCat} timeFmt={timeFmt} />}
          {view === "Calendar" && <CalendarGridView days={calDays} filterCat={filterCat} timeFmt={timeFmt} />}
          {view === "Team" && <TeamView onOpenClass={() => setClassOpen(true)} classCancelled={classCancelled} timeFmt={timeFmt} selectedStaff={selectedStaff} />}
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
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-fg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_20px_rgba(8,7,6,0.35)]"
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
        view={view}
        calDays={calDays}
        onCalDays={setCalDays}
        timeFmt={timeFmt}
        onTimeFmt={setTimeFmt}
        filterCat={filterCat}
        onFilterCat={setFilterCat}
        selectedStaff={selectedStaff}
        onToggleStaff={(id) =>
          setSelectedStaff((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
        }
        onSelectAllStaff={() =>
          setSelectedStaff((s) => (s.length === teamColumns.length ? [] : teamColumns.map((c) => c.id)))
        }
        selectedDay={dayIdx + 2}
        onJumpDate={(d) => {
          setDayIdx(Math.min(Math.max(0, d - 2), dayLabels.length - 1));
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
