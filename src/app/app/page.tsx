"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronRight, Clock, AlertTriangle, CalendarDays, Calendar,
  Plane, Stethoscope, CirclePlus, Check, MapPin, Plus, TrendingUp, TrendingDown,
  Banknote, UserPlus, Gauge, Scissors, Star, Users, ArrowUpRight,
} from "lucide-react";
import { AppHeader, SectionLabel, Sheet, DarkButton, MiniCalendar } from "@/components/ui";
import { UpNextSection } from "@/components/app/UpNextCard";
import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import { Sparkline, MiniBarLine, BenchmarkCurve } from "@/components/app/charts";
import { useRoleStore, type AppRole } from "@/lib/store/roleStore";
import {
  homeHeader, needsAttention, teamToday, upcomingShifts, timeOff,
  type Shift, type TimeOffItem,
} from "@/lib/data/home";
import {
  periods, type Period, revenueHero, staffEarningsHero, staffEarningsSub, businessKpis,
  staffKpis, activitySeries, weekPerformance, benchmark, topServices, clientSplit, growAddTeam,
  type HeroMetric, type KpiTile,
} from "@/lib/data/dashboard";

// Home — role-aware business dashboard. The header role switcher flips between
// owner (full analytics + team), solo (personal analytics, no team), and staff
// (their day only, no business settings). Composition lives in `sectionsFor`.

const kpiIcons = {
  banknote: Banknote, calendar: Calendar, userPlus: UserPlus, gauge: Gauge,
  scissors: Scissors, star: Star,
} as const;

function Delta({ delta, up }: { delta: string; up: boolean }) {
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-success" : "text-muted"}`}>
      {up ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
      {delta}
    </span>
  );
}

// ── Greeting + location ──
function GreetingCard({ location, onPickLocation }: { location: string; onPickLocation: () => void }) {
  return (
    <div className="px-4 pt-3">
      <button onClick={onPickLocation} className="flex items-center gap-1 text-[12px] font-medium text-muted">
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
  );
}

