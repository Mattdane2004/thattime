"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function StaffDonePage() {
  const router = useRouter();
  const staffBusiness = useOnboarding2((s) => s.staffBusiness);

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/staff/home")}>
          Go to my schedule
        </PrimaryButton>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#FFE9E0]"
        >
          <motion.svg
            width="44"
            height="34"
            viewBox="0 0 44 34"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            <motion.path
              d="M4 18 16 30 40 4"
              stroke="#FF6641"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            />
          </motion.svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 font-display text-[30px] font-extrabold tracking-tight text-navy"
        >
          You&rsquo;re on the team.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42 }}
          className="mt-3 text-[15px] leading-relaxed text-secondary"
        >
          Your schedule, clients, and messages for {staffBusiness} will appear here.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 flex w-full items-start gap-3 rounded-2xl border border-border bg-white p-4 text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6641" strokeWidth="1.7" strokeLinecap="round" className="mt-0.5" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>
            <span className="block text-[14px] font-bold text-navy">Today</span>
            <span className="mt-0.5 block text-[13px] text-secondary">
              3 bookings waiting in your schedule
            </span>
          </span>
        </motion.div>
      </div>
    </Screen>
  );
}
