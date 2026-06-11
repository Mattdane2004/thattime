"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";

// Wizard final step (service path) — "Price & duration". Functional port of the
// legacy that-time-app /routes/wizard/Price.jsx (service branch). The class /
// bundle / subscription pricing panels are backlog. Create routes back to the
// hub as a temporary save endpoint — see PORTING.md.

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function PricePage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);

  const canCreate = Boolean(draft.price && draft.durationMin > 0);

  const create = () => {
    if (!canCreate) return;
    resetDraft();
    router.push("/app/hub");
  };

  const stepDuration = (delta: number) =>
    updateDraft({ durationMin: Math.max(15, draft.durationMin + delta) });

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/staff")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-10 pt-2">
          <div className="text-[28px] font-semibold leading-tight tracking-tight text-navy">Price &amp; duration</div>
          <div className="mt-1 text-[14px] text-muted">How much, how long, and what to charge up front.</div>
        </div>

        <div className="space-y-6 pb-6">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Price (£)</span>
            <input
              type="number"
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => updateDraft({ price: e.target.value })}
              placeholder="35"
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>

          <div>
            <span className="mb-2 block text-[13px] font-medium text-secondary">Duration</span>
            <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
              <button onClick={() => stepDuration(-15)} aria-label="Less" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-navy hover:bg-border/40">
                <Minus size={16} />
              </button>
              <span className="text-[15px] font-semibold text-navy">{draft.durationMin} min</span>
              <button onClick={() => stepDuration(15)} aria-label="More" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-navy hover:bg-border/40">
                <Plus size={16} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => updateDraft({ durationMin: d })}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    draft.durationMin === d ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => updateDraft({ depositEnabled: !draft.depositEnabled })}
            className="flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left"
          >
            <div>
              <div className="text-[14px] font-medium text-navy">Require a deposit</div>
              <div className="text-[12px] text-muted">Charge part of the price up front</div>
            </div>
            <span className={`relative h-6 w-10 rounded-full transition-colors ${draft.depositEnabled ? "bg-navy" : "bg-border"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${draft.depositEnabled ? "left-[1.125rem]" : "left-0.5"}`} />
            </span>
          </button>

          {draft.depositEnabled && (
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Deposit amount (£)</span>
              <input
                type="number"
                inputMode="decimal"
                value={draft.depositAmount}
                onChange={(e) => updateDraft({ depositAmount: e.target.value })}
                placeholder="10"
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
              />
            </label>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <button
          onClick={create}
          disabled={!canCreate}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          Create service
        </button>
      </div>
    </>
  );
}
