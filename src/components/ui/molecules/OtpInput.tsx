"use client";

import { useEffect, useRef, useState } from "react";

// OtpInput — 6-box code entry with auto-advance + backspace nav; fires onComplete
// when all six are filled. API identical to the onboarding original.
export function OtpInput({ onComplete }: { onComplete?: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const done = useRef(false);

  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !done.current) {
      done.current = true;
      onComplete?.(code);
    }
  }, [digits, onComplete]);

  return (
    <div className="flex gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            setDigits((prev) => {
              const next = [...prev];
              next[i] = v;
              return next;
            });
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-[52px] w-full min-w-0 flex-1 rounded-xl border border-border bg-white text-center text-[20px] font-semibold text-navy focus:border-navy focus:outline-none"
        />
      ))}
    </div>
  );
}
