"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Users, UsersRound, Building2 } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, CheckCircle } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const sizes = [
  { id: "solo", label: "Just me", icon: <User size={22} strokeWidth={1.5} /> },
  { id: "2-5", label: "2 – 5", icon: <Users size={22} strokeWidth={1.5} /> },
  { id: "6-9", label: "6 – 9", icon: <UsersRound size={22} strokeWidth={1.5} /> },
  { id: "10+", label: "10 or more", icon: <Building2 size={22} strokeWidth={1.5} /> },
];

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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.25 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                set("teamSize", s.id);
                set("trialTeamBand", s.label);
              }}
              className={`flex items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors ${
                selected ? "border-navy" : "border-border"
              }`}
            >
              <span className="text-navy">{s.icon}</span>
              <span className="flex-1 text-[15px] font-semibold text-navy">{s.label}</span>
              <CheckCircle on={selected} />
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
