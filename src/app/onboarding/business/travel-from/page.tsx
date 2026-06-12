"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function TravelFromPage() {
  const router = useRouter();
  const { travelFrom, set } = useOnboarding2();
  const [locating, setLocating] = useState(false);

  const useLocation = () => {
    setLocating(true);
    setTimeout(() => {
      set("travelFrom", "14 Greek Street, Soho");
      setLocating(false);
      router.push("/onboarding/business/travel-area");
    }, 1100);
  };

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={!travelFrom.trim()}
          onClick={() => router.push("/onboarding/business/travel-area")}
        >
          continue
        </PrimaryButton>
      }
    >
      <Title sub="We use this privately as the centre of your travel area. It won't be shown to clients.">
        Where do you travel from?
      </Title>
      <div className="px-6 pt-6">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={useLocation}
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl border border-navy bg-white text-[15px] font-semibold text-navy"
        >
          {locating ? (
            <span
              className="h-5 w-5 rounded-full border-2 border-navy/20 border-t-navy"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : (
            <>
              <MapPin size={16} strokeWidth={1.8} />
              Use my location
            </>
          )}
        </motion.button>

        <div className="flex items-center gap-4 py-5">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[12px] text-muted">Or type it in</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Field label="Base address or postcode">
          <input
            value={travelFrom}
            onChange={(e) => set("travelFrom", e.target.value)}
            className={inputClass}
            placeholder="SW1A 1AA"
          />
        </Field>
      </div>
    </Screen>
  );
}
