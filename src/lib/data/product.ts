// Screen demo data for the mid-fi product screens (Figma node 11990-94642) —
// "what's happening today": agenda rows, calendar grids, Up Next queue,
// conversations, notifications, client rows/forms/reviews.
//
// The sellable catalogue is NOT defined here: lib/data/offers.ts is canonical
// ("what we sell"); `services`/`serviceCategories` below are thin views of it
// shaped for the booking pickers. Add or edit offers in offers.ts.

import { demoOffers } from "./offers";

export interface ScreenService {
  id: string;
  name: string;
  duration: string;
  category: string;
  price: number;
}

// Booking pickers show published, bookable (duration-bearing) services only.
export const services: ScreenService[] = demoOffers
  .filter((o) => o.type === "service" && o.status === "published" && o.durationMin)
  .map((o) => ({
    id: o.id,
    name: o.name,
    duration: `${o.durationMin}m`,
    category: o.category,
    price: Number(o.price),
  }));

export const serviceCategories = [
  "All",
  ...Array.from(new Set(services.map((s) => s.category))),
];

// Retail list for the checkout add-product sheet. Austin folds this into
// lib/data/products.ts (the offer add-on catalogue) later — see
// docs/data-dedupe-proposal.md.
// Retail only — gift cards are sold via their own checkout type (kind:"giftcard"),
// never as a "product", so the can't-pay-a-gift-card-with-a-gift-card rule holds.
export const products = [
  { id: "shampoo", name: "Repair Shampoo", size: "250ml", price: 12, category: "Hair care" },
  { id: "conditioner", name: "Repair Conditioner", size: "250ml", price: 14, category: "Hair care" },
  { id: "serum", name: "Gloss Serum", size: "50ml", price: 18, category: "Hair care" },
  { id: "wax", name: "Styling Wax", size: "75ml", price: 9, category: "Styling" },
  { id: "spray", name: "Heat Protect Spray", size: "200ml", price: 16, category: "Styling" },
];

export const productCategories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

// Checkout "what are you charging for?" catalogues — memberships and classes
// are thin views of the canonical offers; gift cards are fixed denominations.
export const memberships = demoOffers
  .filter((o) => o.type === "subscription" && o.status === "published")
  .map((o) => ({ id: o.id, name: o.name, price: Number(o.price), sub: `${o.category} · per month` }));

export const classOffers = demoOffers
  .filter((o) => o.type === "class" && o.status === "published")
  .map((o) => ({ id: o.id, name: o.name, price: Number(o.price), sub: o.category }));

export const giftCardDenoms = [25, 50, 100];

export const staffMembers = ["Emma S.", "Alex M.", "Chris T.", "Sophie L."];

// `outstanding` is an unpaid balance in £ (0 = settled) — surfaced in the Log
// Payment client picker so vendors can spot who owes before taking payment.
export const clientRows = [
  { id: "emily", name: "Emily Davis", rating: 4.9, meta: "Next: 2 Apr, 14:30", tags: ["Regular"], outstanding: 0 },
  { id: "amanda", name: "Amanda White", rating: 4.3, meta: "Next: 2 Apr, 17:30", tags: ["Regular"], outstanding: 0 },
  { id: "jessica", name: "Jessica Brown", rating: 4.5, meta: "Next: 3 Apr, 14:30", tags: ["VIP", "Allergy"], outstanding: 0 },
  { id: "michael", name: "Michael Chen", rating: 2.1, meta: "Last: 20 Feb 2026", tags: ["Blocked"], outstanding: 120 },
  { id: "patricia", name: "Patricia Taylor", rating: 0, meta: "Last: 5 Feb 2026", tags: [], outstanding: 0 },
  { id: "chris-g", name: "Christopher Garcia", rating: 0, meta: "Last: 2 Jan 2026", tags: ["Inactive"], outstanding: 0 },
  { id: "sarah", name: "Sarah Johnson", rating: 4.8, meta: "Next: 18 Mar, 11:00", tags: ["Regular"], outstanding: 0 },
  { id: "lisa", name: "Lisa Anderson", rating: 4.6, meta: "Next: 14 Apr, 13:00", tags: ["Regular"], outstanding: 45 },
  { id: "robert", name: "Robert Lee", rating: 4.4, meta: "Last: 2 Mar 2026", tags: [], outstanding: 30 },
];

