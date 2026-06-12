"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarPlus, Check } from "lucide-react";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { demoOffers } from "@/lib/data/offers";
import { teamRoster } from "@/lib/data/team";
import { bookingDays, clientBusiness } from "@/lib/data/clientApp";
import { useClientBooking, ANY_PROFESSIONAL } from "@/lib/store/clientBooking";

export default function BookingConfirmedPage() {
  const router = useRouter();
  const { serviceIds, staffId, dayId, time, reset } = useClientBooking();
  const names = serviceIds
    .map((id) => demoOffers.find((o) => o.id === id)?.name)
    .filter(Boolean)
    .join(" · ");
  const dayLabel = bookingDays.find((d) => d.id === dayId)?.label;
  const staffName =
    staffId === ANY_PROFESSIONAL
      ? "any professional"
      : teamRoster.find((t) => t.id === staffId)?.name;

  const done = () => {
    reset();
    router.push("/client/home");
  };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white text-[15px] font-semibold text-navy"
          >
            <CalendarPlus size={17} strokeWidth={1.8} />
            Add to calendar
          </button>
          <PrimaryButton onClick={done}>Done</PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-white"
        >
          <Check size={36} strokeWidth={2.5} />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="pt-5 font-display text-[28px] font-extrabold tracking-tight text-navy"
        >
          Booking confirmed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-2 text-[15px] leading-snug text-secondary"
        >
          {names || "Your appointment"}
          {dayLabel && time ? ` on ${dayLabel} at ${time}` : ""}
          {staffName ? ` with ${staffName}` : ""} at {clientBusiness.name}.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-3 text-[13px] text-muted"
        >
          We&apos;ve sent the details to your email.
        </motion.p>
      </div>
    </Screen>
  );
}
