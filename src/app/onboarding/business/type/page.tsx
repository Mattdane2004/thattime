"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Hand, Sparkles, Flower2, Leaf, Eye, Dumbbell, Syringe, House,
  Search, SlidersHorizontal,
} from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, inputClass } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const types: { id: string; label: string; icon: JSX.Element }[] = [
  { id: "hair-salon", label: "Hair Salon", icon: <Scissors size={24} strokeWidth={1.5} /> },
  { id: "nails", label: "Nails", icon: <Hand size={24} strokeWidth={1.5} /> },
  { id: "beauty", label: "Beauty", icon: <Sparkles size={24} strokeWidth={1.5} /> },
  { id: "spa", label: "Spa", icon: <Flower2 size={24} strokeWidth={1.5} /> },
  { id: "wellness", label: "Wellness", icon: <Leaf size={24} strokeWidth={1.5} /> },
  { id: "brows-lashes", label: "Brows and lashes", icon: <Eye size={24} strokeWidth={1.5} /> },
  { id: "fitness", label: "Fitness", icon: <Dumbbell size={24} strokeWidth={1.5} /> },
  { id: "aesthetics", label: "Aesthetics", icon: <Syringe size={24} strokeWidth={1.5} /> },
  { id: "home-diy", label: "Home DIY", icon: <House size={24} strokeWidth={1.5} /> },
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
            <Search
              size={15}
              strokeWidth={1.75}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
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
            <SlidersHorizontal size={16} strokeWidth={1.75} />
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