// Saved cards on file for the current client — used by the checkout
// "Card on file" payment sheet. Empty list ⇒ the add-card flow opens directly.
export const savedCards = [
  { id: "visa-4242", brand: "Visa", last4: "4242", expiry: "08/27" },
  { id: "mc-8210", brand: "Mastercard", last4: "8210", expiry: "11/26" },
];

export const clientDetailTabs = ["Overview", "Bookings", "Forms", "Reviews"] as const;

export const pastAppointments = [
  { id: "p1", name: "Cut & Style", meta: "3 Mar 2026 · Emma S. · 60min · £85", status: "Completed", docs: 3 },
  { id: "p2", name: "Cut & Style", meta: "10 Feb 2026 · Emma S. · 60min · £85", status: "Completed", docs: 1 },
  { id: "p3", name: "Cut & Blow Dry", meta: "20 Jan 2026 · Emma S. · 45min · £75", status: "Completed", docs: 0 },
  { id: "p4", name: "Cut & Style", meta: "9 Dec 2025 · Alex M. · 60min · £85", status: "Cancelled", docs: 0 },
];

export const clientForms = [
  { id: "f1", name: "Consultation Form", meta: "Consent · 15 Jan 2024", appt: "Cut & Style — 3 Mar 2026", state: "view" },
  { id: "f2", name: "Allergy Questionnaire", meta: "Medical · 15 Jan 2024", appt: "Cut & Style — 3 Mar 2026", state: "view" },
  { id: "f3", name: "Aftercare Instructions", meta: "Aftercare · 16 Mar 2026", appt: "Cut & Style — 18 Mar 2026", state: "remind" },
  { id: "f4", name: "Pre-Appointment Checklist", meta: "Intake · Not sent", appt: "Cut & Style — 18 Mar 2026", state: "not-sent" },
] as const;

export const clientReviews = [
  { id: "r1", stars: 5, date: "3 Mar 2026", text: "Absolutely love my new colour! Emma always knows exactly what I want.", service: "Cut & Style" },
  { id: "r2", stars: 5, date: "10 Feb 2026", text: "Great experience as always. Very relaxing atmosphere.", service: "Cut & Style" },
  { id: "r3", stars: 4, date: "20 Jan 2026", text: "Lovely cut, just took a bit longer than expected.", service: "Cut & Blow Dry" },
];

// ── Up Next queue (Home / My Day live card) ──

export interface UpNextAppt {
  id: string;
  time: string;
  duration: string;
  client: string;
  initials: string;
  service: string;
  staff: string;
  price: number;
  tags: string[];
  note?: string;
  /** Deposit/prepayment taken at booking, in £ — shown as a credit in checkout. */
  deposit?: number;
}

export const upNextQueue: UpNextAppt[] = [
  {
    id: "sarah", time: "11:00 AM", duration: "1h 30m", client: "Sarah Johnson", initials: "SJ",
    service: "Cut & Colour", staff: "Emma S.", price: 140, tags: ["Allergy", "Form"],
    note: "Note attached", deposit: 40,
  },
  {
    id: "lisa", time: "1:00 PM", duration: "1h", client: "Lisa Anderson", initials: "LA",
    service: "Blow Dry & Style", staff: "Emma S.", price: 55, tags: [],
  },
  {
    id: "emily", time: "2:30 PM", duration: "1h", client: "Emily Davis", initials: "ED",
    service: "Cut & Colour", staff: "Emma S.", price: 140, tags: ["Form"],
  },
  {
    id: "amanda", time: "3:30 PM", duration: "1h", client: "Amanda White", initials: "AW",
    service: "Haircut", staff: "Emma S.", price: 65, tags: [],
  },
];

// ── Schedule ──

