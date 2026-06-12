import type { ButtonHTMLAttributes, ReactNode } from "react";

// Chip atom — the selectable pill used for filters, categories, tag toggles.
// Replaces the repeated `rounded-full border px-3 py-1.5 …` selection pills.
// Use `selected` for toggle state; it's a <button> so it stays keyboard-usable.

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors";

export function Chip({ selected = false, className = "", type = "button", children, ...props }: ChipProps) {
  const state = selected ? "bg-navy text-white" : "bg-canvas text-secondary hover:bg-border/40";
  return (
    <button type={type} className={[BASE, state, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </button>
  );
}
