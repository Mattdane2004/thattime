"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, Percent, Banknote, Scissors, ShoppingBag, Plus, Check, X, Gift,
} from "lucide-react";
import { Sheet, DarkButton } from "@/components/app/ui";
import { services, products } from "@/lib/data/product";

// Wallet & loyalty — a dedicated page (was a bottom sheet). Balance and
// points up top, top-ups one tap away, and rewards you can actually build:
// percentage off, amount off, a free service or a free product.

interface Reward {
  id: string;
  label: string;
  sub: string;
}

type RewardKind = "percent" | "amount" | "service" | "product";

const rewardKinds: { key: RewardKind; icon: React.ReactNode; t: string; s: string }[] = [
  { key: "percent", icon: <Percent size={17} strokeWidth={1.8} />, t: "Percentage off", s: "e.g. 10% off any visit" },
  { key: "amount", icon: <Banknote size={17} strokeWidth={1.8} />, t: "Amount off", s: "e.g. £10 off the bill" },
  { key: "service", icon: <Scissors size={17} strokeWidth={1.8} />, t: "Free service", s: "Pick from your menu" },
  { key: "product", icon: <ShoppingBag size={17} strokeWidth={1.8} />, t: "Free product", s: "Pick from retail" },
];

const percentOptions = [5, 10, 15, 20, 25];
const amountOptions = [5, 10, 15, 20];

const activity = [
  { id: "a1", label: "+20 pts · Cut & Style", date: "3 Mar 2026" },
  { id: "a2", label: "£25 credit added", date: "10 Feb 2026" },
  { id: "a3", label: "+20 pts · Cut & Style", date: "10 Feb 2026" },
  { id: "a4", label: "Redeemed · 10% off colour", date: "20 Jan 2026" },
];