export interface AgendaRow {
  id: string;
  kind: "appt" | "now" | "break" | "upnext" | "gap" | "end";
  time?: string;
  end?: string;
  client?: string;
  service?: string;
  past?: boolean;
  label?: string;
  duration?: string;
}

export const myDayAgenda: AgendaRow[] = [
  { id: "a0", kind: "appt", time: "09:00", end: "10:00", client: "Robert Lee", service: "Cut & Style", past: true },
  { id: "now", kind: "now" },
  { id: "br", kind: "break", time: "10:00", label: "Lunch Break", duration: "60m" },
  { id: "up", kind: "upnext" }, // renders the live Up Next card
  { id: "a1", kind: "appt", time: "13:00", end: "14:00", client: "Lisa Anderson", service: "Blow Dry & Style" },
  { id: "g1", kind: "gap", time: "14:00", label: "30min open" },
  { id: "a2", kind: "appt", time: "14:30", end: "15:30", client: "Emily Davis", service: "Cut & Colour" },
  { id: "a3", kind: "appt", time: "15:30", end: "16:30", client: "Amanda White", service: "Haircut" },
  { id: "g2", kind: "gap", time: "16:30", label: "30min open" },
  { id: "end", kind: "end", label: "End of shift · 17:00" },
];

export interface GridBlock {
  start: number; // hour, 24h decimal (9.5 = 09:30)
  span: number; // hours
  name: string;
  service?: string;
  shade: "dark" | "mid" | "light" | "muted" | "outline";
  status?: string;
  // Discriminator for non-appointment blocks. Absent = ordinary appointment.
  // "processing" = a development/processing gap inside a service (e.g. colour
  // sitting) — shown as occupied "processing time", not a bookable open slot.
  kind?: "break" | "blocked" | "bundle" | "processing";
  bundleId?: string; // when kind === "bundle"
  outstanding?: boolean; // an unpaid balance is owed on this booking
}

// ── Bundles (packages of services sold together; the business sets the order
// and timing) — see the bundle booking page. ──
export interface BundleStep {
  service: string;
  staff: string;
  durationMin: number;
}
export interface BundleBooking {
  name: string;
  client: string;
  initials: string;
  staff: string; // lead staff (shown on the calendar block)
  services: BundleStep[];
  price: number; // bundle price
  rrp: number; // sum of the services bought separately
}
export const bundleBookings: Record<string, BundleBooking> = {
  "bun-glamour": {
    name: "Glamour Package",
    client: "Olivia Bennett",
    initials: "OB",
    staff: "Emma S.",
    services: [
      { service: "Cut & Colour", staff: "Emma S.", durationMin: 90 },
      { service: "Blow Dry & Style", staff: "Emma S.", durationMin: 60 },
      { service: "Gel manicure", staff: "Chris T.", durationMin: 45 },
    ],
    price: 200,
    rrp: 230,
  },
};

