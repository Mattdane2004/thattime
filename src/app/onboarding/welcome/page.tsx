"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, StatusBar, Wordmark, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <Screen tone="fog" chrome={false}>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[15px] font-semibold text-navy"
        >
          Welcome to
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08, type: "spring", stiffness: 200, damping: 20 }}
          className="mt-3"
        >
          <Wordmark width={250} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="mt-7 max-w-[300px] text-[16px] leading-relaxed text-secondary"
        >
          Book something brilliant, run your business, or join your team. It all starts here.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.34 }}
        className="px-6 pb-6"
      >
        <PrimaryButton onClick={() => router.push("/onboarding/intent")}>Get started</PrimaryButton>
        <button
          type="button"
          onClick={() => router.push("/onboarding/login")}
          className="mt-4 w-full text-center text-[15px] font-semibold text-navy"
        >
          Log in
        </button>
        <TermsFootnote />
      </motion.div>
    </Screen>
  );
}
