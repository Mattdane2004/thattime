"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, UserPlus, Search, CalendarDays, Banknote, Armchair } from "lucide-react";
import type { Staff } from "@/lib/types";
import { STATUS_LABEL, initialsOf, runTotal, payIsConfigured, paySummary } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";

// Team — Members / Shifts / Pay tabs (Fresha-style team management).
// Members: searchable roster → member detail. Shifts: weekly rota summary +
// time off. Pay: per-member pay setup + pay runs.

const TABS = ["Members", "Shifts", "Pay"] as const;
type Tab = (typeof TABS)[number];

const STATUS_STYLE: Record<Staff["status"], string> = {
  active: "bg-canvas text-secondary",
  pending: "border border-border bg-surface text-muted",
  needs_setup: "bg-warning/15 text-warning",
  archived: "bg-canvas text-muted",
};

function MemberRow({ m }: { m: Staff }) {
  return (
    <Link href={`/app/team/${m.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${m.avatarColor}`}>
        {initialsOf(m.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-navy">{m.name}</span>
          {m.systemRoles.includes("Manager") && (
            <span className="shrink-0 rounded bg-navy px-1.5 py-0.5 text-[10px] font-medium text-white">Manager</span>
          )}
          {m.systemRoles.includes("Instructor") && (
            <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-secondary">Instructor</span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-muted">
          {m.role} · {m.services.length} service{m.services.length === 1 ? "" : "s"}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[m.status]}`}>
        {STATUS_LABEL[m.status]}
      </span>
    </Link>
  );
}

function MembersTab({ members }: { members: Staff[] }) {
  const [query, setQuery] = useState("");
  const visible = members.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  const current = visible.filter((m) => m.status !== "archived");
  const archived = visible.filter((m) => m.status === "archived");
  const bookable = current.filter((m) => m.bookable).length;

  return (
    <>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team"
            className="h-10 w-full rounded-xl bg-canvas pl-10 pr-3 text-[13px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </div>
        <div className="pt-2 text-[12px] text-muted">{current.length} members · {bookable} bookable</div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {current.map((m) => <MemberRow key={m.id} m={m} />)}
        {archived.length > 0 && (
          <>
            <div className="px-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Archived</div>
            {archived.map((m) => <MemberRow key={m.id} m={m} />)}
          </>
        )}
        {visible.length === 0 && <div className="pt-10 text-center text-[13px] text-muted">No matches</div>}
      </div>
    </>
  );
}

function ShiftsTab({ members }: { members: Staff[] }) {
  // Freelancers / chair-renters schedule themselves, so they're off the owner
  // rota — but the owner still sees them (rent due + how busy they are).
  const working = members.filter((m) => m.status === "active" && m.memberType !== "freelancer");
  const freelancers = members.filter((m) => m.status === "active" && m.memberType === "freelancer");
  const timeOff = members.flatMap((m) => m.schedule.timeOff.map((t) => ({ ...t, member: m })));

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <div className="flex items-center gap-2 rounded-2xl bg-canvas px-4 py-3">
        <CalendarDays size={15} className="text-secondary" />
        <span className="text-[13px] text-secondary">This week · Mon 8 – Sun 14 Jun</span>
      </div>

      <div className="mt-3 space-y-2">
        {working.map((m) => {
          const days = m.schedule.weekly;
          return (
            <Link key={m.id} href={`/app/team/${m.id}/schedule`} className="block rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${m.avatarColor}`}>
                  {initialsOf(m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-navy">{m.name}</div>
                  <div className="text-[12px] text-muted">{m.rota.thisWeekHours}h scheduled · next: {m.rota.nextShift}</div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </div>
              <div className="mt-2.5 flex gap-1">
                {days.map((d) => (
                  <span
                    key={d.day}
                    className={`flex h-7 flex-1 items-center justify-center rounded-md text-[10px] font-semibold ${
                      d.enabled ? "bg-navy/90 text-white" : "bg-canvas text-muted"
                    }`}
                  >
                    {d.day[0]}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {freelancers.length > 0 && (
        <>
          <div className="mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Freelancers · self-scheduled</div>
          <div className="mt-2 space-y-2">
            {freelancers.map((m) => (
              <Link key={m.id} href={`/app/team/${m.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${m.avatarColor}`}>
                  {initialsOf(m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-navy">{m.name}</div>
                  <div className="flex items-center gap-1 text-[12px] text-muted">
                    <Armchair size={12} className="shrink-0" />
                    {paySummary(m)} · {m.rota.thisWeekHours}h booked this week
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Upcoming time off</div>
      <div className="mt-2 space-y-2">
        {timeOff.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-[12px] text-muted">
            No time off booked — add it from a member&apos;s schedule.
          </div>
        )}
        {timeOff.map((t) => (
          <Link key={`${t.member.id}_${t.id}`} href={`/app/team/${t.member.id}/schedule`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${t.member.avatarColor}`}>
              {initialsOf(t.member.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-navy">{t.member.name}</div>
              <div className="text-[12px] text-muted">{t.label} · {t.date}</div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PayTab({ members }: { members: Staff[] }) {
  const payRuns = useTeamStore((s) => s.payRuns);
  const paid = members.filter((m) => m.status === "active" && payIsConfigured(m.payment));

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Pay runs</div>
      <div className="mt-2 space-y-2">
        {payRuns.map((r) => (
          <Link key={r.id} href={`/app/team/pay/${r.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
              <Banknote size={17} className="text-navy" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-navy">{r.period}</span>
              <span className="block text-[12px] text-muted">{r.lines.length} people · £{runTotal(r).toLocaleString()}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              r.status === "draft" ? "bg-warning/15 text-warning" : "bg-canvas text-secondary"
            }`}>
              {r.status === "draft" ? "Draft" : "Completed"}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Pay setup</div>
      <div className="mt-2 space-y-2">
        {paid.map((m) => (
          <Link key={m.id} href={`/app/team/${m.id}/pay`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-navy/20">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${m.avatarColor}`}>
              {initialsOf(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-navy">{m.name}</div>
              <div className="text-[12px] text-muted">{paySummary(m)}</div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
        ))}
        {members
          .filter((m) => m.status === "active" && !payIsConfigured(m.payment))
          .map((m) => (
            <Link key={m.id} href={`/app/team/${m.id}/pay`} className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 hover:bg-canvas">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${m.avatarColor}`}>
                {initialsOf(m.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-navy">{m.name}</div>
                <div className="text-[12px] text-warning">Pay not set up</div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </Link>
          ))}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const router = useRouter();
  const members = useTeamStore((s) => s.members);
  const [tab, setTab] = useState<Tab>("Members");
  const sorted = useMemo(() => members, [members]);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center">
          <button type="button" onClick={() => router.back()} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </button>
          <span className="ml-1 text-[17px] font-semibold text-navy">Team</span>
        </div>
        <Link href="/app/team/invite" className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
          <UserPlus size={15} strokeWidth={1.75} />Invite
        </Link>
      </div>

      <div className="px-4 pb-3">
        <div className="flex rounded-full bg-canvas p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
                tab === t ? "bg-navy text-white" : "text-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Members" && <MembersTab members={sorted} />}
      {tab === "Shifts" && <ShiftsTab members={sorted} />}
      {tab === "Pay" && <PayTab members={sorted} />}
    </div>
  );
}
