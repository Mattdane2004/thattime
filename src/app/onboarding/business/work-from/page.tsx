"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, SelectCard } from "@/components/onboarding2/controls";
import { useOnboarding2, businessLabel, type WorkMode } from "@/lib/store/onboarding2";

const modes: { id: WorkMode; title: string; desc: string; icon: JSX.Element }[] = [
  {
    id: "fixed",
    title: "Clients come to me",
    desc: "I work from a shop, salon, studio or fixed address.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 9 5 4h14l2 5M3 9v2a2.5 2.5 0 0 0 5 0V9m0 0v2a2.5 2.5 0 0 0 5 0V9m0 0v2a2.5 2.5 0 0 0 5 0V9M5 13v8h14v-8" />
      </svg>
    ),
  },
  {
    id: "travel",
    title: "I travel to clients",
    desc: "I visit clients at their home, workplace or event.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
  {
    id: "virtual",
    title: "I provide virtual service",
    desc: "I use multiple shops, studios or regular spaces.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="6" width="14" height="12" rx="2.5" />
        <path d="m16 10 6-3v10l-6-3" />
      </svg>
    ),
  },
];

export default function WorkFromPage() {
  const router = useRouter();
  const { workModes, toggleWorkMode, businessName } = useOnboarding2();

  const next = () => {
    if (workModes.includes("fixed")) router.push("/onboarding/business/address");
    else if (workModes.includes("travel")) router.push("/onboarding/business/travel-from");
    else router.push("/onboarding/business/tools");
  };

  return (
    <Screen
      footer={
        <PrimaryButton disabled={workModes.length === 0} onClick={next}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="Choose all that apply.">
        Where does {businessLabel(businessName) === "your business" ? "your business" : businessName} work from?
      </Title>
      <div className="flex flex-col gap-3.5 px-6 pt-6">
        {modes.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.3 }}
          >
            <SelectCard
              icon={m.icon}
              title={m.title}
              desc={m.desc}
              selected={workModes.includes(m.id)}
              onClick={() => toggleWorkMode(m.id)}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
