"use client";

import { useRef } from "react";

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label: string;
};

export function CodeInput({ value, onChange, length = 6, label }: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, index) => value[index] ?? "");

  function updateAt(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const next = chars.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handlePaste(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, length) - 1]?.focus();
  }

  return (
    <div>
      <div className="mb-2 text-[14px] text-secondary">{label}</div>
      <div className="grid grid-cols-6 gap-2">
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={char}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`${label} digit ${index + 1}`}
            className="h-14 rounded-xl border border-border bg-white text-center text-[22px] font-semibold text-navy outline-none transition-colors focus:border-navy"
            onChange={(event) => updateAt(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(event.clipboardData.getData("text"));
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !chars[index] && index > 0) {
                refs.current[index - 1]?.focus();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
