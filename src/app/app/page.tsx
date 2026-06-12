"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown, Clock, AlertTriangle, CalendarDays, Plane, Stethoscope,
  CirclePlus, Check, MapPin, Plus,
} from "lucide-react";
import { AppHeader, SectionLabel, Sheet, DarkButton, MiniCalendar } from "@/components/app/ui";
import { UpNextSection } from "@/components/app/UpNextCard";
import {
  homeHeader, staffStats, needsAttention, teamToday, upcomingShifts, timeOff,
} from "@/lib/data/home";

// Home — mid-fi dashboard (Figma node 11990-94642 → Home). The Up Next card
// carries the appointment lifecycle: Check In → Start service → Checkout.

function NeedsAttentionList() {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-3 px-4">
      {needsAttention.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(8, 7, 6,0.04)]">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-navy">{item.title}</div>
            <div className="mt-0.5 truncate text-[12px] text-muted">{item.detail}</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setResolved((r) => ({ ...r, [item.id]: true }))}
            disabled={resolved[item.id]}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
              resolved[item.id] ? "border-border bg-canvas text-muted" : "border-border bg-white text-navy"
            }`}
          >
            {resolved[item.id] ? item.done : item.action}
          </motion.button>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [location, setLocation] = useState(homeHeader.location);
  const [locOpen, setLocOpen] = useState(false);

  // Time-off request: a two-step flow — type + dates, then a per-day
  // full/half breakdown and the reason.
  const [totOpen, setTotOpen] = useState(false);
  const [totStep, setTotStep] = useState<1 | 2>(1);
  const [totType, setTotType] = useState("Annual Leave");
  const [typeOpen, setTypeOpen] = useState(false);
  const [totStart, setTotStart] = useState<number | null>(null);
  const [totEnd, setTotEnd] = useState<number | null>(null);
  const [totDayParts, setTotDayParts] = useState<Record<number, "Full" | "AM" | "PM">>({});
  const [totReason, setTotReason] = useState("");
  const [extraTimeOff, setExtraTimeOff] = useState<typeof timeOff>([]);

  const pickTotDay = (d: number) => {
    if (totStart === null || (totStart !== null && totEnd !== null)) {
      setTotStart(d);
      setTotEnd(null);
    } else if (d <= totStart) {
      setTotStart(d);
      setTotEnd(null);
    } else {
      setTotEnd(d);
    }
  };
  // 1 March 2026 is a Sunday.
  const dowName = (d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(d - 1) % 7];
  const totDaysList =
    totStart === null
      ? []
      : Array.from({ length: (totEnd ?? totStart) - totStart + 1 }, (_, i) => totStart + i);
  const totTotal = totDaysList.reduce((s, d) => s + ((totDayParts[d] ?? "Full") === "Full" ? 1 : 0.5), 0);
  const totTotalLabel = totTotal === 1 ? "1 day" : `${totTotal} days`;
  const totRangeLabel =
    totStart === null ? null : totEnd === null ? `${totStart} March` : `${totStart} – ${totEnd} March`;
  const totValid = totStart !== null && (totType !== "Other" || totReason.trim().length > 0);

  return (
    <div className="bg-fog pb-6">
      <div className="bg-white">
        <AppHeader title="Home" />
      </div>

      <div className="px-4 pt-3">
        <button onClick={() => setLocOpen(true)} className="flex items-center gap-1 text-[12px] font-medium text-muted">
          {location}
          <ChevronDown size={13} strokeWidth={1.75} />
        </button>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
            {homeHeader.userInitials}
          </span>
          <div>
            <h2 className="text-[20px] font-bold leading-tight text-navy">{homeHeader.greeting}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
              <Clock size={12} strokeWidth={1.75} />
              {homeHeader.hours}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 rounded-2xl bg-white px-2 py-4 shadow-[0_1px_4px_rgba(8, 7, 6,0.04)]">
        {staffStats.map((stat, i) => (
          <div key={stat.label} className={`text-center ${i > 0 ? "border-l border-border" : ""}`}>
            <div className="text-[11px] text-muted">{stat.label}</div>
            <div className="mt-1 text-[18px] font-bold text-navy">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="pt-5">
        <UpNextSection />
      </div>

      <div className="pt-6">
        <SectionLabel count={needsAttention.length}>Needs Attention</SectionLabel>
        <NeedsAttentionList />
      </div>

      <div className="pt-6">
        <SectionLabel
          count={teamToday.count}
          right={
            <Link href="/app/team" className="text-[12px] font-medium text-muted">
              View all
            </Link>
          }
        >
          Team Today
        </SectionLabel>
        <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8, 7, 6,0.04)]">
          {teamToday.members.map((member, i) => (
            <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-semibold text-muted">
                {member.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-navy">{member.name}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                  <Clock size={11} strokeWidth={1.75} />
                  {member.detail}
                </div>
              </div>
              <span className="shrink-0 text-[12px] text-muted">{member.status}</span>
            </div>
          ))}
          <div className="flex w-full items-center gap-2 bg-canvas px-4 py-3 text-[12px] text-secondary">
            <AlertTriangle size={13} strokeWidth={1.75} />
            {teamToday.warning}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <SectionLabel>Your Shifts</SectionLabel>
        <div className="space-y-3 px-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8, 7, 6,0.04)]">
            <div className="flex items-center justify-between px-4 pb-1 pt-4">
              <span className="text-[15px] font-bold text-navy">Upcoming Shifts</span>
              <Link href="/app/schedule" className="text-[12px] font-medium text-muted">
                View all
              </Link>
            </div>
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${shift.badge ? "bg-fg-primary text-white" : "bg-canvas text-secondary"}`}>
                  <CalendarDays size={16} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-navy">{shift.title}</div>
                  <div className="mt-0.5 text-[12px] text-muted">{shift.detail}</div>
                </div>
                {shift.badge && (
                  <span className="shrink-0 rounded-full bg-fg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                    {shift.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8, 7, 6,0.04)]">
            <div className="flex items-center justify-between px-4 pb-1 pt-4">
              <span className="text-[15px] font-bold text-navy">Time Off</span>
              <button
                onClick={() => {
                  setTotType("Annual Leave");
                  setTotStep(1);
                  setTotStart(null);
                  setTotEnd(null);
                  setTotDayParts({});
                  setTotReason("");
                  setTypeOpen(false);
                  setTotOpen(true);
                }}
                className="flex items-center gap-1 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-medium text-secondary"
              >
                <CirclePlus size={13} strokeWidth={1.75} />
                Request
              </button>
            </div>
            {[...timeOff, ...extraTimeOff].map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas">
                  {item.detail.startsWith("Annual") ? (
                    <Plane size={16} className="text-secondary" strokeWidth={1.75} />
                  ) : (
                    <Stethoscope size={16} className="text-secondary" strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-navy">{item.title}</div>
                  <div className="mt-0.5 text-[12px] text-muted">{item.detail}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.badge === "Approved" ? "bg-canvas text-secondary" : "border border-border bg-white text-muted"
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location switcher */}
      <Sheet open={locOpen} onClose={() => setLocOpen(false)} title="Your locations">
        {["Salon Soho", "Salon Shoreditch"].map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => {
              setLocation(loc);
              setLocOpen(false);
            }}
            className="flex w-full items-center gap-3 border-b border-border py-4 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-secondary">
              <MapPin size={16} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-navy">{loc}</span>
              <span className="block text-[12px] text-muted">
                {loc === "Salon Soho" ? "6 staff · open today" : "4 staff · open today"}
              </span>
            </span>
            {location === loc && <Check size={16} className="text-navy" strokeWidth={2.25} />}
          </button>
        ))}
        <button type="button" className="flex w-full items-center gap-3 py-4 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-border text-secondary">
            <Plus size={16} strokeWidth={1.75} />
          </span>
          <span className="text-[14px] font-semibold text-navy">Add a location</span>
        </button>
      </Sheet>

      {/* Request time off — step 1: type + dates, step 2: per-day breakdown + reason */}
      <Sheet
        open={totOpen}
        onClose={() => setTotOpen(false)}
        title={
          totStep === 1 ? (
            "Request time off"
          ) : (
            <button type="button" onClick={() => setTotStep(1)} className="flex items-center gap-1 text-navy">
              <ChevronDown size={18} strokeWidth={2} className="rotate-90" />
              Which days are full days?
            </button>
          )
        }
        sub={totStep === 1 ? "Step 1 of 2 · Pick the type and dates" : `Step 2 of 2 · ${totType} · ${totRangeLabel}`}
        full
      >
        {totStep === 1 && (
          <>
            <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Type</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTypeOpen((o) => !o)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left"
              >
                <span className="text-[14px] font-semibold text-navy">{totType}</span>
                <motion.span animate={{ rotate: typeOpen ? 180 : 0 }} className="flex text-muted">
                  <ChevronDown size={15} strokeWidth={1.75} />
                </motion.span>
              </button>
              {typeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-0 top-[52px] z-20 overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_24px_rgba(8, 7, 6,0.12)]"
                >
                  {["Annual Leave", "Sick Leave", "Other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTotType(t);
                        setTypeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] text-navy ${
                        t === totType ? "bg-canvas font-semibold" : ""
                      }`}
                    >
                      {t}
                      {t === totType && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Dates — tap your first day, then your last
            </p>
            <MiniCalendar selected={null} onSelect={pickTotDay} range={{ start: totStart, end: totEnd }} />
            {totRangeLabel && (
              <p className="pt-2 text-center text-[12px] font-semibold text-navy">
                {totRangeLabel}
                {totDaysList.length > 1 ? ` · ${totDaysList.length} days selected` : ""}
              </p>
            )}

            <div className="pt-5">
              <DarkButton
                disabled={totStart === null}
                onClick={() => {
                  setTotDayParts((p) => {
                    const next = { ...p };
                    totDaysList.forEach((d) => {
                      if (!next[d]) next[d] = "Full";
                    });
                    return next;
                  });
                  setTotStep(2);
                }}
              >
                {totStart === null ? "Pick your dates" : "Continue"}
              </DarkButton>
            </div>
          </>
        )}

        {totStep === 2 && (
          <>
            <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Set each day to full or half
            </p>
            <div className="overflow-hidden rounded-2xl border border-border">
              {totDaysList.map((d, i) => {
                const part = totDayParts[d] ?? "Full";
                const weekend = ["Sat", "Sun"].includes(dowName(d));
                return (
                  <div key={d} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                    <span className="w-16 shrink-0">
                      <span className={`block text-[13px] font-bold ${weekend ? "text-muted" : "text-navy"}`}>
                        {dowName(d)} {d}
                      </span>
                      <span className="block text-[10px] text-muted">{part === "Full" ? "Full day" : `Half · ${part}`}</span>
                    </span>
                    <div className="flex flex-1 justify-end gap-1.5">
                      {(["Full", "AM", "PM"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTotDayParts((p) => ({ ...p, [d]: opt }))}
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                            part === opt ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-secondary"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="pt-2 text-right text-[12px] font-bold text-navy">Total: {totTotalLabel}</p>

            <p className="pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Reason {totType === "Other" ? "— required for Other" : "(optional)"}
            </p>
            <textarea
              value={totReason}
              onChange={(e) => setTotReason(e.target.value)}
              placeholder={
                totType === "Sick Leave"
                  ? "e.g. Migraine — may need Thursday too"
                  : totType === "Other"
                    ? "e.g. Moving house, jury duty..."
                    : "e.g. Family holiday — booked flights already"
              }
              className="h-20 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />

            <div className="pt-4">
              <DarkButton
                disabled={!totValid}
                onClick={() => {
                  setExtraTimeOff((x) => [
                    ...x,
                    {
                      id: `tot${x.length}`,
                      title: `${totRangeLabel} · ${totTotalLabel}`,
                      detail: `${totType}${totReason.trim() ? ` — ${totReason.trim().slice(0, 40)}` : ""}`,
                      badge: "Pending",
                    },
                  ]);
                  setTotOpen(false);
                }}
              >
                {totType === "Other" && !totReason.trim()
                  ? "Add a reason to send"
                  : `Request ${totTotalLabel} · ${totType}`}
              </DarkButton>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