export const threeDayGrid: { day: string; date: string; blocks: GridBlock[] }[] = [
  {
    day: "Thu",
    date: "12",
    blocks: [
      { start: 9, span: 1, name: "Sarah Johnson", service: "Cut & Style", shade: "muted" },
      { start: 10, span: 1, name: "Lunch Break", shade: "light" },
      { start: 11, span: 1, name: "Jessica Brown", service: "Colour · application", shade: "mid" },
      { start: 12, span: 0.5, name: "Processing time", service: "Colour developing", shade: "light", kind: "processing" },
      { start: 12.5, span: 1, name: "Jessica Brown", service: "Colour · toner & finish", shade: "mid" },
      { start: 13.5, span: 1, name: "Lisa Anderson", service: "Blow Dry & Style", shade: "light", status: "Confirmed", outstanding: true },
      { start: 14.5, span: 0.5, name: "Noah Reed", service: "Haircut", shade: "muted", status: "No-show" },
      { start: 15, span: 2, name: "Emily Davis", service: "Cut & Colour", shade: "mid" },
    ],
  },
  {
    day: "Fri",
    date: "13",
    blocks: [
      { start: 9, span: 1, name: "Aiden Brooks", service: "Cut & Style", shade: "dark" },
      { start: 10.5, span: 1.5, name: "Ella Thompson", service: "Full Colour & Cut", shade: "mid" },
      { start: 13.5, span: 0.8, name: "Liam Scott", service: "Haircut", shade: "dark" },
      { start: 15, span: 0.5, name: "Zara Ali", shade: "light" },
      { start: 16.5, span: 1, name: "Harry Evans", service: "Cut & Beard", shade: "dark" },
    ],
  },
  {
    day: "Sat",
    date: "14",
    blocks: [
      { start: 9, span: 1, name: "Isla Cooper", service: "Cut & Style", shade: "dark" },
      { start: 10.5, span: 1, name: "Max Turner", service: "Haircut", shade: "dark" },
      { start: 13, span: 1.5, name: "Admin / paperwork", shade: "light", kind: "blocked", status: "Blocked" },
    ],
  },
  {
    day: "Sun",
    date: "15",
    blocks: [
      { start: 10, span: 3.25, name: "Glamour Package", service: "Olivia Bennett · 3 services", shade: "outline", status: "Bundle", kind: "bundle", bundleId: "bun-glamour" },
    ],
  },
  {
    day: "Mon",
    date: "16",
    blocks: [
      { start: 10, span: 1.5, name: "Priya Nair", service: "Colour Treatment", shade: "mid" },
      { start: 13, span: 1, name: "Lunch Break", shade: "light" },
      { start: 14.5, span: 1, name: "Oscar Reid", service: "Cut & Beard", shade: "dark" },
    ],
  },
  {
    day: "Tue",
    date: "17",
    blocks: [
      { start: 9.5, span: 1, name: "Nina Foster", service: "Blow Dry & Style", shade: "light" },
      { start: 12, span: 2, name: "Ava Hughes", service: "Cut & Colour", shade: "mid" },
      { start: 15.5, span: 1, name: "Leo Walsh", service: "Haircut", shade: "dark" },
    ],
  },
  {
    day: "Wed",
    date: "18",
    blocks: [
      { start: 9, span: 1, name: "Sarah Johnson", service: "Cut & Style", shade: "dark" },
      { start: 11, span: 1, name: "Lunch Break", shade: "light" },
      { start: 13.5, span: 1.5, name: "Grace Lee", service: "Colour Treatment", shade: "mid" },
    ],
  },
];

// Safety/admin notes surfaced prominently on the appointment sheet.
export const clientNotes: Record<string, { allergies?: string[]; formNote?: string }> = {
  "Sarah Johnson": {
    allergies: ["Sensitive scalp", "PPD allergy"],
    formNote: "Consultation form not completed",
  },
  "Jessica Brown": { allergies: ["Nut oils"] },
  "Emily Davis": { formNote: "Aftercare form not sent" },
};

// Contact details surfaced on the booking page client card (quick call/text).
export const clientContacts: Record<string, { phone: string; email?: string }> = {
  "Sarah Johnson": { phone: "(555) 234-5678", email: "sarah.j@email.com" },
  "Emily Davis": { phone: "(555) 102-4471", email: "emily.d@email.com" },
  "Jessica Brown": { phone: "(555) 778-1290" },
  "Amanda White": { phone: "(555) 332-0091" },
  "Michael Chen": { phone: "(555) 640-2210" },
  "Lisa Anderson": { phone: "(555) 419-7733" },
};
export const contactFor = (name: string) =>
  clientContacts[name] ?? { phone: "(555) 000-0000" };

// Tag presets offered when tagging a client from the booking page.
export const tagPresets = [
  "VIP", "Regular", "New client", "Sensitive", "Allergy", "Deposit required",
  "No-show risk", "Loyalty member", "Student", "Senior", "Referral", "Walk-in",
  "Colour client", "Patch test due",
];

