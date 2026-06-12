"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, MapPin, Video } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, SelectCard } from "@/components/onboarding2/controls";
import { useOnboarding2, businessLabel, type WorkMode } from "@/lib/store/onboarding2";

const modes: { id: WorkMode; title: string; desc: string; icon: JSX.Element }[] = [
  {
    id: "fixed",
    title: "Clients come to me",
    desc: "I work from a shop, salon, studio or fixed address.",
    icon: <Store size={20} strokeWidth={1.6} />,
  },
  {
    id: "travel",
    title: "I travel to clients",
    desc: "I visit clients at their home, workplace or event.",
    icon: <MapPin size={20} strokeWidth={1.6} />,
  },
  {
    id: "virtual",
    title: "I provide virtual service",
    desc: "I run sessions online — no address needed.",
    icon: <Video size={20} strokeWidth={1.6} />,
  },
];

export default function WorkFromPage() {
  const router = useRouter();
  const { workModes, toggleWorkMode, businessName } = useOnboarding2();

  // One address ask, no matter the combination: anything with a base address
  // (fixed or travel) goes through the single address step; the confirm screen
  // folds in the travel radius when needed. Virtual-only skips straight on.
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.25 }}
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
