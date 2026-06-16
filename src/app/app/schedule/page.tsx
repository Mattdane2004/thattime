"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Coffee, CalendarCog, SlidersHorizontal,
  MessageSquare, UserPlus, Ban, Play, ChevronDown, Wrench, ListChecks,
  CalendarDays, X, Clock, Check, Calendar as CalendarIcon, Users,
  Lock, Layers, Pencil, Settings2, CalendarClock, Tag as TagIcon,
  Search, Hourglass, Moon, Scissors,
} from "lucide-react";
import { AppHeader, Segmented, Sheet, DarkButton, GhostButton, StatusPill, MiniCalendar, ToggleRow } from "@/components/ui";
import { UpNextCard, GapSlot } from "@/components/app/UpNextCard";
import { useAppStore } from "@/lib/store/appStore";
import {
  myDayAgenda, threeDayGrid, teamColumns, masterclass, clientRows, services,
  serviceCategories, bundleBookings, type GridBlock, type TeamColumn, type WeekBooking,
} from "@/lib/data/product";
import { defaultCategories } from "@/lib/tokens/categories";

// Schedule — My Day agenda, 3-day calendar grid, and team columns, with the
// class sheet (attendee check-in) and calendar settings (jump-to-date).
// Tapping any appointment row/block opens the shared appointment sheet.

// ── Day geometry: the full 24h is rendered, working hours at full height and
// out-of-hours condensed, so you can scroll past either end of the shift. ──
const WORK_START = 8;
const WORK_END = 18;
const FULL_PX = 64; // px per working hour (before zoom)
const OOH_PX = 20; // px per out-of-hours hour (condensed)
const ALL_HOURS = Array.from({ length: 24 }, (_, h) => h);
const isWorkHour = (h: number) => h >= WORK_START && h < WORK_END;
const hourPxAt = (h: number, scale: number) => (isWorkHour(h) ? FULL_PX : OOH_PX) * scale;
// Top offset (px) for a decimal hour — sums variable row heights, plus 8px pad.
function hourTop(h: number, scale: number) {
  let y = 8;
  const whole = Math.floor(h);
  for (let hr = 0; hr < whole; hr++) y += hourPxAt(hr, scale);
  return y + (h - whole) * hourPxAt(whole, scale);
}
const spanHeight = (start: number, span: number, scale: number) => hourTop(start + span, scale) - hourTop(start, scale);
const gridHeight = (scale: number) => hourTop(24, scale) + 8;

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

// ── Calendar filters (settings toggles) ──
export interface CalFilters { showCancelled: boolean; showNoShows: boolean; showOutstanding: boolean; }
const blockVisible = (b: GBlock, f: CalFilters) => {
  if (!f.showNoShows && b.status === "No-show") return false;
  if (!f.showCancelled && b.status === "Cancelled") return false;
  if (!f.showOutstanding && b.outstanding) return false;
  return true;
};
// Multi-select category filter: an empty selection means "all categories".
const catMatch = (svc: string | undefined, cats: string[]) => cats.length === 0 || cats.includes(catOf(svc));

// ── Pinch / trackpad zoom for the calendar grid (Google/Apple-calendar style) ──
// Two-finger pinch on touch; ctrl/⌘ + wheel (trackpad pinch) on desktop.
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
function usePinchZoom() {
  const [zoom, setZoom] = useState(1);
  const ref = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ d: number; z: number } | null>(null);
  const dist = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  // Trackpad pinch arrives as ctrl/⌘ + wheel. React's onWheel is passive (can't
  // preventDefault), so attach a native non-passive listener to stop the page
  // from zooming at the same time.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => clampZoom(z - e.deltaY * 0.01));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  const handlers = {
    onTouchStart: (e: React.TouchEvent) => { if (e.touches.length === 2) start.current = { d: dist(e.touches), z: zoom }; },
    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length === 2 && start.current) setZoom(clampZoom(start.current.z * (dist(e.touches) / start.current.d)));
    },
    onTouchEnd: () => { start.current = null; },
  };
  return { zoom, ref, handlers };
}

// Tap routing for any calendar block — a class opens the class sheet, a bundle
// opens the booking sheet in bundle mode, a break/blocked block opens the
// blocked-time setup sheet for editing, everything else is an appointment.
function useBlockTap() {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const setBlockEdit = useAppStore((s) => s.setBlockEdit);
  return (b: GBlock, staff: string, onOpenClass?: () => void) => {
    if (b.kind === "processing") return; // processing time isn't a bookable/openable block
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
  const isProcessing = block.kind === "processing";
  const showAccent = !isBreak && !isBlocked && !isProcessing;
  const accent = catColor(block.service);
  const icon = isProcessing ? <Hourglass size={10} className="mr-1 inline shrink-0" />
    : isBreak ? <Coffee size={10} className="mr-1 inline shrink-0" />
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
      className={`absolute inset-x-1 overflow-hidden rounded-xl text-left ${
        isProcessing ? "border border-dashed border-border bg-canvas/60 text-muted" : shadeClass(shade)
      } ${d === "minimal" ? "px-1.5 py-1" : "p-2"} ${isProcessing ? "cursor-default" : ""}`}
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
      {d === "minimal" ? (
        // Week / busy columns: a service icon + the client's initials, so nothing
        // trails off the narrow card.
        <div className={`flex items-center gap-1 ${showAccent ? "pl-2" : ""}`}>
          <span className="shrink-0">{showAccent ? <Scissors size={9} className="opacity-70" /> : icon}</span>
          <span className="truncate text-[10px] font-bold leading-tight">
            {showAccent ? initialsOf(block.name) : block.name}
          </span>
        </div>
      ) : (
        // Day / 3-day: full text, anchored top-left.
        <div className={showAccent ? "pl-2.5" : ""}>
          <p className={`truncate text-[11px] font-bold leading-tight ${attention ? "pr-3" : ""}`}>{icon}{block.name}</p>
          {block.service && heightPx > 40 && (
            <p className="truncate pt-0.5 text-[10px] leading-tight opacity-75">{block.service}</p>
          )}
          {d === "full" && block.price && <p className="truncate pt-0.5 text-[9px] opacity-60">{block.price}</p>}
        </div>
      )}
    </motion.button>
  );
}

