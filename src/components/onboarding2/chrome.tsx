"use client";

import { create } from "zustand";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { StatusBar, Wordmark } from "@/components/onboarding2/Shell";

/**
 * Persistent onboarding chrome: the status bar and header live OUTSIDE the
 * route transition so they never remount between steps — only page content
 * animates. Pages can override the back action (e.g. the value carousel
 * steps back through slides before leaving the route).
 */

type ChromeStore = {
  backHandler: (() => void) | null;
  setBackHandler: (fn: (() => void) | null) => void;
};

export const useFlowChrome = create<ChromeStore>((set) => ({
  backHandler: null,
  setBackHandler: (fn) => set({ backHandler: fn }),
}));

type ChromeConfig = {
  header: "full" | "status" | "none";
  bg: string;
};

const PEACH = "linear-gradient(180deg, #FDF6EE 0%, #F6E3D3 100%)";

function configFor(path: string): ChromeConfig {
  const rules: [RegExp, ChromeConfig][] = [
    [/^\/onboarding\/welcome/, { header: "status", bg: "#F7F0E8" }],
    [/^\/onboarding\/preparing/, { header: "status", bg: "#FFFFFF" }],
    [/^\/onboarding\/(value|trial)/, { header: "full", bg: "#F5F3EF" }],
    [/^\/onboarding\/first-step/, { header: "full", bg: PEACH }],
    [/^\/onboarding\/business\/(address\/confirm|travel-area)/, { header: "full", bg: "#FFFFFF" }],
    [/^\/client\/(setup|location|notifications|audience)/, { header: "full", bg: "#F5F3EF" }],
    [/^\/client\/categories/, { header: "full", bg: "#FFFFFF" }],
    [/^\/client\/finding/, { header: "status", bg: "#FFFFFF" }],
    [/^\/client\/home/, { header: "none", bg: "#F5F3EF" }],
    [/^\/client\/business/, { header: "none", bg: "#FFFFFF" }],
    [/^\/client\/book\/confirmed/, { header: "status", bg: "#F5F3EF" }],
  ];
  for (const [re, cfg] of rules) if (re.test(path)) return cfg;
  return { header: "full", bg: "#F7F0E8" };
}

export function OnboardingChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const backHandler = useFlowChrome((s) => s.backHandler);
  const cfg = configFor(pathname);
  const noBack = /\/(welcome|first-step)$/.test(pathname);

  if (cfg.header === "none") return null;

  return (
    <div className="relative z-20 shrink-0">
      <StatusBar />
      {cfg.header === "full" && (
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <div className="w-12">
            {!noBack && (
              <motion.button
                type="button"
                aria-label="Back"
                whileTap={{ scale: 0.9 }}
                onClick={() => (backHandler ? backHandler() : router.back())}
                className="-ml-2 flex h-9 w-9 items-center justify-center text-navy"
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </motion.button>
            )}
          </div>
          <Wordmark width={94} />
          <div className="w-12 text-right">
            <span className="text-[13px] text-muted">Help</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Background layer that crossfades between section tones. */
export function ChromeBackground() {
  const pathname = usePathname();
  const cfg = configFor(pathname);
  return (
    <div
      aria-hidden
      className="absolute inset-0 transition-[background] duration-300 ease-out"
      style={{ background: cfg.bg }}
    />
  );
}
