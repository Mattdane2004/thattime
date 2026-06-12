"use client";

import { ChevronDown } from "lucide-react";

// Shared input shell (matches the onboarding field styling, token-driven).
export const inputClass =
  "h-[52px] w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:border-navy focus:outline-none transition-colors";

// PhoneInput — +44 dial prefix + tel input. API identical to the onboarding original.
export function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-4 text-[15px] text-navy">
        + 44
        <ChevronDown size={14} strokeWidth={1.75} className="text-secondary" />
      </div>
      <input
        type="tel"
        inputMode="tel"
        placeholder="7123 456789"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d ]/g, ""))}
        className={inputClass}
      />
    </div>
  );
}
