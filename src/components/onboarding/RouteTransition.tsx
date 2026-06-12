"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Gentle crossfade + short slide between onboarding steps. Old and new pages
// overlap (no mode="wait"), so there's no collapse-and-expand gap; the chrome
// (status bar, header, background) lives outside this wrapper and never moves.
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-0 flex-1">
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          className="absolute inset-0 flex flex-col"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] } }}
          exit={{ opacity: 0, x: -12, transition: { duration: 0.2, ease: "easeIn" } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
