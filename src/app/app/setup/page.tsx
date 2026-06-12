"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, CircleDashed, Circle, LockKeyhole } from "lucide-react";
import { setupLevels, STATUS_LABEL, setupProgress, type StepStatus } from "@/lib/data/setupGuide";

// Setup guide — ported from the legacy that-time-app /routes/SetupGuide.jsx.
// Tiered checklist with per-step status. The individual setup task screens are
// backlog (steps are inert).

const STATUS_STYLE: Record<StepStatus, string> = {
  done: "bg-success/10 text-success",
  current: "bg-navy text-white",
  todo: "bg-canvas text-secondary",
  locked: "bg-canvas text-muted",
};

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "done") return <CheckCircle2 size={19} className="text-success" strokeWidth={2} />;
  if (status === "current") return <CircleDashed size={19} className="text-navy" strokeWidth={2} />;
  if (status === "locked") return <LockKeyhole size={18} className="text-muted" strokeWidth={1.8} />;
  return <Circle size={19} className="text-muted" strokeWidth={2} />;
}

export default function SetupGuidePage() {
  const router = useRouter();
  const { done, total } = setupProgress();

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex h-16 items-center px-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-surface">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">Setup guide</span>
      </div>

      <div className="px-4 pb-2">
        <div className="rounded-2xl bg-navy px-4 py-4 text-white">
          <div className="text-[13px] font-medium">{done} of {total} steps done</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-8 pt-3">
        {setupLevels.map((level) => (
          <div key={level.key}>
            <div className="mb-2 px-1 text-[13px] font-semibold text-navy">{level.title}</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {level.steps.map((step, i) => (
                <div key={step.label} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                  <StatusIcon status={step.status} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-[14px] font-medium ${step.status === "locked" ? "text-muted" : "text-navy"}`}>{step.label}</div>
                    <div className="truncate text-[12px] text-muted">{step.desc}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[step.status]}`}>{STATUS_LABEL[step.status]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