export default function ClientWalletPage() {
  const router = useRouter();

  const [balance, setBalance] = useState(25);
  const [rewards, setRewards] = useState<Reward[]>([
    { id: "r1", label: "Free blow dry", sub: "Unlocks at 400 pts · 80 to go" },
    { id: "r2", label: "10% off colour", sub: "Unlocks at 250 pts · available now" },
  ]);

  // Top-up is a deliberate flow behind its own button — no accidental credit.
  const [topupOpen, setTopupOpen] = useState(false);
  const [topup, setTopup] = useState<number | null>(null);
  const [topupCustom, setTopupCustom] = useState("");
  const topupValue = topup ?? (Number(topupCustom) > 0 ? Math.floor(Number(topupCustom)) : null);

  // Add-reward flow — chips for the common values, custom input for the rest.
  const [addOpen, setAddOpen] = useState(false);
  const [kind, setKind] = useState<RewardKind | null>(null);
  const [pctPick, setPctPick] = useState<number | null>(null);
  const [pctCustom, setPctCustom] = useState("");
  const [amtPick, setAmtPick] = useState<number | null>(null);
  const [amtCustom, setAmtCustom] = useState("");
  const [itemPick, setItemPick] = useState<string | null>(null);

  const pctValue = pctPick ?? (Number(pctCustom) > 0 && Number(pctCustom) <= 100 ? Math.floor(Number(pctCustom)) : null);
  const amtValue = amtPick ?? (Number(amtCustom) > 0 ? Math.floor(Number(amtCustom)) : null);

  const resetAdd = () => {
    setKind(null);
    setPctPick(null);
    setPctCustom("");
    setAmtPick(null);
    setAmtCustom("");
    setItemPick(null);
  };

  const draftLabel =
    kind === "percent" && pctValue ? `${pctValue}% off any visit`
      : kind === "amount" && amtValue ? `£${amtValue} off the bill`
        : kind === "service" && itemPick ? `Free ${itemPick}`
          : kind === "product" && itemPick ? `Free ${itemPick}`
            : null;

  const saveReward = () => {
    if (!draftLabel) return;
    setRewards((r) => [...r, { id: `r${r.length + 1}-${draftLabel}`, label: draftLabel, sub: "Added by you · available now" }]);
    setAddOpen(false);
    resetAdd();
  };

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="bg-white px-4 pb-4 pt-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="pt-1 text-[24px] font-bold text-navy">Wallet & loyalty</h1>
        <p className="pt-0.5 text-[13px] text-muted">Sarah Johnson</p>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Balance + points hero — labels first, numbers loud */}
        <div className="rounded-3xl bg-[#14181F] p-5 text-white">
          <div className="flex">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">Wallet balance</p>
              <p className="pt-1.5 text-[32px] font-bold leading-none">£{balance}</p>
              <p className="pt-1.5 text-[11px] text-white/60">Spends automatically at checkout</p>
            </div>
            <div className="mx-4 w-px bg-white/12" />
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">Loyalty points</p>
              <p className="pt-1.5 text-[32px] font-bold leading-none">320</p>
              <p className="pt-1.5 text-[11px] text-white/60">{rewards.length} reward{rewards.length === 1 ? "" : "s"} to redeem</p>
            </div>
          </div>
          {/* Progress to the next points reward */}
          <div className="pt-5">
            <div className="flex items-center justify-between pb-1.5 text-[11px] text-white/60">
              <span>Next reward · Free blow dry</span>
              <span>320 / 400 pts</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-white"
              />
            </div>
          </div>
        </div>

        {/* Topping up is deliberate: its own button, its own confirm */}
        <button
          type="button"
          onClick={() => { setTopup(null); setTopupCustom(""); setTopupOpen(true); }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white text-[14px] font-semibold text-navy"
        >
          <Plus size={15} strokeWidth={2} />
          Add top-up
        </button>

        {/* Rewards */}
        <div>
          <div className="flex items-center justify-between pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Rewards · {rewards.length}</p>
            <button
              type="button"
              onClick={() => { resetAdd(); setAddOpen(true); }}
              className="flex items-center gap-1 rounded-full bg-[#14181F] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <Plus size={12} strokeWidth={2.5} />
              Add reward
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
            {rewards.map((r, i) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                  <Gift size={15} strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-navy">{r.label}</span>
                  <span className="block text-[11px] text-muted">{r.sub}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${r.label}`}
                  onClick={() => setRewards((x) => x.filter((y) => y.id !== r.id))}
                  className="p-1.5 text-muted"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
            {rewards.length === 0 && (
              <p className="px-4 py-4 text-[13px] text-muted">No rewards yet — add one above.</p>
            )}
          </div>
        </div>

        {/* Activity */}
        <div>
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Recent activity</p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
            {activity.map((a, i) => (
              <div key={a.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <span className="text-[13px] font-medium text-navy">{a.label}</span>
                <span className="text-[11px] text-muted">{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add top-up — confirm before any credit lands */}
      <Sheet open={topupOpen} onClose={() => setTopupOpen(false)} title="Add top-up" sub="Credit Sarah spends automatically at checkout">
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">How much?</p>
        <div className="flex gap-2">
          {[5, 10, 25].map((v) => (
            <button
              key={v}
              onClick={() => { setTopup(topup === v ? null : v); setTopupCustom(""); }}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold transition-colors ${
                topup === v ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              +£{v}
            </button>
          ))}
        </div>
        <div className="relative mt-3">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted">£</span>
          <input
            value={topupCustom}
            onChange={(e) => { setTopupCustom(e.target.value.replace(/[^0-9]/g, "")); setTopup(null); }}
            inputMode="numeric"
            placeholder="Custom amount"
            className="h-12 w-full rounded-xl bg-canvas pl-8 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <p className="pt-3 text-[12px] leading-snug text-muted">
          Use credit to apologise for a mix-up, reward loyalty, or pre-load a package.
        </p>
        <div className="pt-4">
          <DarkButton
            disabled={!topupValue}
            onClick={() => {
              if (topupValue) setBalance((b) => b + topupValue);
              setTopupOpen(false);
            }}
          >
            {topupValue ? `Confirm £${topupValue} top-up` : "Pick or enter an amount"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Add reward */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={kind === null ? "Add a reward" : rewardKinds.find((k) => k.key === kind)?.t}
        sub="Sarah can redeem it at checkout"
        full={kind === "service" || kind === "product"}
      >
        {kind === null && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {rewardKinds.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-navy">{k.icon}</span>
                <span className="text-[14px] font-semibold text-navy">{k.t}</span>
                <span className="text-[11px] leading-snug text-muted">{k.s}</span>
              </button>
            ))}
          </div>
        )}

        {kind === "percent" && (
          <>
            <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">How much off?</p>
            <div className="flex gap-2">
              {percentOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPctPick(pctPick === p ? null : p); setPctCustom(""); }}
                  className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                    pctPick === p ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <input
                value={pctCustom}
                onChange={(e) => { setPctCustom(e.target.value.replace(/[^0-9]/g, "")); setPctPick(null); }}
                inputMode="numeric"
                placeholder="Custom percentage"
                className="h-12 w-full rounded-xl bg-canvas px-4 pr-9 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted">%</span>
            </div>
          </>
        )}

        {kind === "amount" && (
          <>
            <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">How much off?</p>
            <div className="flex gap-2">
              {amountOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => { setAmtPick(amtPick === p ? null : p); setAmtCustom(""); }}
                  className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                    amtPick === p ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                  }`}
                >
                  £{p}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted">£</span>
              <input
                value={amtCustom}
                onChange={(e) => { setAmtCustom(e.target.value.replace(/[^0-9]/g, "")); setAmtPick(null); }}
                inputMode="numeric"
                placeholder="Custom amount"
                className="h-12 w-full rounded-xl bg-canvas pl-8 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
            </div>
          </>
        )}

        {kind === "service" && (
          <div className="flex flex-col">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setItemPick(s.name)}
                className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-navy">{s.name}</span>
                  <span className="block text-[12px] text-muted">{s.duration} · usually £{s.price}</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    itemPick === s.name ? "border-[#14181F] bg-[#14181F] text-white" : "border-border"
                  }`}
                >
                  {itemPick === s.name && <Check size={11} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
        )}

        {kind === "product" && (
          <div className="flex flex-col">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setItemPick(p.name)}
                className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-navy">{p.name}</span>
                  <span className="block text-[12px] text-muted">{p.size} · usually £{p.price}</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    itemPick === p.name ? "border-[#14181F] bg-[#14181F] text-white" : "border-border"
                  }`}
                >
                  {itemPick === p.name && <Check size={11} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
        )}

        {kind !== null && (
          <div className="pt-5">
            <DarkButton disabled={!draftLabel} onClick={saveReward}>
              {draftLabel ? `Add reward · ${draftLabel}` : "Make a choice above"}
            </DarkButton>
            <button
              type="button"
              onClick={resetAdd}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full text-[13px] font-semibold text-secondary"
            >
              Back to reward types
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
