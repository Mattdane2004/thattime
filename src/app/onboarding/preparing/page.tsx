"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wordmark } from "@/components/onboarding2/Shell";

/** "We accept clearpay" interstitial — payments promo while the profile "builds". */
export default function PreparingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/onboarding/business/name"), 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex h-full flex-col items-center gap-6 px-5 pb-6 pt-2">
      <Wordmark width={120} />
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[30px] font-extrabold tracking-tight text-navy"
        >
          We accept clearpay
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-1 text-[12px] leading-relaxed text-secondary"
        >
          Apple Pay, Clearpay and Klarna can help more people say yes.
        </motion.p>
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, type: "spring", stiffness: 170, damping: 22 }}
          className="relative h-[320px] w-[320px]"
        >
          <Image
            src="/onboarding/illo-terminal.png"
            alt="Card terminal illustration"
            fill
            sizes="320px"
            className="object-contain"
            priority
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 18 }}
            className="absolute left-[18px] top-[88px] h-[64px] w-[64px]"
          >
            <Image src="/onboarding/badge-klarna.png" alt="Klarna" fill sizes="64px" className="object-contain drop-shadow-md" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 18 }}
            className="absolute bottom-[64px] right-[10px] h-[42px] w-[124px]"
          >
            <Image src="/onboarding/badge-clearpay.png" alt="Clearpay" fill sizes="124px" className="object-contain drop-shadow-md" />
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full px-2 pb-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-fg-primary"
            initial={{ width: "8%" }}
            animate={{ width: "82%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-3 text-center text-[12px] text-muted">Setting up your business profile ...</p>
      </div>
    </div>
  );
}
