"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { initialsOf, lineTotal, runTotal } from "@/lib/data/team";
import { useTeamStore } from "@/lib/store/teamStore";

// Pay run detail — wages + commission + tips + adjustments per member, with
// a Complete action for draft runs.

export default function PayRunPage({ params }: { params: { runId: string } }) {
  const router = useRouter();
  const run = useTeamStore((s) => s.payRuns.find((r) => r.id === params.runId));
  const members = useTeamStore((s) => s.members);
  const completePayRun = useTeamStore((s) => s.completePayRun);

  if (!run) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Pay run" onBack={() => router.push("/app/team")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Pay run not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Pay run" onBack={() => router.push("/app/team")} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="rounded-2xl bg-canvas px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-navy">{run.period}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              run.status === "draft" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"
            }`}>
              {run.status === "draft" ? "Draft" : "Completed"}
            </span>
          </div>
          <div className="mt-2 text-[24px] font-bold tracking-tight text-navy">£{runTotal(run).toLocaleString()}</div>
          <div className="text-[12px] text-muted">{run.lines.length} team members</div>
        </div>

        <div className="mt-4 space-y-2">
          {run.lines.map((l) => {
            const m = members.find((x) => x.id === l.staffId);
            if (!m) return null;
            return (
              <div key={l.staffId} className="rounded-2xl border border-border px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${m.avatarColor}`}>
                    {initialsOf(m.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{m.name}</span>
                    <span className="block text-[12px] text-muted">{m.role}</span>
                  </span>
                  <span className="text-[15px] font-bold text-navy">£{lineTotal(l).toLocaleString()}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
                  {[
                    { label: "Wages", value: l.wages },
                    { label: "Commission", value: l.commission },
                    { label: "Tips", value: l.tips },
                    { label: "Adjust", value: l.adjustments },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="text-[10px] uppercase tracking-wide text-muted">{c.label}</div>
                      <div className={`mt-0.5 text-[13px] font-semibold ${c.value < 0 ? "text-danger" : "text-navy"}`}>
                        {c.value < 0 ? `-£${Math.abs(c.value)}` : `£${c.value}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {run.status === "draft" && (
        <div className="shrink-0 border-t border-border px-5 py-4">
          <button
            onClick={() => completePayRun(run.id)}
            className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90"
          >
            Complete pay run · £{runTotal(run).toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}