// Shared day-column chrome: condensed out-of-hours bands + hour lines.
function DayColumnChrome({ zoom, showLabel }: { zoom: number; showLabel?: boolean }) {
  const bands = [
    { top: hourTop(0, zoom), height: hourTop(WORK_START, zoom) - hourTop(0, zoom) },
    { top: hourTop(WORK_END, zoom), height: hourTop(24, zoom) - hourTop(WORK_END, zoom) },
  ];
  return (
    <>
      {bands.map((b, i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-x-0 flex items-start justify-center bg-canvas/50"
          style={{ top: b.top, height: b.height }}
        >
          {showLabel && b.height > 26 && (
            <span className="pt-1 text-[8px] font-semibold uppercase tracking-wide text-muted/60">Out of hours</span>
          )}
        </div>
      ))}
      {ALL_HOURS.map((h) => (
        <span
          key={h}
          className={`pointer-events-none absolute inset-x-0 border-t ${isWorkHour(h) ? "border-border" : "border-border/50"}`}
          style={{ top: hourTop(h, zoom) }}
        />
      ))}
    </>
  );
}

// Auto-scroll the grid so the working day is in view on mount; out-of-hours sits
// above/below and is reachable by scrolling.
function useScrollToWork() {
  const anchor = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    anchor.current?.scrollIntoView({ block: "start" });
  }, []);
  return anchor;
}

