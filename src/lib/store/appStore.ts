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
  | "logpay" // Log Payment — pick any client, then checkout
  | null;

export type CheckoutItemKind =
  | "appointment"
  | "service"
  | "product"
  | "membership"
  | "giftcard"
  | "class"
  | "other";

export interface CheckoutItem {
  id: string;
  kind: CheckoutItemKind;
  name: string;
  sub: string;
  price: number;
  qty: number;
  coveredBy?: string;
}

/** How checkout was entered — drives the Done step (rating + queue advance vs plain finish). */
export type EntryContext = "appointment" | "logpay";

export interface PaymentEntry {
  id: string;
  method: "Cash" | "Card on file" | "Payment link" | "Card machine" | "Gift card" | "Other";
  amount: number;
}

/** Who covers the That Time platform fee on this sale. */
export type FeeBearer = "client" | "split" | "absorb";

/** A client chosen via Log Payment (any client, not just the Up Next queue). */
export interface CheckoutClient {
  name: string;
  initials: string;
  outstanding?: number;
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
  deposit?: number;
  status?: string;
  tags?: string[];
  live?: boolean;
  // A bundle booking opens the same sheet in "bundle mode" (services timeline).
  kind?: "service" | "bundle";
  bundleId?: string;
}

/** A break / blocked-time block being edited via the blocked-time setup sheet. */
export interface BlockEdit {
  key?: string;
  calendarBlockId?: string;
  title: string;
  blockType: string; // a blockTypes id, or "custom"
  time: string;
  duration: string;
  day?: number;
  wholeDay?: boolean;
  frequency?: string;
}

export interface AppointmentOccurrence {
  id: string;
  day: number | null;
  time: string | null;
  service: string;
  staff: string;
}

export interface CustomAppointment {
  id: string;
  client: string;
  service: string;
  staff: string;
  day: number | null;
  time: string | null;
  duration?: string;
  outOfHours?: boolean;
  appointmentType?: "salon" | "mobile" | "online";
  paymentStatus?: "unpaid" | "deposit" | "paid" | "subscription";
  deposit?: number;
  paymentLinkHours?: number;
  pending?: boolean;
  recurring?: string | null;
  bookingSetId?: string;
  occurrences?: AppointmentOccurrence[];
  entitlementLabel?: string;
  price?: number;
}

export interface CalendarBlockedTime {
  id: string;
  title: string;
  blockType: string;
  day: number;
  staff: string[];
  startTime: string;
  endTime: string;
  wholeDay: boolean;
  allowOnline: boolean;
  frequency?: string;
}

export interface MovedCalendarBlock {
  day?: number;
  start?: number;
  staff?: string;
}

export interface ScheduleFocus {
  view: "Calendar" | "Team";
  day: number;
}

export interface CalendarSlotDraft {
  day: number;
  time: string;
  staff?: string;
  view: "Calendar" | "Team";
}

