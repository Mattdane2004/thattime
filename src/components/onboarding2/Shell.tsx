"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
export function Wordmark({ width = 96 }: { width?: number }) {
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

/** Header row: back chevron · wordmark · Help. */
export function FlowHeader({
  onBack,
  showBack = true,
}: {
  onBack?: () => void;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2">
      <div className="w-12">
        {showBack && (
          <motion.button
            type="button"
            aria-label="Back"
            whileTap={{ scale: 0.9 }}
            onClick={onBack ?? (() => router.back())}
            className="-ml-1 flex h-9 w-9 items-center justify-center text-navy"
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden>
              <path
                d="M8.5 1.5 1.5 9l7 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </div>
      <Wordmark width={84} />
      <div className="w-12 text-right">
        <span className="text-[13px] text-muted">Help</span>
      </div>
    </div>
  );
}

/**
 * Standard screen scaffold for the new onboarding: status bar + header +
 * scrollable content + pinned CTA slot. Tone "cream" for value/marketing
 * screens, "fog" for forms.
 */
export function Screen({
  children,
  footer,
  tone = "fog",
  showBack = true,
  onBack,
  chrome = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  tone?: "fog" | "cream" | "white";
  showBack?: boolean;
  onBack?: () => void;
  chrome?: boolean;
}) {
  const bg = tone === "cream" ? "bg-cream" : tone === "white" ? "bg-white" : "bg-fog";
  return (
    <div className={`flex h-full min-h-0 flex-col ${bg} font-body text-navy`}>
      {chrome && (
        <>
          <StatusBar />
          <FlowHeader showBack={showBack} onBack={onBack} />
        </>
      )}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-navy"
      >
        {children}
      </motion.h1>
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: "easeOut" }}
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
