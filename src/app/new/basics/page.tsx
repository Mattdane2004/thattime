"use client";

import { useRouter } from "next/navigation";
import { Scissors, Users, Package, Repeat } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import type { OfferType } from "@/lib/types";

// Wizard step 1 — "The basics" (Figma 12135:45389): icon, name, category,
// description. Branches into the type-specific step sequence.

const HINTS: Record<OfferType, { hint: string; placeholder: string }> = {
  service: { hint: "Give this service a name and a category.", placeholder: "e.g. Classic haircut" },
  class: { hint: "Give this class or course a name and a category.", placeholder: "e.g. Beginner yoga" },
  bundle: { hint: "Give this bundle a name and a category.", placeholder: "e.g. Cut + colour package" },
  subscription: { hint: "Give this membership a name and a category.", placeholder: "e.g. Monthly cuts membership" },
};

const TYPE_ICON: Record<OfferType, typeof Scissors> = {
  service: Scissors, class: Users, bundle: Package, subscription: Repeat,
};

export default function BasicsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);

  const type = draft.type ?? "service";
  const meta = HINTS[type];
  const Icon = TYPE_ICON[type];
  const selectedCat = defaultCategories.find((c) => c.name === draft.category);
  const canContinue = Boolean(draft.name.trim() && draft.category);

  const onContinue = () => {
    if (!canContinue) return;
    if (type === "subscription") router.push("/new/subscription-type");
    else if (type === "bundle") router.push("/new/bundle-services");
    else if (type === "class") router.push("/new/class-participants");
    else router.push("/new/locations");
  };

  return (
    <>
      <ScreenHeader onClose={() => router.push("/app/hub")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="The basics" subtitle={meta.hint} />

        <div className="space-y-5 pb-6">
          <div>
            <FieldLabel>Icon</FieldLabel>
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tintFromHex(selectedCat?.color ?? "#9CA3AF", 0.16) }}
              >
                <Icon size={22} style={{ color: selectedCat?.color ?? "#6B7280" }} strokeWidth={1.75} />
              </span>
              <span className="text-[13px] text-muted">Icon follows the category colour</span>
            </div>
          </div>

          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder={meta.placeholder}
              className={fieldInput}
            />
          </label>

          <div>
            <FieldLabel>Category</FieldLabel>
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

          <label className="block">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="Short description shown to clients"
              rows={4}
              className="w-full resize-none rounded-xl bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>
        </div>
      </div>

      <WizardFooter
        step={1}
        total={TOTAL_STEPS[type]}
        onBack={() => router.push("/new/type")}
        onNext={onContinue}
        disabled={!canContinue}
      />
    </>
  );
}
