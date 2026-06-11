"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function BizCard({ onClick, delay }: { onClick: () => void; delay: number }) {
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
          alt="Village barbers"
          fill
          sizes="210px"
          className="object-cover"
        />
      </span>
      <span className="mt-2 block text-[16px] font-bold text-navy">Village barbers</span>
      <span className="mt-0.5 flex items-center gap-1 text-[13px] text-navy">
        5.0
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="m12 2 3 7 7 .5-5.4 4.8L18.5 22 12 17.8 5.5 22l1.9-7.7L2 9.5 9 9l3-7Z" />
        </svg>
        <span className="text-secondary">(765)</span>
      </span>
      <span className="mt-0.5 block text-[13px] text-secondary">92. Sunningdale high street</span>
    </motion.button>
  );
}

const tabs = [
  {
    label: "Home",
    active: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m3 11 9-7 9 7M5 9.5V20h14V9.5" />
      </svg>
    ),
  },
  {
    label: "Find",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
    ),
  },
  {
    label: "Message",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12a8 8 0 0 1-8 8c-1.5 0-3-.4-4.2-1L3 20l1.2-4.6A8 8 0 1 1 21 12Z" />
      </svg>
    ),
  },
  {
    label: "Schedule",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    ),
  },
];

export default function ClientHomePage() {
  const router = useRouter();
  const book = () => router.push("/client/signup");

  return (
    <div className="flex h-full flex-col bg-cream font-body text-navy">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="h-2" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="20" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-navy" aria-hidden>
              <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M10 19a2.2 2.2 0 0 0 4 0" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger" />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
            </svg>
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
          <BizCard onClick={book} delay={0.05} />
          <BizCard onClick={book} delay={0.12} />
        </div>
        <h2 className="px-5 pb-3 pt-6 font-display text-[19px] font-extrabold text-navy">
          Recommendations
        </h2>
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none]">
          <BizCard onClick={book} delay={0.1} />
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
