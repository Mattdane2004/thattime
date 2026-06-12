"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, X, Plus, Minus, Scissors, ShoppingBag, Percent, CreditCard,
  Banknote, Landmark, Gift, CheckCircle2, Mail, Star, Smartphone, Check, Heart,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton } from "@/components/app/ui";
import { useAppStore, checkoutTotals, type PaymentEntry, type CheckoutItem } from "@/lib/store/appStore";
import { services, products, traitChips, upNextQueue } from "@/lib/data/product";

// Checkout — build the bill (services/products/discount/tip), take payment in
// one or many methods, then the paid screen and client rating. The tab bar is
// hidden on this route; the sticky back header is the way out.

const fmt = (n: number) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;

type MethodSheet = PaymentEntry["method"] | null;

/** Service row in the add-service sheet: services are multi-select, not quantities. */
function ServiceRow({
  name,
  sub,
  price,
  selected,
  onToggle,
}: {
  name: string;
  sub: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 border-b border-border py-3.5 text-left last:border-0"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{name}</span>
        <span className="block text-[12px] text-muted">{sub} · £{price}</span>
      </span>
      <motion.span
        animate={{ scale: selected ? 1 : 0.92 }}
        transition={{ type: "spring", stiffness: 480, damping: 28 }}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-transparent"
        }`}
      >
        <Check size={14} strokeWidth={2.5} />
      </motion.span>
    </button>
  );
}

/** Catalog row in the add-product sheet: + morphs into a − n + stepper. */
function CatalogRow({
  name,
  sub,
  price,
  qty,
  onAdd,
  onRemove,
}: {
  name: string;
  sub: string;
  price: number;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 border-b border-border py-3.5 last:border-0">
      <button type="button" onClick={onAdd} className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold text-navy">{name}</span>
        <span className="block text-[12px] text-muted">{sub} · £{price}</span>
      </button>
      <div className="flex h-9 shrink-0 items-center justify-end">
        <AnimatePresence mode="popLayout" initial={false}>
          {qty === 0 ? (
            <motion.button
              key="plus"
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 480, damping: 30 }}
              whileTap={{ scale: 0.88 }}
              onClick={onAdd}
              aria-label={`Add ${name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy"
            >
              <Plus size={15} strokeWidth={2} />
            </motion.button>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 480, damping: 30 }}
              className="flex h-9 items-center rounded-full bg-[#14181F] px-1 text-white"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.82 }}
                onClick={onRemove}
                aria-label={`Remove one ${name}`}
                className="flex h-7 w-7 items-center justify-center"
              >
                <Minus size={13} strokeWidth={2.25} />
              </motion.button>
              <span className="flex w-5 justify-center overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={qty}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 32 }}
                    className="block text-[13px] font-bold"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.82 }}
                onClick={onAdd}
                aria-label={`Add ${name}`}
                className="flex h-7 w-7 items-center justify-center"
              >
                <Plus size={13} strokeWidth={2.25} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const store = useAppStore();
  const totals = checkoutTotals(store);
  const appt = upNextQueue[store.apptIdx];
  const clientName = appt?.client ?? "Walk-in";
  const clientInitials = appt?.initials ?? "WI";
  const [addSheet, setAddSheet] = useState<"service" | "product" | "discount" | null>(null);
  const [method, setMethod] = useState<MethodSheet>(null);
  const [cashAmount, setCashAmount] = useState(10);
  const [paidScreen, setPaidScreen] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [rate, setRate] = useState(false);
  const [stars, setStars] = useState(0);
  const [traits, setTraits] = useState<string[]>([]);

  // Customer-facing tip sheet.
  const [tipSheet, setTipSheet] = useState(false);
  const [tipPick, setTipPick] = useState<number | null>(null); // preset pct
  const [tipCustomDraft, setTipCustomDraft] = useState(0);
  const tipBase = Math.max(0, totals.subtotal - totals.discount);
  const draftTip = tipCustomDraft > 0 ? tipCustomDraft : tipPick ? (tipBase * tipPick) / 100 : 0;

  const tipOptions = [
    { label: "No tip", pct: 0 },
    { label: "10%", pct: 10 },
    { label: "15%", pct: 15 },
  ];

  const qtyOf = (kind: CheckoutItem["kind"], name: string) =>
    store.items.find((i) => i.kind === kind && i.name === name)?.qty ?? 0;

  const finishPayment = (m: PaymentEntry["method"], amount: number) => {
    store.addPayment(m, amount);
    setMethod(null);
    const after = checkoutTotals({ ...store, payments: [...store.payments, { id: "x", method: m, amount }] });
    if (after.remaining <= 0) setPaidScreen(true);
  };

  const finishVisit = () => {
    store.advanceAppt();
    router.push("/app");
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
          <p className="pt-1 text-[14px] text-secondary">{clientName}</p>
          <div className="mt-6 w-full overflow-hidden rounded-2xl bg-canvas">
            {store.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] last:border-0">
                <span className="text-secondary">{p.method}</span>
                <span className="font-semibold text-navy">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
          <p className="pt-3 text-[12px] text-muted">{store.items.length} item{store.items.length === 1 ? "" : "s"}</p>
          <motion.button
            whileTap={!receiptSent ? { scale: 0.96 } : undefined}
            onClick={() => setReceiptSent(true)}
            className={`mt-5 flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-semibold ${
              receiptSent ? "bg-canvas text-secondary" : "text-navy"
            }`}
          >
            {receiptSent ? <Check size={14} strokeWidth={2.5} /> : <Mail size={14} strokeWidth={1.75} />}
            {receiptSent ? "Receipt sent" : "Email receipt"}
          </motion.button>
        </div>
        <div className="shrink-0 px-6 pb-8">
          <DarkButton onClick={() => setRate(true)}>Rate the visit</DarkButton>
          <button type="button" onClick={finishVisit} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">
            Done
          </button>
        </div>

        <Sheet open={rate} onClose={() => setRate(false)} title="Rate your Client" sub={clientName}>
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
            <DarkButton onClick={finishVisit}>Submit Rating</DarkButton>
            <button
              type="button"
              onClick={finishVisit}
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
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-white px-4 py-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold text-navy">Checkout</h1>
      </div>

      <div className="mx-4 flex items-center gap-3 rounded-2xl bg-canvas p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-bold text-secondary">
          {clientInitials}
        </span>
        <div>
          <p className="text-[15px] font-bold text-navy">{clientName}</p>
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
                <span className="block text-[12px] text-muted">
                  {item.sub}
                  {item.qty > 1 && ` · ${item.qty} × ${fmt(item.price)}`}
                </span>
              </span>
              <span className="text-[15px] font-bold text-navy">{fmt(item.price * item.qty)}</span>
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
          onClick={() => {
            setTipPick(null);
            setTipCustomDraft(0);
            setTipSheet(true);
          }}
          className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
            store.tipCustom > 0 ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
          }`}
        >
          {store.tipCustom > 0 ? fmt(store.tipCustom) : "Custom"}
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
      <Sheet open={addSheet === "service"} onClose={() => setAddSheet(null)} title="Add services" sub="Select everything done in this visit">
        {services.map((s) => {
          const selected = qtyOf("service", s.name) > 0;
          return (
            <ServiceRow
              key={s.id}
              name={s.name}
              sub={`${s.duration} · ${s.category}`}
              price={s.price}
              selected={selected}
              onToggle={() =>
                selected
                  ? store.decrementItem("service", s.name)
                  : store.addItem({ kind: "service", name: s.name, sub: `${s.duration} · ${s.category}`, price: s.price })
              }
            />
          );
        })}
        <div className="pt-4">
          <DarkButton onClick={() => setAddSheet(null)}>Done</DarkButton>
        </div>
      </Sheet>

      <Sheet open={addSheet === "product"} onClose={() => setAddSheet(null)} title="Add Product">
        {products.map((p) => (
          <CatalogRow
            key={p.id}
            name={p.name}
            sub={p.size}
            price={p.price}
            qty={qtyOf("product", p.name)}
            onAdd={() => store.addItem({ kind: "product", name: p.name, sub: p.size, price: p.price })}
            onRemove={() => store.decrementItem("product", p.name)}
          />
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

      {/* Customer-facing tip sheet — hand the phone over */}
      <Sheet open={tipSheet} onClose={() => setTipSheet(false)}>
        <div className="flex flex-col items-center pb-2 text-center">
          <span className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-1.5 text-[11px] font-semibold text-secondary">
            <Smartphone size={12} strokeWidth={2} />
            Hand the phone to your client
          </span>
          <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-navy">
            <Heart size={20} strokeWidth={1.6} />
          </span>
          <h2 className="pt-3 text-[22px] font-bold leading-tight text-navy">
            Would you like to
            <br />
            leave a tip?
          </h2>
          <p className="pt-1.5 text-[13px] text-secondary">
            100% goes to {appt?.staff ?? "your stylist"} · service {fmt(tipBase)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-4">
          {[10, 15, 20].map((pct) => {
            const active = tipPick === pct && tipCustomDraft === 0;
            return (
              <motion.button
                key={pct}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTipPick(pct);
                  setTipCustomDraft(0);
                }}
                className={`flex flex-col items-center rounded-2xl border py-4 transition-colors ${
                  active ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                }`}
              >
                <span className="text-[17px] font-bold">{pct}%</span>
                <span className={`pt-0.5 text-[12px] ${active ? "text-white/60" : "text-muted"}`}>
                  {fmt(Math.round((tipBase * pct) / 100))}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border px-4 py-3">
          <span className="text-[15px] font-bold text-muted">£</span>
          <input
            value={tipCustomDraft || ""}
            onChange={(e) => {
              setTipCustomDraft(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0));
              setTipPick(null);
            }}
            inputMode="numeric"
            placeholder="Other amount"
            aria-label="Custom tip amount"
            className="w-full bg-transparent text-[15px] font-semibold text-navy placeholder:font-normal placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="pt-5">
          <DarkButton
            disabled={draftTip <= 0}
            onClick={() => {
              store.setTip(0, Math.round(draftTip));
              setTipSheet(false);
            }}
          >
            {draftTip > 0 ? `Add ${fmt(Math.round(draftTip))} tip` : "Add tip"}
          </DarkButton>
          <button
            type="button"
            onClick={() => {
              store.setTip(0, 0);
              setTipSheet(false);
            }}
            className="mt-3 w-full text-center text-[14px] font-semibold text-secondary"
          >
            No tip today
          </button>
        </div>
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
