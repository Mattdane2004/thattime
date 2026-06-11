"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const tools = [
  "Fresha",
  "Booksy",
  "Square",
  "GlossGenius",
  "Treatwell",
  "Pen & paper",
  "Instagram DMs",
  "Just starting out",
  "Something else",
];

export default function ToolsPage() {
  const router = useRouter();
  const { currentTool, set } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!currentTool} onClick={() => router.push("/onboarding/business/volume")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="Choose the option closest to your current setup.">
        How are you taking bookings right now?
      </Title>
      <div className="px-6 pt-5">
        <p className="pb-3 text-[15px] font-semibold text-navy">
          How are you taking bookings right now?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((t, i) => {
            const selected = currentTool === t;
            return (
              <motion.button
                key={t}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.035 * i, duration: 0.3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => set("currentTool", t)}
                className={`h-12 rounded-2xl border bg-white px-3 text-[14px] transition-colors ${
                  selected ? "border-navy font-semibold" : "border-border"
                } text-navy`}
              >
                {t}
              </motion.button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
