"use client";

import { motion } from "framer-motion";

// ProgressDashes — coral-active dashes for the value carousel / step progress.
// API identical to the onboarding original.
export function ProgressDashes({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex flex-1 items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          className="h-1 flex-1 rounded-full"
          animate={{ backgroundColor: i < active ? "#FF6641" : "rgba(17,17,17,0.19)" }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}
