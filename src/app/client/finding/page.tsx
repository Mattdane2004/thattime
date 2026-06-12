"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SprayCan, UserRound, Scissors, Footprints, Smile } from "lucide-react";

const tiles = [
  <SprayCan key="spray" size={34} strokeWidth={1.4} className="text-white" />,
  <UserRound key="person" size={34} strokeWidth={1.4} className="text-white" />,
  <Scissors key="scissors" size={40} strokeWidth={1.4} className="text-white" />,
  <Footprints key="foot" size={34} strokeWidth={1.4} className="text-white" />,
  <Smile key="smile" size={34} strokeWidth={1.4} className="text-white" />,
];

export default function ClientFindingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/client/home"), 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex h-full flex-col justify-center">
      <motion.p
        initial={{ opacity: 0, y: 6 }}
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
  );
}
