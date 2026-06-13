"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

// Pill CTAs (mid-fi). These are the app's in-use button shapes; the shadcn
// `Button` (cva) is the longer-term primitive these will fold into as the
// design-system look-and-feel is settled. Kept verbatim so appearance is stable.

/** Full-width pill CTA with loading + ink/coral tones (onboarding + flows). */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  tone = "ink",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "ink" | "orange";
}) {
  const enabled = !disabled && !loading;
  return (
    <motion.button
      type="button"
      whileTap={enabled ? { scale: 0.97 } : undefined}
      onClick={enabled ? onClick : undefined}
      aria-disabled={!enabled}
      className={`flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-colors duration-200 ${
        enabled
          ? tone === "orange"
            ? "bg-coral text-white"
            : "bg-fg-primary text-white"
          : "bg-[#807B75] text-white/90"
      }`}
    >
      {loading ? (
        <span
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
}

/** Dark primary pill used across the product surfaces. */
export function DarkButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${
        disabled ? "bg-canvas text-muted" : "bg-fg-primary text-white"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

/** Bordered ghost pill (secondary action). */
export function GhostButton({
  children,
  onClick,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white text-[15px] font-semibold text-navy ${className}`}
    >
      {children}
    </motion.button>
  );
}
