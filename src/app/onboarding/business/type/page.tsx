"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, inputClass } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const types: { id: string; label: string; icon: JSX.Element }[] = [
  {
    id: "hair-salon",
    label: "Hair Salon",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8.2 7.8 20 19M8.2 16.2 20 5" />
      </svg>
    ),
  },
  {
    id: "nails",
    label: "Nails",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM6 14h12l-1 7H7l-1-7Z" />
      </svg>
    ),
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6ZM18.5 14.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
      </svg>
    ),
  },
  {
    id: "spa",
    label: "Spa",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 4c1.8 2 2.8 4.2 2.8 6.4A2.8 2.8 0 0 1 12 13a2.8 2.8 0 0 1-2.8-2.6C9.2 8.2 10.2 6 12 4Z" /><path d="M4 14c2.5 4 5.2 6 8 6s5.5-2 8-6c-2.7-.8-5.3-.4-8 1.4C9.3 13.6 6.7 13.2 4 14Z" />
      </svg>
    ),
  },
  {
    id: "wellness",
    label: "Wellness",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="5" r="2" /><path d="M7 11c2-1.8 8-1.8 10 0M12 9v6m0 0-3.5 5M12 15l3.5 5" />
      </svg>
    ),
  },
  {
    id: "brows-lashes",
    label: "Brows and lashes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12c2.7-3.4 13.3-3.4 16 0M7 14l-1 2.4M11 15v2.6M15 14l1 2.4" />
      </svg>
    ),
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12h3m14 0h3M7 8v8m10-8v8M7 12h10" />
      </svg>
    ),
  },
  {
    id: "aesthetics",
    label: "Aesthetics",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m14 4 6 6-9.5 9.5a2.1 2.1 0 0 1-3-3L14 4ZM12 6l6 6M5 19l-1 1" />
      </svg>
    ),
  },
  {
    id: "home-diy",
    label: "Home DIY",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m3 11 9-7 9 7M5 9.5V20h14V9.5" />
      </svg>
    ),
  },
];

export default function BusinessTypePage() {
  const router = useRouter();
  const { businessTypes, otherType, toggleBusinessType, set } = useOnboarding2();
  const [query, setQuery] = useState("");
  const visible = types.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()));
  const canContinue = businessTypes.length > 0 || otherType.trim().length > 0;

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!canContinue} onClick={() => router.push("/onboarding/business/team-size")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="Choose one or more so we can personalise your setup.">
        What kind of business do you run?
      </Title>
      <div className="px-6 pt-4">
        <div className="flex gap-2.5 pb-4">
          <div className="relative flex-1">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search serivces"
              className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:border-navy focus:outline-none"
            />
          </div>
          <button
            type="button"
            aria-label="Filters"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-navy"
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <path d="M1 3.5h14M1 10.5h14" />
              <circle cx="10.5" cy="3.5" r="1.8" fill="white" />
              <circle cx="5.5" cy="10.5" r="1.8" fill="white" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visible.map((t, i) => {
            const idx = businessTypes.indexOf(t.id);
            const selected = idx !== -1;
            const isPrimary = idx === 0;
            return (
              <motion.button
                key={t.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleBusinessType(t.id)}
                className={`relative rounded-2xl border bg-white p-4 pb-5 text-left transition-colors ${
                  selected ? "border-navy" : "border-border"
                }`}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      className={`absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-semibold ${
                        isPrimary ? "bg-[#FFF1E0] text-[#D97706]" : "bg-[#FFF1E0] text-[#D97706]"
                      }`}
                    >
                      {isPrimary ? "Primary" : idx + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="text-navy">{t.icon}</span>
                <span className="mt-3 block text-[14px] text-navy">{t.label}</span>
              </motion.button>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-[13px] text-secondary">Other</p>
        <input
          value={otherType}
          onChange={(e) => set("otherType", e.target.value)}
          className={inputClass}
          placeholder="Dog walking"
        />
        <div className="h-4" />
      </div>
    </Screen>
  );
}
