"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Wordmark, TermsFootnote } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/ui";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <Screen
      footer={
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
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
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[15px] font-semibold text-navy"
        >
          Welcome to
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.06, type: "spring", stiffness: 220, damping: 24 }}
          className="mt-3"
        >
          <Wordmark width={250} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="mt-7 max-w-[300px] text-[16px] leading-relaxed text-secondary"
        >
          Book something brilliant, run your business, or join your team. It all starts here.
        </motion.p>
      </div>
    </Screen>
  );
}
