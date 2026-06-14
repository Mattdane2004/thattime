"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ToggleRow — a labelled switch row (settings, preferences). `tone` sets the
// active-switch accent so the business (ink) and consumer (coral) surfaces can
// share one component without homogenising their look.
export interface ToggleRowProps {
  title: ReactNode;
  sub?: ReactNode;
  on: boolean;
  onToggle: () => void;
  /** Top divider between stacked rows in a group. */
  divider?: boolean;
  tone?: "ink" | "coral";
}

export function ToggleRow({ title, sub, on, onToggle, divider, tone = "ink" }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left",
        divider && "border-t border-border",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-navy">{title}</span>
        {sub && <span className="block pt-0.5 text-[11px] leading-snug text-muted">{sub}</span>}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          on ? (tone === "coral" ? "bg-coral" : "bg-fg-primary") : "bg-border",
        )}
      >
        <motion.span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
          animate={{ left: on ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </span>
    </button>
  );
}
