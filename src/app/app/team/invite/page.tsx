"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";

// Team invite — functional port of the legacy that-time-app /routes/team/QuickAdd.jsx
// (the multi-step rent/commission setup is deferred). Collects the essentials
// and returns to the roster; persisting the new member needs the shared
// app-state slice (backlog).

const TYPES = [
  { key: "employee", label: "Employee", desc: "On your books — you set their schedule." },
  { key: "freelancer", label: "Freelancer", desc: "Self-employed — rents a chair or splits commission." },
] as const;

export default function TeamInvitePage() {
  const router = useRouter();
  const [memberType, setMemberType] = useState<"employee" | "freelancer">("employee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [takesBookings, setTakesBookings] = useState(true);

  const valid = Boolean(name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

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
            <span className="mb-2 block text-[13px] font-medium text-secondary">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com"
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Job title</span>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior stylist"
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy" />
          </label>
          <button onClick={() => setTakesBookings((v) => !v)} className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left">
            <span className="text-[14px] font-medium text-navy">Takes bookings</span>
            <span className={`relative h-6 w-10 rounded-full ${takesBookings ? "bg-navy" : "bg-border"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${takesBookings ? "left-[1.125rem]" : "left-0.5"}`} />
            </span>
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={() => valid && router.push("/app/team")} disabled={!valid}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          Send invite
        </button>
      </div>
    </>
  );
}
