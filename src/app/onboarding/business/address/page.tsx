"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Eye, EyeOff } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass } from "@/components/onboarding2/controls";
import { useOnboarding2, businessLabel } from "@/lib/store/onboarding2";

export default function AddressPage() {
  const router = useRouter();
  const { businessName, baseAddress, hideAddressUntilBooking, workModes, set } = useOnboarding2();
  const [locating, setLocating] = useState(false);
  const travels = workModes.includes("travel");

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
      <Title
        sub={
          travels
            ? "One address covers everything — it's where clients come, and the centre of your travel area."
            : "Add the address customers will see when they book."
        }
      >
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
            value={baseAddress}
            onChange={(e) => set("baseAddress", e.target.value)}
            className={inputClass}
            placeholder="SW1A 1AA"
          />
        </Field>

        <button
          type="button"
          onClick={() => set("hideAddressUntilBooking", !hideAddressUntilBooking)}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fog text-navy">
            {hideAddressUntilBooking ? (
              <EyeOff size={16} strokeWidth={1.7} />
            ) : (
              <Eye size={16} strokeWidth={1.7} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-navy">
              {hideAddressUntilBooking ? "Hidden until booking is confirmed" : "Visible to clients before booking"}
            </span>
            <span className="block text-[12px] text-muted">Tap to change — you can update this anytime.</span>
          </span>
          <span
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              hideAddressUntilBooking ? "bg-fg-primary" : "bg-border"
            }`}
          >
            <motion.span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
              animate={{ left: hideAddressUntilBooking ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </span>
        </button>
      </div>
    </Screen>
  );
}
