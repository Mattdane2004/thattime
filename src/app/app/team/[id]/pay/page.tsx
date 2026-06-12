"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { FieldLabel, fieldInput, Toggle } from "@/components/app/WizardChrome";
import { useTeamStore } from "@/lib/store/teamStore";

// Member pay — employment type, rate, commission and tips. Commission applies
// to the services they deliver; wages come from scheduled shifts.

export default function MemberPayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const member = useTeamStore((s) => s.members.find((m) => m.id === params.id));
  const updateMember = useTeamStore((s) => s.updateMember);

  if (!member) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Pay" onBack={() => router.push("/app/team")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Team member not found</div>
      </div>
    );
  }

  const pay = member.payment;
  const setPay = (patch: Partial<typeof pay>) => updateMember(member.id, { payment: { ...pay, ...patch } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title={`${member.name.split(" ")[0]}'s pay`} onBack={() => router.push(`/app/team/${member.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="pb-5">
          <FieldLabel>Employment type</FieldLabel>
          <div className="flex rounded-2xl bg-canvas p-1">
            {(["employee", "contractor"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPay({ type: t })}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize transition-colors ${
                  pay.type === t ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {t === "employee" ? "Employee" : "Self-employed"}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted">
            {pay.type === "employee"
              ? "Wages are calculated from scheduled shifts; commission is added on top."
              : "Self-employed members invoice you — rates here are for reference and reports."}
          </div>
        </div>

        <div className="space-y-4 pb-6">
          <label className="block">
            <FieldLabel>{pay.type === "employee" ? "Hourly rate (£)" : "Session rate (£)"}</FieldLabel>
            <input
              type="number" inputMode="decimal" value={pay.payRate} placeholder="12.50"
              onChange={(e) => setPay({ payRate: e.target.value })}
              className={fieldInput}
            />
          </label>

          <label className="block">
            <FieldLabel>Service commission (%)</FieldLabel>
            <input
              type="number" inputMode="numeric" value={pay.commission || ""} placeholder="20"
              onChange={(e) => setPay({ commission: Number(e.target.value) || 0 })}
              className={fieldInput}
            />
            <span className="mt-2 block text-[12px] text-muted">
              Share of the price of each service they deliver. Tiered and per-service rates are coming later.
            </span>
          </label>

          <button onClick={() => setPay({ tips: !pay.tips })} className="flex w-full items-center justify-between rounded-2xl bg-canvas px-4 py-3.5 text-left">
            <span>
              <span className="block text-[14px] font-medium text-navy">Keeps their tips</span>
              <span className="block text-[12px] text-muted">Tips collected at checkout go to this member</span>
            </span>
            <Toggle on={pay.tips} />
          </button>

          <div className="rounded-2xl border border-border px-4 py-3.5">
            <div className="text-[12px] text-muted">Payout status</div>
            <div className="mt-0.5 text-[14px] font-medium text-navy">{pay.payoutStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
