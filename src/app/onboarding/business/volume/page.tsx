"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function VolumePage() {
  const router = useRouter();
  const { weeklyBookings, set } = useOnboarding2();
  const clamp = (n: number) => Math.min(100, Math.max(1, n));

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/onboarding/business/price")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="A rough guess is fine. We'll use this to estimate your monthly booking volume.">
        How many bookings do you take in a typical week?
      </Title>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="relative h-[88px] overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={weeklyBookings}
              initial={{ y: 26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -26, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="block font-display text-[72px] font-extrabold leading-none text-navy"
            >
              {weeklyBookings}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-1 text-[17px] text-navy">per week</p>

        <div className="mt-8 flex w-full items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            aria-label="Fewer bookings"
            onClick={() => set("weeklyBookings", clamp(weeklyBookings - 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0E6DC] text-[18px] text-navy"
          >
            −
          </motion.button>
          <input
            type="range"
            min={1}
            max={100}
            value={weeklyBookings}
            onChange={(e) => set("weeklyBookings", Number(e.target.value))}
            className="tt-slider w-full"
            aria-label="Bookings per week"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            aria-label="More bookings"
            onClick={() => set("weeklyBookings", clamp(weeklyBookings + 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0E6DC] text-[18px] text-navy"
          >
            +
          </motion.button>
        </div>
      </div>
    </Screen>
  );
}
