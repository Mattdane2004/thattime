import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// SegmentedControl — the pill tab toggle (Business/Profile, 12h/24h, etc.).
// Controlled; generic over the option value type.
export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("flex rounded-full border border-border bg-surface p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "flex-1 rounded-full py-2 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy",
              active ? "bg-navy text-white" : "text-secondary hover:text-navy",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
