"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/ui";
import { PhotoCarousel } from "@/components/onboarding2/PhotoCarousel";

export default function ClientSetupPage() {
  const router = useRouter();
  return (
    <Screen
      footer={
        <>
          <PrimaryButton onClick={() => router.push("/client/location")}>Get started</PrimaryButton>
          <TermsFootnote />
        </>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 items-center">
          <PhotoCarousel
            images={[
              "/onboarding/photo-carousel-left.png",
              "/onboarding/photo-carousel-center.png",
              "/onboarding/photo-carousel-right.png",
            ]}
          />
        </div>
        <div className="px-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[30px] font-extrabold tracking-tight text-navy"
          >
            Let&rsquo;s get you set up
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-2 text-[15px] leading-relaxed text-navy/80"
          >
            Enter your details to start discovering and booking services.
          </motion.p>
        </div>
      </div>
    </Screen>
  );
}
