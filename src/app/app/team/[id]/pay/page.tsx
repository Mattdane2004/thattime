"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui";
import { FieldLabel, fieldInput, Toggle } from "@/components/ui";
import { paySummary } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";
import type { MemberType, PayComponents, StaffPayment } from "@/lib/types";

// Member pay — built from independent components so a member can mix several
// (e.g. a low chair rent AND a commission) and leave any unset ("set up
// later"). Direction flips with member type: employees are paid; freelancers /
// chair-renters pay the business. Settlement (bank details, payouts) is handled
// later in Stripe — not captured here.

function ToggleRow({
  label,
  desc,
  on,
  onToggle,
  children,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
        <span>
          <span className="block text-[14px] font-medium text-navy">{label}</span>
          <span className="block text-[12px] text-muted">{desc}</span>
        </span>
        <Toggle on={on} />
      </button>
      {on && children && <div className="space-y-3 border-t border-border px-4 py-3.5">{children}</div>}
    </div>
  );
}

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
  const comps = pay.components;
  const isFreelancer = member.memberType === "freelancer";

  const setPayment = (patch: Partial<StaffPayment>) => updateMember(member.id, { payment: { ...pay, ...patch } });
  const setComps = (patch: Partial<PayComponents>) => setPayment({ components: { ...comps, ...patch } });

  const setMemberType = (t: MemberType) => {
    const next: PayComponents = { ...comps };
    if (next.commission) next.commission = { ...next.commission, direction: t === "freelancer" ? "to_owner" : "to_member" };
    updateMember(member.id, { memberType: t, payment: { ...pay, components: next } });
  };

  const summary = paySummary(member);

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title={`${member.name.split(" ")[0]}'s pay`} onBack={() => router.push(`/app/team/${member.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="pb-5">
          <FieldLabel>Member type</FieldLabel>
          <div className="flex rounded-2xl bg-canvas p-1">
            {(["employee", "freelancer"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMemberType(t)}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize transition-colors ${
                  member.memberType === t ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted">
            {isFreelancer
              ? "They pay you — chair rent and/or a cut of what they earn. You'll invoice them; no payslip."
              : "You pay them — wages from shifts, plus any commission or tips."}
          </div>
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Pay components</div>
        <div className="space-y-2 pb-5">
          <ToggleRow
            label="Hourly rate"
            desc="Paid per hour worked"
            on={comps.hourly !== undefined}
            onToggle={() => setComps({ hourly: comps.hourly === undefined ? "" : undefined })}
          >
            <label className="block">
              <FieldLabel>Hourly rate (£)</FieldLabel>
              <input
                type="number" inputMode="decimal" value={comps.hourly ?? ""} placeholder="12.50"
                onChange={(e) => setComps({ hourly: e.target.value })}
                className={fieldInput}
              />
            </label>
          </ToggleRow>

          <ToggleRow
            label="Salary"
            desc="Fixed pay each period"
            on={comps.salary !== undefined}
            onToggle={() => setComps({ salary: comps.salary === undefined ? "" : undefined })}
          >
            <label className="block">
              <FieldLabel>Salary (£)</FieldLabel>
              <input
                type="text" value={comps.salary ?? ""} placeholder="2,400/mo"
                onChange={(e) => setComps({ salary: e.target.value })}
                className={fieldInput}
              />
            </label>
          </ToggleRow>

          <ToggleRow
            label="Commission"
            desc="A share of each service they deliver"
            on={comps.commission !== undefined}
            onToggle={() =>
              setComps({
                commission: comps.commission === undefined
                  ? { rate: 0, direction: isFreelancer ? "to_owner" : "to_member" }
                  : undefined,
              })
            }
          >
            <label className="block">
              <FieldLabel>Commission (%)</FieldLabel>
              <input
                type="number" inputMode="numeric" value={comps.commission?.rate || ""} placeholder="20"
                onChange={(e) =>
                  setComps({
                    commission: {
                      rate: Number(e.target.value) || 0,
                      direction: comps.commission?.direction ?? (isFreelancer ? "to_owner" : "to_member"),
                    },
                  })
                }
                className={fieldInput}
              />
              <span className="mt-2 block text-[12px] text-muted">
                {isFreelancer
                  ? "You take this share of everything they earn."
                  : "They keep this share of each service they deliver."}
              </span>
            </label>
          </ToggleRow>

          <ToggleRow
            label="Chair rent"
            desc="A fixed rent they pay to work here"
            on={comps.chairRent !== undefined}
            onToggle={() =>
              setComps({ chairRent: comps.chairRent === undefined ? { amount: "", frequency: "weekly" } : undefined })
            }
          >
            <label className="block">
              <FieldLabel>Rent (£)</FieldLabel>
              <input
                type="number" inputMode="decimal" value={comps.chairRent?.amount ?? ""} placeholder="250"
                onChange={(e) =>
                  setComps({ chairRent: { amount: e.target.value, frequency: comps.chairRent?.frequency ?? "weekly" } })
                }
                className={fieldInput}
              />
            </label>
            <div className="flex rounded-2xl bg-canvas p-1">
              {(["weekly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setComps({ chairRent: { amount: comps.chairRent?.amount ?? "", frequency: f } })}
                  className={`flex-1 rounded-xl py-2 text-[12px] font-medium capitalize transition-colors ${
                    (comps.chairRent?.frequency ?? "weekly") === f ? "bg-surface text-navy shadow-card" : "text-secondary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </ToggleRow>

          <button onClick={() => setPayment({ tips: !pay.tips })} className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 text-left">
            <span>
              <span className="block text-[14px] font-medium text-navy">Keeps their tips</span>
              <span className="block text-[12px] text-muted">Tips collected at checkout go to this member</span>
            </span>
            <Toggle on={pay.tips} />
          </button>
        </div>

        <div className="rounded-2xl bg-canvas px-4 py-3.5">
          <div className="text-[12px] text-muted">{isFreelancer ? "What they owe" : "What they're on"}</div>
          <div className="mt-0.5 text-[14px] font-semibold text-navy">
            {summary === "Not set up" ? "Set up later — nothing configured yet" : summary}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border px-4 py-3.5">
          <div className="text-[12px] text-muted">Payout status</div>
          <div className="mt-0.5 text-[14px] font-medium text-navy">{pay.payoutStatus}</div>
        </div>

        <p className="px-1 pt-4 text-center text-[12px] text-muted">
          Bank details and payouts are set up in Stripe — coming with payments.
        </p>
      </div>
    </div>
  );
}
