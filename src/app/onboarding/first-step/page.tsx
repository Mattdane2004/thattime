"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StatusBar, FlowHeader } from "@/components/onboarding2/Shell";

const options = [
  {
    title: "Set up your services",
    desc: "Add what you offer, your prices and how long each takes.",
    href: "/new",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3c.5 3.2 1.8 4.5 5 5-3.2.5-4.5 1.8-5 5-.5-3.2-1.8-4.5-5-5 3.2-.5 4.5-1.8 5-5ZM18.5 13.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5ZM6 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
      </svg>
    ),
  },
  {
    title: "Move Your data from Fresha",
    desc: "Bring your bookings and clients over from Fresha or similar.",
    href: "/app",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="12" r="2.5" /><circle cx="6" cy="18" r="2.5" />
        <path d="M8.5 6H14M8.5 18H14M15.8 10.5 8.2 7.4M15.8 13.5 8.2 16.6" />
      </svg>
    ),
  },
  {
    title: "Invite your team",
    desc: "Send your staff a code so they can join and see their calendar.",
    href: "/app/team",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.5" r="2.2" />
        <path d="M3.5 19c.7-3.2 3-5 5.5-5s4.8 1.8 5.5 5M14.6 14.4c2.2.3 3.9 1.7 4.4 4.1" />
      </svg>
    ),
  },
];

export default function FirstStepPage() {
  const router = useRouter();
  return (
    <div
      className="flex h-full flex-col font-body"
      style={{ background: "linear-gradient(180deg, #FBF6F1 0%, #F6E3D3 100%)" }}
    >
      <StatusBar />
      <FlowHeader />
      <div className="px-6 pb-2 pt-1">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
        >
          What would you like to do first?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 220, damping: 24 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(o.href)}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_2px_10px_rgba(15,26,46,0.05)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1EC] text-coral">
              {o.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-navy">{o.title}</span>
              <span className="mt-1 block text-[13px] leading-snug text-secondary">{o.desc}</span>
            </span>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="shrink-0 text-muted" aria-hidden>
              <path d="m1 1 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ))}
      </div>
      <div className="flex flex-1 items-end justify-center pb-10">
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="text-[15px] font-bold text-navy"
        >
          Take a look around first
        </button>
      </div>
    </div>
  );
}
