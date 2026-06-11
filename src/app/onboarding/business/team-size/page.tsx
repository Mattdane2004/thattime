"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, CheckCircle } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const sizes = [
  { id: "solo", label: "Just me", heads: 1 },
  { id: "2-5", label: "2 – 5", heads: 2 },
  { id: "6-9", label: "6 – 9", heads: 3 },
  { id: "10+", label: "10 or more", heads: 4 },
];

function Heads({ n }: { n: number }) {
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      {n === 1 && (
        <>
          <circle cx="13" cy="7" r="3.4" />
          <path d="M6.5 19c.7-3.6 3.4-5.5 6.5-5.5s5.8 1.9 6.5 5.5" />
        </>
      )}
      {n === 2 && (
        <>
          <circle cx="9.5" cy="7.5" r="3" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M3.5 19c.6-3.2 3-5 6-5s5.4 1.8 6 5M15 14.7c2.4.2 4.3 1.7 4.9 4.3" />
        </>
      )}
      {n === 3 && (
        <>
          <circle cx="8" cy="8" r="2.6" /><circle cx="14.5" cy="6.5" r="2.4" /><circle cx="19.5" cy="9" r="2.1" />
          <path d="M3 19c.5-2.9 2.6-4.5 5-4.5s4.5 1.6 5 4.5M13.5 14c2 .2 3.7 1.5 4.2 3.8M18.5 14.6c1.7.3 3 1.4 3.4 3.2" />
        </>
      )}
      {n === 4 && (
        <>
          <circle cx="7" cy="6" r="2.2" /><circle cx="13" cy="5" r="2.2" /><circle cx="19" cy="6" r="2.2" />
          <path d="M2.5 13.5c.5-2.4 2.3-3.8 4.5-3.8s4 1.4 4.5 3.8M8.5 12.6c.6-2.2 2.3-3.4 4.5-3.4s3.9 1.2 4.5 3.4M14.6 13.5c.5-2.4 2.3-3.8 4.4-3.8 1 0 1.9.3 2.7.8" />
          <circle cx="7" cy="16" r="1.9" /><circle cx="13" cy="15.4" r="1.9" /><circle cx="19" cy="16" r="1.9" />
          <path d="M3.5 21.5c.4-1.9 1.9-3 3.5-3s3.1 1.1 3.5 3M9.6 21.2c.4-1.8 1.8-2.8 3.4-2.8s3 1 3.4 2.8M15.6 21.5c.4-1.9 1.9-3 3.4-3 .8 0 1.6.2 2.2.7" />
        </>
      )}
    </svg>
  );
}

export default function TeamSizePage() {
  const router = useRouter();
  const { teamSize, set } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!teamSize} onClick={() => router.push("/onboarding/business/work-from")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="Just you, a small crew, or a full house? We'll set up your calendar to match.">
        How big is your team?
      </Title>
      <div className="flex flex-col gap-3 px-6 pt-5">
        {sizes.map((s, i) => {
          const selected = teamSize === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                set("teamSize", s.id);
                set("trialTeamBand", s.label);
              }}
              className={`flex items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors ${
                selected ? "border-navy" : "border-border"
              }`}
            >
              <span className="text-navy">
                <Heads n={s.heads} />
              </span>
              <span className="flex-1 text-[15px] font-semibold text-navy">{s.label}</span>
              <CheckCircle on={selected} />
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
