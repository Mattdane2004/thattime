"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/** iOS-style status bar (9:41, signal, battery) used on every screen. */
export function StatusBar({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const c = tone === "ink" ? "text-navy" : "text-white";
  const bar = tone === "ink" ? "bg-navy" : "bg-white";
  const ring = tone === "ink" ? "border-navy" : "border-white";
  return (
    <div className={`flex h-12 shrink-0 items-center justify-between px-8 ${c}`}>
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-[2px]">
          {[6, 8, 11, 14].map((h) => (
            <span key={h} className={`${bar} w-1 rounded-full`} style={{ height: h }} />
          ))}
        </div>
        <div className={`relative h-[14px] w-[27px] rounded-[5px] border ${ring}`}>
          <span className={`absolute inset-[2px] right-[5px] rounded-[3px] ${bar}`} />
          <span className={`absolute -right-1 top-1 h-[6px] w-[2px] rounded-r ${bar}`} />
        </div>
      </div>
    </div>
  );
}

/** that:time wordmark (SVG asset exported from Figma). */
export function Wordmark({ width = 94 }: { width?: number }) {
  return (
    <Image
      src="/onboarding/logo-thattime.svg"
      alt="that:time"
      width={width}
      height={Math.round(width * 0.155)}
      priority
      style={{ width, height: "auto" }}
    />
  );
}

/**
 * Screen scaffold for onboarding content. Chrome (status bar, header, section
 * background) is owned by the route layout so it persists across steps — this
 * only lays out scrollable content plus a pinned footer.
 */
export function Screen({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      {footer && <div className="shrink-0 px-6 pb-6 pt-3">{footer}</div>}
    </div>
  );
}

/** Page title + optional sub copy, Fresha-style generous type. */
export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-6 pb-2 pt-1">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-navy"
      >
        {children}
      </motion.h1>
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.04, ease: "easeOut" }}
          className="mt-2 text-[15px] leading-snug text-secondary"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

export function TermsFootnote() {
  return (
    <p className="pt-3 text-center text-[10px] text-secondary">
      By using That Time you agree to our{" "}
      <span className="underline">Terms and Privacy Policy</span>.
    </p>
  );
}
