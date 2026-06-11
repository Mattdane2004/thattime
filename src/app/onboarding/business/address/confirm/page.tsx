"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2, businessLabel } from "@/lib/store/onboarding2";

export default function AddressConfirmPage() {
  const router = useRouter();
  const { businessName, baseAddress, hideAddressUntilBooking, workModes } = useOnboarding2();

  const next = () =>
    workModes.includes("travel")
      ? router.push("/onboarding/business/travel-from")
      : router.push("/onboarding/business/tools");

  return (
    <Screen footer={<PrimaryButton onClick={next}>Confirm</PrimaryButton>} tone="white">
      <Title sub="Add the address customers will see when they book.">
        Where&rsquo;s {businessLabel(businessName)} based?
      </Title>
      <div className="flex flex-col gap-3 px-6 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-white p-4"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-navy" aria-hidden>
            <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Base address</p>
            <p className="mt-0.5 text-[14px] text-navy">{baseAddress || "35 Luke Street, Shoreditch"}</p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[13px] font-medium text-[#111]"
          >
            Edit
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-white p-4"
        >
          <svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-navy" aria-hidden>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Address privacy</p>
            <p className="mt-0.5 text-[14px] text-navy">
              {hideAddressUntilBooking ? "Hidden until booking is confirmed" : "Visible to clients before booking"}
            </p>
          </div>
        </motion.div>

        <p className="pt-2 text-[15px] font-medium text-navy">Move this pin to your exact location</p>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative h-[184px] overflow-hidden rounded-3xl border border-border bg-[#EEF2F6]"
        >
          <Image
            src="/onboarding/map-streets.png"
            alt="Map"
            fill
            sizes="340px"
            priority
            className="scale-110 object-cover"
          />
          <motion.div
            drag
            dragConstraints={{ left: -120, right: 120, top: -60, bottom: 60 }}
            dragElastic={0.08}
            whileDrag={{ scale: 1.15 }}
            className="absolute left-1/2 top-1/2 -ml-[18px] -mt-[30px] cursor-grab active:cursor-grabbing"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 22s-8-6.2-8-12.6A8 8 0 0 1 12 1.5a8 8 0 0 1 8 7.9C20 15.8 12 22 12 22Z"
                fill="#0F1A2E"
              />
              <circle cx="12" cy="9.4" r="3" fill="white" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </Screen>
  );
}
