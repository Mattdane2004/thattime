"use client";

import { useRef, useState } from "react";
import { OnboardingData } from "../OnboardingFlow";
import { PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function Screen4Verify({ data, update, onNext }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [celebrating, setCelebrating] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const onChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const full = code.join("");
  const canVerify = full.length === 6;

  const handleVerify = () => {
    update({ verified: true });
    setCelebrating(true);
    setTimeout(onNext, 1100);
  };

  if (celebrating) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-pop">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Account verified!</h2>
        <p className="text-muted mt-2">Nice — let’s personalise things.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="💬"
        title="Verify your number"
        subtitle={`We sent a 6-digit code to ${data.phone || "your phone"}. Pop it in below.`}
      />

      <div className="flex gap-2 justify-between mb-4">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={c}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-semibold rounded-2xl border border-border bg-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        ))}
      </div>

      <button className="text-sm text-brand font-medium self-center mb-auto">
        Resend code
      </button>

      <PrimaryButton onClick={handleVerify} disabled={!canVerify}>
        Verify
      </PrimaryButton>
    </div>
  );
}
