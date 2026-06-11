"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSplash =
    pathname.includes("/value") ||
    pathname.includes("/trial") ||
    pathname.includes("/intro") ||
    pathname.includes("/save") ||
    pathname.includes("/setup-") ||
    pathname.includes("/user-type-benefits") ||
    pathname.includes("/welcome");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="absolute inset-0 flex flex-col bg-canvas"
        initial={isSplash ? { opacity: 0, scale: 0.98 } : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={isSplash ? { opacity: 0, scale: 0.98 } : { opacity: 0, x: -28 }}
        transition={{ duration: isSplash ? 0.45 : 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
