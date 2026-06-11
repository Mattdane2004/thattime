"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import {
  PrimaryButton,
  BottomSheet,
  inputClass,
} from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const options = [
  {
    id: "client",
    title: "I'm here to book a service",
    desc: "Find services near you and book in seconds.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18M9 15h6" />
      </svg>
    ),
  },
  {
    id: "owner",
    title: "I run a business",
    desc: "Take bookings, manage your team and keep more of what you earn.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 9 5 4h14l2 5M3 9v2a2.5 2.5 0 0 0 5 0V9m0 0v2a2.5 2.5 0 0 0 5 0V9m0 0v2a2.5 2.5 0 0 0 5 0V9M5 13v8h14v-8M10 21v-5h4v5" />
      </svg>
    ),
  },
] as const;

export default function IntentPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<"client" | "owner" | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [code, setCode] = useState("");
  const setField = useOnboarding2((s) => s.set);

  const next = () => {
    if (picked === "owner") router.push("/onboarding/business/intro");
    else if (picked === "client") router.push("/client/setup");
  };

  return (
    <Screen
      footer={
        <>
          <PrimaryButton disabled={!picked} onClick={next}>
            Continue
          </PrimaryButton>
          <button
            type="button"
            onClick={() => router.push("/onboarding/login")}
            className="mt-4 w-full text-center text-[15px] font-semibold text-navy"
          >
            I Already have an account
          </button>
        </>
      }
    >
      <Title>What brings you to That Time?</Title>
      <div className="flex flex-col gap-4 px-6 pt-4">
        {options.map((o, i) => (
          <motion.button
            key={o.id}
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.07, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPicked(o.id)}
            className={`rounded-2xl border bg-white p-5 text-left transition-colors ${
              picked === o.id ? "border-navy" : "border-border"
            }`}
          >
            <span className="text-navy">{o.icon}</span>
            <span className="mt-3 block text-[15px] font-semibold text-navy">{o.title}</span>
            <span className="mt-1 block text-[14px] leading-snug text-secondary">{o.desc}</span>
          </motion.button>
        ))}
        <p className="pt-2 text-center text-[14px] text-secondary">
          Joining a team?{" "}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="font-semibold text-navy underline"
          >
            Enter your code
          </button>
        </p>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-navy">Got an invite?</h2>
            <p className="mt-1 text-[14px] text-secondary">
              Paste your code, or tap the link in your email.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="p-1 text-navy">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="mb-2 mt-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          Enter invite code
        </p>
        <input
          inputMode="numeric"
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={inputClass}
        />
        <div className="mt-5">
          <PrimaryButton
            disabled={code.length !== 6}
            onClick={() => {
              setField("inviteCode", code);
              setSheetOpen(false);
              router.push("/onboarding/staff/invite");
            }}
          >
            Join team
          </PrimaryButton>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted">
          No code? Ask your manager to send one over.
        </p>
      </BottomSheet>
    </Screen>
  );
}
