"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { demoOffers } from "@/lib/data/offers";
import { bookingDays, daySlots, fmtDuration, clientBusiness, type DaySlots } from "@/lib/data/clientApp";
import { useClientBooking } from "@/lib/store/clientBooking";

const PERIODS: { key: keyof DaySlots; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

export default function PickTimePage() {
  const router = useRouter();
  const { serviceIds, dayId, time, setSlot } = useClientBooking();
  const [viewDay, setViewDay] = useState(dayId ?? bookingDays[0].id);
  const slots = daySlots[viewDay];

  const totalMins = serviceIds.reduce(
    (sum, id) => sum + (demoOffers.find((o) => o.id === id)?.durationMin ?? 0),
    0
  );

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={!dayId || !time}
          onClick={() => router.push("/client/book/review")}
        >
          {dayId && time
            ? `Continue · ${bookingDays.find((d) => d.id === dayId)?.label} · ${time}`
            : "Pick a time"}
        </PrimaryButton>
      }
    >
      <Title
        sub={
          totalMins
            ? `${fmtDuration(totalMins)} at ${clientBusiness.name}`
            : clientBusiness.name
        }
      >
        Pick a time
      </Title>

      {/* Day strip */}
      <div className="flex gap-2 overflow-x-auto px-6 pt-4 [scrollbar-width:none]">
        {bookingDays.map((d) => {
          const active = viewDay === d.id;
          return (
            <button
              key={d.id}
              type="button"
              disabled={d.closed}
              onClick={() => setViewDay(d.id)}
              className={`flex w-[52px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-colors ${
                active
                  ? "border-navy bg-navy text-white"
                  : d.closed
                    ? "border-border bg-white text-muted opacity-50"
                    : "border-border bg-white text-navy"
              }`}
            >
              <span className="text-[11px] font-medium uppercase">{d.dow}</span>
              <span className="pt-0.5 text-[16px] font-bold">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-5 px-6 pb-4 pt-5">
        {PERIODS.map(({ key, label }) =>
          slots[key].length === 0 ? null : (
            <div key={key}>
              <p className="pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
              <div className="grid grid-cols-3 gap-2">
                {slots[key].map((t) => {
                  const on = dayId === viewDay && time === t;
                  return (
                    <motion.button
                      key={t}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSlot(viewDay, t)}
                      className={`h-11 rounded-xl border text-[14px] font-semibold transition-colors ${
                        on ? "border-navy bg-navy text-white" : "border-border bg-white text-navy"
                      }`}
                    >
                      {t}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )
        )}
        {!slots.morning.length && !slots.afternoon.length && !slots.evening.length && (
          <p className="pt-6 text-center text-[14px] text-muted">Closed on this day — pick another.</p>
        )}
      </div>
    </Screen>
  );
}
