"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { FieldLabel, fieldInput, Toggle } from "@/components/app/WizardChrome";
import { ACCESS_LEVELS } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import type { AccessLevel } from "@/lib/types";

// Team invite — collects the essentials plus a workspace access level,
// persists the member as "Invite sent", and confirms before returning.

const TYPES = [
  { key: "employee", label: "Employee", desc: "On your books — you set their schedule." },
  { key: "freelancer", label: "Freelancer", desc: "Self-employed — rents a chair or splits commission." },
] as const;

export default function TeamInvitePage() {
  const router = useRouter();
  const inviteMember = useTeamStore((s) => s.inviteMember);
  const [memberType, setMemberType] = useState<"employee" | "freelancer">("employee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [takesBookings, setTakesBookings] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("low");
  const [sentTo, setSentTo] = useState<{ name: string; id: string } | null>(null);

  const valid = Boolean(name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  const send = () => {
    if (!valid) return;
    const created = inviteMember({ name: name.trim(), email: email.trim(), role: jobTitle.trim(), memberType, bookable: takesBookings, accessLevel });
    setSentTo({ name: created.name, id: created.id });
  };

  if (sentTo) {
    return (
      <>
        <ScreenHeader onClose={() => router.push("/app/team")} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <CheckCircle2 size={44} className="text-success" strokeWidth={1.5} />
          <div className="mt-4 text-[20px] font-semibold text-navy">Invite sent</div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {sentTo.name} has been emailed a link to join your workspace. They&apos;ll show as &quot;Invite sent&quot; until they accept — you can resend it from their profile.
          </div>
        </div>
        <div className="shrink-0 space-y-3 px-5 pb-5">
          <button onClick={() => router.push(`/app/team/${sentTo.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90">
            Set up their profile
          </button>
          <button onClick={() => router.push("/app/team")} className="h-12 w-full rounded-full border border-border text-[15px] font-semibold text-navy hover:bg-canvas">
            Done
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Add team member" onBack={() => router.push("/app/team")} border />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-4">
          <div className="text-[22px] font-semibold tracking-tight text-navy">Who are you adding?</div>
        </div>

        <div className="space-y-2 pb-5">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => setMemberType(t.key)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${memberType === t.key ? "border-navy bg-navy/[0.03]" : "border-border hover:bg-canvas"}`}>
              <div className="text-[15px] font-medium text-navy">{t.label}</div>
              <div className="mt-0.5 text-[13px] text-muted">{t.desc}</div>
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-6">
          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={fieldInput} />
          </label>
          <label className="block">
            <FieldLabel>Email</FieldLabel>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className={fieldInput} />
          </label>
          <label className="block">
            <FieldLabel>Job title</FieldLabel>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior stylist" className={fieldInput} />
          </label>

          <button onClick={() => setTakesBookings((v) => !v)} className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left">
            <span className="text-[14px] font-medium text-navy">Takes bookings</span>
            <Toggle on={takesBookings} />
          </button>

          <div>
            <FieldLabel>Workspace access</FieldLabel>
            <div className="space-y-2">
              {ACCESS_LEVELS.filter((l) => l.key !== "owner").map((l) => (
                <button
                  key={l.key}
                  onClick={() => setAccessLevel(l.key)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    accessLevel === l.key ? "border-navy" : "border-border hover:bg-canvas"
                  }`}
                >
                  <span>
                    <span className="block text-[13px] font-semibold text-navy">{l.label}</span>
                    <span className="block text-[12px] text-muted">{l.desc}</span>
                  </span>
                  <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${accessLevel === l.key ? "border-navy bg-navy" : "border-border"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={send} disabled={!valid}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Send invite
        </button>
      </div>
    </>
  );
}
