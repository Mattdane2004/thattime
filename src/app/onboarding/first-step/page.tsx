"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Shuffle, Users, ChevronRight } from "lucide-react";

const options = [
  {
    title: "Set up your services",
    desc: "Add what you offer, your prices and how long each takes.",
    href: "/new",
    icon: <Sparkles size={22} strokeWidth={1.6} />,
  },
  {
    title: "Move Your data from Fresha",
    desc: "Bring your bookings and clients over from Fresha or similar.",
    href: "/app",
    icon: <Shuffle size={22} strokeWidth={1.6} />,
  },
  {
    title: "Invite your team",
    desc: "Send your staff a code so they can join and see their calendar.",
    href: "/app/team",
    icon: <Users size={22} strokeWidth={1.6} />,
  },
];

export default function FirstStepPage() {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-2 pt-1">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
        >
          What would you like to do first?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.06, duration: 0.25 }}
          className="mt-2 text-[15px] leading-snug text-secondary"
        >
          Pick a starting point, you can always come back to the others from the Hub.
        </motion.p>
      </div>
      <div className="flex flex-col gap-4 px-6 pt-4">
        {options.map((o, i) => (
          <motion.button
            key={o.title}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 260, damping: 26 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(o.href)}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_2px_10px_rgba(8, 7, 6,0.05)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1EC] text-coral">
              {o.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-navy">{o.title}</span>
              <span className="mt-1 block text-[13px] leading-snug text-secondary">{o.desc}</span>
            </span>
            <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
          </motion.button>
        ))}
      </div>
      <div className="flex flex-1 items-end justify-center pb-10">
        <button type="button" onClick={() => router.push("/app")} className="text-[15px] font-bold text-navy">
          Take a look around first
        </button>
      </div>
    </div>
  );
}
