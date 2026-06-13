"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function PricePage() {
  const router = useRouter();
  const { avgPrice, set } = useOnboarding2();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!avgPrice} onClick={() => router.push("/onboarding/value")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="No need to dig through receipts. Your best guess is enough.">
        what does a booking usually cost?
      </Title>
      <div className="flex flex-1 items-center justify-center px-6">
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => inputRef.current?.focus()}
          className="flex items-end gap-2"
        >
          <span className="pb-2 font-display text-[44px] font-extrabold text-muted">£</span>
          <span className="border-b border-border pb-1">
            <input
              ref={inputRef}
              value={avgPrice || ""}
              onChange={(e) => set("avgPrice", Number(e.target.value.replace(/\D/g, "").slice(0, 4)) || 0)}
              inputMode="numeric"
              className="w-[150px] bg-transparent text-center font-display text-[64px] font-extrabold leading-none text-navy focus:outline-none"
              aria-label="Average booking price in pounds"
            />
          </span>
        </motion.button>
      </div>
    </Screen>
  );
}
