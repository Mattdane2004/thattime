"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Mail, Phone, CalendarDays, ShieldCheck,
  Banknote, Scissors, MapPin, Send, Archive, RotateCcw,
} from "lucide-react";
import { STATUS_LABEL, ACCESS_LEVELS, initialsOf } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import { Toggle } from "@/components/ui";
import { businessLocations } from "@/lib/data/locations";

// Team member detail — profile, bookability, services, locations, and links
// to schedule / permissions / pay. Pending invites can be resent; members are
// archived (kept for history) rather than deleted.

export default function TeamMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const member = useTeamStore((s) => s.members.find((m) => m.id === params.id));
  const updateMember = useTeamStore((s) => s.updateMember);
  const resendInvite = useTeamStore((s) => s.resendInvite);
  const archiveMember = useTeamStore((s) => s.archiveMember);
  const restoreMember = useTeamStore((s) => s.restoreMember);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [resent, setResent] = useState(false);

  if (!member) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 items-center px-5">
          <Link href="/app/team" aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></Link>
        </div>
        <div className="pt-12 text-center text-[13px] text-muted">Team member not found</div>
      </div>
    );
  }

  const workingDays = member.schedule.weekly.filter((d) => d.enabled).length;
  const accessLabel = ACCESS_LEVELS.find((l) => l.key === member.accessLevel)?.label ?? "Custom";
  const locations = member.locations
    .map((id) => businessLocations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(" · ") || "All locations";

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between px-5">
        <Link href="/app/team" aria-label="Back to team" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></Link>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
          member.status === "active" ? "bg-success/10 text-success" : member.status === "pending" ? "border border-border text-muted" : "bg-warning/15 text-warning"
        }`}>
          {STATUS_LABEL[member.status]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex items-center gap-4 pb-5">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold ${member.avatarColor}`}>
            {initialsOf(member.name)}
          </div>
          <div className="min-w-0">
            <div className="text-[20px] font-bold tracking-tight text-navy">{member.name}</div>
            <div className="text-[13px] text-muted">{member.role}</div>
          </div>
        </div>

        {member.status === "pending" && (
          <div className="mb-4 rounded-2xl bg-canvas px-4 py-3.5">
            <div className="text-[13px] font-medium text-navy">Invite sent {member.invite.sentAt}</div>
            <div className="mt-0.5 text-[12px] text-muted">They haven&apos;t joined yet. Invites expire after 7 days.</div>
            <button
              onClick={() => { resendInvite(member.id); setResent(true); }}
              className="mt-3 flex h-9 items-center gap-1.5 rounded-full bg-navy px-4 text-[12px] font-semibold text-white hover:bg-navy/90"
            >
              <Send size={13} />{resent ? "Invite resent" : "Resend invite"}
            </button>
          </div>
        )}

        <div className="mb-4 overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail size={15} className="shrink-0 text-secondary" />
            <span className="truncate text-[13px] text-navy">{member.email}</span>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3">
            <Phone size={15} className="shrink-0 text-secondary" />
            <span className="text-[13px] text-navy">{member.phone || "No phone number"}</span>
          </div>
          <button
            onClick={() => updateMember(member.id, { bookable: !member.bookable })}
            className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-left"
          >
            <span>
              <span className="block text-[14px] font-medium text-navy">Takes bookings</span>
              <span className="block text-[12px] text-muted">Clients can book this member online</span>
            </span>
            <Toggle on={member.bookable} />
          </button>
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Manage</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <Link href={`/app/team/${member.id}/schedule`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><CalendarDays size={15} className="text-secondary" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Schedule</span>
              <span className="block text-[12px] text-muted">{workingDays} working days · {member.schedule.timeOff.length} time off</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
          <Link href={`/app/team/${member.id}/permissions`} className="flex items-center gap-3 border-t border-border px-4 py-3.5 hover:bg-canvas">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><ShieldCheck size={15} className="text-secondary" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Permissions</span>
              <span className="block text-[12px] text-muted">{accessLabel} access</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
          <Link href={`/app/team/${member.id}/pay`} className="flex items-center gap-3 border-t border-border px-4 py-3.5 hover:bg-canvas">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Banknote size={15} className="text-secondary" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Pay</span>
              <span className="block text-[12px] text-muted">
                {member.payment.payRate
                  ? `${member.payment.type === "employee" ? `£${member.payment.payRate}/h` : `£${member.payment.payRate}/session`}${member.payment.commission ? ` · ${member.payment.commission}% commission` : ""}`
                  : "Not set up"}
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
        </div>

        <div className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Work</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Scissors size={15} className="text-secondary" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Services</span>
              <span className="block truncate text-[12px] text-muted">
                {member.services.length ? member.services.join(" · ") : "No services assigned yet"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><MapPin size={15} className="text-secondary" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Locations</span>
              <span className="block truncate text-[12px] text-muted">{locations}</span>
            </span>
          </div>
        </div>

        <div className="mt-6">
          {member.status === "archived" ? (
            <button
              onClick={() => { restoreMember(member.id); }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-[14px] font-medium text-navy hover:bg-canvas"
            >
              <RotateCcw size={15} />Restore member
            </button>
          ) : (
            <button
              onClick={() => {
                if (!confirmArchive) { setConfirmArchive(true); return; }
                archiveMember(member.id);
                router.push("/app/team");
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-[14px] font-medium text-danger hover:bg-danger/5"
            >
              <Archive size={15} />
              {confirmArchive ? "Tap again to archive — bookings stay in history" : "Archive member"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
