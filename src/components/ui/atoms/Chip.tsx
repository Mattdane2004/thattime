import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Chip — selectable pill for filters / categories / tag toggles. Clickable
// (<button>) with a `selected` state and aria-pressed; for a static label use Badge.
export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
        selected ? "bg-navy text-white" : "bg-canvas text-secondary hover:bg-border/40",
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";
