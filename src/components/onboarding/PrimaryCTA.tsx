"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { motion } from "framer-motion";

type PrimaryCTAProps = {
  children: ReactNode;
  loading?: boolean;
  tone?: "navy" | "white";
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
};

export function PrimaryCTA({
  children,
  loading = false,
  tone = "navy",
  disabled,
  className = "",
  type = "button",
  ...props
}: PrimaryCTAProps) {
  const isWhite = tone === "white";

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={[
        "flex h-14 w-full items-center justify-center rounded-xl text-[16px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isWhite
          ? "bg-white text-navy focus:ring-white focus:ring-offset-navy"
          : "bg-navy text-white focus:ring-navy focus:ring-offset-canvas",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <span
          className={`h-5 w-5 rounded-full border-2 border-t-transparent ${isWhite ? "border-navy" : "border-white"}`}
          style={{ animation: "spin 0.8s linear infinite" }}
          aria-label="Loading"
        />
      ) : (
        children
      )}
    </motion.button>
  );
}
