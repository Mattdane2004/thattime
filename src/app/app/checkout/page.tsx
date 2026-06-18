"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, X, Plus, Minus, Scissors, ShoppingBag, Percent, CreditCard,
  Banknote, Coins, Gift, CheckCircle2, Mail, Star, Smartphone, Check, Heart,
  Link2, Repeat, Users, Tag, Search, UserRound, UserPlus,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton, ListRow } from "@/components/ui";
import {
  useAppStore, checkoutTotals,
  type PaymentEntry, type CheckoutItem, type CheckoutItemKind, type FeeBearer, type CheckoutClient,
} from "@/lib/store/appStore";
import {
  services, products, memberships, classOffers, giftCardDenoms, serviceCategories, productCategories,
  clientRows, traitChips, upNextQueue, savedCards,
} from "@/lib/data/product";
import { discountCodes, entitlementBalances } from "@/lib/data/finalisation";

// Checkout — a hub-and-spoke till. The page is the hub: client, items, adjustments
// and payments all live here with empty states; each is edited through a bottom-sheet
// spoke. Payments are recorded as you take them; the sale is finalised only when the
// operator taps Complete (never auto-closed). The tab bar is hidden on this route.

const fmt = (n: number) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;
const initialsOf = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2);

type MethodSheet = PaymentEntry["method"] | null;

const ITEM_ICON: Record<CheckoutItemKind, React.ReactNode> = {
  appointment: <Scissors size={16} strokeWidth={1.6} />,
  service: <Scissors size={16} strokeWidth={1.6} />,
  product: <ShoppingBag size={16} strokeWidth={1.6} />,
  membership: <Repeat size={16} strokeWidth={1.6} />,
  giftcard: <Gift size={16} strokeWidth={1.6} />,
  class: <Users size={16} strokeWidth={1.6} />,
  other: <Coins size={16} strokeWidth={1.6} />,
};

const ADD_TYPES: { type: CheckoutItemKind; label: string }[] = [
  { type: "service", label: "Services" },
  { type: "product", label: "Products" },
  { type: "membership", label: "Memberships" },
  { type: "giftcard", label: "Gift cards" },
  { type: "class", label: "Classes" },
  { type: "other", label: "Other" },
];

const FEE_OPTIONS: { v: FeeBearer; label: string; sub: string }[] = [
  { v: "client", label: "Client pays", sub: "Added to bill" },
  { v: "split", label: "Split 50/50", sub: "Shared" },
  { v: "absorb", label: "You absorb", sub: "From payout" },
];

/** Catalog row used in the add sheet (all item types): + morphs into a − n + stepper. */
function CatalogRow({ name, sub, price, qty, onAdd, onRemove }: {
  name: string; sub: string; price: number; qty: number; onAdd: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 border-b border-border py-3.5 last:border-0">
      <button type="button" onClick={onAdd} className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold text-navy">{name}</span>
        <span className="block text-[12px] text-muted">{sub} · £{price}</span>
      </button>
      <Stepper qty={qty} onAdd={onAdd} onRemove={onRemove} name={name} />
    </div>
  );
}

