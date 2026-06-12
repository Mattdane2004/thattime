"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// CheckRow — small square checkbox + label/sub (terms, marketing opt-in).
// API identical to the onboarding original.
export function CheckRow({
  checked,
  onToggle,
  title,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 text-left">
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
          checked ? "border-navy bg-fog" : "border-border bg-white",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} className="text-navy" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-snug text-navy">{title}</span>
        {sub && <span className="mt-0.5 block text-[11px] text-muted">{sub}</span>}
      </span>
    </button>
  );
}
