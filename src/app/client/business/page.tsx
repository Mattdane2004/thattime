"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from "lucide-react";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { demoOffers, offerMeta } from "@/lib/data/offers";
import { teamRoster, initialsOf } from "@/lib/data/team";
import { clientBusiness, businessReviews } from "@/lib/data/clientApp";
import { useClientBooking } from "@/lib/store/clientBooking";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5 text-navy">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < n ? "fill-current" : "text-border"} />
      ))}
    </span>
  );
}

export default function ClientBusinessPage() {
  const router = useRouter();
  const { toggleService, serviceIds, reset } = useClientBooking();
  const services = demoOffers.filter((o) => o.type === "service" && o.status === "published");
  const team = teamRoster.filter((t) => t.bookable && t.status === "active").slice(0, 6);

  const startBooking = (serviceId?: string) => {
    reset();
    if (serviceId && !serviceIds.includes(serviceId)) toggleService(serviceId);
    router.push("/client/book");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white font-body text-navy">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {/* Hero */}
        <div className="relative h-[220px] w-full bg-border">
          <Image
            src={clientBusiness.photos[0]}
            alt={clientBusiness.name}
            fill
            sizes="430px"
            className="object-cover"
            priority
          />
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.push("/client/home")}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy shadow-sm"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Save to favourites"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy shadow-sm"
          >
            <Heart size={17} strokeWidth={1.8} />
          </button>
        </div>

        {/* Identity */}
        <div className="px-5 pt-4">
          <h1 className="font-display text-[26px] font-extrabold tracking-tight">{clientBusiness.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-[14px]">
            <span className="font-bold">{clientBusiness.rating}</span>
            <Star size={13} className="fill-current" />
            <span className="text-secondary">({clientBusiness.reviewCount.toLocaleString()})</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-secondary">
            <MapPin size={14} strokeWidth={1.8} />
            {clientBusiness.address}
          </p>
          <p className="mt-1 text-[13px] font-medium text-success">{clientBusiness.openLine}</p>
        </div>

        {/* Services */}
        <h2 className="px-5 pb-2 pt-6 font-display text-[19px] font-extrabold">Services</h2>
        <div className="flex flex-col">
          {services.map((s) => (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => startBooking(s.id)}
              className="flex items-center gap-3 border-b border-border px-5 py-3.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{s.name}</span>
                <span className="mt-0.5 block text-[13px] text-secondary">{offerMeta(s)}</span>
              </span>
              <span className="flex items-center gap-1 text-[13px] font-semibold text-navy">
                Book
                <ChevronRight size={15} strokeWidth={2} />
              </span>
            </motion.button>
          ))}
        </div>

        {/* Team */}
        <h2 className="px-5 pb-3 pt-6 font-display text-[19px] font-extrabold">The team</h2>
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none]">
          {team.map((t) => (
            <div key={t.id} className="flex w-[72px] shrink-0 flex-col items-center text-center">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-bold ${t.avatarColor}`}>
                {initialsOf(t.name)}
              </span>
              <span className="mt-1.5 w-full truncate text-[12px] font-semibold">{t.name.split(" ")[0]}</span>
              <span className="w-full truncate text-[11px] text-muted">{t.role}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <h2 className="px-5 pb-2 pt-6 font-display text-[19px] font-extrabold">About</h2>
        <p className="px-5 text-[14px] leading-relaxed text-secondary">{clientBusiness.about}</p>
        <div className="mx-5 mt-4 rounded-2xl border border-border">
          {clientBusiness.hours.map((h, i) => (
            <div
              key={h.day}
              className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${i ? "border-t border-border" : ""}`}
            >
              <span className="font-medium">{h.day}</span>
              <span className={h.time === "Closed" ? "text-muted" : "text-secondary"}>{h.time}</span>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <h2 className="px-5 pb-2 pt-6 font-display text-[19px] font-extrabold">Reviews</h2>
        <div className="flex flex-col gap-3 px-5">
          {businessReviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fog text-[13px] font-bold">
                  {r.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{r.name}</span>
                  <span className="block text-[12px] text-muted">{r.date}</span>
                </span>
                <Stars n={r.stars} />
              </div>
              <p className="mt-2.5 text-[13px] leading-snug text-secondary">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="shrink-0 border-t border-border bg-white px-5 pb-6 pt-3">
        <PrimaryButton onClick={() => startBooking()}>Book now</PrimaryButton>
      </div>
    </div>
  );
}
