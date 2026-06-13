"use client";

// Checkout — order summary, promo code, wallet credit, payment method,
// tip selector, sticky pay footer with fake processing. Tab bar hidden.

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Tag,
  Check,
  CreditCard,
  Plus,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { DarkButton, SectionLabel, Sheet } from "@/components/ui";
import { Avatar } from "@/components/client/shared";
import { getSalon, getOffer, clientUser, type PaymentMethod } from "@/lib/data/b2c";

const parsePrice = (p: string) => Number(p.replace(/[^\d.]/g, "")) || 0;
const gbp = (n: number) => `£${n.toFixed(2)}`;

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-canvas" />}>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const router = useRouter();
  const search = useSearchParams();
  const salonId = search.get("salon") ?? "village-barbers";
  const offerId = search.get("offer") ?? "";
  const salon = getSalon(salonId);
  const offer = salon ? getOffer(salonId, offerId) ?? salon.offers[0] : undefined;

  // promo
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "applied" | "invalid">("idle");

  // wallet
  const walletBalance = parsePrice(clientUser.wallet.balance);
  const [useCredit, setUseCredit] = useState(false);

  // payment methods
  const [methods, setMethods] = useState<PaymentMethod[]>(clientUser.paymentMethods);
  const [methodId, setMethodId] = useState(
    clientUser.paymentMethods.find((m) => m.isDefault)?.id ?? clientUser.paymentMethods[0]?.id,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [cardNo, setCardNo] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // tip
  const [tipPct, setTipPct] = useState(0);

  // processing
  const [processing, setProcessing] = useState(false);

  const tippable = offer?.type === "service" || offer?.type === "class";

  const totals = useMemo(() => {
    const base = offer ? parsePrice(offer.price) : 0;
    const discount = promoState === "applied" ? 14 : 0;
    const tip = tippable ? (base * tipPct) / 100 : 0;
    const subTotal = Math.max(0, base - discount) + tip;
    const credit = useCredit ? Math.min(walletBalance, subTotal) : 0;
    return { base, discount, tip, credit, total: Math.max(0, subTotal - credit) };
  }, [offer, promoState, tipPct, useCredit, walletBalance, tippable]);

  if (!salon || !offer) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-[14px] text-secondary">Nothing to check out.</p>
      </div>
    );
  }

  const applyPromo = () => {
    setPromoState(promo.trim().toUpperCase() === "FORM10" ? "applied" : "invalid");
  };

  const addCard = () => {
    if (!cardNo.trim()) return;
    const id = `pm-${methods.length + 1}-new`;
    setMethods((p) => [
      ...p,
      { id, brand: "Card", last4: cardNo.replace(/\s/g, "").slice(-4) || "0000", expiry: cardExp || "01/29", isDefault: false },
    ]);
    setMethodId(id);
    setAddOpen(false);
    setCardNo(""); setCardExp(""); setCardCvc("");
  };

  const pay = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      router.push(`/c/confirmed?salon=${salon.id}&offer=${offer.id}&total=${totals.total.toFixed(2)}`);
    }, 1200);
  };

  const showsDateTime = offer.type === "service" || offer.type === "class";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-surface px-3 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => router.back()} aria-label="Back" className="p-1.5 text-navy">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </motion.button>
          <p className="font-display text-[16px] font-extrabold tracking-tight text-navy">Checkout</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {/* order summary */}
        <SectionLabel>Order summary</SectionLabel>
        <div className="px-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Avatar initials={salon.avatar} category={salon.category} size={40} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-navy">{salon.name}</p>
                <p className="truncate text-[12px] text-secondary">{offer.name}</p>
              </div>
            </div>
            {showsDateTime && (
              <div className="flex items-center justify-between pt-3 text-[13px]">
                <span className="text-secondary">Date & time</span>
                <span className="font-semibold text-navy">
                  {offer.type === "class" ? offer.nextSession ?? "Sat 20 Jun, 10:00" : "Tue 16 Jun · 15:30"}
                </span>
              </div>
            )}
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              <Line label={offer.name} value={gbp(totals.base)} />
              <AnimatePresence>
                {totals.discount > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Line label="Promo FORM10" value={`−${gbp(totals.discount)}`} accent />
                  </motion.div>
                )}
                {totals.tip > 0 && (
                  <motion.div key="tip" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Line label={`Tip (${tipPct}%)`} value={gbp(totals.tip)} />
                  </motion.div>
                )}
                {totals.credit > 0 && (
                  <motion.div key="credit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Line label="Wallet credit" value={`−${gbp(totals.credit)}`} accent />
                  </motion.div>
                )}
              </AnimatePresence>
              <Line label="Booking fees" value="£0.00" />
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="text-[14px] font-bold text-navy">Total</span>
                <span className="text-[15px] font-bold text-navy">{gbp(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* promo */}
          <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
            {promoState === "applied" ? (
              <p className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                FORM10 applied — £14.00 off
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPromoOpen((v) => !v)}
                  className="flex w-full items-center gap-2.5 text-left text-[14px] font-medium text-navy"
                >
                  <Tag size={20} strokeWidth={1.75} className="text-coral" />
                  Add a promo code
                </button>
                <AnimatePresence>
                  {promoOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-3">
                        <input
                          value={promo}
                          onChange={(e) => { setPromo(e.target.value); setPromoState("idle"); }}
                          placeholder="e.g. FORM10"
                          className="min-w-0 flex-1 rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-[14px] uppercase text-navy placeholder:normal-case placeholder:text-muted focus:outline-none"
                        />
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={applyPromo}
                          className="rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
                        >
                          Apply
                        </motion.button>
                      </div>
                      {promoState === "invalid" && (
                        <p className="pt-2 text-[12px] font-medium text-coral">That code isn&apos;t valid.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* wallet credit */}
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <span className="flex items-center gap-2.5 text-[14px] font-medium text-navy">
              <Wallet size={20} strokeWidth={1.75} className="text-navy" />
              Use {clientUser.wallet.balance} credit
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={useCredit}
              onClick={() => setUseCredit((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors ${useCredit ? "bg-ink" : "bg-border"}`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow ${useCredit ? "right-0.5" : "left-0.5"}`}
              />
            </button>
          </div>
        </div>

        {/* payment method */}
        <div className="pt-5">
          <SectionLabel>Payment method</SectionLabel>
        </div>
        <div className="space-y-2.5 px-4">
          {methods.map((m) => {
            const selected = methodId === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setMethodId(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ${selected ? "border-2 border-ink" : "border border-border"}`}
              >
                <CreditCard size={20} strokeWidth={1.75} className="text-navy" />
                <span className="flex-1 text-[14px] font-medium text-navy">
                  {m.brand}
                  {m.last4 && <span className="text-secondary"> •••• {m.last4}</span>}
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-ink bg-ink text-white" : "border-border"}`}
                >
                  {selected && <Check size={12} strokeWidth={3} />}
                </span>
              </motion.button>
            );
          })}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-4 text-[14px] font-medium text-secondary"
          >
            <Plus size={20} strokeWidth={1.75} /> Add payment method
          </motion.button>
        </div>

        {/* tip */}
        {tippable && (
          <>
            <div className="pt-5">
              <SectionLabel>Add a tip</SectionLabel>
            </div>
            <div className="flex gap-2 px-4">
              {[0, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTipPct(p)}
                  className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${tipPct === p ? "border-ink bg-ink text-white" : "border-border bg-surface text-navy"}`}
                >
                  {p === 0 ? "None" : `${p}%`}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="flex items-start gap-2 px-4 pt-5 text-[11px] leading-relaxed text-muted">
          <ShieldCheck size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          Free cancellation until 24h before. By confirming you agree to thattime&apos;s Terms and {salon.name}&apos;s booking policy.
        </p>
        <div className="h-4" />
      </div>

      {/* sticky footer */}
      <div className="shrink-0 border-t border-border bg-surface px-4 pb-5 pt-3">
        <div className="flex items-center justify-between pb-2.5">
          <span className="text-[13px] text-secondary">Total to pay</span>
          <span className="text-[17px] font-bold text-navy">{gbp(totals.total)}</span>
        </div>
        <DarkButton onClick={pay} disabled={processing}>
          {processing ? (
            <>
              <Loader2 size={18} strokeWidth={2} className="animate-spin" /> Processing…
            </>
          ) : (
            "Confirm & pay"
          )}
        </DarkButton>
      </div>

      {/* add card sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add payment method" sub="Card details are mocked in this wireframe">
        <div className="space-y-3 pt-1">
          <input
            value={cardNo}
            onChange={(e) => setCardNo(e.target.value)}
            placeholder="Card number"
            inputMode="numeric"
            className="w-full rounded-2xl border border-border bg-canvas p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
          <div className="flex gap-3">
            <input
              value={cardExp}
              onChange={(e) => setCardExp(e.target.value)}
              placeholder="MM/YY"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-canvas p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
            <input
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value)}
              placeholder="CVC"
              inputMode="numeric"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-canvas p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <DarkButton onClick={addCard} disabled={!cardNo.trim()}>
            Save card
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${accent ? "font-medium text-coral" : "text-secondary"}`}>{label}</span>
      <span className={`text-[13px] font-medium ${accent ? "text-coral" : "text-navy"}`}>{value}</span>
    </div>
  );
}
