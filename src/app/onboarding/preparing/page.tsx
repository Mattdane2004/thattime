"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StatusBar, Wordmark } from "@/components/onboarding2/Shell";

/** "We accept clearpay" interstitial — payments promo while the profile "builds". */
export default function PreparingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/onboarding/business/name"), 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex h-full flex-col bg-white font-body text-navy">
      <StatusBar />
      <div className="flex flex-1 flex-col items-center gap-6 px-5 pb-6 pt-2">
        <Wordmark width={116} />
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[30px] font-semibold tracking-tight text-navy"
          >
            We accept clearpay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-1 text-[12px] leading-relaxed text-secondary"
          >
            Apple Pay, Clearpay and Klarna can help more people say yes.
          </motion.p>
        </div>

        <div className="relative flex w-full flex-1 items-end justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 160, damping: 20 }}
            className="relative h-[333px] w-[334px]"
          >
            <Image
              src="/onboarding/illo-terminal.png"
              alt="Card terminal illustration"
              fill
              sizes="334px"
              className="object-contain"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 18 }}
            className="absolute left-[36px] top-[100px] h-[66px] w-[66px]"
          >
            <Image src="/onboarding/badge-klarna.png" alt="Klarna" fill sizes="66px" className="object-contain" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 18 }}
            className="absolute bottom-[36px] right-[28px] h-[43px] w-[127px]"
          >
            <Image src="/onboarding/badge-clearpay.png" alt="Clearpay" fill sizes="127px" className="object-contain" />
          </motion.div>
        </div>

        <div className="w-full px-2 pb-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-[#111]"
              initial={{ width: "8%" }}
              animate={{ width: "82%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-3 text-center text-[12px] text-muted">
            Setting up your business profile ...
          </p>
        </div>
      </div>
    </div>
  );
}
