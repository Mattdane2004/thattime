"use client";

import { OnboardingData } from "../OnboardingFlow";
import { GhostButton, PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function Screen8Notifications({ update, onNext }: Props) {
  const choose = (allow: boolean) => {
    update({ notificationsAllowed: allow });
    onNext();
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🔔"
        title="Stay in the loop"
        subtitle="Get updates on your bookings, offers, and new services."
      />

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-soft animate-pulse-ring" />
          <div className="absolute inset-3 rounded-full bg-white shadow-md flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="#ff5a5f">
              <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </div>

        <ul className="space-y-2.5 text-sm self-stretch px-2">
          {[
            { icon: "✅", text: "Booking confirmations & reminders" },
            { icon: "🎁", text: "Exclusive offers from your favourites" },
            { icon: "✨", text: "New providers near you" },
          ].map((row) => (
            <li key={row.text} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center" aria-hidden>
                {row.icon}
              </span>
              <span className="text-foreground/80">{row.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={() => choose(true)}>Allow notifications</PrimaryButton>
        <GhostButton onClick={() => choose(false)}>Maybe later</GhostButton>
      </div>
    </div>
  );
}