// Form templates that can be attached to a booking, grouped for filtering.
export const formCategories = ["All", "Consultation", "Medical", "Consent", "Intake", "Aftercare"] as const;
export const formTemplates: { name: string; category: string }[] = [
  { name: "Consultation form", category: "Consultation" },
  { name: "Allergy questionnaire", category: "Medical" },
  { name: "Medical history", category: "Medical" },
  { name: "Patch test consent", category: "Consent" },
  { name: "Photo & marketing consent", category: "Consent" },
  { name: "GDPR consent", category: "Consent" },
  { name: "Minor consent form", category: "Consent" },
  { name: "Pre-appointment checklist", category: "Intake" },
  { name: "New client intake", category: "Intake" },
  { name: "Aftercare instructions", category: "Aftercare" },
];

// Templates for scheduling a class from the calendar.
export const classTemplates = [
  { id: "colour-mc", emoji: "🎨", name: "Colour Masterclass", sub: "90m · £65 per seat · 8 seats" },
  { id: "blowdry", emoji: "💨", name: "Blow Dry Basics", sub: "60m · £40 per seat · 6 seats" },
  { id: "bridal", emoji: "💍", name: "Bridal Trial Workshop", sub: "120m · £80 per seat · 4 seats" },
];

// Team calendar columns. `hours` shows that day's working hours in the column
// header (replacing the job title); `off` marks staff not working today — hidden
// by default but selectable from settings so an owner can call them in.
// `weekBookings` (Mon→Sun) drives the team week overview: each day is either a
// list of condensed bookings or "off" (not working that day).
export interface WeekBooking { time: string; client: string; service: string; }
export interface TeamColumn {
  id: string;
  initials: string;
  name: string;
  role: string;
  hours: string;
  off?: boolean;
  weekBookings: (WeekBooking[] | "off")[];
  blocks: (GridBlock & { price?: string })[];
}

