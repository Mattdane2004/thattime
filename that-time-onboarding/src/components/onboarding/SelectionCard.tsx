"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type SelectionCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  meta?: string;
  onClick: () => void;
};

export function SelectionCard({
  icon,
  title,
  description,
  meta,
  onClick,
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left transition-shadow hover:shadow-card focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[17px] font-semibold leading-6 text-navy">{title}</span>
          {meta ? (
            <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-[12px] font-semibold text-success">
              {meta}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-[14px] leading-5 text-secondary">
          {description}
        </span>
      </span>
      <ChevronRight
        size={18}
        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
      />
    </motion.button>
  );
}
