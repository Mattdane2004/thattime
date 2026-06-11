"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ChipProps = {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  full?: boolean;
};

export function Chip({ selected, children, onClick, icon, full }: ChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2",
        full ? "w-full" : "",
        selected
          ? "border border-navy bg-navy text-white"
          : "border border-border bg-white text-navy hover:border-navy/30",
      ].join(" ")}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </motion.button>
  );
}
