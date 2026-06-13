"use client";

// Booking confirmation — animated check, summary, quick actions and a
// social hook nudging the user to share their visit.

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  CalendarPlus,
  MapPin,
  MessageCircle,
  Camera,
  ChevronRight,
} from "lucide-react";
import { DarkButton, GhostButton } from "@/components/app/ui";
import { Avatar } from "@/components/client/shared";
import { getSalon, getOffer } from "@/lib/data/b2c";

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-canvas" />}>
      <Confirmed />
    </Suspense>
  );
}

function Confirmed() {
  const router = useRouter();
  const search = useSearchParams();
  const salon = getSalon(search.get("salon") ?? "village-barbers");
  const offer = salon ? getOffer(salon.id, search.get("offer") ?? "") ?? salon.offers[0] : undefined;
  const total = search.get("total");

  if (!salon || !offer) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-[14px] text-secondary">Booking not found.</p>
      </div>
    );
  }

  const showsDateTime = offer.type === "service" || offer.type === "class";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-10">
        {/* animated check */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-white"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32, type: "spring", stiffness: 300, damping: 18 }}
            >
              <Check size={38} strokeWidth={2.5} />
            </motion.span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-5 font-display text-[22px] font-extrabold tracking-tight text-navy"
          >
            Booking confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-1 text-center text-[13px] text-secondary"
          >
            We&apos;ve sent the details to your email.
          </motion.p>
        </div>

        {/* summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6 rounded-2xl border border-border bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <Avatar initials={salon.avatar} category={salon.category} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-navy">{salon.name}</p>
              <p className="truncate text-[12px] text-secondary">{offer.name}</p>
            </div>
            <span className="text-[15px] font-bold text-navy">{total ? `£${total}` : offer.price}</span>
          </div>
          {showsDateTime && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[13px]">
              <span className="text-secondary">Date & time</span>
              <span className="font-semibold text-navy">
                {offer.type === "class" ? offer.nextSession ?? "Sat 20 Jun, 10:00" : "Tue 16 Jun · 15:30"}
              </span>
            </div>
          )}
        </motion.div>

        {/* quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <ActionRow icon={<CalendarPlus size={20} strokeWidth={1.75} />} label="Add to calendar" onClick={() => {}} />
          <ActionRow icon={<MapPin size={20} strokeWidth={1.75} />} label="Get directions" onClick={() => {}} />
          <ActionRow
            icon={<MessageCircle size={20} strokeWidth={1.75} />}
            label={`Message ${salon.name}`}
            onClick={() => router.push("/c/inbox")}
          />
        </motion.div>

        {/* social hook */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/c/create")}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-ink p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
            <Camera size={20} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-white">Share your visit</span>
            <span className="block text-[12px] text-white/70">
              Post your result and tag {salon.handle} — inspire someone&apos;s next booking.
            </span>
          </span>
          <ChevronRight size={20} strokeWidth={1.75} className="text-white/60" />
        </motion.button>
      </div>

      <div className="shrink-0 space-y-2.5 border-t border-border bg-surface px-4 pb-5 pt-3">
        <DarkButton onClick={() => router.push("/c/bookings/bk-1")}>View booking</DarkButton>
        <GhostButton onClick={() => router.push("/c/home")}>Done</GhostButton>
      </div>
    </div>
  );
}

function ActionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-left"
    >
      <span className="text-navy">{icon}</span>
      <span className="flex-1 text-[14px] font-medium text-navy">{label}</span>
      <ChevronRight size={18} strokeWidth={1.75} className="text-muted" />
    </motion.button>
  );
}
