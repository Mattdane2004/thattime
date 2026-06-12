"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BadgePercent, CalendarDays, Users, BarChart3, ChevronDown, Receipt, UsersRound } from "lucide-react";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2, type Plan } from "@/lib/store/onboarding2";

const benefits = [
  { text: "0% commission on all bookings", icon: <BadgePercent size={20} strokeWidth={1.5} /> },
  { text: "Manage services, staff, and locations in one place", icon: <CalendarDays size={20} strokeWidth={1.5} /> },
  { text: "Invite your team and stay organised", icon: <Users size={20} strokeWidth={1.5} /> },
  { text: "Access powerful business insights", icon: <BarChart3 size={20} strokeWidth={1.5} /> },
];

const bands = ["Just me", "2 – 5", "6 – 9", "10 or more"];

export default function TrialPage() {
  const router = useRouter();
  const { plan, trialTeamBand, weeklyBookings, avgPrice, set } = useOnboarding2();
  const [bandOpen, setBandOpen] = useState(false);
  const saved = Math.max(35, Math.round((weeklyBookings * 4.3 * (avgPrice || 13)) * 0.072 / 10) * 10);

  return (
    <Screen>
      <div className="px-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-display text-[30px] font-extrabold tracking-tight text-navy"
        >
          Your free trial is ready
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-center text-[15px] text-secondary"
        >
          Start your free trial today and <span className="font-semibold text-coral">save £{saved}</span> with 0% commission
        </motion.p>

        <div className="mt-6 flex flex-col gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.text}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0E6DC] text-navy">
                {b.icon}
              </span>
              <span className="text-[14px] font-medium text-navy">{b.text}</span>
            </motion.div>
          ))}
        </div>

        <p className="mb-2 mt-6 text-[13px] font-medium text-navy">Team Size</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setBandOpen((o) => !o)}
            className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-border bg-white px-4 text-left"
          >
            <UsersRound size={20} strokeWidth={1.5} className="text-navy" />
            <span className="flex-1 text-[15px] font-semibold text-navy">{trialTeamBand}</span>
            <motion.span animate={{ rotate: bandOpen ? 180 : 0 }} className="flex text-navy">
              <ChevronDown size={16} strokeWidth={1.75} />
            </motion.span>
          </button>
          <AnimatePresence>
            {bandOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute inset-x-0 top-[56px] z-20 overflow-hidden rounded-xl border border-border bg-white shadow-card"
              >
                {bands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      set("trialTeamBand", b);
                      setBandOpen(false);
                    }}
                    className={`block w-full px-4 py-3 text-left text-[14px] ${
                      b === trialTeamBand ? "bg-fog font-semibold" : ""
                    } text-navy`}
                  >
                    {b}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {(
            [
              { id: "yearly", title: "Yearly", price: "£ 510/yr", badge: "-16%" },
              { id: "monthly", title: "Monthly", price: "£49.99/ mo" },
            ] as { id: Plan; title: string; price: string; badge?: string }[]
          ).map((p) => {
            const selected = plan === p.id;
            return (
              <motion.button
                key={p.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => set("plan", p.id)}
                className={`relative rounded-2xl border-2 bg-white p-4 text-left transition-colors ${
                  selected ? "border-coral" : "border-transparent"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-coral px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {p.badge}
                  </span>
                )}
                <span className="block text-[15px] font-bold text-navy">{p.title}</span>
                <span className="mt-1 block text-[14px] text-secondary">{p.price}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex items-start gap-3 px-1">
          <Receipt size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-navy" />
          <p className="text-[12px] leading-snug text-secondary">
            <span className="font-bold text-navy">No card needed today.</span>
            <br />
            We&rsquo;ll remind you before your trial ends.
          </p>
        </div>
      </div>

      <div className="shrink-0 px-6 pb-6 pt-2">
        <PrimaryButton onClick={() => router.push("/onboarding/first-step")}>
          Start 30 days free trial
        </PrimaryButton>
      </div>
    </Screen>
  );
}