// ── Period selector pill (scopes the dashboard) ──
function PeriodPill({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-[13px] font-semibold text-navy"
      >
        {value}
        <ChevronDown size={14} strokeWidth={2} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] ${p === value ? "bg-canvas font-semibold text-navy" : "text-secondary"}`}
              >
                {p}
                {p === value && <Check size={13} strokeWidth={2.5} className="text-navy" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Hero metric (revenue / earnings) with sparkline ──
function HeroMetricCard({ metric, period, sub, href }: { metric: HeroMetric; period?: Period; sub?: string; href: string }) {
  return (
    <Link href={href} className="mx-4 block">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[12px] font-medium text-muted">
              {metric.label}{period ? ` · ${period.toLowerCase()}` : ""}
            </span>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-[32px] font-bold leading-none tracking-tight text-navy">{metric.value}</span>
              <Delta delta={metric.delta} up={metric.up} />
            </div>
            {sub && <p className="mt-1.5 text-[12px] text-muted">{sub}</p>}
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-muted">
            <ArrowUpRight size={16} strokeWidth={2} />
          </span>
        </div>
        <div className="mt-3 text-navy">
          <Sparkline data={metric.spark} className="text-navy" />
        </div>
      </div>
    </Link>
  );
}

// ── Horizontal-scroll KPI tiles ──
// Padding lives on the inner `w-max` block so both the leading AND trailing
// inset are part of the scroll width (a flex scroll container drops its own
// trailing padding in most browsers).
function KpiScroller({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="overflow-x-auto pb-1 [scrollbar-width:none]">
      <div className="flex w-max snap-x gap-3 px-4">
        {tiles.map((t) => {
          const Icon = kpiIcons[t.icon];
          return (
            <div key={t.id} className="w-[140px] shrink-0 snap-start rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-navy">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <Delta delta={t.delta} up={t.up} />
              </div>
              <div className="mt-3 text-[22px] font-bold leading-none tracking-tight text-navy">{t.value}</div>
              <div className="mt-1 text-[12px] text-muted">{t.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 7-day activity (bars = bookings, line = revenue) ──
function ActivityCard() {
  return (
    <Link href="/app/hub" className="mx-4 block">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-[15px] font-bold text-navy">Activity</span>
          <ChevronRight size={18} strokeWidth={2} className="text-muted" />
        </div>
        <div className="mt-3 flex gap-6">
          <div>
            <div className="text-[20px] font-bold tracking-tight text-navy">{weekPerformance.bookings}</div>
            <div className="text-[12px] text-muted">Bookings</div>
          </div>
          <div>
            <div className="text-[20px] font-bold tracking-tight text-navy">{weekPerformance.revenue}</div>
            <div className="text-[12px] text-muted">Revenue</div>
          </div>
        </div>
        <div className="mt-4">
          <MiniBarLine data={activitySeries} className="text-navy" />
        </div>
      </div>
    </Link>
  );
}

// ── Peer benchmark ──
function BenchmarkCard() {
  return (
    <div className="mx-4 rounded-3xl bg-white p-5 shadow-sm">
      <span className="text-[15px] font-bold text-navy">{benchmark.headline}</span>
      <p className="mt-0.5 text-[12px] text-muted">{benchmark.sub}</p>
      <div className="mt-3 text-navy">
        <BenchmarkCurve you={benchmark.you} className="text-navy" />
      </div>
    </div>
  );
}

// ── Insights: top services (bar list) + client mix ──
function InsightGrid() {
  const maxCount = Math.max(...topServices.map((s) => s.count)) || 1;
  const total = clientSplit.newCount + clientSplit.returningCount || 1;
  const returningPct = Math.round((clientSplit.returningCount / total) * 100);
  return (
    <div className="mx-4 space-y-3">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <span className="text-[15px] font-bold text-navy">Top services</span>
        <div className="mt-3 space-y-3">
          {topServices.map((s) => (
            <div key={s.name}>
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-semibold text-navy">{s.name}</span>
                <span className="text-muted">{s.count} · {s.revenue}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-fg-primary" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-navy">Clients</span>
          <span className="text-[12px] text-muted">{clientSplit.rebookRate} rebook rate</span>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full bg-fg-primary" style={{ width: `${returningPct}%` }} />
          <div className="h-full bg-fg-primary/30" style={{ width: `${100 - returningPct}%` }} />
        </div>
        <div className="mt-2.5 flex justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-navy">
            <span className="h-2 w-2 rounded-full bg-fg-primary" /> {clientSplit.returningCount} returning
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full bg-fg-primary/30" /> {clientSplit.newCount} new
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Solo: grow / add your team ──
function GrowAddTeamCard() {
  return (
    <div className="mx-4">
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-navy">
          <Users size={18} strokeWidth={1.8} />
        </span>
        <h3 className="mt-3 text-[16px] font-bold text-navy">{growAddTeam.title}</h3>
        <p className="mt-1 text-[13px] leading-snug text-secondary">{growAddTeam.body}</p>
        <Link
          href={growAddTeam.href}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fg-primary text-[14px] font-semibold text-white"
        >
          <Plus size={15} strokeWidth={2.25} />
          {growAddTeam.cta}
        </Link>
      </div>
    </div>
  );
}

// ── Needs Attention ──
function NeedsAttentionList() {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-3 px-4">
      {needsAttention.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
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

// ── Team Today (owner only) ──
function TeamTodaySection() {
  return (
    <div className="pt-6">
      <SectionLabel
        count={teamToday.count}
        right={<Link href="/app/team" className="text-[12px] font-medium text-muted">View all</Link>}
      >
        Team Today
      </SectionLabel>
      <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm">
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
  );
}

// ── Your Shifts + Time off (self-contained, owns the request flow) ──
function YourShiftsSection() {
  const [totOpen, setTotOpen] = useState(false);
  const [totStep, setTotStep] = useState<1 | 2>(1);
  const [totType, setTotType] = useState("Annual Leave");
  const [typeOpen, setTypeOpen] = useState(false);
  const [totStart, setTotStart] = useState<number | null>(null);
  const [totEnd, setTotEnd] = useState<number | null>(null);
  const [totDayParts, setTotDayParts] = useState<Record<number, "Full" | "AM" | "PM">>({});
  const [totReason, setTotReason] = useState("");
  const [extraTimeOff, setExtraTimeOff] = useState<TimeOffItem[]>([]);

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
  const dowName = (d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(d - 1) % 7];
  const totDaysList =
    totStart === null ? [] : Array.from({ length: (totEnd ?? totStart) - totStart + 1 }, (_, i) => totStart + i);
  const totTotal = totDaysList.reduce((s, d) => s + ((totDayParts[d] ?? "Full") === "Full" ? 1 : 0.5), 0);
  const totTotalLabel = totTotal === 1 ? "1 day" : `${totTotal} days`;
  const totRangeLabel =
    totStart === null ? null : totEnd === null ? `${totStart} March` : `${totStart} – ${totEnd} March`;
  const totValid = totStart !== null && (totType !== "Other" || totReason.trim().length > 0);

  return (
    <div className="pt-6">
      <SectionLabel>Your Shifts</SectionLabel>
      <div className="space-y-3 px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 pb-1 pt-4">
            <span className="text-[15px] font-bold text-navy">Upcoming Shifts</span>
            <Link href="/app/schedule" className="text-[12px] font-medium text-muted">View all</Link>
          </div>
          {(upcomingShifts as Shift[]).map((shift) => (
            <div key={shift.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${shift.badge ? "bg-fg-primary text-white" : "bg-canvas text-secondary"}`}>
                <CalendarDays size={16} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-navy">{shift.title}</div>
                <div className="mt-0.5 text-[12px] text-muted">{shift.detail}</div>
              </div>
              {shift.badge && (
                <span className="shrink-0 rounded-full bg-fg-primary px-2.5 py-1 text-[11px] font-semibold text-white">{shift.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
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
                  className="absolute inset-x-0 top-[52px] z-20 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
                >
                  {["Annual Leave", "Sick Leave", "Other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTotType(t);
                        setTypeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] text-navy ${t === totType ? "bg-canvas font-semibold" : ""}`}
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
                {totType === "Other" && !totReason.trim() ? "Add a reason to send" : `Request ${totTotalLabel} · ${totType}`}
              </DarkButton>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}

// `role` prop overrides the store — the staff route passes "staff" so the
// stripped view renders on the first paint (no flash of owner content).
export default function HomePage({ role: roleProp }: { role?: AppRole }) {
  const storeRole = useRoleStore((s) => s.role);
  const role = roleProp ?? storeRole;
  const [location, setLocation] = useState(homeHeader.location);
  const [locOpen, setLocOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("This week");

  const avatarHref = role === "staff" ? null : "/app/hub";

  return (
    <div className="bg-fog pb-6">
      <div className="bg-white">
        <AppHeader title="Home" center={<RoleSwitcher />} avatarHref={avatarHref} />
      </div>

      <GreetingCard location={location} onPickLocation={() => setLocOpen(true)} />

      {/* Up Next — the live appointment stays at the top for every role. */}
      <div className="pt-5">
        <UpNextSection />
      </div>

      {role === "staff" ? (
        // Staff — their day only: own earnings, personal stats, schedule.
        <>
          <div className="mt-5">
            <HeroMetricCard metric={staffEarningsHero} sub={staffEarningsSub} href="/app/schedule" />
          </div>
          <div className="mt-3">
            <KpiScroller tiles={staffKpis} />
          </div>
          <YourShiftsSection />
        </>
      ) : (
        // Owner & solo — business dashboard.
        <>
          <div className="flex items-center justify-between px-4 pb-2 pt-6">
            <span className="text-[15px] font-bold text-navy">Overview</span>
            <PeriodPill value={period} onChange={setPeriod} />
          </div>

          <HeroMetricCard metric={revenueHero} period={period} href="/app/hub" />

          <div className="mt-3">
            <KpiScroller tiles={businessKpis} />
          </div>

          <div className="mt-3">
            <ActivityCard />
          </div>

          {role === "owner" && (
            <div className="mt-3">
              <BenchmarkCard />
            </div>
          )}

          <div className="mt-3">
            <InsightGrid />
          </div>

          <div className="pt-6">
            <SectionLabel count={needsAttention.length}>Needs Attention</SectionLabel>
            <NeedsAttentionList />
          </div>

          {role === "owner" ? <TeamTodaySection /> : <div className="pt-6"><GrowAddTeamCard /></div>}

          <YourShiftsSection />
        </>
      )}

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
    </div>
  );
}
