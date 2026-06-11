"use client";

import { OnboardingData } from "../OnboardingFlow";
import { PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  onRestart: () => void;
};

const SAMPLE_CARDS: Record<string, { name: string; sub: string; price: string; rating: string; tint: string }[]> = {
  salons: [
    { name: "The Curl Co.", sub: "Cut & colour · 0.4 mi", price: "from £45", rating: "4.9", tint: "from-pink-200 to-rose-200" },
    { name: "Studio Lume", sub: "Hair styling · 0.8 mi", price: "from £35", rating: "4.8", tint: "from-amber-200 to-orange-200" },
  ],
  barbers: [{ name: "Sharp & Co.", sub: "Barber · 0.3 mi", price: "from £22", rating: "4.9", tint: "from-slate-200 to-zinc-300" }],
  fitness: [{ name: "Pulse Studio", sub: "HIIT class · 0.6 mi", price: "from £18", rating: "4.7", tint: "from-lime-200 to-emerald-200" }],
  beauty: [{ name: "Glow Bar", sub: "Facials · 0.5 mi", price: "from £55", rating: "4.9", tint: "from-fuchsia-200 to-pink-200" }],
  wellness: [{ name: "Quiet Mind", sub: "Yoga · 0.9 mi", price: "from £15", rating: "4.8", tint: "from-sky-200 to-indigo-200" }],
  home: [{ name: "Spruce", sub: "Home cleaning", price: "from £40", rating: "4.7", tint: "from-teal-200 to-cyan-200" }],
  spa: [{ name: "Aurora Spa", sub: "Massage · 1.1 mi", price: "from £65", rating: "4.9", tint: "from-violet-200 to-purple-200" }],
  nails: [{ name: "Polish Lab", sub: "Nails · 0.4 mi", price: "from £28", rating: "4.8", tint: "from-rose-200 to-red-200" }],
  pets: [{ name: "Paws & Co", sub: "Grooming · 1.3 mi", price: "from £30", rating: "4.9", tint: "from-yellow-200 to-amber-200" }],
};

export default function Screen10Home({ data, onRestart }: Props) {
  const firstName = data.fullName.split(" ")[0] || "there";
  const prefs = data.preferences.length ? data.preferences : ["salons", "fitness", "beauty"];
  const cards = prefs.flatMap((p) => SAMPLE_CARDS[p] ?? []).slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🎉"
        title="All set!"
        subtitle={`We’ve tailored your feed${data.postcode ? ` for ${data.postcode}` : ""}. Start discovering services near you, ${firstName}.`}
      />

      <div className="flex-1 -mx-2 px-2 overflow-hidden">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm"
            >
              <div className={`h-20 bg-gradient-to-br ${c.tint} relative`}>
                <span className="absolute top-2 right-2 text-[10px] bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-full font-medium">
                  ★ {c.rating}
                </span>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold leading-tight">{c.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{c.sub}</div>
                <div className="text-[11px] text-brand font-medium mt-1.5">{c.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <PrimaryButton onClick={() => alert("This is the end of the prototype — happy browsing!")}>
          Start browsing
        </PrimaryButton>
        <button onClick={onRestart} className="w-full text-xs text-muted py-2 hover:text-foreground transition">
          Restart onboarding
        </button>
      </div>
    </div>
  );
}