export const teamColumns: TeamColumn[] = [
  {
    id: "emma",
    initials: "ES",
    name: "Emma S.",
    role: "Senior Stylist",
    hours: "09:00 – 17:00",
    weekBookings: [
      [ { time: "09:00", client: "Sarah Johnson", service: "Cut & Style" }, { time: "11:00", client: "Jessica Brown", service: "Colour" }, { time: "14:30", client: "Emily Davis", service: "Cut & Colour" } ],
      [ { time: "09:30", client: "Olivia Bennett", service: "Blow Dry" }, { time: "13:00", client: "Lisa Anderson", service: "Colour" } ],
      [ { time: "10:00", client: "Mia Clark", service: "Cut & Style" }, { time: "15:00", client: "Grace Lee", service: "Colour" } ],
      [ { time: "09:00", client: "Nadia Khan", service: "Trim" }, { time: "12:00", client: "Nina Patel", service: "Balayage" }, { time: "16:00", client: "Zoe Reed", service: "Blow Dry" } ],
      [ { time: "09:00", client: "Amara Okafor", service: "Colour" }, { time: "11:30", client: "Ruby Shah", service: "Cut" }, { time: "14:00", client: "Eva Lin", service: "Updo" } ],
      [ { time: "10:00", client: "Holly Day", service: "Cut & Colour" }, { time: "13:30", client: "Ivy Cole", service: "Blow Dry" } ],
      "off",
    ],
    blocks: [
      { start: 9, span: 1, name: "Sarah Johnson", service: "Cut & Style", shade: "muted", status: "Done", price: "60m · £85" },
      { start: 10, span: 1, name: "Lunch Break", shade: "light" },
      { start: 11, span: 2, name: "Jessica Brown", service: "Colour Treatment", shade: "dark", status: "Confirmed", price: "120m · £180" },
      { start: 13, span: 1, name: "Lisa Anderson", service: "Blow Dry & Style", shade: "dark", status: "Confirmed", price: "60m · £55" },
      { start: 14.5, span: 2, name: "Emily Davis", service: "Cut & Colour", shade: "dark", status: "Confirmed", price: "120m · £210" },
    ],
  },
  {
    id: "alex",
    initials: "AM",
    name: "Alex M.",
    role: "Barber",
    hours: "09:00 – 16:00",
    weekBookings: [
      "off",
      [ { time: "09:30", client: "Robert Lee", service: "Skin fade" }, { time: "13:15", client: "James Miller", service: "Beard trim" } ],
      [ { time: "10:00", client: "Leo Carter", service: "Cut" }, { time: "12:30", client: "Sam Ortiz", service: "Skin fade" }, { time: "15:00", client: "Dan Webb", service: "Beard" } ],
      [ { time: "09:00", client: "Theo Marsh", service: "Cut" }, { time: "14:00", client: "Owen Hale", service: "Skin fade" } ],
      [ { time: "09:00", client: "Max Turner", service: "Cut" }, { time: "11:00", client: "Liam Scott", service: "Beard" }, { time: "13:30", client: "Harry Evans", service: "Cut & Beard" }, { time: "16:00", client: "Jay Cole", service: "Skin fade" } ],
      [ { time: "10:00", client: "Noah Reed", service: "Cut" }, { time: "12:00", client: "Kai Brooks", service: "Skin fade" }, { time: "14:30", client: "Reece Day", service: "Beard" } ],
      [ { time: "11:00", client: "Walk-in", service: "Open chair" } ],
    ],
    blocks: [
      { start: 9.5, span: 0.8, name: "Robert Lee", shade: "muted", status: "Done" },
      { start: 10.5, span: 0.8, name: "Michael Chen", shade: "muted", status: "No-show" },
      { start: 11.2, span: 1.3, name: "Lunch Break", shade: "light" },
      { start: 13.2, span: 0.8, name: "James Miller", shade: "dark", status: "Confirmed" },
      { start: 14, span: 1.5, name: "Colour Masterclass", service: "6/8 booked", shade: "outline", status: "Class" },
    ],
  },
  {
    id: "chris",
    initials: "CT",
    name: "Chris T.",
    role: "Stylist",
    hours: "09:00 – 17:00",
    weekBookings: [
      [ { time: "09:00", client: "Olivia Bennett", service: "Glamour pkg" }, { time: "13:00", client: "Amanda White", service: "Cut" } ],
      [ { time: "11:30", client: "Amanda White", service: "Blow Dry" }, { time: "15:00", client: "Thomas Moore", service: "Cut" } ],
      "off",
      [ { time: "10:00", client: "Priya Nair", service: "Colour" }, { time: "14:00", client: "Sofia Khan", service: "Cut & Colour" } ],
      [ { time: "09:30", client: "Ella Thompson", service: "Full colour" }, { time: "13:00", client: "Isla Cooper", service: "Cut" } ],
      [ { time: "10:00", client: "Aiden Brooks", service: "Cut & Style" } ],
      "off",
    ],
    blocks: [
      { start: 9, span: 2.4, name: "Glamour Package", service: "3 services", shade: "outline", status: "Bundle", kind: "bundle", bundleId: "bun-glamour" },
      { start: 11.5, span: 1.2, name: "Amanda White", shade: "dark", status: "Confirmed" },
      { start: 13, span: 1, name: "David Wilson", shade: "dark", status: "Unconfirmed", outstanding: true },
      { start: 14.2, span: 0.6, name: "Break", shade: "light", kind: "break" },
      { start: 15, span: 1.2, name: "Thomas Moore", shade: "dark", status: "Confirmed" },
    ],
  },
  {
    id: "priya",
    initials: "PS",
    name: "Priya S.",
    role: "Stylist",
    hours: "Day off",
    off: true,
    weekBookings: [
      [ { time: "09:30", client: "Hannah Lee", service: "Cut & Colour" }, { time: "13:00", client: "Maya Singh", service: "Blow Dry" } ],
      "off",
      [ { time: "10:00", client: "Freya Watts", service: "Balayage" }, { time: "14:30", client: "Lily Cho", service: "Trim" } ],
      [ { time: "09:00", client: "Ava Reid", service: "Colour" }, { time: "12:00", client: "Erin Ford", service: "Cut" }, { time: "15:30", client: "Tara Bose", service: "Blow Dry" } ],
      [ { time: "09:00", client: "Demi Stone", service: "Cut & Colour" }, { time: "13:00", client: "Cara Lyn", service: "Updo" } ],
      [ { time: "10:00", client: "Beth Cole", service: "Colour" }, { time: "14:00", client: "Sana Ali", service: "Cut" } ],
      "off",
    ],
    blocks: [],
  },
  {
    id: "jordan",
    initials: "JK",
    name: "Jordan K.",
    role: "Junior Stylist",
    hours: "Day off",
    off: true,
    weekBookings: [
      [ { time: "10:00", client: "Ben Pryce", service: "Cut" } ],
      "off",
      [ { time: "11:00", client: "Cody Ray", service: "Skin fade" }, { time: "15:00", client: "Eli Mason", service: "Cut" } ],
      [ { time: "09:30", client: "Finn Doyle", service: "Cut" }, { time: "13:00", client: "Gus Wood", service: "Beard" } ],
      [ { time: "10:00", client: "Hugo Bell", service: "Cut" }, { time: "14:00", client: "Ira Knott", service: "Skin fade" } ],
      [ { time: "11:00", client: "Jude Frost", service: "Cut" } ],
      "off",
    ],
    blocks: [],
  },
];

