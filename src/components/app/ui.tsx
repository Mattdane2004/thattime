"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

/** Tab-page header: bold title + date, bell (→ notifications), avatar (→ hub). */
export function AppHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-4">
      <div>
        <h1 className="text-[20px] font-bold leading-tight text-navy">{title}</h1>
        <p className="text-[12px] text-muted">Wednesday 4 March</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/app/notifications" aria-label="Notifications" className="relative p-1 text-navy">
          <Bell size={20} strokeWidth={1.75} />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-danger" />
        </Link>
        <Link
          href="/app/hub"
          aria-label="Open business management hub"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-secondary transition-colors hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
        >
          SJ
        </Link>
      </div>
    </div>
  );
}

export function SectionLabel({ children, count, right }: { children: ReactNode; count?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[16px] font-bold text-navy">{children}</span>
        {count !== undefined && <span className="text-[15px] font-semibold text-muted">{count}</span>}
      </div>
      {right}
    </div>
  );
}

/** Segmented control (Schedule views, client tabs). */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 rounded-full bg-canvas p-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="relative flex-1 rounded-full py-2 text-[13px] font-medium"
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.join("-")}`}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(15,26,46,0.1)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative ${active ? "font-semibold text-navy" : "text-secondary"}`}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Bottom sheet for product surfaces (white, grabber, drag-dismiss). */
export function Sheet({
  open,
  onClose,
  children,
  title,
  sub,
  full,
  aboveNav,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  sub?: string;
  full?: boolean;
  aboveNav?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`absolute inset-0 bg-black/40 ${aboveNav ? "z-40" : "z-[70]"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute inset-x-0 flex flex-col rounded-t-[24px] bg-white ${
              aboveNav ? "bottom-[64px] z-50" : "bottom-0 z-[80]"
            } ${full ? "top-[7%]" : "max-h-[88%]"}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="shrink-0 px-6 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              {(title || sub) && (
                <div className="flex items-start justify-between pb-3">
                  <div className="min-w-0">
                    {title && <h2 className="text-[18px] font-bold text-navy">{title}</h2>}
                    {sub && <p className="mt-0.5 text-[13px] text-secondary">{sub}</p>}
                  </div>
                  <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-navy">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Dark primary pill (mid-fi). */
export function DarkButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${
        disabled ? "bg-canvas text-muted" : "bg-[#14181F] text-white"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white text-[15px] font-semibold text-navy ${className}`}
    >
      {children}
    </motion.button>
  );
}

/** Status pill used on calendar blocks and cards. */
export function StatusPill({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" | "danger" | "amber" }) {
  const cls =
    tone === "dark"
      ? "bg-white/15 text-white"
      : tone === "danger"
        ? "bg-danger text-white"
        : tone === "amber"
          ? "bg-[#FEF3C7] text-[#B45309]"
          : "bg-canvas text-secondary";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

// 2026 months for the mini calendar (Mon-first offset of the 1st + day count).
const calendarMonths = [
  { name: "January 2026", offset: 3, days: 31 },
  { name: "February 2026", offset: 6, days: 28 },
  { name: "March 2026", offset: 6, days: 31 },
  { name: "April 2026", offset: 2, days: 30 },
  { name: "May 2026", offset: 4, days: 31 },
  { name: "June 2026", offset: 0, days: 30 },
] as const;
const TODAY_MONTH = 2; // March

/**
 * Month calendar used by reschedule / new appointment / block time — pageable.
 * Pass `range` for multi-day selection (time off): endpoints render dark,
 * days in between get a light fill.
 */
export function MiniCalendar({
  selected,
  onSelect,
  dots,
  range,
}: {
  selected: number | null;
  onSelect: (d: number) => void;
  dots?: Record<number, "g" | "a" | "r">;
  range?: { start: number | null; end: number | null };
}) {
  const [mIdx, setMIdx] = useState(TODAY_MONTH);
  const month = calendarMonths[mIdx];
  const cells: (number | null)[] = [
    ...Array(month.offset).fill(null),
    ...Array.from({ length: month.days }, (_, i) => i + 1),
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMIdx((i) => Math.max(0, i - 1))}
          disabled={mIdx === 0}
          className="px-2 py-1 text-[16px] text-secondary disabled:opacity-30"
        >
          ‹
        </button>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={month.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="text-[15px] font-bold text-navy"
          >
            {month.name}
          </motion.span>
        </AnimatePresence>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMIdx((i) => Math.min(calendarMonths.length - 1, i + 1))}
          disabled={mIdx === calendarMonths.length - 1}
          className="px-2 py-1 text-[16px] text-secondary disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="pb-1 text-[11px] text-muted">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className="relative mx-auto flex h-9 w-9 flex-col items-center justify-center"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors ${
                  selected === d || (range && (d === range.start || d === range.end))
                    ? "bg-[#14181F] font-semibold text-white"
                    : range && range.start && range.end && d > range.start && d < range.end
                      ? "bg-[#E4E5E9] font-medium text-navy"
                      : d === 4 && mIdx === TODAY_MONTH
                        ? "border border-border text-navy"
                        : "text-navy"
                }`}
              >
                {d}
              </span>
              {dots?.[d] && mIdx === TODAY_MONTH && (
                <span
                  className={`absolute bottom-0 h-1.5 w-1.5 rounded-full ${
                    dots[d] === "g" ? "bg-success" : dots[d] === "a" ? "bg-warning" : "bg-danger"
                  }`}
                />
              )}
            </button>
          ),
        )}
      </div>
      <p className="pt-2 text-center text-[11px] text-muted">Today is Wednesday 4 March</p>
    </div>
  );
}

export const timeSlots = [
  { t: "09:00", free: true },
  { t: "09:30", free: true },
  { t: "10:00", free: false },
  { t: "10:30", free: true },
  { t: "11:00", free: false },
  { t: "11:30", free: true },
  { t: "12:00", free: true },
  { t: "13:00", free: true },
  { t: "13:30", free: false },
  { t: "14:00", free: true },
  { t: "14:30", free: true },
  { t: "15:00", free: true },
  { t: "15:30", free: true },
  { t: "16:00", free: true },
];

export function TimeChips({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {timeSlots.map(({ t, free }) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            disabled={!free}
            onClick={() => onSelect(t)}
            className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
              active
                ? "border-[#14181F] bg-[#14181F] text-white"
                : free
                  ? "border-border bg-white text-navy"
                  : "border-border bg-white text-muted line-through"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
