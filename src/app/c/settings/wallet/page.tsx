"use client";

// Wallet & loyalty — balance hero, Gold tier progress, transactions, passes.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronDown, Gift, Plus, Crown, Receipt, ChevronRight } from "lucide-react";
import { clientUser } from "@/lib/data/b2c";
import { Sheet, DarkButton } from "@/components/ui";
import { OfferTypeBadge } from "@/components/ui/consumer";

const TIER_TARGET = 500; // points to Platinum

export default function WalletPage() {
  const router = useRouter();
  const [sheet, setSheet] = useState<null | "topup" | "refer">(null);
  const [howOpen, setHowOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("£20");

  const { wallet, memberships } = clientUser;
  const progress = Math.min(100, Math.round((wallet.loyaltyPoints / TIER_TARGET) * 100));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Wallet & loyalty</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5">
        {/* balance hero */}
        <div className="rounded-3xl bg-ink p-5 text-white">
          <p className="text-[12px] font-medium text-white/60">Wallet balance</p>
          <p className="pt-1 font-display text-[36px] font-extrabold leading-none tracking-tight">{wallet.balance}</p>
          <div className="flex gap-2.5 pt-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSheet("topup")}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-semibold text-navy"
            >
              <Plus size={15} strokeWidth={2} />
              Add funds
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSheet("refer")}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-[13px] font-semibold text-white"
            >
              <Gift size={15} strokeWidth={1.75} />
              Refer a friend +£10
            </motion.button>
          </div>
        </div>

        {/* loyalty card */}
        <div className="mt-4 rounded-3xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-navy">
              <Crown size={18} strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-navy">{wallet.tier} tier</p>
              <p className="text-[12px] text-secondary">{wallet.loyaltyPoints} points</p>
            </div>
          </div>
          <div className="pt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="h-full rounded-full bg-coral"
              />
            </div>
            <p className="pt-2 text-[12px] text-secondary">
              {TIER_TARGET - wallet.loyaltyPoints} points to Platinum
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHowOpen((v) => !v)}
            className="mt-3 flex w-full items-center justify-between border-t border-border pt-3 text-left"
          >
            <span className="text-[13px] font-semibold text-navy">How it works</span>
            <motion.span animate={{ rotate: howOpen ? 180 : 0 }} className="text-muted">
              <ChevronDown size={16} strokeWidth={1.75} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {howOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ul className="flex flex-col gap-1.5 pt-3 text-[13px] leading-relaxed text-secondary">
                  <li>· Earn 10 points for every £1 spent on bookings.</li>
                  <li>· Gold unlocks priority slots and birthday credit.</li>
                  <li>· Platinum at 500 points adds 5% wallet cashback.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* transactions */}
        <p className="pb-2 pt-7 text-[12px] font-bold uppercase tracking-wide text-muted">Transactions</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {wallet.transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-secondary">
                <Receipt size={16} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-navy">{t.label}</span>
                <span className="block text-[12px] text-secondary">{t.date}</span>
              </span>
              <span className="text-[13px] font-bold text-coral">{t.amount}</span>
            </div>
          ))}
        </div>

        {/* memberships */}
        <p className="pb-2 pt-7 text-[12px] font-bold uppercase tracking-wide text-muted">Your passes</p>
        <div className="flex flex-col gap-3">
          {memberships.map((m) => (
            <Link
              key={m.id}
              href={`/c/salon/${m.salonId}`}
              className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-navy">{m.name}</span>
                  <OfferTypeBadge type={m.kind} />
                </span>
                <span className="block text-[12px] text-secondary">
                  {m.salonName} · {m.detail}
                </span>
              </span>
              <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </div>

      {/* top-up sheet */}
      <Sheet open={sheet === "topup"} onClose={() => setSheet(null)} title="Add funds" sub="Credit never expires.">
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex gap-2.5">
            {["£10", "£20", "£50"].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setTopupAmount(a)}
                className={`flex-1 rounded-2xl border py-3.5 text-[15px] font-bold ${
                  topupAmount === a ? "border-ink bg-ink text-white" : "border-border bg-canvas text-navy"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-secondary">Paying with Visa ••4242 (default)</p>
          <DarkButton onClick={() => setSheet(null)}>Add {topupAmount}</DarkButton>
        </div>
      </Sheet>

      {/* refer sheet */}
      <Sheet open={sheet === "refer"} onClose={() => setSheet(null)} title="Refer a friend" sub="You both get £10 when they complete a booking.">
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-canvas px-4 py-3.5">
            <span className="text-[15px] font-bold tracking-wide text-navy">EMMA-10</span>
            <span className="text-[12px] font-semibold text-coral">Copy</span>
          </div>
          <DarkButton onClick={() => setSheet(null)}>Share invite link</DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
