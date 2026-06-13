"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
                    ? "bg-fg-primary font-semibold text-white"
                    : range && range.start && range.end && d > range.start && d < range.end
                      ? "bg-[#E5DDD4] font-medium text-navy"
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
                ? "border-fg-primary bg-fg-primary text-white"
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
