"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, X, Plus, Scissors, ShoppingBag, Percent, CreditCard,
  Banknote, Landmark, Gift, CheckCircle2, Mail, Star,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton } from "@/components/app/ui";
import { useAppStore, checkoutTotals, type PaymentEntry } from "@/lib/store/appStore";
import { services, products, traitChips } from "@/lib/data/product";

// Checkout — build the bill (services/products/discount/tip), take payment in
// one or many methods, then the paid screen and client rating.

const fmt = (n: number) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;

type MethodSheet = PaymentEntry["method"] | null;

export default function CheckoutPage() {
  const router = useRouter();
  const store = useAppStore();
  const totals = checkoutTotals(store);
  const [addSheet, setAddSheet] = useState<"service" | "product" | "discount" | null>(null);
  const [method, setMethod] = useState<MethodSheet>(null);
  const [cashAmount, setCashAmount] = useState(10);
  const [paidScreen, setPaidScreen] = useState(false);
  const [rate, setRate] = useState(false);
  const [stars, setStars] = useState(0);
  const [traits, setTraits] = useState<string[]>([]);

  const tipOptions = [
    { label: "No tip", pct: 0 },
    { label: "10%", pct: 10 },
    { label: "15%", pct: 15 },
    { label: "20%", pct: 20 },
  ];

  const finishPayment = (m: PaymentEntry["method"], amount: number) => {
    store.addPayment(m, amount);
    setMethod(null);
    const after = checkoutTotals({ ...store, payments: [...store.payments, { id: "x", method: m, amount }] });
    if (after.remaining <= 0) setPaidScreen(true);
  };

  if (paidScreen) {
    return (
      <div className="flex min-h-full flex-col bg-white">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#14181F] text-white"
          >
            <CheckCircle2 size={34} strokeWidth={1.6} />
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="pt-6 text-[32px] font-bold text-navy"
          >
            {fmt(totals.total)}
          </motion.p>
          <p className="pt-1 text-[14px] text-secondary">Sarah Johnson</p>
          <div className="mt-6 w-full overflow-hidden rounded-2xl bg-canvas">
            {store.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] last:border-0">
                <span className="text-secondary">{p.method}</span>
                <span className="font-semibold text-navy">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
          <p className="pt-3 text-[12px] text-muted">{store.items.length} item{store.items.length === 1 ? "" : "s"}</p>
          <button className="mt-5 flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-semibold text-navy">
            <Mail size={14} strokeWidth={1.75} />
            Email receipt
          </button>
        </div>
        <div className="shrink-0 px-6 pb-8">
          <DarkButton onClick={() => setRate(true)}>Rate the visit</DarkButton>
        </div>

        <Sheet
          open={rate}
          onClose={() => setRate(false)}
          title={
            <span className="flex w-full items-center justify-between">
              Rate your Client
            </span>
          }
          sub="Emily Davis"
        >
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => setStars(i)} aria-label={`${i} stars`}>
                <Star
                  size={36}
                  strokeWidth={1.2}
                  className={i <= stars ? "fill-navy text-navy" : "text-border"}
                />
              </motion.button>
            ))}
          </div>
          <p className="pb-3 text-[13px] text-muted">Anything to note?</p>
          <div className="flex flex-wrap gap-2 pb-4">
            {traitChips.map((t) => {
              const on = traits.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTraits((x) => (on ? x.filter((y) => y !== t) : [...x, t]))}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    on ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl bg-canvas p-4">
            <p className="pb-1 text-[12px] font-semibold text-navy">Add a private note</p>
            <textarea
              placeholder="Anything the team should know before their next visit..."
              className="h-16 w-full resize-none bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="pt-4">
            <DarkButton
              onClick={() => {
                store.resetCheckout();
                store.setApptStatus("done");
                router.push("/app");
              }}
            >
              Submit Rating
            </DarkButton>
            <button
              type="button"
              onClick={() => {
                store.resetCheckout();
                store.setApptStatus("done");
                router.push("/app");
              }}
              className="mt-3 w-full text-center text-[14px] font-semibold text-secondary"
            >
              Skip
            </button>
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-white pb-4">
      <div className="flex items-center gap-2 px-4 py-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold text-navy">Checkout</h1>
      </div>

      <div className="mx-4 flex items-center gap-3 rounded-2xl bg-canvas p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-bold text-secondary">
          SJ
        </span>
        <div>
          <p className="text-[15px] font-bold text-navy">Sarah Johnson</p>
          <p className="text-[12px] text-muted">
            {store.items.length} item{store.items.length === 1 ? "" : "s"} · {fmt(totals.subtotal)}
          </p>
        </div>
      </div>

      <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Items</p>
      <div className="flex flex-col gap-2 px-4">
        <AnimatePresence initial={false}>
          {store.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">
                {item.kind === "product" ? <ShoppingBag size={16} strokeWidth={1.6} /> : <Scissors size={16} strokeWidth={1.6} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-navy">{item.name}</span>
                <span className="block text-[12px] text-muted">{item.sub}</span>
              </span>
              <span className="text-[15px] font-bold text-navy">{fmt(item.price)}</span>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => store.removeItem(item.id)}
                className="p-1 text-muted"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2.5 px-4 pt-4">
        <GhostButton className="!h-11 flex-1 !text-[13px]" onClick={() => setAddSheet("service")}>
          <Plus size={15} />
          Service
        </GhostButton>
        <GhostButton className="!h-11 flex-1 !text-[13px]" onClick={() => setAddSheet("product")}>
          <Plus size={15} />
          Product
        </GhostButton>
      </div>

      <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Discount</p>
      <div className="px-4">
        <button
          type="button"
          onClick={() => setAddSheet("discount")}
          className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-navy">
            <Percent size={15} strokeWidth={1.75} />
          </span>
          <span className="flex-1 text-[14px] font-semibold text-navy">
            {totals.discount > 0 ? `Discount applied · −${fmt(totals.discount)}` : "Add discount"}
          </span>
          {totals.discount > 0 && (
            <span
              role="button"
              aria-label="Remove discount"
              onClick={(e) => {
                e.stopPropagation();
                store.setDiscount(0, 0);
              }}
              className="p-1 text-muted"
            >
              <X size={15} />
            </span>
          )}
        </button>
      </div>

      <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Tip</p>
      <div className="flex gap-2 px-4">
        {tipOptions.map((t) => {
          const active = store.tipPct === t.pct && store.tipCustom === 0;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => store.setTip(t.pct)}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold transition-colors ${
                active ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => store.setTip(0, 5)}
          className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
            store.tipCustom > 0 ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
          }`}
        >
          Custom
        </button>
      </div>

      <div className="mx-4 mt-5 overflow-hidden rounded-2xl bg-canvas">
        <div className="flex items-center justify-between px-4 py-3 text-[13px]">
          <span className="text-secondary">Subtotal</span>
          <span className="font-semibold text-navy">{fmt(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
            <span className="text-secondary">Discount</span>
            <span className="font-semibold text-navy">−{fmt(totals.discount)}</span>
          </div>
        )}
        {totals.tip > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
            <span className="text-secondary">Tip</span>
            <span className="font-semibold text-navy">{fmt(totals.tip)}</span>
          </div>
        )}
        {totals.paid > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
            <span className="text-secondary">Paid so far</span>
            <span className="font-semibold text-navy">−{fmt(totals.paid)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
          <span className="text-[14px] font-bold text-navy">Remaining</span>
          <span className="text-[18px] font-bold text-navy">{fmt(totals.remaining)}</span>
        </div>
      </div>

      {store.payments.length > 0 && (
        <>
          <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Payments</p>
          <div className="flex flex-col gap-2 px-4">
            {store.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-navy">{p.method}</span>
                <span className="flex items-center gap-2 text-[15px] font-bold text-navy">
                  {fmt(p.amount)}
                  <button aria-label="Remove payment" onClick={() => store.removePayment(p.id)} className="p-1 text-muted">
                    <X size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Take remaining {fmt(totals.remaining)} with
      </p>
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {(
          [
            { m: "Card", icon: <CreditCard size={16} strokeWidth={1.75} /> },
            { m: "Cash", icon: <Banknote size={16} strokeWidth={1.75} /> },
            { m: "Bank transfer", icon: <Landmark size={16} strokeWidth={1.75} /> },
            { m: "Gift card", icon: <Gift size={16} strokeWidth={1.75} /> },
          ] as { m: PaymentEntry["method"]; icon: React.ReactNode }[]
        ).map(({ m, icon }) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMethod(m)}
            disabled={totals.remaining <= 0}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-white text-[14px] font-semibold text-navy disabled:opacity-40"
          >
            {icon}
            {m}
          </motion.button>
        ))}
      </div>

      <div className="px-4 pt-5">
        <div className="flex h-12 items-center justify-center rounded-full bg-canvas text-[13px] font-medium text-secondary">
          {totals.remaining > 0 ? `${fmt(totals.remaining)} to pay — choose a payment method` : "All paid"}
        </div>
      </div>

      {/* Add service / product / discount sheets */}
      <Sheet open={addSheet === "service"} onClose={() => setAddSheet(null)} title="Add service">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => store.addItem({ kind: "service", name: s.name, sub: `${s.duration} · ${s.category}`, price: s.price })}
            className="flex w-full items-center justify-between border-b border-border py-4 text-left last:border-0"
          >
            <span>
              <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
              <span className="block text-[12px] text-muted">{s.duration} · {s.category}</span>
            </span>
            <span className="flex items-center gap-2 text-[15px] font-bold text-navy">
              £{s.price}
              <Plus size={16} className="text-secondary" />
            </span>
          </button>
        ))}
        <div className="pt-4">
          <DarkButton onClick={() => setAddSheet(null)}>Done</DarkButton>
        </div>
      </Sheet>

      <Sheet open={addSheet === "product"} onClose={() => setAddSheet(null)} title="Add Product">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => store.addItem({ kind: "product", name: p.name, sub: p.size, price: p.price })}
            className="flex w-full items-center justify-between border-b border-border py-4 text-left last:border-0"
          >
            <span>
              <span className="block text-[15px] font-semibold text-navy">{p.name}</span>
              <span className="block text-[12px] text-muted">{p.size}</span>
            </span>
            <span className="flex items-center gap-2 text-[15px] font-bold text-navy">
              £{p.price}
              <Plus size={16} className="text-secondary" />
            </span>
          </button>
        ))}
        <div className="pt-4">
          <DarkButton onClick={() => setAddSheet(null)}>Done</DarkButton>
        </div>
      </Sheet>

      <Sheet open={addSheet === "discount"} onClose={() => setAddSheet(null)} title="Add discount" sub={`Subtotal ${fmt(totals.subtotal)}`}>
        {[
          { label: "10% off", pct: 10, flat: 0 },
          { label: "20% off", pct: 20, flat: 0 },
          { label: "£5 off", pct: 0, flat: 5 },
          { label: "£10 off", pct: 0, flat: 10 },
        ].map((d) => (
          <button
            key={d.label}
            type="button"
            onClick={() => {
              store.setDiscount(d.pct, d.flat);
              setAddSheet(null);
            }}
            className="flex w-full items-center justify-between border-b border-border py-4 text-left last:border-0"
          >
            <span className="text-[15px] font-semibold text-navy">{d.label}</span>
            <span className="text-[14px] font-medium text-secondary">
              −{d.pct ? fmt((totals.subtotal * d.pct) / 100) : fmt(d.flat)}
            </span>
          </button>
        ))}
      </Sheet>

      {/* Payment method sheets */}
      <Sheet
        open={method === "Card" || method === "Bank transfer" || method === "Gift card"}
        onClose={() => setMethod(null)}
        title={method ?? ""}
        sub={`${fmt(totals.remaining)} remaining`}
      >
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount to charge</p>
        <div className="flex items-center rounded-2xl bg-canvas px-4 py-4">
          <span className="pr-1 text-[20px] font-bold text-muted">£</span>
          <span className="text-[24px] font-bold text-navy">{totals.remaining}</span>
        </div>
        <p className="pt-3 text-[13px] text-secondary">
          {method === "Card"
            ? "The card reader will prompt the client to tap or insert."
            : method === "Bank transfer"
              ? "Mark as received once the transfer lands."
              : "The balance will be deducted from their gift card."}
        </p>
        <div className="pt-5">
          <DarkButton onClick={() => method && finishPayment(method, totals.remaining)}>
            Charge {fmt(totals.remaining)}
          </DarkButton>
        </div>
      </Sheet>

      <Sheet open={method === "Cash"} onClose={() => setMethod(null)} title="Cash" sub={`${fmt(totals.remaining)} remaining`}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Cash received</p>
        <div className="flex items-center rounded-2xl bg-canvas px-4 py-4">
          <span className="pr-1 text-[20px] font-bold text-muted">£</span>
          <input
            value={cashAmount}
            onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))}
            inputMode="numeric"
            className="w-full bg-transparent text-[24px] font-bold text-navy focus:outline-none"
            aria-label="Cash received"
          />
        </div>
        <div className="flex gap-2 pt-3">
          {[
            { label: `Exact · ${fmt(totals.remaining)}`, v: totals.remaining },
            { label: "£10", v: 10 },
            { label: "£20", v: 20 },
            { label: "£50", v: 50 },
          ].map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCashAmount(c.v)}
              className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${
                cashAmount === c.v ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {cashAmount < totals.remaining && cashAmount > 0 && (
          <p className="mt-3 rounded-xl bg-canvas px-4 py-3 text-[12px] text-secondary">
            {fmt(totals.remaining - cashAmount)} will still be due — take the rest with another method.
          </p>
        )}
        <div className="pt-5">
          <DarkButton disabled={cashAmount <= 0} onClick={() => finishPayment("Cash", Math.min(cashAmount, totals.remaining))}>
            {cashAmount >= totals.remaining ? `Take ${fmt(totals.remaining)} cash` : `Add ${fmt(cashAmount)} · split payment`}
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
