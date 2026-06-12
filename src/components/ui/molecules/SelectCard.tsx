"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle } from "../atoms/CheckCircle";

// SelectCard — selectable option card with leading icon + right-side check.
// API identical to the onboarding original (single or multi select).
export function SelectCard({
  icon,
  title,
  desc,
  selected,
  onClick,
  badge,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  selected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-colors",
        selected ? "border-navy" : "border-border",
      )}
    >
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fog text-navy">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{title}</span>
        {desc && <span className="mt-0.5 block text-[13px] leading-snug text-secondary">{desc}</span>}
      </span>
      {badge}
      <CheckCircle on={!!selected} />
    </motion.button>
  );
}