function MyDayView({ filterCats, timeFmt }: { filterCats: string[]; timeFmt: string }) {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const setQuickAction = useAppStore((s) => s.setQuickAction);
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
              duration: a.duration ?? "—",
              status: a.outOfHours ? "Out of hours" : "Confirmed",
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
            <span className="block truncate text-[12px] text-muted">
              {a.service}{a.duration ? ` · ${a.duration}` : ""}
            </span>
          </span>
          <StatusPill tone="amber">{a.outOfHours ? "OOH" : "New"}</StatusPill>
        </button>
      ))}
      {myDayAgenda.map((row) => {
        if (row.kind === "appt" && !catMatch(row.service, filterCats)) return null;
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

      {/* Out of hours — condensed; you can still take an after-hours booking */}
      <div className="mt-1 rounded-2xl bg-canvas/50 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          <Moon size={11} strokeWidth={1.9} /> Out of hours
        </p>
        <button
          type="button"
          onClick={() => setQuickAction("choose")}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-white/60 px-3 py-2 text-left"
        >
          <span className="text-[12px] font-semibold text-navy">{fmtT("18:00", timeFmt)} – {fmtT("21:00", timeFmt)}</span>
          <span className="text-[11px] text-muted">Tap to add an after-hours booking</span>
        </button>
      </div>
    </div>
  );
}

function CalendarGridView({ days, filterCats, timeFmt, filters, headerTop }: { days: number; filterCats: string[]; timeFmt: string; filters: CalFilters; headerTop: number }) {
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const openBlock = useBlockTap();
  const { zoom, ref, handlers } = usePinchZoom();
  const workAnchor = useScrollToWork();
  const visibleDays = threeDayGrid.slice(0, days);
  const density: Density = days === 1 ? "full" : days <= 3 ? "compact" : "minimal";
  const H = gridHeight(zoom);
  return (
    <div ref={ref} className="px-2 pb-6 pt-2" style={{ touchAction: "pan-y" }} {...handlers}>
      <div className="grid" style={{ gridTemplateColumns: `34px repeat(${days}, 1fr)` }}>
        <span className="sticky z-20 bg-fog" style={{ top: headerTop }} />
        {visibleDays.map((d) => (
          <div key={d.day} className="sticky z-20 border-b border-border bg-fog pb-2 pt-1 text-center" style={{ top: headerTop }}>
            <p className="text-[11px] text-muted">{d.day}</p>
            <p className="text-[14px] font-bold text-navy">{d.date}</p>
          </div>
        ))}
        <div className="relative" style={{ height: H }}>
          {ALL_HOURS.map((h) => (
            <span
              key={h}
              className={`absolute -translate-y-1/2 text-[10px] ${isWorkHour(h) ? "text-muted" : "text-muted/50"}`}
              style={{ top: hourTop(h, zoom) }}
            >
              {fmtHour(h, timeFmt)}
            </span>
          ))}
        </div>
        {visibleDays.map((d, col) => (
          <div
            key={d.day}
            role="button"
            tabIndex={0}
            aria-label={`Add to ${d.day} ${d.date}`}
            onClick={() => setQuickAction("choose")}
            onKeyDown={(e) => e.key === "Enter" && setQuickAction("choose")}
            className="relative cursor-pointer border-l border-border"
            style={{ height: H }}
          >
            <DayColumnChrome zoom={zoom} showLabel={col === 0} />
            {col === 0 && <div ref={workAnchor} className="absolute" style={{ top: hourTop(WORK_START, zoom), scrollMarginTop: headerTop }} />}
            {d.blocks.map((b, i) => {
              const special = b.kind || isBreakBlock(b.name);
              if (!special && !catMatch(b.service, filterCats)) return null;
              if (!blockVisible(b, filters)) return null;
              return (
                <CalendarBlock
                  key={i}
                  block={b}
                  density={density}
                  top={hourTop(b.start, zoom)}
                  heightPx={Math.max(28, spanHeight(b.start, b.span, zoom) - 4)}
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

// Team week overview — a horizontally-scrollable swimlane per staff member with
// the day's bookings as condensed cards. Surfaces who's on/off across the week
// and frees vertical space to read bookings and assign shifts.
const WEEK7 = [
  { label: "Mon", dom: 2 }, { label: "Tue", dom: 3 }, { label: "Wed", dom: 4 },
  { label: "Thu", dom: 5 }, { label: "Fri", dom: 6 }, { label: "Sat", dom: 7 }, { label: "Sun", dom: 8 },
];
// Selectable start/end times for the shift editor (06:00–22:00, half-hourly).
const TIME_OPTS = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 22; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();
type DayPlan = { on: boolean; start: string; end: string };
const defaultDayPlan = (): DayPlan[] => WEEK7.map((_, i) => ({ on: i < 5, start: "09:00", end: "17:00" }));

// The left identity column stays put while days scroll — opaque bg + a right
// edge so booking cards never show through behind it. z-20 keeps it below the
// sticky page header (z-30) so it tucks under, not over, when scrolling.
const STICKY_COL = "sticky left-0 z-20 w-[88px] shrink-0 bg-fog shadow-[1px_0_0_var(--colours-border-border)]";

function TeamWeek({ columns, shiftOverrides, onAddStaff }: { columns: TeamColumn[]; shiftOverrides: Record<string, number[]>; onAddStaff: () => void }) {
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const dayOf = (c: TeamColumn, i: number): WeekBooking[] | "off" => {
    const ov = shiftOverrides[c.id];
    if (ov) return ov.includes(i) ? "off" : (Array.isArray(c.weekBookings[i]) ? (c.weekBookings[i] as WeekBooking[]) : []);
    return c.weekBookings[i];
  };
  return (
    <div className="overflow-x-auto pb-4 [scrollbar-width:none]">
      <div className="min-w-[700px]">
        {/* Day header row */}
        <div className="flex border-b border-border">
          <div className={`${STICKY_COL} pb-2`} />
          {WEEK7.map((d) => (
            <div key={d.label} className="min-w-[88px] flex-1 px-1 pb-2 text-center">
              <p className="text-[11px] text-muted">{d.label}</p>
              <p className="text-[13px] font-bold text-navy">{d.dom}</p>
            </div>
          ))}
        </div>
        {/* One row per staff member */}
        {columns.map((c) => {
          const shifts = WEEK7.filter((_, i) => dayOf(c, i) !== "off").length;
          return (
            <div key={c.id} className="flex border-b border-border">
              <div className={`${STICKY_COL} flex flex-col items-center justify-center gap-1 px-1 py-2 text-center`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-secondary">{c.initials}</span>
                <span className="w-full truncate text-[11px] font-semibold leading-tight text-navy">{c.name}</span>
                <span className="text-[9px] leading-tight text-muted">{shifts} {shifts === 1 ? "shift" : "shifts"}</span>
              </div>
              {WEEK7.map((d, i) => {
                const day = dayOf(c, i);
                return (
                  <div key={i} className={`min-h-[128px] min-w-[88px] flex-1 space-y-1 border-l border-border p-1 ${day === "off" ? "bg-canvas/40" : ""}`}>
                    {day === "off" ? (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted/50">Off</span>
                      </div>
                    ) : (
                      day.map((b, k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setApptSheet({ client: b.client, initials: initialsOf(b.client), service: b.service, staff: c.name, time: b.time, duration: "60m", status: "Confirmed" })}
                          className="block w-full rounded-md border-l-2 border-fg-primary/30 bg-white px-1.5 py-1 text-left shadow-[0_1px_3px_rgba(8,7,6,0.05)]"
                        >
                          <span className="block text-[10px] font-bold leading-tight text-navy">{b.time}</span>
                          <span className="block truncate text-[10px] leading-tight text-navy">{b.client}</span>
                          <span className="block truncate text-[9px] leading-tight text-muted">{b.service}</span>
                        </button>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* Add a team member — its own left column */}
        <div className="flex">
          <button type="button" onClick={onAddStaff} className={`${STICKY_COL} flex flex-col items-center justify-center gap-1.5 py-4`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-border text-navy">
              <UserPlus size={15} strokeWidth={1.9} />
            </span>
            <span className="text-center text-[10px] font-semibold leading-tight text-navy">Add team member</span>
          </button>
          {WEEK7.map((d, i) => <div key={i} className="min-w-[88px] flex-1 border-l border-border" />)}
        </div>
      </div>
    </div>
  );
}

function TeamView({ onOpenClass, classCancelled, timeFmt, selectedStaff, filterCats, filters, teamMode, headerTop }: { onOpenClass: () => void; classCancelled: boolean; timeFmt: string; selectedStaff: string[]; filterCats: string[]; filters: CalFilters; teamMode: "day" | "week"; headerTop: number }) {
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const openBlock = useBlockTap();
  const { zoom, ref, handlers } = usePinchZoom();
  const workAnchor = useScrollToWork();
  const [extraStaff, setExtraStaff] = useState<TeamColumn[]>([]);
  const [shiftOverrides, setShiftOverrides] = useState<Record<string, number[]>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [pickStaff, setPickStaff] = useState<string>("__new__"); // "__new__" | staff id
  const [staffDdOpen, setStaffDdOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [dayPlan, setDayPlan] = useState<DayPlan[]>(defaultDayPlan);
  const visibleColumns = teamColumns.filter((c) => selectedStaff.includes(c.id));
  // Week view shows the whole roster — each day self-reports "off", so "off today"
  // shouldn't hide a member who works the rest of the week.
  const weekColumns = [...teamColumns, ...extraStaff];
  const density: Density = visibleColumns.length <= 1 ? "full" : visibleColumns.length <= 3 ? "compact" : "minimal";
  const H = gridHeight(zoom);

  const openAssign = () => { setPickStaff("__new__"); setNewName(""); setDayPlan(defaultDayPlan()); setStaffDdOpen(false); setAssignOpen(true); };
  const pickExisting = (c: TeamColumn) => {
    setPickStaff(c.id);
    setStaffDdOpen(false);
    setDayPlan(WEEK7.map((_, i) => ({ on: c.weekBookings[i] !== "off", start: "09:00", end: "17:00" })));
  };
  const pickedName = weekColumns.find((c) => c.id === pickStaff)?.name ?? "";
  const pickedLabel = pickStaff === "__new__" ? "New team member" : pickedName || "Select a member";
  const offIdx = dayPlan.map((d, i) => (d.on ? -1 : i)).filter((i) => i >= 0);
  const canSave = pickStaff === "__new__" ? newName.trim().length > 0 : !!pickStaff;
  const setDay = (i: number, patch: Partial<DayPlan>) => setDayPlan((p) => p.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const saveShift = () => {
    if (pickStaff === "__new__") {
      const name = newName.trim();
      if (!name) return;
      const firstOn = dayPlan.find((d) => d.on);
      const weekBookings = dayPlan.map((d) => (d.on ? [] : "off")) as (WeekBooking[] | "off")[];
      setExtraStaff((x) => [...x, { id: `new-${x.length}`, initials: initialsOf(name), name, role: "New", hours: firstOn ? `${firstOn.start} – ${firstOn.end}` : "—", weekBookings, blocks: [] }]);
    } else if (pickStaff) {
      setShiftOverrides((o) => ({ ...o, [pickStaff]: offIdx }));
    }
    setAssignOpen(false);
  };

  const shiftSheet = (
    <Sheet open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign shift" sub="Pick a member, then set their days & hours" full>
      {/* Team member selector */}
      <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Team member</p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setStaffDdOpen((o) => !o)}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left"
        >
          <span className="text-[14px] font-semibold text-navy">{pickedLabel}</span>
          <ChevronDown size={16} strokeWidth={2} className={`text-muted transition-transform ${staffDdOpen ? "rotate-180" : ""}`} />
        </button>
        {staffDdOpen && (
          <div className="absolute inset-x-0 top-[52px] z-20 max-h-56 overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg">
            {weekColumns.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickExisting(c)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-navy"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-secondary">{c.initials}</span>
                {c.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPickStaff("__new__"); setStaffDdOpen(false); }}
              className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-[14px] font-semibold text-navy"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border"><UserPlus size={14} /></span>
              New team member
            </button>
          </div>
        )}
      </div>
      {pickStaff === "__new__" && (
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Member name"
          className="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:outline-none"
        />
      )}

      {/* Per-day toggle + hours */}
      <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Days &amp; hours</p>
      <div className="overflow-hidden rounded-2xl border border-border">
        {WEEK7.map((d, i) => (
          <div key={d.label} className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
            <button
              type="button"
              role="switch"
              aria-checked={dayPlan[i].on}
              aria-label={`${d.label} working`}
              onClick={() => setDay(i, { on: !dayPlan[i].on })}
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${dayPlan[i].on ? "bg-fg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dayPlan[i].on ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <span className="w-8 text-[13px] font-semibold text-navy">{d.label}</span>
            {dayPlan[i].on ? (
              <div className="ml-auto flex items-center gap-1.5">
                <select
                  value={dayPlan[i].start}
                  onChange={(e) => setDay(i, { start: e.target.value })}
                  className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px] font-medium text-navy focus:outline-none"
                >
                  {TIME_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-[12px] text-muted">–</span>
                <select
                  value={dayPlan[i].end}
                  onChange={(e) => setDay(i, { end: e.target.value })}
                  className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px] font-medium text-navy focus:outline-none"
                >
                  {TIME_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="ml-auto text-[12px] font-semibold text-muted">Off</span>
            )}
          </div>
        ))}
      </div>

      <div className="pt-5">
        <DarkButton disabled={!canSave} onClick={saveShift}>
          {pickStaff === "__new__"
            ? (newName.trim() ? `Add ${newName.trim()}` : "Add team member")
            : `Save ${pickedName}’s shift`}
        </DarkButton>
      </div>
      <div className="h-2" />
    </Sheet>
  );

  // Team week — scrollable swimlane; the add/assign sheet handles both.
  if (teamMode === "week") {
    return (
      <div className="pb-6 pt-3">
        <TeamWeek columns={weekColumns} shiftOverrides={shiftOverrides} onAddStaff={openAssign} />
        {shiftSheet}
      </div>
    );
  }

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
      <div ref={ref} style={{ touchAction: "pan-y" }} {...handlers}>
      <div className="grid" style={{ gridTemplateColumns: `34px repeat(${visibleColumns.length}, 1fr)` }}>
        <span className="sticky z-20 self-stretch bg-fog pt-1 text-[10px] text-muted" style={{ top: headerTop }} />
        {visibleColumns.map((c) => (
          <div key={c.id} className="sticky z-20 border-b border-border bg-fog pb-2 pt-1 text-center" style={{ top: headerTop }}>
            <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${c.off ? "bg-canvas text-muted" : "bg-canvas text-secondary"}`}>
              {c.initials}
            </span>
            <p className="pt-1 text-[12px] font-bold text-navy">{c.name}</p>
            <p className={`truncate text-[10px] ${c.off ? "font-semibold text-muted" : "text-muted"}`}>{c.hours}</p>
          </div>
        ))}
        <div className="relative" style={{ height: H }}>
          {ALL_HOURS.map((h) => (
            <span
              key={h}
              className={`absolute -translate-y-1/2 text-[10px] ${isWorkHour(h) ? "text-muted" : "text-muted/50"}`}
              style={{ top: hourTop(h, zoom) }}
            >
              {fmtHour(h, timeFmt)}
            </span>
          ))}
        </div>
        {visibleColumns.map((c, col) => (
          <div
            key={c.id}
            role={c.off ? undefined : "button"}
            tabIndex={c.off ? undefined : 0}
            aria-label={c.off ? `${c.name} is off today` : `Add to ${c.name}'s day`}
            onClick={c.off ? undefined : () => setQuickAction("choose")}
            onKeyDown={c.off ? undefined : (e) => e.key === "Enter" && setQuickAction("choose")}
            className={`relative border-l border-border ${c.off ? "bg-canvas/40" : "cursor-pointer"}`}
            style={{ height: H }}
          >
            {c.off ? (
              <div className="absolute inset-x-0 flex flex-col items-center gap-1 px-1 text-center text-muted" style={{ top: hourTop(WORK_START, zoom) + 56 }}>
                <Moon size={15} strokeWidth={1.75} />
                <span className="text-[11px] font-semibold">Day off</span>
              </div>
            ) : (
              <>
                <DayColumnChrome zoom={zoom} showLabel={col === 0} />
                {col === 0 && <div ref={workAnchor} className="absolute" style={{ top: hourTop(WORK_START, zoom), scrollMarginTop: headerTop }} />}
                <span className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-danger" style={{ top: hourTop(15, zoom) }}>
                  {col === 0 && <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-danger" />}
                </span>
                {c.blocks.map((b, i) => {
                  const isClass = b.status === "Class";
                  const special = !!b.kind || isBreakBlock(b.name) || isClass;
                  if (!special && !catMatch(b.service, filterCats)) return null;
                  if (!blockVisible(b, filters)) return null;
                  const shade = isClass && classCancelled ? "muted" : b.shade;
                  const status = isClass && classCancelled ? "Cancelled" : b.status;
                  return (
                    <CalendarBlock
                      key={i}
                      block={b}
                      density={density}
                      top={hourTop(b.start, zoom)}
                      heightPx={Math.max(28, spanHeight(b.start, b.span, zoom) - 4)}
                      shade={shade}
                      status={status}
                      delay={0.03 * i}
                      onTap={() => openBlock(b, c.name, onOpenClass)}
                    />
                  );
                })}
              </>
            )}
          </div>
        ))}
      </div>
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
            run: () => { onClose(); router.push("/app/messages/cls-colour"); },
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

// Calendar-view options (Calendar tab only). `days: 30` = the month overview.
const MONTH_DAYS = 30;
const calendarViews = [
  { label: "Day", days: 1 },
  { label: "3 Day", days: 3 },
  { label: "Week", days: 7 },
  { label: "Month", days: MONTH_DAYS },
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

// Filter dropdown — multi-select category panel; an empty selection = all.
function FilterDropdown({ filterCats, onToggleCat, onClearCats }: { filterCats: string[]; onToggleCat: (c: string) => void; onClearCats: () => void }) {
  const [open, setOpen] = useState(false);
  const active = filterCats.length > 0;
  const cats = serviceCategories.filter((c) => c !== "All");
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
        {active ? `${filterCats.length} selected` : "Filter"}
        <ChevronDown size={14} strokeWidth={2} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute left-0 top-[calc(100%+8px)] z-20 max-h-60 w-56 overflow-y-auto rounded-2xl border border-border bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={onClearCats}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] ${!active ? "font-semibold text-navy" : "text-secondary"}`}
            >
              All appointments
              {!active && <Check size={15} strokeWidth={2.5} className="text-navy" />}
            </button>
            {cats.map((c) => {
              const sel = filterCats.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onToggleCat(c)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] ${sel ? "font-semibold text-navy" : "text-secondary"}`}
                >
                  {c}
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${sel ? "border-fg-primary bg-fg-primary text-white" : "border-border"}`}>
                    {sel && <Check size={12} strokeWidth={3} />}
                  </span>
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

// 2026 calendar (deterministic, SSR-safe): days per month + the weekday (0=Sun)
// the 1st falls on. Powers the vertically-scrolling month view.
const MONTHS_2026 = [
  { name: "January", days: 31, firstDow: 4 },
  { name: "February", days: 28, firstDow: 0 },
  { name: "March", days: 31, firstDow: 0 },
  { name: "April", days: 30, firstDow: 3 },
  { name: "May", days: 31, firstDow: 5 },
  { name: "June", days: 30, firstDow: 1 },
  { name: "July", days: 31, firstDow: 3 },
  { name: "August", days: 31, firstDow: 6 },
  { name: "September", days: 30, firstDow: 2 },
  { name: "October", days: 31, firstDow: 4 },
  { name: "November", days: 30, firstDow: 0 },
  { name: "December", days: 31, firstDow: 2 },
];
const MARCH_IDX = 2;
const TODAY_DOM = 3; // the schedule's "today" — 3 March (matches TODAY_IDX)
// Busyness for a day — March uses the curated demo set, other months a stable pattern.
const monthDot = (m: number, d: number): "g" | "a" | "r" => {
  if (m === MARCH_IDX) return JUMP_DOTS[d] ?? "g";
  const v = (m * 7 + d * 3) % 10;
  return v < 4 ? "g" : v < 7 ? "a" : "r";
};

// Month overview — all twelve months of 2026 stacked vertically, scroll like a
// native calendar. Lands on the current month; the header + arrows stay in sync.
const DOT_CLASS: Record<"g" | "a" | "r", string> = { g: "bg-success", a: "bg-warning", r: "bg-danger" };
function MonthView({ monthIdx, scrollNonce, onMonthVisible, onPickDay }: { monthIdx: number; scrollNonce: number; onMonthVisible: (i: number) => void; onPickDay: (month: number, day: number) => void }) {
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
  const monthIdxRef = useRef(monthIdx);
  monthIdxRef.current = monthIdx;

  // Scroll to a month ONLY on explicit intent — mount + arrow presses bump
  // scrollNonce. Free-scroll updates monthIdx via the observer below, which must
  // NOT trigger a scroll (that would fight the user).
  useEffect(() => {
    monthRefs.current[monthIdxRef.current]?.scrollIntoView({ block: "start" });
  }, [scrollNonce]);

  // Free scroll → keep the header's month in sync (no scrolling here).
  useEffect(() => {
    const root = monthRefs.current[0]?.closest(".overflow-y-auto") ?? null;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = monthRefs.current.indexOf(e.target as HTMLDivElement);
            if (idx >= 0) onMonthVisible(idx);
          }
        }
      },
      { root, rootMargin: "-150px 0px -60% 0px" },
    );
    monthRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [onMonthVisible]);

  return (
    <div className="px-4 pb-10 pt-1">
      {MONTHS_2026.map((m, mi) => (
        <div
          key={m.name}
          ref={(el) => { monthRefs.current[mi] = el; }}
          className="scroll-mt-[150px] pt-5 first:pt-1"
        >
          <p className="pb-2 text-[14px] font-bold text-navy">{m.name} 2026</p>
          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] font-semibold text-muted">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: m.firstDow }).map((_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: m.days }, (_, k) => k + 1).map((d) => {
              const off = (m.firstDow + d - 1) % 7 === 0; // Sundays — salon closed
              const today = mi === MARCH_IDX && d === TODAY_DOM;
              const dot = monthDot(mi, d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={off}
                  onClick={() => onPickDay(mi, d)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-[13px] ${
                    today ? "border-fg-primary bg-fg-primary text-white"
                    : off ? "border-transparent text-muted/40"
                    : "border-border bg-white text-navy"
                  }`}
                >
                  <span className="font-semibold">{d}</span>
                  {off ? (
                    <span className="text-[7px] font-semibold uppercase tracking-wide text-muted/50">Off</span>
                  ) : (
                    <span className={`h-1.5 w-1.5 rounded-full ${today ? "bg-white" : DOT_CLASS[dot]}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-4 pt-5 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Filling up</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Fully booked</span>
      </div>
    </div>
  );
}

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
  filterCats,
  onToggleCat,
  onClearCats,
  selectedStaff,
  onToggleStaff,
  onSelectAllStaff,
  selectedDay,
  onJumpDate,
  filters,
  onToggleFilter,
  teamMode,
  onTeamMode,
}: {
  open: boolean;
  onClose: () => void;
  view: string;
  calDays: number;
  onCalDays: (n: number) => void;
  timeFmt: "12h" | "24h";
  onTimeFmt: (f: "12h" | "24h") => void;
  filterCats: string[];
  onToggleCat: (c: string) => void;
  onClearCats: () => void;
  selectedStaff: string[];
  onToggleStaff: (id: string) => void;
  onSelectAllStaff: () => void;
  selectedDay: number;
  onJumpDate: (d: number) => void;
  filters: CalFilters;
  onToggleFilter: (key: keyof CalFilters) => void;
  teamMode: "day" | "week";
  onTeamMode: (m: "day" | "week") => void;
}) {
  const allSelected = selectedStaff.length === teamColumns.length;
  return (
    <Sheet open={open} onClose={onClose} title="Calendar Settings">
      {/* Calendar view layout — Calendar tab only */}
      {view === "Calendar" && (
        <>
          <p className={SECTION_LABEL}>Calendar view</p>
          <div className="grid grid-cols-2 gap-2.5">
            {calendarViews.map((l) => {
              const sel = calDays === l.days;
              return (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => onCalDays(l.days)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[13px] font-semibold transition-colors ${
                    sel ? "border-2 border-fg-primary text-navy" : "border border-border text-secondary"
                  }`}
                >
                  <CalendarIcon size={18} strokeWidth={1.75} />
                  {l.label}
                </button>
              );
            })}
          </div>
          <p className="pb-5 pt-2 text-center text-[11px] text-muted">Pinch or ⌘-scroll to zoom the day grid</p>
        </>
      )}

      {/* Team layout + filter — Team tab only */}
      {view === "Team" && (
        <>
          <p className={SECTION_LABEL}>Team layout</p>
          <div className="grid grid-cols-2 gap-2.5 pb-5">
            {(["day", "week"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onTeamMode(m)}
                className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[13px] font-semibold capitalize transition-colors ${
                  teamMode === m ? "border-2 border-fg-primary text-navy" : "border border-border text-secondary"
                }`}
              >
                <CalendarIcon size={18} strokeWidth={1.75} />
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pb-2">
            <p className={`${SECTION_LABEL} pb-0`}>
              Team members <span className="ml-1 normal-case tracking-normal text-secondary">{selectedStaff.length}/{teamColumns.length} selected</span>
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
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold ${c.off ? "bg-canvas text-muted" : "bg-canvas text-secondary"}`}>
                      {c.initials}
                    </span>
                    <span className="text-[13px] font-semibold text-navy">{c.name}</span>
                    <span className={`text-[11px] ${c.off ? "font-semibold text-warning" : "text-muted"}`}>{c.off ? "Day off" : c.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Filter + time format — shared by every view */}
      <div className="flex items-center justify-between pb-5">
        <FilterDropdown filterCats={filterCats} onToggleCat={onToggleCat} onClearCats={onClearCats} />
        <TimeFormatToggle timeFmt={timeFmt} onTimeFmt={onTimeFmt} />
      </div>

      {/* Show / hide on the calendar */}
      <p className={SECTION_LABEL}>Show on calendar</p>
      <div className="mb-5 overflow-hidden rounded-2xl border border-border">
        <ToggleRow title="Cancelled appointments" on={filters.showCancelled} onToggle={() => onToggleFilter("showCancelled")} />
        <ToggleRow title="No-shows" on={filters.showNoShows} onToggle={() => onToggleFilter("showNoShows")} divider />
        <ToggleRow title="Outstanding balances" on={filters.showOutstanding} onToggle={() => onToggleFilter("showOutstanding")} divider />
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

// Full month of labels (index = day-of-month − 1) so jump-to-date and the month
// view can navigate to any day, not just a 5-day window. March 2026: 1 Mar = Sun.
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayLabels = Array.from({ length: 31 }, (_, i) => `${DOW[i % 7]} ${i + 1} March`);
const TODAY_IDX = 2; // the schedule demo's "today" — Tuesday 3 March

export default function SchedulePage() {
  const openBlock = useBlockTap();
  const [view, setView] = useState("My Day");
  const [classOpen, setClassOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [classCancelled, setClassCancelled] = useState(false);
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const [calDays, setCalDays] = useState(3);
  const [timeFmt, setTimeFmt] = useState<"12h" | "24h">("24h");
  const [filterCats, setFilterCats] = useState<string[]>([]);
  const [filters, setFilters] = useState<CalFilters>({ showCancelled: true, showNoShows: true, showOutstanding: true });
  const [selectedStaff, setSelectedStaff] = useState<string[]>(teamColumns.filter((c) => !c.off).map((c) => c.id));
  const [teamMode, setTeamMode] = useState<"day" | "week">("day");
  const [monthIdx, setMonthIdx] = useState(MARCH_IDX);
  const [scrollNonce, setScrollNonce] = useState(0); // bumped to scroll the month view (arrows)
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Measure the sticky page header so the grid's day-of-week headers can pin
  // directly below it — it grows/shrinks when search opens, so it can't be fixed.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(160);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The date selector shows the period for the active view; arrows step by it.
  const isMonth = view === "Calendar" && calDays === MONTH_DAYS;
  const isTeamWeek = view === "Team" && teamMode === "week"; // a single fixed demo week
  const isWeekView = (view === "Calendar" && calDays === 7) || isTeamWeek;
  const is3Day = view === "Calendar" && calDays === 3;
  const stepUnit = isWeekView ? 7 : is3Day ? 3 : 1;
  const maxStart = Math.max(0, dayLabels.length - stepUnit); // keep a full window in range
  const viewStart = Math.min(dayIdx, maxStart);
  const shortDay = (i: number) => {
    const c = Math.min(Math.max(0, i), dayLabels.length - 1);
    return `${dayLabels[c].split(" ")[0].slice(0, 3)} ${c + 1}`;
  };
  const periodLabel = isMonth ? `${MONTHS_2026[monthIdx].name} 2026`
    : isTeamWeek ? `${WEEK7[0].label} ${WEEK7[0].dom} – ${WEEK7[6].label} ${WEEK7[6].dom}`
    : isWeekView ? `${shortDay(viewStart)} – ${shortDay(viewStart + 6)}`
    : is3Day ? `${shortDay(viewStart)} – ${shortDay(viewStart + 2)}`
    : dayLabels[dayIdx];
  const stepDate = (dir: -1 | 1) => {
    if (isTeamWeek) return; // swimlane is a single fixed week
    if (isMonth) { setMonthIdx((m) => Math.min(11, Math.max(0, m + dir))); setScrollNonce((n) => n + 1); return; }
    setDayIdx((d) => Math.min(maxStart, Math.max(0, d + dir * stepUnit)));
  };
  const atStart = isTeamWeek ? true : isMonth ? monthIdx === 0 : dayIdx === 0;
  const atEnd = isTeamWeek ? true : isMonth ? monthIdx === 11 : dayIdx >= maxStart;

  // Search across the team's bookings (the set that carries a staff name).
  const searchResults = query.trim()
    ? teamColumns
        .flatMap((c) =>
          c.blocks
            .filter((b) => !b.kind && !isBreakBlock(b.name) && b.status !== "Class")
            .map((b) => ({ block: b, staff: c.name })),
        )
        .filter((r) => r.block.name.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <div className="flex min-h-full flex-col bg-fog">
      <div ref={headerRef} className="sticky top-0 z-30 bg-white">
        <AppHeader title="Schedule" />
        <div className="flex items-center gap-2.5 px-4 pb-3">
          <Segmented options={["My Day", "Calendar", "Team"]} value={view} onChange={setView} />
          <button
            type="button"
            aria-label="Search appointments"
            onClick={() => setSearchOpen((o) => !o)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${searchOpen ? "bg-fg-primary text-white" : "bg-canvas text-navy"}`}
          >
            <Search size={17} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            aria-label="Calendar settings"
            onClick={() => setSettingsOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <CalendarCog size={17} strokeWidth={1.75} />
          </button>
        </div>
        {searchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={15} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a client in your calendar..."
                className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-9 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  <X size={15} strokeWidth={2} />
                </button>
              )}
            </div>
            {query.trim() && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-white">
                {searchResults.length ? (
                  searchResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { openBlock(r.block, r.staff); setSearchOpen(false); setQuery(""); }}
                      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
                        {initialsOf(r.block.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-navy">{r.block.name}</span>
                        <span className="block truncate text-[12px] text-muted">
                          {r.block.service ?? "Appointment"} · {hhmm(r.block.start)} · {r.staff}
                        </span>
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-muted" />
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-4 text-center text-[13px] text-muted">No matches for &ldquo;{query.trim()}&rdquo;</p>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-b border-border px-4 pb-3">
          <button
            aria-label="Previous"
            onClick={() => stepDate(-1)}
            className="p-1 text-muted disabled:opacity-30"
            disabled={atStart}
          >
            <ChevronLeft size={18} />
          </button>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={periodLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="text-[15px] font-bold text-navy"
            >
              {periodLabel}
            </motion.span>
          </AnimatePresence>
          <button
            aria-label="Next"
            onClick={() => stepDate(1)}
            className="p-1 text-muted disabled:opacity-30"
            disabled={atEnd}
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
          {filterCats.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterCats([])}
              className="mx-4 mt-3 flex items-center gap-2 rounded-full border border-fg-primary bg-fg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white"
            >
              <SlidersHorizontal size={11} strokeWidth={2} />
              {filterCats.length === 1 ? `Showing ${filterCats[0]} only` : `${filterCats.length} categories`} · clear
            </button>
          )}
          {view === "My Day" && <MyDayView filterCats={filterCats} timeFmt={timeFmt} />}
          {view === "Calendar" && (calDays === MONTH_DAYS ? (
            <MonthView
              monthIdx={monthIdx}
              scrollNonce={scrollNonce}
              onMonthVisible={setMonthIdx}
              onPickDay={(m, d) => {
                // Per-day data is March-only in this prototype; only March drills in.
                // Zoom to a 3-day view with the tapped day centred (start = d−2).
                if (m === MARCH_IDX) { setDayIdx(Math.min(Math.max(0, d - 2), dayLabels.length - 3)); setCalDays(3); }
              }}
            />
          ) : (
            <CalendarGridView days={calDays} filterCats={filterCats} timeFmt={timeFmt} filters={filters} headerTop={headerH} />
          ))}
          {view === "Team" && <TeamView onOpenClass={() => setClassOpen(true)} classCancelled={classCancelled} timeFmt={timeFmt} selectedStaff={selectedStaff} filterCats={filterCats} filters={filters} teamMode={teamMode} headerTop={headerH} />}
        </motion.div>
      </AnimatePresence>

      {/* Floating "today" pill — appears once you step off the current day/month */}
      <AnimatePresence>
        {(isMonth ? monthIdx !== MARCH_IDX : dayIdx !== TODAY_IDX) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[78px] z-40 flex justify-center">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (isMonth) { setMonthIdx(MARCH_IDX); setScrollNonce((n) => n + 1); }
                else setDayIdx(TODAY_IDX);
              }}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-fg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_20px_rgba(8,7,6,0.35)]"
            >
              <CalendarDays size={13} strokeWidth={2} />
              {isMonth ? "Today" : "Back to today"}
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
        filterCats={filterCats}
        onToggleCat={(c) => setFilterCats((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))}
        onClearCats={() => setFilterCats([])}
        selectedStaff={selectedStaff}
        onToggleStaff={(id) =>
          setSelectedStaff((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
        }
        onSelectAllStaff={() =>
          setSelectedStaff((s) => (s.length === teamColumns.length ? [] : teamColumns.map((c) => c.id)))
        }
        selectedDay={dayIdx + 1}
        onJumpDate={(d) => {
          setDayIdx(Math.min(Math.max(0, d - 1), dayLabels.length - 1));
          setSettingsOpen(false);
        }}
        filters={filters}
        onToggleFilter={(key) => setFilters((f) => ({ ...f, [key]: !f[key] }))}
        teamMode={teamMode}
        onTeamMode={setTeamMode}
      />
    </div>
  );
}
