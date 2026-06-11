"use client";

import { useState } from "react";
import { OnboardingData } from "../OnboardingFlow";
import { PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

const CATEGORIES = [
  { id: "salons", label: "Salons", emoji: "💇‍♀️" },
  { id: "barbers", label: "Barbers", emoji: "💈" },
  { id: "fitness", label: "Fitness", emoji: "🏋️" },
  { id: "beauty", label: "Beauty", emoji: "💅" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
  { id: "home", label: "Home services", emoji: "🏠" },
  { id: "spa", label: "Spa & massage", emoji: "💆" },
  { id: "nails", label: "Nails", emoji: "💖" },
  { id: "pets", label: "Pet care", emoji: "🐾" },
];

export default function Screen9Preferences({ data, update, onNext }: Props) {
  const [celebrating, setCelebrating] = useState(false);

  const toggle = (id: string) => {
    const has = data.preferences.includes(id);
    update({
      preferences: has
        ? data.preferences.filter((p) => p !== id)
        : [...data.preferences, id],
    });
  };

  const canContinue = data.preferences.length > 0;

  const handleDone = () => {
    setCelebrating(true);
    setTimeout(onNext, 1100);
  };

  if (celebrating) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-brand-soft flex items-center justify-center mb-5 animate-pop">
          <span className="text-5xl" aria-hidden>🎉</span>
        </div>
        <h2 className="text-2xl font-bold">Preferences saved!</h2>
        <p className="text-muted mt-2">Curating your feed…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🎯"
        title="What services do you like?"
        subtitle="Pick your favourites to tailor your feed."
      />

      <div className="flex flex-wrap gap-2 flex-1 content-start">
        {CATEGORIES.map((c) => {
          const selected = data.preferences.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`px-4 h-11 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${
                selected
                  ? "border-brand bg-brand text-white shadow-[0_8px_18px_-10px_rgba(255,90,95,0.7)]"
                  : "border-border bg-white text-foreground hover:border-foreground/20"
              }`}
            >
              <span aria-hidden>{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted mb-3 text-center">
        {data.preferences.length} selected · pick as many as you like
      </p>
      <PrimaryButton onClick={handleDone} disabled={!canContinue}>
        Done
      </PrimaryButton>
    </div>
  );
}
