// Shared demo data for the Jun 17 product sign-off refinements. These objects
// keep cross-screen prototype states aligned without wiring a backend.

import type { FeeBearer } from "@/lib/store/appStore";

export type AppointmentType = "salon" | "mobile" | "online";
export type DiscountCodeType = "percent" | "amount";
export type EntitlementKind = "package" | "subscription";

export interface DiscountCode {
  id: string;
  code: string;
  label: string;
  type: DiscountCodeType;
  value: number;
  scope: string;
  status: "active" | "scheduled" | "expired";
}

export interface EntitlementBalance {
  id: string;
  client: string;
  kind: EntitlementKind;
  name: string;
  purchased: number;
  used: number;
  remaining: number;
  value: number;
  appliesTo: string[];
  renewal?: string;
}

export interface WaitlistCandidate {
  id: string;
  name: string;
  initials: string;
  service: string;
  preference: string;
  note: string;
}

export interface AppointmentActivityEvent {
  id: string;
  time: string;
  title: string;
  body: string;
  kind: "booking" | "payment" | "form" | "message" | "policy" | "edit" | "dispute";
}

export interface NotificationChannelSetting {
  id: string;
  label: string;
  description: string;
  push: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  paid: boolean;
}

export interface ClientUpcomingAppointment {
  id: string;
  service: string;
  date: string;
  time: string;
  staff: string;
  price: number;
  status: "confirmed" | "pending" | "recurring";
}

export const appointmentTypes: { id: AppointmentType; label: string; sub: string }[] = [
  { id: "salon", label: "In salon", sub: "Client comes to Salon Soho" },
  { id: "mobile", label: "Mobile", sub: "At-home visit with travel notes" },
  { id: "online", label: "Online", sub: "Virtual appointment link required" },
];

export const discountCodes: DiscountCode[] = [
  { id: "bf20", code: "BLACKFRIDAY20", label: "Black Friday 20%", type: "percent", value: 20, scope: "All services · expires 30 Nov", status: "active" },
  { id: "vip15", code: "VIP15", label: "VIP client 15%", type: "percent", value: 15, scope: "Tagged VIP clients", status: "active" },
  { id: "colour10", code: "COLOUR10", label: "£10 colour credit", type: "amount", value: 10, scope: "Colour services only", status: "active" },
];

export const entitlementBalances: EntitlementBalance[] = [
  {
    id: "pkg-sarah-cuts",
    client: "Sarah Johnson",
    kind: "package",
    name: "10 Cut & Style sessions",
    purchased: 10,
    used: 7,
    remaining: 3,
    value: 85,
    appliesTo: ["Cut & Style", "Cut & Colour", "Haircut"],
  },
  {
    id: "sub-lisa-glow",
    client: "Lisa Anderson",
    kind: "subscription",
    name: "Glow Club monthly",
    purchased: 4,
    used: 2,
    remaining: 2,
    value: 55,
    renewal: "Renews 1 Apr",
    appliesTo: ["Blow Dry & Style", "Cut & Style"],
  },
];

export const waitlistCandidates: WaitlistCandidate[] = [
  { id: "wb1", name: "Maya Patel", initials: "MP", service: "Cut & Colour", preference: "Any weekday after 3pm", note: "Can take the freed slot with 1h notice" },
  { id: "wb2", name: "Nina Foster", initials: "NF", service: "Blow Dry & Style", preference: "Today only", note: "Already requested a cancellation slot" },
  { id: "wb3", name: "Chloe Martin", initials: "CM", service: "Patch test", preference: "Before Friday", note: "New client request waiting in messages" },
];

export const appointmentActivity: AppointmentActivityEvent[] = [
  { id: "a1", time: "09:05", title: "Booking confirmed", body: "Emma S. accepted the booking request for Cut & Colour.", kind: "booking" },
  { id: "a2", time: "09:06", title: "Deposit paid", body: "£40 deposit paid by card on file. Balance remains due at checkout.", kind: "payment" },
  { id: "a3", time: "09:08", title: "Consultation form sent", body: "Form sent by SMS and email. Client has not completed it yet.", kind: "form" },
  { id: "a4", time: "10:12", title: "Reminder read", body: "Appointment reminder opened by Sarah Johnson.", kind: "message" },
  { id: "a5", time: "10:21", title: "Policy snapshot", body: "24h cancellation policy captured for evidence tracking.", kind: "policy" },
];

export const clientUpcomingAppointments: ClientUpcomingAppointment[] = [
  { id: "u1", service: "Cut & Style", date: "18 Mar 2026", time: "11:00", staff: "Emma S.", price: 85, status: "confirmed" },
  { id: "u2", service: "Colour refresh", date: "1 Apr 2026", time: "14:30", staff: "Emma S.", price: 140, status: "recurring" },
  { id: "u3", service: "Patch test", date: "8 Apr 2026", time: "09:30", staff: "Alex M.", price: 0, status: "pending" },
  { id: "u4", service: "Cut & Style", date: "15 Apr 2026", time: "11:00", staff: "Emma S.", price: 85, status: "recurring" },
];

export const notificationChannelSettings: NotificationChannelSetting[] = [
  { id: "booking-confirmed", label: "Booking confirmations", description: "Sent when a booking is accepted or changed", push: true, email: true, sms: true, whatsapp: false, paid: true },
  { id: "appointment-reminder", label: "Appointment reminders", description: "Before-visit nudges and read receipts", push: true, email: true, sms: true, whatsapp: true, paid: true },
  { id: "payment-link", label: "Payment links", description: "Deposit and outstanding-balance requests", push: true, email: true, sms: true, whatsapp: false, paid: true },
  { id: "form-request", label: "Forms and consent", description: "Consultation, insurer, and prescriber forms", push: true, email: true, sms: false, whatsapp: true, paid: true },
];

export const messagePermissionOptions = [
  { id: "before", label: "Before booking", sub: "Prospects can message before they book" },
  { id: "after", label: "After booking only", sub: "Default: clients need a booking, package, or subscription first" },
  { id: "off", label: "Disabled", sub: "Clients cannot start conversations" },
] as const;

export const clientPlatformFeeOptions: { id: FeeBearer | "inherit"; label: string; sub: string }[] = [
  { id: "inherit", label: "Inherit business default", sub: "Business default: you absorb the fee" },
  { id: "client", label: "Client pays", sub: "Added to this client's bill" },
  { id: "split", label: "Split 50/50", sub: "Shared between salon and client" },
  { id: "absorb", label: "You absorb", sub: "Taken from payout" },
];

export const bookingDefaults = {
  deposit: { type: "percent" as const, value: 25, linkLimitHours: 24 },
  cancellationPolicy: "24h notice · calculated fee £40 deposit",
  recurring: ["Doesn't repeat", "Weekly", "Fortnightly", "Monthly"],
};
