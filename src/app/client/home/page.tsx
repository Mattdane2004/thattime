"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Bell, UserRound, House, Search, MessageCircle, Calendar } from "lucide-react";

function BizCard({
  onClick,
  delay,
  name = "Village barbers",
  rating = "5.0",
  reviews = "(765)",
  address = "92. Sunningdale high street",
}: {
  onClick: () => void;
  delay: number;
  name?: string;
  rating?: string;
  reviews?: string;
  address?: string;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-[210px] shrink-0 text-left"
    >
      <span className="relative block h-[150px] w-full overflow-hidden rounded-2xl bg-border">
        <Image
          src="/onboarding/photo-carousel-center.png"
          alt={name}
          fill
          sizes="210px"
          className="object-cover"
        />
      </span>
      <span className="mt-2 block text-[16px] font-bold text-navy">{name}</span>
      <span className="mt-0.5 flex items-center gap-1 text-[13px] text-navy">
        {rating}
        <Star size={12} className="fill-current" />
        <span className="text-secondary">{reviews}</span>
      </span>
      <span className="mt-0.5 block text-[13px] text-secondary">{address}</span>
    </motion.button>
  );
}

const tabs = [
  { label: "Home", active: true, icon: <House size={22} strokeWidth={1.7} /> },
  { label: "Find", icon: <Search size={22} strokeWidth={1.7} /> },
  { label: "Message", icon: <MessageCircle size={22} strokeWidth={1.7} /> },
  { label: "Schedule", icon: <Calendar size={22} strokeWidth={1.7} /> },
];

export default function ClientHomePage() {
  const router = useRouter();
  const book = () => router.push("/client/business");

  return (
    <div className="flex h-full flex-col bg-cream font-body text-navy">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="h-2" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} strokeWidth={1.6} className="text-navy" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger" />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
            <UserRound size={16} strokeWidth={1.7} />
          </span>
        </div>
      </div>
      <p className="px-5 pt-1 text-[12px] text-muted">Sunningdale, Ascot</p>
      <h1 className="px-5 pt-1 font-display text-[24px] font-extrabold tracking-tight text-navy">
        Good afternoon, Emma
      </h1>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <h2 className="px-5 pb-3 pt-5 font-display text-[19px] font-extrabold text-navy">Near you</h2>
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none]">
          <BizCard
            onClick={book}
            delay={0.05}
            name="Salon Soho"
            rating="4.9"
            reviews="(1,234)"
            address="14 Greek Street, Soho"
          />
          <BizCard onClick={book} delay={0.12} />
        </div>
        <h2 className="px-5 pb-3 pt-6 font-display text-[19px] font-extrabold text-navy">
          Recommendations
        </h2>
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none]">
          <BizCard
            onClick={book}
            delay={0.1}
            name="Salon Soho"
            rating="4.9"
            reviews="(1,234)"
            address="14 Greek Street, Soho"
          />
          <BizCard onClick={book} delay={0.17} />
        </div>
      </div>

      <nav className="flex shrink-0 items-center justify-around border-t border-border bg-white px-2 pb-5 pt-2.5">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`flex flex-col items-center gap-1 px-3 text-[11px] font-medium ${
              t.active ? "text-navy" : "text-muted"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
