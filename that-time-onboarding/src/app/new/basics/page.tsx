"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore } from "@/lib/store/wizardStore";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import type { OfferType } from "@/lib/types";

// Wizard step 1 — "The basics" (name + category). Functional port of the legacy
// that-time-app /routes/wizard/Basics.jsx. The icon picker, class-visibility
// controls, and the later wizard steps (locations, staff, price…) are backlog;
// Continue routes to the hub as a temporary completion. See PORTING.md.

const HINTS: Record<OfferType, { title: string; hint: string; placeholder: string }> = {
  service: { title: "service", hint: "Give this service a name and a category.", placeholder: "e.g. Classic haircut" },
  class: { title: "course", hint: "Give this course or training session a name and category.", placeholder: "e.g. Lip filler foundation course" },
  bundle: { title: "bundle", hint: "Give this bundle a name and a category.", placeholder: "e.g. Cut + colour package" },
  subscription: { title: "membership", hint: "Give this membership a name and a category.", placeholder: "e.g. Monthly cuts membership" },
};

export default function BasicsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);

  const meta = HINTS[draft.type ?? "service"];
  const canContinue = Boolean(draft.name.trim() && draft.category);

  const onContinue = () => {
    if (!canContinue) return;
    // TODO(phase-4): route to /new/locations once later wizard steps are ported.
    resetDraft();
    router.push("/app/hub");
  };

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">The basics</div>
          <div className="mt-1 text-[14px] text-muted">{meta.hint}</div>
        </div>

        <div className="space-y-6 pb-6">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-secondary">Name</span>
            <input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder={meta.placeholder}
              className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>

          <div>
            <span className="mb-2 block text-[13px] font-medium text-secondary">Category</span>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((cat) => {
                const selected = draft.category === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => updateDraft({ category: cat.name })}
                    style={selected ? { backgroundColor: tintFromHex(cat.color, 0.16) } : undefined}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
                      selected ? "border-transparent text-navy" : "border-border text-secondary hover:bg-canvas"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          Continue
        </button>
      </div>
    </>
  );
}
