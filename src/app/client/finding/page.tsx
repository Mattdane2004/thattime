"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StatusBar } from "@/components/onboarding2/Shell";

const tiles = [
  <svg key="spray" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 8h6v13H9zM10 8V5h4v3M12 2v1M16 3l-.7.7M19 6h-1" />
  </svg>,
  <svg key="person" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="7" r="3" /><path d="M6 21c.8-3.8 3.2-5.8 6-5.8s5.2 2 6 5.8M15 4.5 17 3M16 7.5h2" />
  </svg>,
  <svg key="scissors" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8.2 7.8 20 19M8.2 16.2 20 5" />
  </svg>,
  <svg key="foot" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3c3 0 5 2.5 5 6 0 2.4-1 3.6-1 6a3.5 3.5 0 0 1-7 0c0-3 -1-4-1-7 0-3 1.6-5 4-5Z" /><path d="M8.5 20.5c1 .8 2.6 1 4 .4" />
  </svg>,
  <svg key="smile" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" /><path d="M8.5 14c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2M9 9.5h.01M15 9.5h.01" />
  </svg>,
];

export default function ClientFindingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/client/home"), 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex h-full flex-col bg-white font-body text-navy">
      <StatusBar />
      <div className="flex flex-1 flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-8 text-center font-display text-[22px] font-extrabold text-navy"
        >
          Finding services for you
        </motion.p>
        <div className="relative h-[120px] overflow-hidden">
          <motion.div
            className="absolute flex items-center gap-4"
            initial={{ x: 0 }}
            animate={{ x: -480 }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          >
            {[...tiles, ...tiles, ...tiles].map((icon, i) => {
              const center = i % 5 === 2;
              return (
                <span
                  key={i}
                  className={`flex shrink-0 items-center justify-center rounded-[28px] bg-coral ${
                    center ? "h-[104px] w-[104px]" : "h-[84px] w-[84px]"
                  }`}
                >
                  {icon}
                </span>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
