"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton, PermissionDialog } from "@/components/onboarding2/controls";

export default function ClientNotificationsPage() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  return (
    <Screen
      footer={
        <>
          <PrimaryButton onClick={() => setAsking(true)}>Get started</PrimaryButton>
          <TermsFootnote />
        </>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, rotate: -6, scale: 0.92 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 18 }}
          className="relative mx-auto mt-2 h-[340px] w-[320px]"
        >
          <Image src="/onboarding/illo-bell.png" alt="Notification bell and calendar" fill sizes="320px" className="object-contain" priority />
        </motion.div>
        <div className="px-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
          >
            Manage your bookings with ease
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-2 text-[15px] leading-relaxed text-secondary"
          >
            let us send you notifications to keep you in the loop
          </motion.p>
        </div>
      </div>

      <PermissionDialog
        open={asking}
        text="Let that time send you notifications"
        onYes={() => router.push("/client/audience")}
      />
    </Screen>
  );
}