// Bookings with an active payment dispute — surfaces an urgency banner on the
// appointment card (prototype: keyed by client name).
export const disputedClients = ["David Wilson"];

export const masterclass = {
  name: "Colour Masterclass",
  offerId: "cls_colour_masterclass",
  badge: "Scheduled",
  sub: "Seat based class · £65 per seat",
  time: "17:00 – 18:30",
  staff: "Emma S.",
  location: "Main Studio",
  booked: 6,
  capacity: 8,
  agenda: ["Consultation & strand tests", "Mixing ratios and application", "Toning, gloss and aftercare"],
  note: "Bring your own tint brushes — colour kits and models provided.",
  attendees: [
    { id: "mp", initials: "MP", name: "Maya Patel", status: "Paid · waiver signed", warn: false },
    { id: "tc", initials: "TC", name: "Theo Clarke", status: "Deposit paid", warn: false },
    { id: "im", initials: "IM", name: "Isla Morgan", status: "Awaiting waiver", warn: true },
    { id: "sk", initials: "SK", name: "Sofia Khan", status: "Paid · waiver signed", warn: false },
    { id: "rl", initials: "RL", name: "Robert Lee", status: "Unpaid · collect", warn: true },
    { id: "gl", initials: "GL", name: "Grace Lee", status: "Paid · waiver signed", warn: false },
  ],
};

// ── Messages ──

export type ConversationKind = "client" | "group" | "business" | "class";

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  kind: ConversationKind;
  /** Secondary line — phone substitute in the thread header, members, supplier label. */
  sub?: string;
  /** Avatar stack for group / class conversations. */
  members?: { initials: string }[];
  /** Ended class chats are auto-archived: read-only and dimmed in the list. */
  archived?: boolean;
};

