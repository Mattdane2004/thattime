"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton, PermissionDialog } from "@/components/ui";

export default function ClientLocationPage() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  return (
    <Screen
      footer={
        <>
          <PrimaryButton onClick={() => setAsking(true)}>Continue</PrimaryButton>
          <TermsFootnote />
        </>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 20 }}
          className="relative mx-auto mt-2 h-[330px] w-[300px]"
        >
          <Image src="/onboarding/illo-chair.png" alt="Barber chair" fill sizes="300px" className="object-contain" priority />
        </motion.div>
        <div className="px-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
          >
            Find your local business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-2 text-[15px] leading-relaxed text-secondary"
          >
            Enter your location to helps us show services near you.
          </motion.p>
        </div>
      </div>

      <PermissionDialog
        open={asking}
        text="Let that time use your locations"
        onYes={() => router.push("/client/notifications")}
      />
    </Screen>
  );
}
