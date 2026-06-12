"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const week = [
  { day: "Monday", hours: null },
  { day: "Tuesday", hours: "09:00 – 18:00" },
  { day: "Wednesday", hours: "09:00 – 20:00" },
  { day: "Thursday", hours: "09:00 – 20:00" },
  { day: "Friday", hours: "09:00 – 20:00" },
  { day: "Saturday", hours: "10:00 – 16:00" },
  { day: "Sunday", hours: null },
];

export default function StaffWeekPage() {
  const router = useRouter();
  const { staffName, staffManager } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/onboarding/staff/done")}>
          Looks good
        </PrimaryButton>
      }
    >
      <div className="px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[28px] font-extrabold tracking-tight text-navy"
        >
          Here&rsquo;s your week, <span className="text-coral">{staffName.first}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-[15px] text-secondary"
        >
          {staffManager} has you in 5 days a week. Welcome aboard.
        </motion.p>
      </div>

      <div className="flex flex-col gap-2.5 px-6 pt-6">
        {week.map((d, i) => {
          const off = !d.hours;
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 ${
                off ? "bg-[#ECECEE]" : "bg-white shadow-[0_1px_6px_rgba(15,26,46,0.06)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                  off ? "bg-[#DCDCE0] text-white" : "bg-coral text-white"
                }`}
              >
                {d.day[0]}
              </span>
              <span className={`flex-1 text-[15px] font-semibold ${off ? "text-muted" : "text-navy"}`}>
                {d.day}
              </span>
              <span className={`text-[14px] font-semibold ${off ? "text-muted" : "text-navy"}`}>
                {d.hours ?? "Off"}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="px-6 pt-5 text-center text-[12px] text-muted">
        Not quite right? Let {staffManager} tweak it any time.
      </p>
    </Screen>
  );
}
