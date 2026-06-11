"use client";

import { OnboardingData } from "../OnboardingFlow";
import { Field, PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function Screen7Location({ data, update, onNext }: Props) {
  const valid = !!data.postcode.trim() || data.locationGranted;

  const grantLocation = () => {
    update({ locationGranted: true, postcode: data.postcode || "E1 6AN" });
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="📍"
        title="Where are you?"
        subtitle="This helps us show services near you."
      />

      <div className="flex-1 space-y-4">
        <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-[#e8f0ff] to-[#dde7ff] border border-border">
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 160" fill="none">
            <path d="M0 100 Q100 60 200 90 T400 80" stroke="#a0b4ff" strokeWidth="2" fill="none" />
            <path d="M0 130 Q120 90 240 120 T400 110" stroke="#a0b4ff" strokeWidth="2" fill="none" />
            <circle cx="80" cy="50" r="20" fill="#c5d1ff" />
            <rect x="260" y="40" width="60" height="40" rx="6" fill="#c5d1ff" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-brand/20 animate-pulse-ring" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff5a5f">
                  <path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={grantLocation}
          className={`w-full p-4 rounded-2xl border flex items-center justify-between transition ${
            data.locationGranted
              ? "border-brand bg-brand-soft"
              : "border-border bg-white hover:border-foreground/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A8.99 8.99 0 0 0 13 3.06V1h-2v2.06A8.99 8.99 0 0 0 3.06 11H1v2h2.06A8.99 8.99 0 0 0 11 20.94V23h2v-2.06A8.99 8.99 0 0 0 20.94 13H23v-2h-2.06z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Use current location</div>
              <div className="text-xs text-muted">Fastest way to find nearby</div>
            </div>
          </div>
          <span className="text-xs text-brand font-medium">
            {data.locationGranted ? "Enabled" : "Allow"}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Field
          label="Postcode"
          placeholder="E1 6AN"
          value={data.postcode}
          onChange={(e) => update({ postcode: e.target.value })}
        />
      </div>

      <PrimaryButton onClick={onNext} disabled={!valid}>
        Next
      </PrimaryButton>
    </div>
  );
}
