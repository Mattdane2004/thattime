"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronRight, Clock, Bell, AlertTriangle, CalendarDays,
  Plane, Stethoscope, CalendarOff, MessageSquare, RotateCcw, X, CheckCircle2,
  Shuffle, User,
} from "lucide-react";
import {
  homeHeader, staffStats, upNext, needsAttention, teamToday,
  upcomingShifts, timeOff,
} from "@/lib/data/home";
import "@/components/onboarding2/motion-test-hook";

// New product Home (Figma "🔴 Onbaording" → Home frame): warm cream surface,
// account-setup checklist, coral accents. Shared by the owner (/app) and
// staff (/staff/home) variants.

const setupSteps = [
  { n: 1, title: "add services", desc: "up the treatments and prices you offer", state: "done" },
  { n: 2, title: "set up payments", desc: "Connect a payment method to take deposits and card payments", state: "active" },
  { n: 3, title: "invite team members", desc: "Add your staff members and set their working hours", state: "open" },
  { n: 4, title: "Set your availability", desc: "Add your working hours so clients can book online", state: "open" },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-display text-[17px] font-extrabold text-navy">{children}</div>;
}

function HeaderBar({ name }: { name: string }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-3">
        <button className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-[13px] font-semibold text-navy">
          {homeHeader.location}
          <ChevronDown size={14} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-3">
          <Link href="/app/messages" aria-label="Notifications" className="relative text-navy">
            <Bell size={20} strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger" />
          </Link>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
            <User size={16} strokeWidth={1.75} />
          </span>
        </div>
      </div>
      <p className="px-4 pt-3 text-[13px] font-medium text-muted">{homeHeader.date}</p>
      <h1 className="px-4 pt-0.5 font-display text-[26px] font-extrabold tracking-tight text-navy">
        {`Good afternoon, ${name}`}
      </h1>
      <p className="flex items-center gap-1.5 px-4 pt-1 text-[12px] text-muted">
        <Clock size={12} strokeWidth={1.75} />
        {homeHeader.hours}
      </p>
    </>
  );
}

