"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass, CheckRow } from "@/components/onboarding2/controls";
import { useOnboarding2, businessLabel } from "@/lib/store/onboarding2";

export default function AddressPage() {
  const router = useRouter();
  const { businessName, baseAddress, hideAddressUntilBooking, set } = useOnboarding2();
  const [locating, setLocating] = useState(false);

  const useLocation = () => {
    setLocating(true);
    setTimeout(() => {
      set("baseAddress", "35 Luke Street, Shoreditch");
      setLocating(false);
      router.push("/onboarding/business/address/confirm");
    }, 1100);
  };

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={!baseAddress.trim()}
          onClick={() => router.push("/onboarding/business/address/confirm")}
        >
          continue
        </PrimaryButton>
      }
    >
      <Title sub="Add the address customers will see when they book.">
        Where&rsquo;s {businessLabel(businessName)} based?
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
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
            value={baseAddress}
            onChange={(e) => set("baseAddress", e.target.value)}
            className={inputClass}
            placeholder="SW1A 1AA"
          />
        </Field>

        <div className="mt-4 rounded-2xl border border-border bg-white p-4">
          <CheckRow
            checked={hideAddressUntilBooking}
            onToggle={() => set("hideAddressUntilBooking", !hideAddressUntilBooking)}
            title="Hide my address until booking is confirmed"
          />
        </div>
      </div>
    </Screen>
  );
}
