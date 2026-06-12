"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { PhotoCarousel } from "@/components/onboarding2/PhotoCarousel";

export default function BusinessIntroPage() {
  const router = useRouter();
  return (
    <Screen
      footer={
        <>
          <PrimaryButton onClick={() => router.push("/onboarding/signup")}>
            Get started
          </PrimaryButton>
          <TermsFootnote />
        </>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 items-center">
          <PhotoCarousel />
        </div>
        <div className="px-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
          >
            Let&rsquo;s get your business set up
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-3 text-[15px] leading-relaxed text-secondary"
          >
            Get ready to take bookings, manage your day and keep more of what you earn.
          </motion.p>
        </div>
      </div>
    </Screen>
  );
}