function StatsCard() {
  return (
    <div className="mx-4 mt-4 grid grid-cols-3 rounded-2xl bg-white px-2 py-4 shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
      {staffStats.map((stat, i) => (
        <div key={stat.label} className={`text-center ${i > 0 ? "border-l border-border" : ""}`}>
          <div className="text-[12px] text-secondary">{stat.label}</div>
          <div className="mt-1 font-display text-[20px] font-extrabold text-navy">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

function FreshaCard() {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="mx-4 mt-4 flex items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-[0_1px_6px_rgba(15,26,46,0.05)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1EC] text-coral">
        <Shuffle size={18} strokeWidth={1.75} />
      </span>
      <span className="flex-1 text-[15px] font-bold text-navy">Move Your data from Fresha</span>
      <ChevronRight size={16} className="text-muted" />
    </motion.button>
  );
}

function SetupChecklist() {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white p-5 shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
      <p className="text-[13px] font-semibold text-muted">Account set up</p>
      <div className="mt-4 flex flex-col">
        {setupSteps.map((s, i) => (
          <div key={s.n} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < setupSteps.length - 1 && (
              <span className="absolute left-[7px] top-5 h-full w-px bg-border" aria-hidden />
            )}
            <span
              className={`relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full ${
                s.state === "done" || s.state === "active"
                  ? "bg-coral"
                  : s.state === "open" && s.n === 3
                    ? "border-2 border-[#C7C7CC] bg-white"
                    : "bg-[#E3E3E6]"
              }`}
            />
            <div>
              <p className="text-[14px] font-bold text-navy">
                {s.n}. {s.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          href="/app/setup"
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FF4D00] text-[15px] font-bold text-white"
        >
          <CalendarDays size={16} strokeWidth={2} />
          Continue set up
        </Link>
      </motion.div>
    </div>
  );
}

function UpNextCards({ withActions }: { withActions?: boolean }) {
  return (
    <>
      <div className="mt-6 flex items-center justify-between px-4 pb-3">
        <SectionLabel>Up Next</SectionLabel>
        <Link href="/app/schedule" className="flex items-center gap-1 text-[12px] font-semibold text-navy">
          See your Schedule
          <ChevronRight size={13} strokeWidth={2} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 [scrollbar-width:none]">
        {[0, 1].map((i) => (
          <div key={i} className="w-[300px] shrink-0 rounded-3xl bg-[#161310] p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] font-bold">
                <Clock size={15} strokeWidth={1.75} />
                {upNext.time}
                <span className="text-[12px] font-medium text-white/60">· {upNext.duration}</span>
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-navy">
                {upNext.countdown}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
                {upNext.initials}
              </span>
              <div>
                <p className="text-[15px] font-bold">{upNext.client}</p>
                <p className="text-[12px] text-white/60">{upNext.service}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-white/70">
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} /> Allergy
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={11} /> Note attached
              </span>
            </div>
            {withActions && (
              <div className="mt-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
                  <MessageSquare size={15} />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
                  <RotateCcw size={15} />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
                  <X size={15} />
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto flex h-9 items-center gap-1.5 rounded-full bg-coral px-4 text-[13px] font-bold text-white"
                >
                  <CheckCircle2 size={14} />
                  Check in
                </motion.button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function NeedsAttentionRow() {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  return (
    <>
      <div className="mt-6 flex items-center gap-2 px-4 pb-3">
        <SectionLabel>Needs attention</SectionLabel>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white">
          {needsAttention.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 [scrollbar-width:none]">
        {needsAttention.map((item) => (
          <div key={item.id} className="w-[260px] shrink-0 rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
            <p className="text-[15px] font-bold text-navy">{item.title}</p>
            <p className="mt-1 truncate text-[12px] text-muted">{item.detail}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setResolved((r) => ({ ...r, [item.id]: true }))}
              className={`mt-3 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                resolved[item.id]
                  ? "border-border text-muted"
                  : "border-coral text-coral"
              }`}
            >
              {resolved[item.id] ? item.done : item.action}
            </motion.button>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamTodaySection() {
  return (
    <>
      <div className="mt-6 flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2">
          <SectionLabel>Team today</SectionLabel>
          <span className="text-[12px] font-semibold text-muted">· {teamToday.count} on shift</span>
        </div>
        <Link href="/app/team" className="flex items-center gap-1 text-[12px] font-semibold text-navy">
          View all
          <ChevronRight size={13} strokeWidth={2} />
        </Link>
      </div>
      <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
        {teamToday.members.map((member, i) => (
          <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/15 text-[11px] font-bold text-coral">
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
        <div className="flex w-full items-center gap-2 bg-cream px-4 py-3 text-[12px] text-secondary">
          <AlertTriangle size={13} strokeWidth={1.75} />
          {teamToday.warning}
        </div>
      </div>
    </>
  );
}

function ShiftsSection() {
  return (
    <div className="space-y-3 px-4 pt-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
        <div className="px-4 pb-1 pt-4"><SectionLabel>Upcoming Shifts</SectionLabel></div>
        {upcomingShifts.map((shift) => (
          <div key={shift.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream">
              <CalendarDays size={16} className="text-secondary" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-navy">{shift.title}</div>
              <div className="mt-0.5 text-[12px] text-muted">{shift.detail}</div>
            </div>
            {shift.badge && (
              <span className="shrink-0 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-white">
                {shift.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(15,26,46,0.05)]">
        <div className="px-4 pb-1 pt-4"><SectionLabel>Time Off</SectionLabel></div>
        {timeOff.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream">
              {item.detail === "Annual Leave" ? (
                <Plane size={16} className="text-secondary" strokeWidth={1.75} />
              ) : item.detail === "Doctors" ? (
                <Stethoscope size={16} className="text-secondary" strokeWidth={1.75} />
              ) : (
                <CalendarOff size={16} className="text-secondary" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-navy">{item.title}</div>
              <div className="mt-0.5 text-[12px] text-muted">{item.detail}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                item.badge === "Approved" ? "bg-cream text-secondary" : "border border-border bg-white text-muted"
              }`}
            >
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeDashboard({ variant }: { variant: "owner" | "staff" }) {
  const name = variant === "owner" ? "Emma" : "Sam";
  return (
    <div className="bg-cream pb-8 font-body">
      <HeaderBar name={name} />
      <StatsCard />
      {variant === "owner" ? (
        <>
          <FreshaCard />
          <SetupChecklist />
          <UpNextCards />
          <NeedsAttentionRow />
          <TeamTodaySection />
          <ShiftsSection />
        </>
      ) : (
        <>
          <UpNextCards withActions />
          <NeedsAttentionRow />
          <TeamTodaySection />
          <ShiftsSection />
        </>
      )}
    </div>
  );
}