/** Compact − n + control (qty 0 shows a single +). */
function Stepper({ qty, onAdd, onRemove, name }: { qty: number; onAdd: () => void; onRemove: () => void; name: string }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-end">
      <AnimatePresence mode="popLayout" initial={false}>
        {qty === 0 ? (
          <motion.button key="plus" type="button" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 480, damping: 30 }} whileTap={{ scale: 0.88 }} onClick={onAdd} aria-label={`Add ${name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy">
            <Plus size={15} strokeWidth={2} />
          </motion.button>
        ) : (
          <motion.div key="stepper" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 480, damping: 30 }} className="flex h-9 items-center rounded-full bg-fg-primary px-1 text-white">
            <motion.button type="button" whileTap={{ scale: 0.82 }} onClick={onRemove} aria-label={`Remove one ${name}`} className="flex h-7 w-7 items-center justify-center">
              <Minus size={13} strokeWidth={2.25} />
            </motion.button>
            <span className="flex w-5 justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={qty} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 32 }} className="block text-[13px] font-bold">
                  {qty}
                </motion.span>
              </AnimatePresence>
            </span>
            <motion.button type="button" whileTap={{ scale: 0.82 }} onClick={onAdd} aria-label={`Add ${name}`} className="flex h-7 w-7 items-center justify-center">
              <Plus size={13} strokeWidth={2.25} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Select row (no quantity) — used for services, which are added once. */
function PickRow({ name, sub, price, selected, onToggle }: {
  name: string; sub: string; price: number; selected: boolean; onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 border-b border-border py-3.5 text-left last:border-0">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{name}</span>
        <span className="block text-[12px] text-muted">{sub} · £{price}</span>
      </span>
      <motion.span animate={{ scale: selected ? 1 : 0.92 }} transition={{ type: "spring", stiffness: 480, damping: 28 }}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-transparent"}`}>
        <Check size={14} strokeWidth={2.5} />
      </motion.span>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const store = useAppStore();
  const totals = checkoutTotals(store);
  const appt = upNextQueue[store.apptIdx];
  const cc = store.checkoutClient;
  const isAppt = store.entryContext === "appointment";
  const clientName = cc?.name ?? (isAppt ? appt?.client : undefined);
  const clientInitials = cc?.initials ?? (isAppt ? appt?.initials : undefined);
  const noClient = !clientName;
  const displayName = clientName ?? "Walk-in";
  const owed = cc?.outstanding ?? 0;
  const staffName = appt?.staff ?? "your stylist";
  const anonymous = noClient || displayName === "Walk-in" || displayName === "New client";
  const sellingGiftCard = store.items.some((i) => i.kind === "giftcard");
  const selectedCode = discountCodes.find((c) => c.id === store.discountCodeId);
  const saleNames = store.items.map((i) => i.name);
  const eligibleEntitlements = entitlementBalances.filter(
    (e) => e.client === displayName && e.remaining > 0 && e.appliesTo.some((name) => saleNames.includes(name)),
  );
  const appliedEntitlement = eligibleEntitlements.find((e) => e.name === store.entitlementLabel);

  // Spokes.
  const [clientSheet, setClientSheet] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [showAllOwed, setShowAllOwed] = useState(false);
  const [addSheet, setAddSheet] = useState(false);
  const [addType, setAddType] = useState<CheckoutItemKind>("service");
  const [addQuery, setAddQuery] = useState("");
  const [addCat, setAddCat] = useState("All");
  const [gcValue, setGcValue] = useState(25);
  const [otherName, setOtherName] = useState("");
  const [otherPrice, setOtherPrice] = useState("");

  // Edit-item spoke — quantity (non-services) + price override.
  const [editId, setEditId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState("");
  const editItem = store.items.find((i) => i.id === editId) ?? null;
  const openEdit = (item: CheckoutItem) => { setEditId(item.id); setEditQty(item.qty); setEditPrice(String(item.price)); };

  const [discountSheet, setDiscountSheet] = useState(false);
  const [discMode, setDiscMode] = useState<"pct" | "amount">("pct");
  const [discDraft, setDiscDraft] = useState("");
  const [feeOpen, setFeeOpen] = useState(false);

  const [tipSheet, setTipSheet] = useState(false);
  const [tipPick, setTipPick] = useState<number | null>(null);
  const [tipCustomDraft, setTipCustomDraft] = useState(0);
  const tipBase = Math.max(0, totals.subtotal - totals.discount);
  const draftTip = tipCustomDraft > 0 ? tipCustomDraft : tipPick ? (tipBase * tipPick) / 100 : 0;

  const [method, setMethod] = useState<MethodSheet>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [otherAmount, setOtherAmount] = useState(0);
  const [linkAmount, setLinkAmount] = useState(0);
  const [linkSent, setLinkSent] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const giftValid = giftCode.replace(/[^A-Z0-9]/g, "").length >= 6;

  const [paidScreen, setPaidScreen] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [rate, setRate] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const [stars, setStars] = useState(0);
  const [traits, setTraits] = useState<string[]>([]);

  const qtyOf = (kind: CheckoutItem["kind"], name: string) =>
    store.items.find((i) => i.kind === kind && i.name === name)?.qty ?? 0;

  // Assign / change the payer; seed (or clear) their outstanding balance line.
  const assignClient = (c: CheckoutClient) => {
    store.setCheckoutClient(c);
    store.setEntitlementCredit(null, 0);
    const existing = store.items.find((i) => i.name === "Outstanding balance");
    if (existing) store.removeItem(existing.id);
    if (c.outstanding && c.outstanding > 0) {
      store.addItem({ kind: "other", name: "Outstanding balance", sub: "Carried over from a previous visit", price: c.outstanding });
    }
    setClientSheet(false);
    setClientQuery("");
    setShowAllOwed(false);
  };

  // Record a payment — does NOT auto-finish; the operator taps Complete when ready.
  const takePayment = (m: PaymentEntry["method"], amount: number) => {
    if (amount > 0) store.addPayment(m, amount);
    setMethod(null);
    setAddingCard(false);
  };

  const openMethod = (m: PaymentEntry["method"]) => {
    if (m === "Cash") setCashAmount(totals.remaining);
    if (m === "Other") setOtherAmount(totals.remaining);
    if (m === "Payment link") { setLinkAmount(totals.remaining); setLinkSent(false); }
    if (m === "Card on file") setAddingCard(savedCards.length === 0);
    if (m === "Gift card") { setGiftCode(""); setGiftAmount(Math.min(totals.remaining, 50)); }
    setMethod(m);
  };

  const finishVisit = () => {
    if (isAppt) store.advanceAppt();
    else store.resetCheckout();
    router.push("/app");
  };

  const applyEntitlement = (name: string | null, amount: number) => {
    store.setEntitlementCredit(name, amount);
  };

  // Filtered add-sheet catalogues.
  const addServices = services.filter((s) => (addCat === "All" || s.category === addCat) && s.name.toLowerCase().includes(addQuery.toLowerCase()));
  const addProducts = products.filter((p) => (addCat === "All" || p.category === addCat) && p.name.toLowerCase().includes(addQuery.toLowerCase()));
  const addMemberships = memberships.filter((m) => m.name.toLowerCase().includes(addQuery.toLowerCase()));
  const addClasses = classOffers.filter((c) => c.name.toLowerCase().includes(addQuery.toLowerCase()));

  // Client picker lists.
  const clientMatches = clientRows.filter((c) => c.name.toLowerCase().includes(clientQuery.toLowerCase()));
  const owedClients = clientMatches.filter((c) => (c.outstanding ?? 0) > 0).sort((a, b) => (b.outstanding ?? 0) - (a.outstanding ?? 0));
  const owedVisible = showAllOwed ? owedClients : owedClients.slice(0, 4);
  const settledClients = clientMatches.filter((c) => (c.outstanding ?? 0) === 0);

  // ── Done / paid screen ──────────────────────────────────────────────
  if (paidScreen) {
    return (
      <div className="flex min-h-full flex-col bg-white">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 16 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-fg-primary text-white">
            <CheckCircle2 size={34} strokeWidth={1.6} />
          </motion.span>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pt-6 text-[32px] font-bold text-navy">
            {fmt(totals.total)}
          </motion.p>
          <p className="pt-1 text-[14px] text-secondary">{displayName}</p>
          <div className="mt-6 w-full overflow-hidden rounded-2xl bg-canvas">
            {store.entitlementCredit > 0 && store.entitlementLabel && (
              <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] last:border-0">
                <span className="text-secondary">{store.entitlementLabel}</span>
                <span className="font-semibold text-navy">−{fmt(store.entitlementCredit)}</span>
              </div>
            )}
            {totals.prepaid > 0 && (
              <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] last:border-0">
                <span className="text-secondary">Deposit (at booking)</span>
                <span className="font-semibold text-navy">{fmt(totals.prepaid)}</span>
              </div>
            )}
            {store.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] last:border-0">
                <span className="text-secondary">{p.method}</span>
                <span className="font-semibold text-navy">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
          {totals.overpay > 0 && (
            <p className="mt-3 rounded-xl bg-warning/10 px-4 py-2.5 text-[12px] font-medium text-warning">{fmt(totals.overpay)} change / credit due</p>
          )}
          {totals.remaining > 0 && (
            <p className="mt-3 rounded-xl bg-warning/10 px-4 py-2.5 text-[12px] font-medium text-warning">{fmt(totals.remaining)} left to collect — added to {displayName.split(" ")[0]}&rsquo;s balance</p>
          )}
          <p className="pt-3 text-[12px] text-muted">{store.items.length} item{store.items.length === 1 ? "" : "s"}</p>
          <motion.button whileTap={!receiptSent ? { scale: 0.96 } : undefined} onClick={() => setReceiptSent(true)}
            className={`mt-5 flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-semibold ${receiptSent ? "bg-canvas text-secondary" : "text-navy"}`}>
            {receiptSent ? <Check size={14} strokeWidth={2.5} /> : <Mail size={14} strokeWidth={1.75} />}
            {receiptSent ? "Receipt sent" : "Email receipt"}
          </motion.button>
        </div>
        <div className="shrink-0 px-6 pb-8">
          {appliedEntitlement && (
            <button
              type="button"
              onClick={() => useAppStore.getState().setQuickAction("appointment")}
              className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-[14px] font-semibold text-navy"
            >
              <Repeat size={15} strokeWidth={1.9} />
              Book next session · {appliedEntitlement.remaining - 1} left
            </button>
          )}
          {isAppt ? (
            <>
              <DarkButton onClick={() => setRate(true)}>Rate the visit</DarkButton>
              <button type="button" onClick={finishVisit} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">Done</button>
            </>
          ) : (
            <DarkButton onClick={finishVisit}>Done</DarkButton>
          )}
        </div>

        <Sheet open={rate} onClose={() => setRate(false)} title="Rate your Client" sub={displayName}>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => setStars(i)} aria-label={`${i} stars`}>
                <Star size={36} strokeWidth={1.2} className={i <= stars ? "fill-navy text-navy" : "text-border"} />
              </motion.button>
            ))}
          </div>
          <p className="pb-3 text-[13px] text-muted">Anything to note?</p>
          <div className="flex flex-wrap gap-2 pb-4">
            {traitChips.map((t) => {
              const on = traits.includes(t);
              return (
                <button key={t} type="button" onClick={() => setTraits((x) => (on ? x.filter((y) => y !== t) : [...x, t]))}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>
                  {t}
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl bg-canvas p-4">
            <p className="pb-1 text-[12px] font-semibold text-navy">Add a private note</p>
            <textarea placeholder="Anything the team should know before their next visit..." className="h-16 w-full resize-none bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none" />
          </div>
          <div className="pt-4">
            <DarkButton onClick={() => { setRate(false); setFollowUp(true); }}>Submit Rating</DarkButton>
            <button type="button" onClick={finishVisit} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">Skip</button>
          </div>
        </Sheet>

        <Sheet open={followUp} onClose={finishVisit} title="Send a follow-up?" sub={`${displayName} just left`}>
          <div className="rounded-2xl bg-canvas p-4">
            <p className="text-[11px] font-semibold text-muted">PREVIEW</p>
            <p className="pt-2 text-[14px] leading-relaxed text-navy">Thanks for coming in today, {displayName.split(" ")[0]}! Hope you love it. If you have a minute, we&rsquo;d really appreciate a quick review ⭐</p>
          </div>
          <div className="pt-5">
            <DarkButton onClick={finishVisit}><Mail size={15} /> Send &amp; finish</DarkButton>
            <button type="button" onClick={finishVisit} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">Not this time</button>
          </div>
        </Sheet>
      </div>
    );
  }

  const completeLabel = totals.remaining > 0
    ? `Complete · ${fmt(totals.remaining)} owing`
    : totals.overpay > 0
      ? `Refund · ${fmt(totals.overpay)}`
      : "Complete sale";

  // ── Hub ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-white px-4 py-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold text-navy">Checkout</h1>
      </div>

      <div className="flex-1 pb-4">
        {/* Client — tap to assign or change */}
        <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Client</p>
        {noClient ? (
          <button type="button" onClick={() => setClientSheet(true)} className="mx-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-dashed border-border bg-white p-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-secondary"><UserPlus size={18} strokeWidth={1.7} /></span>
            <span className="flex-1 text-[15px] font-semibold text-navy">Add a client</span>
            <span className="text-[13px] text-muted">Walk-in by default</span>
          </button>
        ) : (
          <button type="button" onClick={() => setClientSheet(true)} className="mx-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-canvas p-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-bold text-secondary">{clientInitials ?? "WI"}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-navy">{displayName}</span>
              <span className="block text-[12px] text-muted">{owed > 0 ? `Owes £${owed}` : totals.prepaid > 0 ? `Deposit £${totals.prepaid} on file` : "Tap to change"}</span>
            </span>
            {totals.prepaid > 0 && <span className="flex items-center gap-1 rounded-full bg-fg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-navy"><Tag size={11} strokeWidth={2} /> Deposit</span>}
            <ChevronRight size={16} className="text-muted" />
          </button>
        )}

        {eligibleEntitlements.length > 0 && (
          <div className="mx-4 mt-3 rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-[13px] font-bold text-navy">Package/subscription credit available</span>
                <span className="block pt-0.5 text-[12px] text-muted">
                  Auto-suggested from {displayName}&rsquo;s remaining sessions.
                </span>
              </span>
              {store.entitlementCredit > 0 && <span className="rounded-full bg-fg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-navy">Applied</span>}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {eligibleEntitlements.map((e) => {
                const on = store.entitlementLabel === e.name;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => applyEntitlement(on ? null : e.name, on ? 0 : e.value)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left ${
                      on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-canvas text-navy"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{e.name}</span>
                      <span className={`block truncate pt-0.5 text-[11px] ${on ? "text-white/70" : "text-muted"}`}>
                        {e.kind === "subscription" ? "Subscription" : "Package"} · {e.used}/{e.purchased} used · {e.remaining} remaining
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold">−{fmt(e.value)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Items — empty state + inline qty editing */}
        <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Items</p>
        {store.items.length === 0 ? (
          <button type="button" onClick={() => setAddSheet(true)} className="mx-4 flex w-[calc(100%-2rem)] flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-white px-4 py-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-secondary"><Plus size={20} strokeWidth={1.7} /></span>
            <span className="pt-1 text-[14px] font-semibold text-navy">Add a service or product</span>
            <span className="text-[12px] text-muted">Services, retail, memberships, gift cards…</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2 px-4">
            <AnimatePresence initial={false}>
              {store.items.map((item) => {
                const editable = item.kind !== "appointment" && item.name !== "Outstanding balance";
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">{ITEM_ICON[item.kind]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-navy">{item.name}</span>
                      <span className="block text-[12px] text-muted">
                        {item.sub}{item.qty > 1 ? ` · ${item.qty} × ${fmt(item.price)}` : ""}{editable ? " · Edit" : ""}
                      </span>
                    </span>
                  </>
                );
                return (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} className="flex items-center gap-3">
                    {editable ? (
                      <button type="button" onClick={() => openEdit(item)} className="flex min-w-0 flex-1 items-center gap-3 text-left">{inner}</button>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>
                    )}
                    <span className="text-[15px] font-bold text-navy">{fmt(item.price * item.qty)}</span>
                    <button type="button" aria-label={`Remove ${item.name}`} onClick={() => store.removeItem(item.id)} className="p-1 text-muted"><X size={15} strokeWidth={2} /></button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        <div className="px-4 pt-3">
          <GhostButton className="!h-11 !text-[13px]" onClick={() => setAddSheet(true)}><Plus size={15} /> Add item</GhostButton>
        </div>

        {/* Adjustments */}
        <div className="mx-4 mt-5 overflow-hidden rounded-2xl border border-border">
          <button type="button" onClick={() => setDiscountSheet(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <Percent size={15} strokeWidth={1.75} className="shrink-0 text-secondary" />
            <span className="flex-1 text-[14px] font-medium text-navy">Discount</span>
            <span className="text-right">
              <span className="block text-[13px] font-semibold text-navy">{totals.discount > 0 ? `−${fmt(totals.discount)}` : "Add"}</span>
              {selectedCode && <span className="block text-[11px] text-muted">{selectedCode.code}</span>}
            </span>
            <ChevronRight size={15} className="shrink-0 text-muted" />
          </button>
          <button type="button" onClick={() => { setTipPick(null); setTipCustomDraft(0); setTipSheet(true); }} className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left">
            <Heart size={15} strokeWidth={1.75} className="shrink-0 text-secondary" />
            <span className="flex-1 text-[14px] font-medium text-navy">Tip</span>
            <span className="text-[13px] font-semibold text-navy">{totals.tip > 0 ? fmt(totals.tip) : "Add"}</span>
            <ChevronRight size={15} className="shrink-0 text-muted" />
          </button>
          <button type="button" onClick={() => setFeeOpen((v) => !v)} className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left">
            <Coins size={15} strokeWidth={1.75} className="shrink-0 text-secondary" />
            <span className="flex-1 whitespace-nowrap text-[14px] font-medium text-navy">Platform fee</span>
            <span className="text-right">
              <span className="block text-[13px] font-semibold text-navy">{FEE_OPTIONS.find((o) => o.v === store.feeBearer)?.label}</span>
              <span className="block text-[11px] text-muted">{store.feeBearer === "absorb" ? `−${fmt(totals.fee)} payout` : `+${fmt(totals.clientFee)}`}</span>
            </span>
            <motion.span animate={{ rotate: feeOpen ? 90 : 0 }} className="flex shrink-0 text-muted"><ChevronRight size={15} /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {feeOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
                <div className="grid grid-cols-3 gap-2 p-3">
                  {FEE_OPTIONS.map((o) => {
                    const on = store.feeBearer === o.v;
                    return (
                      <button key={o.v} type="button" onClick={() => store.setFeeBearer(o.v)}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2.5 text-center transition-colors ${on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>
                        <span className="text-[12px] font-bold leading-tight">{o.label}</span>
                        <span className={`text-[10px] leading-tight ${on ? "text-white/70" : "text-muted"}`}>{o.sub}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="px-4 pb-3 text-[12px] text-muted">You receive <span className="font-semibold text-navy">{fmt(totals.youReceive)}</span>{totals.vendorFee > 0 ? ` after the ${fmt(totals.vendorFee)} fee` : " — fee passed to the client"}.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Totals */}
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-canvas">
          <div className="flex items-center justify-between px-4 py-3 text-[13px]"><span className="text-secondary">Subtotal</span><span className="font-semibold text-navy">{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">Discount</span><span className="font-semibold text-navy">−{fmt(totals.discount)}</span></div>}
          {totals.entitlementCredit > 0 && store.entitlementLabel && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">{store.entitlementLabel}</span><span className="font-semibold text-navy">−{fmt(totals.entitlementCredit)}</span></div>}
          {totals.tip > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">Tip</span><span className="font-semibold text-navy">{fmt(totals.tip)}</span></div>}
          {totals.clientFee > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">Platform fee</span><span className="font-semibold text-navy">{fmt(totals.clientFee)}</span></div>}
          {totals.prepaid > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">Deposit paid at booking</span><span className="font-semibold text-navy">−{fmt(totals.prepaid)}</span></div>}
          {totals.paid > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]"><span className="text-secondary">Paid so far</span><span className="font-semibold text-navy">−{fmt(totals.paid)}</span></div>}
          <div className="flex items-center justify-between border-t border-border px-4 py-3.5"><span className="text-[14px] font-bold text-navy">Remaining</span><span className="text-[18px] font-bold text-navy">{fmt(totals.remaining)}</span></div>
        </div>
        {totals.overpay > 0 && <p className="mx-4 mt-2 rounded-xl bg-warning/10 px-4 py-2.5 text-[12px] font-medium text-warning">Deposit exceeds the bill — {fmt(totals.overpay)} to refund or credit.</p>}

        {/* Payments taken */}
        {store.payments.length > 0 && (
          <>
            <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Payments taken</p>
            <div className="flex flex-col gap-2 px-4">
              {store.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-navy">{p.method}</span>
                  <span className="flex items-center gap-2 text-[15px] font-bold text-navy">{fmt(p.amount)}
                    <button aria-label="Remove payment" onClick={() => store.removePayment(p.id)} className="p-1 text-muted"><X size={14} /></button>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Take payment — methods open an amount sheet; nothing auto-completes */}
        {totals.remaining > 0 && (
          <>
            <p className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Take payment</p>
            <div className="flex flex-col gap-2 px-4">
              {([
                { m: "Cash", icon: <Banknote size={17} strokeWidth={1.7} /> },
                { m: "Card machine", icon: <Smartphone size={17} strokeWidth={1.7} /> },
                { m: "Card on file", icon: <CreditCard size={17} strokeWidth={1.7} />, disabled: anonymous, reason: "No saved card for a walk-in" },
                { m: "Payment link", icon: <Link2 size={17} strokeWidth={1.7} />, disabled: anonymous, reason: "No contact on file" },
              ] as { m: PaymentEntry["method"]; icon: React.ReactNode; disabled?: boolean; reason?: string }[]).map(({ m, icon, disabled, reason }) => (
                <button key={m} type="button" disabled={disabled} onClick={() => openMethod(m)} className="rounded-2xl border border-border bg-white text-left disabled:opacity-45">
                  <ListRow leading={<span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">{icon}</span>} title={m} subtitle={disabled ? reason : undefined} chevron={!disabled} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setMoreOpen((v) => !v)} className="mx-4 mt-2 flex items-center justify-between rounded-2xl bg-canvas px-4 py-3.5 text-left">
              <span className="text-[14px] font-semibold text-navy">More ways to pay</span>
              <motion.span animate={{ rotate: moreOpen ? 90 : 0 }} className="flex text-muted"><ChevronRight size={16} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {moreOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-col gap-2 px-4 pt-2">
                    <button type="button" disabled={sellingGiftCard} onClick={() => openMethod("Gift card")} className="rounded-2xl border border-border bg-white text-left disabled:opacity-45">
                      <ListRow leading={<span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"><Gift size={17} strokeWidth={1.7} /></span>} title="Gift card" subtitle={sellingGiftCard ? "Can't pay for a gift card with a gift card" : undefined} chevron={!sellingGiftCard} />
                    </button>
                    <button type="button" onClick={() => openMethod("Other")} className="rounded-2xl border border-border bg-white text-left">
                      <ListRow leading={<span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"><Coins size={17} strokeWidth={1.7} /></span>} title="Other" subtitle="Bank transfer, voucher, app" chevron />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Sticky finalise — only the operator completes the sale */}
      <div className="sticky bottom-0 border-t border-border bg-white px-4 pb-6 pt-3">
        <DarkButton disabled={store.items.length === 0 && totals.overpay === 0} onClick={() => setPaidScreen(true)}>
          {completeLabel}
        </DarkButton>
      </div>

      {/* ── Spokes ──────────────────────────────────────────────────── */}

      {/* Client picker */}
      <Sheet open={clientSheet} onClose={() => setClientSheet(false)} title="Who's paying?" full>
        <div className="relative pt-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Search clients..." className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none" />
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          <button type="button" onClick={() => assignClient({ name: "New client", initials: "NC" })} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-primary text-white"><Plus size={18} strokeWidth={2} /></span>
            <span className="text-[15px] font-semibold text-navy">New client</span>
          </button>
          <button type="button" onClick={() => assignClient({ name: "Walk-in", initials: "WI" })} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-secondary"><UserRound size={17} strokeWidth={1.6} /></span>
            <span className="text-[15px] font-semibold text-navy">Walk-in</span>
          </button>
        </div>
        {owedClients.length > 0 && (
          <>
            <p className="px-1 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Owes a balance</p>
            <div className="flex flex-col gap-2.5">
              {owedVisible.map((c) => (
                <button key={c.id} type="button" onClick={() => assignClient({ name: c.name, initials: initialsOf(c.name), outstanding: c.outstanding })} className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/[0.06] p-3.5 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-[12px] font-semibold text-warning">{initialsOf(c.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-navy">{c.name}</span>
                    <span className="block text-[12px] font-semibold text-warning">Owes £{c.outstanding}</span>
                  </span>
                  <ChevronRight size={15} className="text-muted" />
                </button>
              ))}
              {owedClients.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllOwed((v) => !v)}
                  className="h-10 rounded-full border border-border text-[13px] font-semibold text-navy"
                >
                  {showAllOwed ? "Show fewer" : `Show all ${owedClients.length}`}
                </button>
              )}
            </div>
          </>
        )}
        {settledClients.length > 0 && (
          <>
            <p className="px-1 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">All clients</p>
            <div className="flex flex-col">
              {settledClients.map((c) => (
                <button key={c.id} type="button" onClick={() => assignClient({ name: c.name, initials: initialsOf(c.name), outstanding: c.outstanding })} className="flex items-center gap-3 border-b border-border py-3 text-left last:border-b-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-secondary">{initialsOf(c.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-navy">{c.name}</span>
                    <span className="block text-[12px] text-muted">{c.meta}</span>
                  </span>
                  <ChevronRight size={15} className="text-muted" />
                </button>
              ))}
            </div>
          </>
        )}
      </Sheet>

      {/* Add item — searchable, group-filtered catalogue per type */}
      <Sheet open={addSheet} onClose={() => setAddSheet(false)} title="Add to sale" full>
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
          {ADD_TYPES.map((t) => (
            <button key={t.type} type="button" onClick={() => { setAddType(t.type); setAddQuery(""); setAddCat("All"); }}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${addType === t.type ? "bg-fg-primary text-white" : "bg-canvas text-secondary"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {(addType === "service" || addType === "product" || addType === "membership" || addType === "class") && (
          <div className="relative pb-2">
            <Search size={15} strokeWidth={1.75} className="absolute left-4 top-[18px] -translate-y-1/2 text-muted" />
            <input value={addQuery} onChange={(e) => setAddQuery(e.target.value)} placeholder={`Search ${ADD_TYPES.find((t) => t.type === addType)?.label.toLowerCase()}...`} className="h-11 w-full rounded-xl bg-canvas pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
          </div>
        )}

        {(addType === "service" || addType === "product") && (
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
            {(addType === "service" ? serviceCategories : productCategories).map((c) => (
              <button key={c} type="button" onClick={() => setAddCat(c)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${addCat === c ? "bg-navy text-white" : "border border-border bg-white text-navy"}`}>{c}</button>
            ))}
          </div>
        )}

        {addType === "service" && (
          <>
            {addServices.map((s) => {
              const on = qtyOf("service", s.name) > 0;
              return (
                <PickRow key={s.id} name={s.name} sub={`${s.duration} · ${s.category}`} price={s.price} selected={on}
                  onToggle={() => on ? store.decrementItem("service", s.name) : store.addItem({ kind: "service", name: s.name, sub: `${s.duration} · ${s.category}`, price: s.price })} />
              );
            })}
            {addServices.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No services match.</p>}
          </>
        )}
        {addType === "product" && (
          <>
            {addProducts.map((p) => (
              <CatalogRow key={p.id} name={p.name} sub={`${p.size} · ${p.category}`} price={p.price} qty={qtyOf("product", p.name)}
                onAdd={() => store.addItem({ kind: "product", name: p.name, sub: p.size, price: p.price })} onRemove={() => store.decrementItem("product", p.name)} />
            ))}
            {addProducts.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No products match.</p>}
          </>
        )}
        {addType === "membership" && (
          addMemberships.length ? addMemberships.map((m) => (
            <CatalogRow key={m.id} name={m.name} sub={m.sub} price={m.price} qty={qtyOf("membership", m.name)}
              onAdd={() => store.addItem({ kind: "membership", name: m.name, sub: m.sub, price: m.price })} onRemove={() => store.decrementItem("membership", m.name)} />
          )) : <p className="py-6 text-center text-[13px] text-muted">No memberships published yet.</p>
        )}
        {addType === "class" && (
          addClasses.length ? addClasses.map((c) => (
            <CatalogRow key={c.id} name={c.name} sub={c.sub} price={c.price} qty={qtyOf("class", c.name)}
              onAdd={() => store.addItem({ kind: "class", name: c.name, sub: c.sub, price: c.price })} onRemove={() => store.decrementItem("class", c.name)} />
          )) : <p className="py-6 text-center text-[13px] text-muted">No classes published yet.</p>
        )}
        {addType === "giftcard" && (
          <div className="pt-1">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Gift card value</p>
            <div className="flex gap-2.5">
              {giftCardDenoms.map((v) => (
                <button key={v} type="button" onClick={() => setGcValue(v)} className={`flex-1 rounded-2xl border py-4 text-[16px] font-bold transition-colors ${gcValue === v ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>£{v}</button>
              ))}
            </div>
            <div className="pt-4">
              <DarkButton onClick={() => store.addItem({ kind: "giftcard", name: `Gift card · £${gcValue}`, sub: "Digital gift card", price: gcValue })}><Plus size={15} /> Add £{gcValue} gift card</DarkButton>
            </div>
            <p className="pt-3 text-[12px] text-muted">A sold gift card can&rsquo;t be paid for with another gift card.</p>
          </div>
        )}
        {addType === "other" && (
          <div className="pt-1">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">What&rsquo;s it for?</p>
            <input value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="e.g. No-show fee, deposit, custom" className="mb-2.5 h-12 w-full rounded-2xl border border-border bg-white px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
            <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount</p>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4">
              <span className="text-[18px] font-bold text-navy">£</span>
              <input value={otherPrice} onChange={(e) => setOtherPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0.00" className="h-14 w-full bg-transparent text-[18px] font-bold text-navy placeholder:text-muted focus:outline-none" aria-label="Custom amount" />
            </div>
            <div className="pt-4">
              <DarkButton disabled={!(parseFloat(otherPrice) > 0) || !otherName.trim()} onClick={() => { store.addItem({ kind: "other", name: otherName.trim(), sub: "Custom charge", price: Math.round((parseFloat(otherPrice) || 0) * 100) / 100 }); setOtherName(""); setOtherPrice(""); }}><Plus size={15} /> Add to bill</DarkButton>
            </div>
          </div>
        )}

        <div className="pt-6">
          <DarkButton onClick={() => setAddSheet(false)}>{store.items.length ? `Done · ${store.items.length} item${store.items.length > 1 ? "s" : ""}` : "Done"}</DarkButton>
        </div>
      </Sheet>

      {/* Edit item — quantity (non-services) + price override */}
      <Sheet open={!!editId && !!editItem} onClose={() => setEditId(null)} title={editItem?.name ?? "Edit item"} sub={editItem?.sub}>
        {editItem && (() => {
          const isService = editItem.kind === "service";
          const qty = isService ? 1 : editQty;
          const validPrice = editPrice !== "" && !Number.isNaN(parseFloat(editPrice));
          const lineTotal = (parseFloat(editPrice) || 0) * qty;
          return (
            <>
              {!isService && (
                <>
                  <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Quantity</p>
                  <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <span className="text-[14px] font-medium text-navy">How many</span>
                    <div className="flex items-center gap-4">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setEditQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"><Minus size={16} strokeWidth={2} /></button>
                      <span className="w-6 text-center text-[16px] font-bold text-navy">{editQty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setEditQty((q) => q + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"><Plus size={16} strokeWidth={2} /></button>
                    </div>
                  </div>
                </>
              )}
              <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Price{isService ? "" : " (each)"}</p>
              <div className="flex items-center gap-2 rounded-2xl border border-border px-4">
                <span className="text-[18px] font-bold text-navy">£</span>
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" aria-label="Override price" className="h-14 w-full bg-transparent text-[18px] font-bold text-navy focus:outline-none" />
              </div>
              <p className="pt-2 text-[12px] text-muted">Overrides the price for this sale only.</p>
              <div className="pt-5">
                <DarkButton disabled={!validPrice} onClick={() => { store.updateItem(editItem.id, { qty, price: Math.round((parseFloat(editPrice) || 0) * 100) / 100 }); setEditId(null); }}>
                  {validPrice ? `Save · ${fmt(lineTotal)}` : "Enter a price"}
                </DarkButton>
                <button type="button" onClick={() => { store.removeItem(editItem.id); setEditId(null); }} className="mt-3 w-full text-center text-[14px] font-semibold text-danger">Remove from sale</button>
              </div>
            </>
          );
        })()}
      </Sheet>

      {/* Discount */}
      <Sheet open={discountSheet} onClose={() => setDiscountSheet(false)} title="Add discount" sub={`Off the ${fmt(totals.subtotal)} bill`}>
        <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Saved codes</p>
        <div className="flex flex-col gap-2 pb-4">
          {discountCodes.map((code) => {
            const on = store.discountCodeId === code.id;
            const pounds = code.type === "percent" ? (totals.subtotal * code.value) / 100 : Math.min(code.value, totals.subtotal);
            return (
              <button
                key={code.id}
                type="button"
                onClick={() => {
                  if (on) store.setDiscountCode(null, 0, 0);
                  else store.setDiscountCode(code.id, code.type === "percent" ? code.value : 0, code.type === "amount" ? code.value : 0);
                  setDiscountSheet(false);
                }}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left ${
                  on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold">{code.label}</span>
                  <span className={`block truncate pt-0.5 text-[11px] ${on ? "text-white/70" : "text-muted"}`}>{code.code} · {code.scope}</span>
                </span>
                <span className="shrink-0 text-[13px] font-bold">−{fmt(pounds)}</span>
              </button>
            );
          })}
        </div>
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Manual discount</p>
        <div className="flex rounded-full bg-canvas p-1">
          {(["pct", "amount"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => { setDiscMode(mode); setDiscDraft(""); }} className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${discMode === mode ? "bg-white text-navy shadow-[0_1px_3px_rgba(8,7,6,0.08)]" : "text-muted"}`}>{mode === "pct" ? "Percentage" : "Amount"}</button>
          ))}
        </div>
        <div className="flex gap-2 pt-3">
          {(discMode === "pct" ? ["5", "10", "15", "20"] : ["5", "10", "20", "50"]).map((v) => {
            const on = discDraft === v;
            return <button key={v} type="button" onClick={() => setDiscDraft(v)} className={`flex-1 rounded-full border py-2 text-[13px] font-semibold transition-colors ${on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>{discMode === "pct" ? `${v}%` : `£${v}`}</button>;
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border px-4 py-3.5">
          {discMode === "amount" && <span className="text-[18px] font-bold text-muted">£</span>}
          <input value={discDraft} onChange={(e) => setDiscDraft(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder={discMode === "pct" ? "Custom percentage" : "Custom amount"} aria-label="Discount value" className="w-full bg-transparent text-[18px] font-bold text-navy placeholder:text-[15px] placeholder:font-normal placeholder:text-muted focus:outline-none" />
          {discMode === "pct" && <span className="text-[18px] font-bold text-muted">%</span>}
        </div>
        {(() => {
          const n = parseFloat(discDraft) || 0;
          const pounds = discMode === "pct" ? (totals.subtotal * n) / 100 : Math.min(n, totals.subtotal);
          return <p className="pt-3 text-center text-[13px] text-secondary">{n > 0 ? <>This takes <span className="font-bold text-navy">−{fmt(pounds)}</span>{discMode === "pct" ? ` (${n}% of ${fmt(totals.subtotal)})` : ""} off the bill</> : "Enter a percentage or amount to discount the whole bill, before tip."}</p>;
        })()}
        <div className="pt-5">
          <DarkButton disabled={!(parseFloat(discDraft) > 0)} onClick={() => { const n = parseFloat(discDraft) || 0; if (discMode === "pct") store.setDiscount(n, 0); else store.setDiscount(0, Math.min(n, totals.subtotal)); setDiscountSheet(false); }}>
            {parseFloat(discDraft) > 0 ? `Apply −${fmt(discMode === "pct" ? (totals.subtotal * (parseFloat(discDraft) || 0)) / 100 : Math.min(parseFloat(discDraft) || 0, totals.subtotal))} discount` : "Apply discount"}
          </DarkButton>
          {totals.discount > 0 && <button type="button" onClick={() => { store.setDiscount(0, 0); setDiscDraft(""); setDiscountSheet(false); }} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">Remove discount</button>}
        </div>
      </Sheet>

      {/* Tip — customer-facing */}
      <Sheet open={tipSheet} onClose={() => setTipSheet(false)}>
        <div className="flex flex-col items-center pb-2 text-center">
          <span className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-1.5 text-[11px] font-semibold text-secondary"><Smartphone size={12} strokeWidth={2} /> Hand the phone to your client</span>
          <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-navy"><Heart size={20} strokeWidth={1.6} /></span>
          <h2 className="pt-3 text-[22px] font-bold leading-tight text-navy">Would you like to<br />leave a tip?</h2>
          <p className="pt-1.5 text-[13px] text-secondary">100% goes to {staffName} · service {fmt(tipBase)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 pt-4">
          {[10, 15, 20].map((pct) => {
            const active = tipPick === pct && tipCustomDraft === 0;
            return (
              <motion.button key={pct} type="button" whileTap={{ scale: 0.95 }} onClick={() => { setTipPick(pct); setTipCustomDraft(0); }} className={`flex flex-col items-center rounded-2xl border py-4 transition-colors ${active ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>
                <span className="text-[17px] font-bold">{pct}%</span>
                <span className={`pt-0.5 text-[12px] ${active ? "text-white/60" : "text-muted"}`}>{fmt(Math.round((tipBase * pct) / 100))}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border px-4 py-3">
          <span className="text-[15px] font-bold text-muted">£</span>
          <input value={tipCustomDraft || ""} onChange={(e) => { setTipCustomDraft(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0)); setTipPick(null); }} inputMode="numeric" placeholder="Other amount" aria-label="Custom tip amount" className="w-full bg-transparent text-[15px] font-semibold text-navy placeholder:font-normal placeholder:text-muted focus:outline-none" />
        </div>
        <div className="pt-5">
          <DarkButton disabled={draftTip <= 0} onClick={() => { store.setTip(0, Math.round(draftTip)); setTipSheet(false); }}>{draftTip > 0 ? `Add ${fmt(Math.round(draftTip))} tip` : "Add tip"}</DarkButton>
          <button type="button" onClick={() => { store.setTip(0, 0); setTipSheet(false); }} className="mt-3 w-full text-center text-[14px] font-semibold text-secondary">No tip today</button>
        </div>
      </Sheet>

      {/* Card on file */}
      <Sheet open={method === "Card on file"} onClose={() => { setMethod(null); setAddingCard(false); }} title={addingCard ? "Add a card" : "Card on file"} sub={`${fmt(totals.remaining)} to charge`}>
        {!addingCard ? (
          <>
            <div className="flex flex-col gap-2.5">
              {savedCards.map((c) => (
                <button key={c.id} type="button" onClick={() => takePayment("Card on file", totals.remaining)} className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-white p-4 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy"><CreditCard size={17} strokeWidth={1.7} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-navy">{c.brand} •••• {c.last4}</span>
                    <span className="block text-[12px] text-muted">Expires {c.expiry}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-navy">Charge</span>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAddingCard(true)} className="mt-2.5 flex w-full items-center gap-3.5 rounded-2xl border border-dashed border-border bg-white p-4 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary"><Plus size={18} strokeWidth={1.8} /></span>
              <span className="text-[15px] font-semibold text-navy">Add a new card</span>
            </button>
            <p className="pt-3 text-[12px] text-muted">The saved card is charged instantly — no reader needed.</p>
          </>
        ) : (
          <>
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Card details</p>
            <input aria-label="Card number" inputMode="numeric" placeholder="Card number" className="mb-2.5 h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
            <div className="flex gap-2.5">
              <input aria-label="Expiry" placeholder="MM / YY" className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
              <input aria-label="CVC" inputMode="numeric" placeholder="CVC" className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
            </div>
            <input aria-label="Name on card" placeholder="Name on card" className="mt-2.5 h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" />
            <p className="pt-3 text-[12px] text-muted">This card is charged now for {displayName.split(" ")[0]}.</p>
            <div className="flex gap-2.5 pt-5">
              {savedCards.length > 0 && <button type="button" onClick={() => setAddingCard(false)} className="h-12 flex-1 rounded-full border border-border text-[14px] font-semibold text-navy">Back</button>}
              <div className="flex-1"><DarkButton onClick={() => takePayment("Card on file", totals.remaining)}>Save &amp; charge {fmt(totals.remaining)}</DarkButton></div>
            </div>
          </>
        )}
      </Sheet>

      {/* Payment link */}
      <Sheet open={method === "Payment link"} onClose={() => setMethod(null)} title="Send payment link" sub={`To ${displayName}`}>
        {linkSent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fg-primary text-white"><Check size={26} strokeWidth={2.2} /></span>
            <p className="pt-4 text-[15px] font-bold text-navy">Link sent to {displayName.split(" ")[0]}</p>
            <p className="pt-1 text-[13px] text-secondary">They can pay {fmt(linkAmount)} from their phone. We&rsquo;ll mark it paid once they complete it.</p>
            <div className="w-full pt-6"><DarkButton onClick={() => takePayment("Payment link", Math.min(linkAmount, totals.remaining))}>Done</DarkButton></div>
          </div>
        ) : (
          <>
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount to request</p>
            <div className="flex items-center rounded-2xl bg-canvas px-4 py-4">
              <span className="pr-1 text-[20px] font-bold text-muted">£</span>
              <input value={linkAmount || ""} onChange={(e) => setLinkAmount(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} inputMode="numeric" className="w-full bg-transparent text-[24px] font-bold text-navy focus:outline-none" aria-label="Payment link amount" />
            </div>
            <div className="flex items-center gap-3 pt-4 text-[13px] text-secondary"><Smartphone size={15} strokeWidth={1.7} className="shrink-0" /> Sent by text and email — the client pays securely without handing over a card.</div>
            <div className="pt-5"><DarkButton disabled={linkAmount <= 0} onClick={() => setLinkSent(true)}>Send link for {fmt(Math.min(linkAmount, totals.remaining))}</DarkButton></div>
          </>
        )}
      </Sheet>

      {/* Card machine */}
      <Sheet open={method === "Card machine"} onClose={() => setMethod(null)} title="Card machine" sub={`${fmt(totals.remaining)} remaining`}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount to charge</p>
        <div className="flex items-center rounded-2xl bg-canvas px-4 py-4"><span className="pr-1 text-[20px] font-bold text-muted">£</span><span className="text-[24px] font-bold text-navy">{totals.remaining}</span></div>
        <p className="pt-3 text-[13px] text-secondary">The card reader will prompt the client to tap or insert.</p>
        <div className="pt-5"><DarkButton onClick={() => takePayment("Card machine", totals.remaining)}>Charge {fmt(totals.remaining)}</DarkButton></div>
      </Sheet>

      {/* Cash */}
      <Sheet open={method === "Cash"} onClose={() => setMethod(null)} title="Cash" sub={`${fmt(totals.remaining)} remaining`}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Cash received</p>
        <div className="flex items-center rounded-2xl bg-canvas px-4 py-4">
          <span className="pr-1 text-[20px] font-bold text-muted">£</span>
          <input value={cashAmount} onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} inputMode="numeric" className="w-full bg-transparent text-[24px] font-bold text-navy focus:outline-none" aria-label="Cash received" />
        </div>
        <div className="flex gap-2 pt-3">
          {[{ label: `Exact · ${fmt(totals.remaining)}`, v: totals.remaining }, { label: "£20", v: 20 }, { label: "£50", v: 50 }].map((c) => (
            <button key={c.label} type="button" onClick={() => setCashAmount(c.v)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${cashAmount === c.v ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>{c.label}</button>
          ))}
        </div>
        {cashAmount > totals.remaining && <p className="mt-3 rounded-xl bg-canvas px-4 py-3 text-[13px] font-semibold text-navy">Change due · {fmt(cashAmount - totals.remaining)}</p>}
        {cashAmount > 0 && cashAmount < totals.remaining && <p className="mt-3 rounded-xl bg-canvas px-4 py-3 text-[12px] text-secondary">{fmt(totals.remaining - cashAmount)} will still be due — take the rest with another method.</p>}
        <div className="pt-5">
          <DarkButton disabled={cashAmount <= 0} onClick={() => takePayment("Cash", Math.min(cashAmount, totals.remaining))}>{cashAmount >= totals.remaining ? `Take ${fmt(totals.remaining)} cash` : `Add ${fmt(cashAmount)} · part payment`}</DarkButton>
        </div>
      </Sheet>

      {/* Gift card */}
      <Sheet open={method === "Gift card"} onClose={() => setMethod(null)} title="Gift card" sub={`${fmt(totals.remaining)} remaining`}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Gift card code</p>
        <div className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3.5">
          <Gift size={16} strokeWidth={1.75} className="shrink-0 text-secondary" />
          <input value={giftCode} onChange={(e) => setGiftCode(e.target.value.toUpperCase())} placeholder="e.g. GIFT-4F2K-99" className="w-full bg-transparent text-[15px] font-semibold tracking-wide text-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:outline-none" aria-label="Gift card code" />
          {giftValid && <Check size={16} strokeWidth={2.5} className="shrink-0 text-navy" />}
        </div>
        {giftValid ? <p className="pt-2 text-[12px] font-semibold text-navy">Card found · £50 balance available</p> : <p className="pt-2 text-[12px] text-muted">Enter the code printed on the card or in their email.</p>}
        <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount to charge to the card</p>
        <div className={`flex items-center rounded-2xl bg-canvas px-4 py-4 ${giftValid ? "" : "opacity-40"}`}>
          <span className="pr-1 text-[20px] font-bold text-muted">£</span>
          <input value={giftAmount} disabled={!giftValid} onChange={(e) => setGiftAmount(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} inputMode="numeric" className="w-full bg-transparent text-[24px] font-bold text-navy focus:outline-none" aria-label="Amount to charge to the gift card" />
        </div>
        {giftValid && giftAmount > 50 && <p className="mt-3 rounded-xl bg-warning/10 px-4 py-3 text-[12px] font-medium text-warning">Only £50 is on this card — we&rsquo;ll charge £50 and the rest stays due.</p>}
        <div className="pt-5">
          <DarkButton disabled={!giftValid || giftAmount <= 0} onClick={() => takePayment("Gift card", Math.min(giftAmount, 50, totals.remaining))}>
            {!giftValid ? "Enter the card code first" : Math.min(giftAmount, 50) >= totals.remaining ? `Charge ${fmt(totals.remaining)} to gift card` : `Add ${fmt(Math.min(giftAmount, 50))} · part payment`}
          </DarkButton>
        </div>
      </Sheet>

      {/* Other */}
      <Sheet open={method === "Other"} onClose={() => setMethod(null)} title="Other payment" sub={`${fmt(totals.remaining)} remaining`}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Amount paid by other means</p>
        <div className="flex items-center rounded-2xl bg-canvas px-4 py-4">
          <span className="pr-1 text-[20px] font-bold text-muted">£</span>
          <input value={otherAmount} onChange={(e) => setOtherAmount(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} inputMode="numeric" className="w-full bg-transparent text-[24px] font-bold text-navy focus:outline-none" aria-label="Amount paid by other means" />
        </div>
        <div className="flex gap-2 pt-3">
          {[{ label: `Full · ${fmt(totals.remaining)}`, v: totals.remaining }, { label: "£20", v: 20 }, { label: "£50", v: 50 }].map((c) => (
            <button key={c.label} type="button" onClick={() => setOtherAmount(c.v)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${otherAmount === c.v ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}>{c.label}</button>
          ))}
        </div>
        <p className="pt-3 text-[13px] text-secondary">Bank transfer, voucher, an app payment — anything taken outside That Time. It&rsquo;s recorded against this bill.</p>
        <div className="pt-5">
          <DarkButton disabled={otherAmount <= 0} onClick={() => takePayment("Other", Math.min(otherAmount, totals.remaining))}>{otherAmount >= totals.remaining ? `Record ${fmt(totals.remaining)}` : `Add ${fmt(otherAmount)} · part payment`}</DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
