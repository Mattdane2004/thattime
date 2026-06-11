"use client";

import { create } from "zustand";

/**
 * Shared state for the mid-fi product app (Figma node 11990-94642):
 * the Up Next appointment lifecycle, the checkout cart, and which
 * quick-action sheet is open. Prototype-only, nothing persists.
 */

export type ApptStatus = "upcoming" | "arrived" | "in-progress" | "done" | "cancelled";

export type QuickAction =
  | "menu"
  | "appointment"
  | "client"
  | "block"
  | null;

export interface CheckoutItem {
  id: string;
  kind: "appointment" | "service" | "product";
  name: string;
  sub: string;
  price: number;
}

export interface PaymentEntry {
  id: string;
  method: "Card" | "Cash" | "Bank transfer" | "Gift card";
  amount: number;
}

type AppState = {
  // Up Next appointment lifecycle (Sarah Johnson 11:00).
  apptStatus: ApptStatus;
  movedTo: string | null;
  setApptStatus: (s: ApptStatus) => void;
  setMovedTo: (v: string | null) => void;

  // Break card.
  breakActive: boolean;
  setBreakActive: (v: boolean) => void;

  // Quick actions overlay (owned by the tab bar layout).
  quickAction: QuickAction;
  setQuickAction: (q: QuickAction) => void;

  // Checkout cart.
  items: CheckoutItem[];
  discountPct: number; // 0, 10, 20
  discountFlat: number; // £
  tipPct: number; // 0, 10, 15, 20
  tipCustom: number;
  payments: PaymentEntry[];
  addItem: (item: Omit<CheckoutItem, "id">) => void;
  removeItem: (id: string) => void;
  setDiscount: (pct: number, flat: number) => void;
  setTip: (pct: number, custom?: number) => void;
  addPayment: (method: PaymentEntry["method"], amount: number) => void;
  removePayment: (id: string) => void;
  resetCheckout: () => void;
};

let nextId = 1;
const uid = () => `i${nextId++}`;

const baseItems: CheckoutItem[] = [
  { id: "appt", kind: "appointment", name: "Cut & Colour", sub: "Appointment", price: 140 },
];

export const useAppStore = create<AppState>((set, get) => ({
  apptStatus: "upcoming",
  movedTo: null,
  setApptStatus: (s) => set({ apptStatus: s }),
  setMovedTo: (v) => set({ movedTo: v }),

  breakActive: false,
  setBreakActive: (v) => set({ breakActive: v }),

  quickAction: null,
  setQuickAction: (q) => set({ quickAction: q }),

  items: baseItems,
  discountPct: 0,
  discountFlat: 0,
  tipPct: 0,
  tipCustom: 0,
  payments: [],

  addItem: (item) => set({ items: [...get().items, { ...item, id: uid() }] }),
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  setDiscount: (pct, flat) => set({ discountPct: pct, discountFlat: flat }),
  setTip: (pct, custom = 0) => set({ tipPct: pct, tipCustom: custom }),
  addPayment: (method, amount) =>
    set({ payments: [...get().payments, { id: uid(), method, amount }] }),
  removePayment: (id) => set({ payments: get().payments.filter((p) => p.id !== id) }),
  resetCheckout: () =>
    set({ items: baseItems, discountPct: 0, discountFlat: 0, tipPct: 0, tipCustom: 0, payments: [] }),
}));

export function checkoutTotals(s: {
  items: CheckoutItem[];
  discountPct: number;
  discountFlat: number;
  tipPct: number;
  tipCustom: number;
  payments: PaymentEntry[];
}) {
  const subtotal = s.items.reduce((sum, i) => sum + i.price, 0);
  const discount = s.discountPct > 0 ? (subtotal * s.discountPct) / 100 : s.discountFlat;
  const tip = s.tipCustom > 0 ? s.tipCustom : (subtotal * s.tipPct) / 100;
  const total = Math.max(0, subtotal - discount + tip);
  const paid = s.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  return { subtotal, discount, tip, total, paid, remaining };
}