type AppState = {
  // Up Next queue + lifecycle of the current appointment.
  apptIdx: number;
  apptStatus: ApptStatus;
  movedTo: string | null;
  /** Minutes the current appointment is running late (null = on time). */
  lateBy: number | null;
  /** "I'm ready" sent — the waiting client has been told to come in. */
  readySent: boolean;
  setApptStatus: (s: ApptStatus) => void;
  setMovedTo: (v: string | null) => void;
  setLateBy: (m: number | null) => void;
  setReadySent: (v: boolean) => void;
  /** Current appointment is finished — move the card to the next one. */
  advanceAppt: () => void;

  // Appointment details sheet (opened from cards, agenda rows, grid blocks).
  apptSheet: ApptSheetData | null;
  setApptSheet: (a: ApptSheetData | null) => void;

  // A break/blocked block tapped on the calendar — opens the blocked-time setup
  // sheet pre-filled for editing (null = creating a new block).
  blockEdit: BlockEdit | null;
  setBlockEdit: (b: BlockEdit | null) => void;
  deletedBlockKeys: string[];
  deleteBlockKey: (key: string) => void;

  // Break card: idle → active → ended (ended slides away and stays gone).
  breakActive: boolean;
  setBreakActive: (v: boolean) => void;
  breakEnded: boolean;
  setBreakEnded: (v: boolean) => void;

  // Appointments created through quick-add — they appear on the calendar.
  customAppts: CustomAppointment[];
  addCustomAppt: (a: Omit<CustomAppointment, "id">) => string;
  updateCustomAppt: (id: string, patch: Partial<CustomAppointment>) => void;
  updateCustomOccurrence: (appointmentId: string, occurrenceId: string, patch: Partial<AppointmentOccurrence>) => void;
  cancelCustomAppointments: (ids: string[]) => void;
  calendarBlocks: CalendarBlockedTime[];
  addCalendarBlock: (b: Omit<CalendarBlockedTime, "id">) => string;
  updateCalendarBlock: (id: string, patch: Partial<CalendarBlockedTime>) => void;
  deleteCalendarBlock: (id: string) => void;
  movedCalendarBlocks: Record<string, MovedCalendarBlock>;
  moveCalendarBlock: (key: string, patch: MovedCalendarBlock) => void;
  scheduleFocus: ScheduleFocus | null;
  focusSchedule: (day: number, view?: ScheduleFocus["view"]) => void;
  clearScheduleFocus: () => void;
  slotDraft: CalendarSlotDraft | null;
  setSlotDraft: (slot: CalendarSlotDraft | null) => void;
  clearSlotDraft: () => void;

  // Quick actions overlay (owned by the tab bar layout).
  quickAction: QuickAction;
  setQuickAction: (q: QuickAction) => void;

  // Checkout cart.
  items: CheckoutItem[];
  discountPct: number; // 0, 10, 20
  discountFlat: number; // £
  discountCodeId: string | null;
  tipPct: number; // 0, 10, 15, 20
  tipCustom: number;
  payments: PaymentEntry[];
  /** Package/subscription credit applied to this sale. */
  entitlementCredit: number;
  entitlementLabel: string | null;
  /** Deposit/prepayment already taken at booking, in £ — credited against the bill. */
  prepaid: number;
  /** Who covers the platform fee on this sale. */
  feeBearer: FeeBearer;
  /** Set when checkout is opened for an arbitrary client via Log Payment. */
  checkoutClient: CheckoutClient | null;
  /** How checkout was entered — appointment (Up Next / appt sheet) vs logpay. */
  entryContext: EntryContext;
  addItem: (item: Omit<CheckoutItem, "id" | "qty">) => void;
  decrementItem: (kind: CheckoutItem["kind"], name: string) => void;
  /** Edit a line's quantity and/or unit price (price override) from the hub. */
  updateItem: (id: string, patch: { qty?: number; price?: number }) => void;
  removeItem: (id: string) => void;
  setDiscount: (pct: number, flat: number) => void;
  setDiscountCode: (id: string | null, pct: number, flat: number) => void;
  setEntitlementCredit: (label: string | null, amount: number) => void;
  setTip: (pct: number, custom?: number) => void;
  setFeeBearer: (b: FeeBearer) => void;
  addPayment: (method: PaymentEntry["method"], amount: number) => void;
  removePayment: (id: string) => void;
  /** Open checkout for a specific client (Log Payment) — seeds any outstanding balance. */
  startCheckoutFor: (c: CheckoutClient) => void;
  /** Reassign the payer on the checkout hub without touching the cart. */
  setCheckoutClient: (c: CheckoutClient | null) => void;
  /** Open a blank checkout hub (Log Payment) — no client, no items, assigned on the hub. */
  startBlankCheckout: () => void;
  /** Open checkout for the current Up Next appointment — resets to its pre-built bill. */
  startAppointmentCheckout: () => void;
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
  lateBy: null,
  readySent: false,
  setApptStatus: (s) => set({ apptStatus: s }),
  setMovedTo: (v) => set({ movedTo: v }),
  setLateBy: (m) => set({ lateBy: m }),
  setReadySent: (v) => set({ readySent: v }),
  advanceAppt: () => {
    const idx = get().apptIdx + 1;
    set({
      apptIdx: idx,
      apptStatus: "upcoming",
      movedTo: null,
      lateBy: null,
      readySent: false,
      items: baseItemsFor(upNextQueue[idx]),
      discountPct: 0,
      discountFlat: 0,
      discountCodeId: null,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
      entitlementCredit: 0,
      entitlementLabel: null,
      prepaid: upNextQueue[idx]?.deposit ?? 0,
      feeBearer: "absorb",
      checkoutClient: null,
      entryContext: "appointment",
    });
  },

  apptSheet: null,
  setApptSheet: (a) => set({ apptSheet: a }),

  blockEdit: null,
  setBlockEdit: (b) => set({ blockEdit: b }),
  deletedBlockKeys: [],
  deleteBlockKey: (key) => {
    const deletedBlockKeys = get().deletedBlockKeys;
    if (deletedBlockKeys.includes(key)) return;
    set({ deletedBlockKeys: [...deletedBlockKeys, key] });
  },

  breakActive: false,
  setBreakActive: (v) => set({ breakActive: v }),
  breakEnded: false,
  setBreakEnded: (v) => set({ breakEnded: v }),

  customAppts: [],
  addCustomAppt: (a) => {
    const id = uid();
    set({ customAppts: [...get().customAppts, { ...a, id }] });
    return id;
  },
  updateCustomAppt: (id, patch) => set({ customAppts: get().customAppts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }),
  updateCustomOccurrence: (appointmentId, occurrenceId, patch) =>
    set({
      customAppts: get().customAppts.map((a) =>
        a.id === appointmentId
          ? { ...a, occurrences: (a.occurrences ?? []).map((o) => (o.id === occurrenceId ? { ...o, ...patch } : o)) }
          : a,
      ),
    }),
  cancelCustomAppointments: (ids) => set({ customAppts: get().customAppts.filter((a) => !ids.includes(a.id)) }),

  calendarBlocks: [],
  addCalendarBlock: (b) => {
    const id = uid();
    set({ calendarBlocks: [...get().calendarBlocks, { ...b, id }] });
    return id;
  },
  updateCalendarBlock: (id, patch) => set({ calendarBlocks: get().calendarBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
  deleteCalendarBlock: (id) => set({ calendarBlocks: get().calendarBlocks.filter((b) => b.id !== id) }),
  movedCalendarBlocks: {},
  moveCalendarBlock: (key, patch) => set({ movedCalendarBlocks: { ...get().movedCalendarBlocks, [key]: { ...get().movedCalendarBlocks[key], ...patch } } }),
  scheduleFocus: null,
  focusSchedule: (day, view = "Calendar") => set({ scheduleFocus: { day, view } }),
  clearScheduleFocus: () => set({ scheduleFocus: null }),
  slotDraft: null,
  setSlotDraft: (slot) => set({ slotDraft: slot }),
  clearSlotDraft: () => set({ slotDraft: null }),

  quickAction: null,
  setQuickAction: (q) => set({ quickAction: q }),

  items: baseItemsFor(upNextQueue[0]),
  discountPct: 0,
  discountFlat: 0,
  discountCodeId: null,
  tipPct: 0,
  tipCustom: 0,
  payments: [],
  entitlementCredit: 0,
  entitlementLabel: null,
  prepaid: upNextQueue[0]?.deposit ?? 0,
  feeBearer: "absorb",
  checkoutClient: null,
  entryContext: "appointment",

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
  updateItem: (id, patch) =>
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, price: patch.price ?? i.price, qty: patch.qty != null ? Math.max(1, patch.qty) : i.qty }
          : i,
      ),
    }),
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  setDiscount: (pct, flat) => set({ discountPct: pct, discountFlat: flat, discountCodeId: null }),
  setDiscountCode: (id, pct, flat) => set({ discountCodeId: id, discountPct: pct, discountFlat: flat }),
  setEntitlementCredit: (label, amount) => set({ entitlementLabel: label, entitlementCredit: Math.max(0, amount) }),
  setTip: (pct, custom = 0) => set({ tipPct: pct, tipCustom: custom }),
  setFeeBearer: (b) => set({ feeBearer: b }),
  addPayment: (method, amount) =>
    set({ payments: [...get().payments, { id: uid(), method, amount }] }),
  removePayment: (id) => set({ payments: get().payments.filter((p) => p.id !== id) }),
  startCheckoutFor: (c) =>
    set({
      checkoutClient: c,
      entryContext: "logpay",
      items:
        c.outstanding && c.outstanding > 0
          ? [{ id: "outstanding", kind: "other", name: "Outstanding balance", sub: "Carried over from a previous visit", price: c.outstanding, qty: 1 }]
          : [],
      discountPct: 0,
      discountFlat: 0,
      discountCodeId: null,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
      entitlementCredit: 0,
      entitlementLabel: null,
      prepaid: 0,
      feeBearer: "absorb",
    }),
  setCheckoutClient: (c) => set({ checkoutClient: c }),
  startBlankCheckout: () =>
    set({
      checkoutClient: null,
      entryContext: "logpay",
      items: [],
      discountPct: 0,
      discountFlat: 0,
      discountCodeId: null,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
      entitlementCredit: 0,
      entitlementLabel: null,
      prepaid: 0,
      feeBearer: "absorb",
    }),
  startAppointmentCheckout: () =>
    set({
      checkoutClient: null,
      entryContext: "appointment",
      items: baseItemsFor(upNextQueue[get().apptIdx]),
      discountPct: 0,
      discountFlat: 0,
      discountCodeId: null,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
      entitlementCredit: 0,
      entitlementLabel: null,
      prepaid: upNextQueue[get().apptIdx]?.deposit ?? 0,
      feeBearer: "absorb",
    }),
  resetCheckout: () =>
    set({
      items: baseItemsFor(upNextQueue[get().apptIdx]),
      discountPct: 0,
      discountFlat: 0,
      discountCodeId: null,
      tipPct: 0,
      tipCustom: 0,
      payments: [],
      entitlementCredit: 0,
      entitlementLabel: null,
      prepaid: upNextQueue[get().apptIdx]?.deposit ?? 0,
      feeBearer: "absorb",
      checkoutClient: null,
      entryContext: "appointment",
    }),
}));

