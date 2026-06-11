"use client";

import { OnboardingData } from "../OnboardingFlow";
import { PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

const OPTIONS = [
  { value: "female", label: "Female", emoji: "👩" },
  { value: "male", label: "Male", emoji: "👨" },
  { value: "non-binary", label: "Non-binary", emoji: "🧑" },
  { value: "prefer-not", label: "Prefer not to say", emoji: "🤍" },
];

export default function Screen6Gender({ data, update, onNext }: Props) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🌈"
        title="How do you identify?"
        subtitle="This helps us tailor services to you."
      />

      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {OPTIONS.map((opt) => {
          const selected = data.gender === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => update({ gender: opt.value })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selected
                  ? "border-brand bg-brand-soft shadow-[0_8px_24px_-12px_rgba(255,90,95,0.6)]"
                  : "border-border bg-white hover:border-foreground/20"
              }`}
            >
              <div className="text-2xl mb-2" aria-hidden>{opt.emoji}</div>
              <div className="font-medium text-sm">{opt.label}</div>
            </button>
          );
        })}
      </div>

      <PrimaryButton onClick={onNext} disabled={!data.gender}>
        Next
      </PrimaryButton>
    </div>
  );
}
