"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// CheckCircle — round selection indicator (used by SelectCard, standalone lists).
// Same API as the onboarding original: <CheckCircle on={selected} />.
export function CheckCircle({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
        on ? "bg-fg-primary" : "border border-border bg-white",
        className,
      )}
    >
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex"
          >
            <Check size={12} strokeWidth={3} className="text-white" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