/** The appointment the Up Next card is currently on (undefined once the day is done). */
export function currentAppt(idx: number): UpNextAppt | undefined {
  return upNextQueue[idx];
}

/** That Time's platform fee, charged on the post-discount service/product bill. */
export const PLATFORM_FEE_RATE = 0.05;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function checkoutTotals(s: {
  items: CheckoutItem[];
  discountPct: number;
  discountFlat: number;
  entitlementCredit?: number;
  tipPct: number;
  tipCustom: number;
  payments: PaymentEntry[];
  prepaid?: number;
  feeBearer?: FeeBearer;
}) {
  const subtotal = s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = s.discountPct > 0 ? (subtotal * s.discountPct) / 100 : Math.min(s.discountFlat, subtotal);
  const tip = s.tipCustom > 0 ? s.tipCustom : (subtotal * s.tipPct) / 100;
  const base = Math.max(0, subtotal - discount); // billable before tip
  const entitlementCredit = Math.min(s.entitlementCredit ?? 0, base);
  // Platform fee + who carries it: client adds it on top, split halves it, absorb
  // takes it off the vendor's payout (the client total is unaffected).
  const fee = round2(base * PLATFORM_FEE_RATE);
  const feeBearer = s.feeBearer ?? "absorb";
  const clientFee = feeBearer === "client" ? fee : feeBearer === "split" ? round2(fee / 2) : 0;
  const vendorFee = feeBearer === "absorb" ? fee : feeBearer === "split" ? round2(fee / 2) : 0;
  const total = Math.max(0, base + tip + clientFee); // what the client owes
  const youReceive = Math.max(0, base + tip - vendorFee); // vendor payout after fee
  const prepaid = s.prepaid ?? 0;
  const paid = s.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - paid - prepaid - entitlementCredit);
  // Overpay: deposit (or collected payments) exceed the bill — surfaced as a credit/refund.
  const overpay = Math.max(0, paid + prepaid + entitlementCredit - total);
  return { subtotal, discount, tip, base, entitlementCredit, fee, clientFee, vendorFee, total, youReceive, prepaid, paid, remaining, overpay };
}
