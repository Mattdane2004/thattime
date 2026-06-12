"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, UserRound, MessageCircle, Bell, Lock } from "lucide-react";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const perks = [
  { text: "Manage your bookings on the go", icon: <CalendarDays size={20} strokeWidth={1.5} /> },
  { text: "Client notes and history at a glance", icon: <UserRound size={20} strokeWidth={1.5} /> },
  { text: "Message Emma, the team and clients in one place", icon: <MessageCircle size={20} strokeWidth={1.5} /> },
  { text: "Reminders that keep your day on track", icon: <Bell size={20} strokeWidth={1.5} /> },
];

export default function StaffInvitePage() {
  const router = useRouter();
  const { staffBusiness, staffRole, staffManager } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/onboarding/staff/password")}>
          Accept invite
        </PrimaryButton>
      }
    >
      <div className="px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[28px] font-extrabold leading-[1.18] tracking-tight text-navy"
        >
          You&rsquo;re invited to join <span className="text-coral">{staffBusiness}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-[15px] leading-relaxed text-secondary"
        >
          {staffManager} set you up as a {staffRole}. Accept and finish your setup in under a minute.
        </motion.p>
      </div>

      <div className="flex gap-2.5 px-6 pt-6">
        {[
          { k: "Business", v: staffBusiness },
          { k: "Role", v: staffRole },
          { k: "Start date", v: "Today" },
        ].map((c, i) => (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="flex-1 rounded-2xl bg-[#F0E6DC] px-3 py-3.5 text-center"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{c.k}</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-bold text-navy">{c.v}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-5 px-6 pt-8">
        {perks.map((p, i) => (
          <motion.div
            key={p.text}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className="flex items-center gap-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0E6DC] text-navy">
              {p.icon}
            </span>
            <span className="text-[14px] font-medium leading-snug text-navy">{p.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-6 mt-7 flex items-start gap-3 rounded-2xl border border-coral/50 bg-white p-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1EC] text-coral">
          <Lock size={15} strokeWidth={1.7} />
        </span>
        <p className="text-[12px] leading-snug text-secondary">
          <span className="block text-[13px] font-bold text-navy">Invited by {staffManager}</span>
          If this doesn&rsquo;t look right, contact your manager before accepting.
        </p>
      </motion.div>
      <div className="h-4" />
    </Screen>
  );
}
