"use client";

import { create } from "zustand";
import { upNextQueue, type UpNextAppt } from "@/lib/data/product";

/**
 * Shared state for the mid-fi product app (Figma node 11990-94642):
 * the Up Next appointment lifecycle (a queue — finishing one advances to the
 * next), the checkout cart, the quick-action overlay, and the appointment
 * details sheet. Prototype-only, nothing persists.
 */

export type ApptStatus = "upcoming" | "arrived" | "in-progress" | "done" | "cancelled";

export type QuickAction =
  | "menu"
  | "choose" // "what are you adding?" — from tapping empty calendar space
  | "appointment"
  | "class"
  | "client"
  | "block"
  | null;

export interface CheckoutItem {
  id: string;
  kind: "appointment" | "service" | "product";
  name: string;
  sub: string;
  price: number;
  qty: number;
}

export interface PaymentEntry {
  id: string;
  method: "Card" | "Cash" | "Other" | "Gift card";
  amount: number;
}

/** What the appointment details sheet shows; `live` ties it to the Up Next lifecycle. */
export interface ApptSheetData {
  client: string;
  initials: string;
  service: string;
  staff: string;
  time: string;
  duration: string;
  price?: number;
  status?: string;
  tags?: string[];
  live?: boolean;
  // A bundle booking opens the same sheet in "bundle mode" (services timeline).
  kind?: "service" | "bundle";
  bundleId?: string;
}

/** A break / blocked-time block being edited via the blocked-time setup sheet. */
export interface BlockEdit {
  title: string;
  blockType: string; // a blockTypes id, or "custom"
  time: string;
  duration: string;
}

type AppState = {
  // Up Next queue + lifecycle of the current appointment.
  apptIdx: number;
  apptStatus: ApptStatus;
  movedTo: string | null;
  setApptStatus: (s: ApptStatus) => void;
  setMovedTo: (v: string | null) => void;
  /** Current appointment is finished — move the card to the next one. */
  advanceAppt: () => void;

  // Appointment details sheet (opened from cards, agenda rows, grid blocks).
  apptSheet: ApptSheetData | null;
  setApptSheet: (a: ApptSheetData | null) => void;

  // A break/blocked block tapped on the calendar — opens the blocked-time setup
  // sheet pre-filled for editing (null = creating a new block).
  blockEdit: BlockEdit | null;
  setBlockEdit: (b: BlockEdit | null) => void;

  // Break card: idle → active → ended (ended slides away and stays gone).
  breakActive: boolean;
  setBreakActive: (v: boolean) => void;
  breakEnded: boolean;
  setBreakEnded: (v: boolean) => void;

  // Appointments created through quick-add — they appear on the calendar.
  customAppts: { id: string; client: string; service: string; staff: string; day: number | null; time: string | null }[];
  addCustomAppt: (a: { client: string; service: string; staff: string; day: number | null; time: string | null }) => void;

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
  addItem: (item: Omit<CheckoutItem, "id" | "qty">) => void;
  decrementItem: (kind: CheckoutItem["kind"], name: string) => void;
  removeItem: (id: string) => void;
  setDiscount: (pct: number, flat: number) => void;
  setTip: (pct: number, custom?: number) => void;
  addPayment: (method: PaymentEntry["method"], amount: number) => void;
  removePayment: (id: string) => void;
  resetCheckout: () => void;
};

let nextId = 1;
const uid = () => `i${nextId++}`;

const baseItemsFor = (appt: UpNextAppt | undefined): CheckoutItem[] =>
  appt
    ? [{ id: "appt", kind: "appointment", name: appt.service, sub: "Appointment", price: appt.price, qty: 1 }]
    : [];

export const useAppStore = create<AppState>((set, get) => ({
  apptIdx: 0,
  apptStatus: "upcoming",
  movedTo: null,
  setApptStatus: (s) => set({ apptStatus: s }),
  setMovedTo: (v) => set({ movedTo: v }),
  advanceAppt: () => {
    const idx = get().apptIdx + 1;
    set({
      apptIdx: idx,
      apptStatus: "upcoming",
      movedTo: null,
      items: baseItemsFor(upNextQueue[idx]),
      discountPct: 0,
      discountFlat: 0,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
    });
  },

  apptSheet: null,
  setApptSheet: (a) => set({ apptSheet: a }),

  blockEdit: null,
  setBlockEdit: (b) => set({ blockEdit: b }),

  breakActive: false,
  setBreakActive: (v) => set({ breakActive: v }),
  breakEnded: false,
  setBreakEnded: (v) => set({ breakEnded: v }),

  customAppts: [],
  addCustomAppt: (a) => set({ customAppts: [...get().customAppts, { ...a, id: uid() }] }),

  quickAction: null,
  setQuickAction: (q) => set({ quickAction: q }),

  items: baseItemsFor(upNextQueue[0]),
  discountPct: 0,
  discountFlat: 0,
  tipPct: 0,
  tipCustom: 0,
  payments: [],

  addItem: (item) => {
    const existing = get().items.find((i) => i.kind === item.kind && i.name === item.name);
    set({
      items: existing
        ? get().items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i))
        : [...get().items, { ...item, id: uid(), qty: 1 }],
    });
  },
  decrementItem: (kind, name) => {
    const existing = get().items.find((i) => i.kind === kind && i.name === name);
    if (!existing) return;
    set({
      items:
        existing.qty > 1
          ? get().items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty - 1 } : i))
          : get().items.filter((i) => i.id !== existing.id),
    });
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  setDiscount: (pct, flat) => set({ discountPct: pct, discountFlat: flat }),
  setTip: (pct, custom = 0) => set({ tipPct: pct, tipCustom: custom }),
  addPayment: (method, amount) =>
    set({ payments: [...get().payments, { id: uid(), method, amount }] }),
  removePayment: (id) => set({ payments: get().payments.filter((p) => p.id !== id) }),
  resetCheckout: () =>
    set({
      items: baseItemsFor(upNextQueue[get().apptIdx]),
      discountPct: 0,
      discountFlat: 0,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
    }),
}));

/** The appointment the Up Next card is currently on (undefined once the day is done). */
export function currentAppt(idx: number): UpNextAppt | undefined {
  return upNextQueue[idx];
}

export function checkoutTotals(s: {
  items: CheckoutItem[];
  discountPct: number;
  discountFlat: number;
  tipPct: number;
  tipCustom: number;
  payments: PaymentEntry[];
}) {
  const subtotal = s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = s.discountPct > 0 ? (subtotal * s.discountPct) / 100 : s.discountFlat;
  const tip = s.tipCustom > 0 ? s.tipCustom : (subtotal * s.tipPct) / 100;
  const total = Math.max(0, subtotal - discount + tip);
  const paid = s.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  return { subtotal, discount, tip, total, paid, remaining };
}
