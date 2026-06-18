"use client";

import { Toggle } from "@/components/ui";
import type { Weekday, WeeklyScheduleDay } from "@/lib/types";

// Shared weekly working-hours editor. Controlled via props so it can be driven
// by the team store (member's own schedule) or the onboarding store (staff
// join flow) — the owner asked for the join-flow week to look identical to the
// self-edit schedule screen, so both render this one component.

/** Sum of whole-hour spans across enabled days. */
export function weeklyHours(week: WeeklyScheduleDay[]): number {
  return week
    .filter((d) => d.enabled)
    .reduce((sum, d) => sum + (Number(d.end.slice(0, 2)) - Number(d.start.slice(0, 2))), 0);
}

export function WeekEditor({
  week,
  onChange,
  readOnly = false,
}: {
  week: WeeklyScheduleDay[];
  onChange?: (day: Weekday, patch: Partial<WeeklyScheduleDay>) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {week.map((d, i) => (
        <div key={d.day} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
          {readOnly ? (
            <div className="flex items-center gap-3">
              <Toggle on={d.enabled} />
              <span className={`w-10 text-left text-[13px] font-semibold ${d.enabled ? "text-navy" : "text-muted"}`}>{d.day}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChange?.(d.day, { enabled: !d.enabled })}
              className="flex items-center gap-3"
              aria-label={`Toggle ${d.day}`}
            >
              <Toggle on={d.enabled} />
              <span className={`w-10 text-left text-[13px] font-semibold ${d.enabled ? "text-navy" : "text-muted"}`}>{d.day}</span>
            </button>
          )}
          {d.enabled ? (
            readOnly ? (
              <span className="flex-1 text-right text-[12px] font-medium text-navy">{d.start} – {d.end}</span>
            ) : (
              <div className="flex flex-1 items-center justify-end gap-2">
                <input
                  type="time"
                  value={d.start}
                  onChange={(e) => onChange?.(d.day, { start: e.target.value })}
                  className="h-9 rounded-lg bg-canvas px-2 text-[12px] text-navy outline-none focus:ring-1 focus:ring-navy"
                />
                <span className="text-[12px] text-muted">–</span>
                <input
                  type="time"
                  value={d.end}
                  onChange={(e) => onChange?.(d.day, { end: e.target.value })}
                  className="h-9 rounded-lg bg-canvas px-2 text-[12px] text-navy outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
            )
          ) : (
            <span className="flex-1 text-right text-[12px] text-muted">Day off</span>
          )}
        </div>
      ))}
    </div>
  );
}