export const conversations: Conversation[] = [
  // Clients — 1:1 booking conversations
  { id: "emily", name: "Emily Davis", preview: "Maybe Thursday the 9th? I'll confirm later today", time: "Today, 09:45", unread: 2, kind: "client" },
  { id: "sarah", name: "Sarah Johnson", preview: "Thanks! See you then 😊", time: "Today, 08:12", unread: 0, kind: "client" },
  { id: "robert", name: "Robert Lee", preview: "Yes please — can I come in next week?", time: "Yesterday", unread: 1, kind: "client" },
  { id: "lisa", name: "Lisa Anderson", preview: "Perfect, see you there!", time: "27 Feb", unread: 0, kind: "client" },
  { id: "amanda", name: "Amanda White", preview: "Looking forward to my appointment!", time: "25 Feb", unread: 0, kind: "client" },
  { id: "jessica", name: "Jessica Brown", preview: "Could I add the patch test to my booking?", time: "24 Feb", unread: 0, kind: "client" },
  // Team & business — internal chat, class groups, suppliers
  {
    id: "team", name: "Salon team", preview: "Emma: I'll cover the 2pm colour 👍", time: "Today, 10:02", unread: 3, kind: "group",
    sub: "Emma, Alex, Chris, Priya, Jordan",
    members: [{ initials: "ES" }, { initials: "AM" }, { initials: "CT" }, { initials: "PS" }, { initials: "JK" }],
  },
  {
    id: "cls-colour", name: "Colour Masterclass", preview: "You: Doors open at 4:45 — see you all soon!", time: "Today, 09:20", unread: 0, kind: "class",
    sub: "6 attendees · Today 17:00",
    members: [{ initials: "MP" }, { initials: "TC" }, { initials: "IM" }, { initials: "SK" }, { initials: "RL" }, { initials: "GL" }],
  },
  {
    id: "supplier", name: "Bloom Hair Supplies", preview: "Your colour stock order ships Monday.", time: "2 Mar", unread: 0, kind: "business",
    sub: "Supplier",
  },
  {
    id: "cls-bridal", name: "Bridal Hair Workshop", preview: "You: Thank you all — the recording is in your inbox 💐", time: "28 Feb", unread: 0, kind: "class",
    sub: "Ended 28 Feb · 5 attendees", archived: true,
    members: [{ initials: "HD" }, { initials: "IC" }, { initials: "ZR" }, { initials: "NK" }, { initials: "EL" }],
  },
];

export const notificationGroups = [
  {
    label: "Today",
    items: [
      { id: "n1", kind: "request", who: "CM", title: "Message request", body: "Chloe Martin wants to message Salon Soho — she found you through search." },
      { id: "n2", kind: "promo", title: "New in ThatTime", body: "Week view is here — see your whole week at a glance in the Schedule.", cta: "Try it" },
      { id: "n3", kind: "favourite", title: "New favourite", body: "Amanda White added Salon Soho to her favourites." },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "n4", kind: "cancel", who: "FD", title: "Cancellation Request", body: "James Smith Canceled Facial Treatment at 10:00 – 24/11/26" },
      { id: "n5", kind: "booking", who: "HD", title: "New Booking", body: "Michael Brown Booked Haircut & Beard Trim at 11:00 – 26/11/26" },
      { id: "n6", kind: "blog", title: "From the ThatTime blog", body: "5 ways to fill last-minute gaps in your calendar", meta: "4 min read · Read" },
      { id: "n7", kind: "review", who: "ID", title: "Client Feedback", body: "Jessica White Left Review: “Amazing service! Will come back!” on 22/11/26" },
    ],
  },
  {
    label: "23 January",
    items: [
      { id: "n8", kind: "reschedule", who: "GD", title: "Rescheduled Appointment", body: "Sarah Johnson Rescheduled Manicure to 15:00 – 25/11/26" },
      { id: "n9", kind: "blog", title: "From the ThatTime blog", body: "Pricing psychology: what your service menu says about you", meta: "6 min read · Read" },
      { id: "n10", kind: "cancel", who: "FD", title: "Cancelled Booking", body: "John Smith Cancelled Haircut at 10:00 – 22/11/26" },
      { id: "n11", kind: "promo", title: "ThatTime update", body: "Faster checkout, client merge tools and bug fixes in version 3.2.", cta: "What's new" },
    ],
  },
];

export const blockTypes = [
  { id: "custom", emoji: "✏️", name: "Custom", sub: "New blocked time" },
  { id: "lunch", emoji: "🥪", name: "Lunch", sub: "30 min · Unpaid" },
  { id: "break", emoji: "☕", name: "Break", sub: "15 min · Paid" },
  { id: "training", emoji: "📚", name: "Training", sub: "60 min · Paid" },
  { id: "admin", emoji: "🗂️", name: "Admin", sub: "30 min · Paid" },
];

export const traitChips = [
  "Punctual",
  "Quite",
  "Late arrival",
  "No-show",
  "Easy to work with",
  "Needs extra time",
  "Talkative",
];
