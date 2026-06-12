"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2, type TravelFeeType } from "@/lib/store/onboarding2";

export default function TravelAreaPage() {
  const router = useRouter();
  const {
    travelFrom,
    travelRadius,
    travelFeeEnabled,
    travelFeeType,
    travelFeeAmount,
    set,
  } = useOnboarding2();

  // Radius circle scales with the slider (12px – 86px display radius).
  const circle = 24 + ((travelRadius - 1) / 49) * 148;

  return (
    <Screen footer={<PrimaryButton onClick={() => router.push("/onboarding/business/tools")}>Confirm</PrimaryButton>}>
      <Title sub="Drag to set how far you'll travel, and choose how you'd like to charge.">
        What&rsquo;s your travel area?
      </Title>
      <div className="px-6 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Base address</p>
        <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
          <MapPin size={15} strokeWidth={1.7} className="text-secondary" />
          <span className="flex-1 text-[14px] text-navy">{travelFrom || "14 Greek Street, Soho"}</span>
          <button type="button" onClick={() => router.back()} className="text-[13px] font-medium text-navy underline">
            Edit
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <motion.span
            key={travelRadius}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            className="text-[15px] font-bold text-navy"
          >
            {travelRadius} mile{travelRadius === 1 ? "" : "s"}
          </motion.span>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            Travel radius
          </span>
        </div>

        <div className="relative mt-2 h-[176px] overflow-hidden rounded-2xl border border-border bg-[#F7F0E8]">
          <Image src="/onboarding/map-streets.png" alt="Map" fill sizes="340px" priority className="scale-110 object-cover" />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/30 ring-1 ring-coral/50"
            animate={{ width: circle * 2, height: circle * 2 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 22s-8-6.2-8-12.6A8 8 0 0 1 12 1.5a8 8 0 0 1 8 7.9C20 15.8 12 22 12 22Z" fill="#080706" />
              <circle cx="12" cy="9.4" r="3" fill="white" />
            </svg>
          </div>
        </div>

        <div className="relative mt-3">
          <input
            type="range"
            min={1}
            max={50}
            value={travelRadius}
            onChange={(e) => set("travelRadius", Number(e.target.value))}
            className="tt-slider w-full"
            aria-label="Travel radius in miles"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>1 mile</span>
            <span>50 miles</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Travel fee</span>
          <button
            type="button"
            role="switch"
            aria-checked={travelFeeEnabled}
            onClick={() => set("travelFeeEnabled", !travelFeeEnabled)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              travelFeeEnabled ? "bg-fg-primary" : "bg-border"
            }`}
          >
            <motion.span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
              animate={{ left: travelFeeEnabled ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </button>
        </div>

        <motion.div
          animate={{ opacity: travelFeeEnabled ? 1 : 0.4, height: "auto" }}
          className="mt-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: "flat", title: "Flat rate", sub: "Per booking" },
                { id: "per-mile", title: "Per mile", sub: "By distance" },
              ] as { id: TravelFeeType; title: string; sub: string }[]
            ).map((o) => (
              <motion.button
                key={o.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!travelFeeEnabled}
                onClick={() => set("travelFeeType", o.id)}
                className={`rounded-2xl border px-4 py-3 text-center transition-colors ${
                  travelFeeType === o.id ? "border-navy bg-fog" : "border-border bg-white"
                }`}
              >
                <span className="block text-[14px] font-semibold text-navy">{o.title}</span>
                <span className="block text-[11px] text-muted">{o.sub}</span>
              </motion.button>
            ))}
          </div>
          <div className="mt-3 flex items-center rounded-xl border border-border bg-white px-4">
            <span className="text-[14px] text-navy">£</span>
            <input
              value={travelFeeAmount}
              disabled={!travelFeeEnabled}
              onChange={(e) => set("travelFeeAmount", e.target.value.replace(/\D/g, ""))}
              className="h-[48px] w-full bg-transparent px-2 text-[14px] text-navy focus:outline-none"
              inputMode="numeric"
            />
            <span className="shrink-0 text-[12px] text-muted">
              {travelFeeType === "flat" ? "per booking" : "per mile"}
            </span>
          </div>
        </motion.div>
        <div className="h-4" />
      </div>
    </Screen>
  );
}
