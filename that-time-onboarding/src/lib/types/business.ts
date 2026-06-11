// ── Core business domain ─────────────────────────────────────────────
// Canonical home for the enums collected during onboarding and consumed
// across the product. store.ts re-exports these for backward compatibility.
//
// NOTE: "Vertical" (the business's trade, chosen in onboarding) and the
// service "Category" palette (src/lib/tokens/categories.ts) are deliberately
// SEPARATE taxonomies — a Hair Salon vertical offers Hair, Colour, Beauty…
// categories. Map between them rather than conflating.

export type Vertical =
  | "Hair Salon"
  | "Barbershop"
  | "Nails"
  | "Beauty"
  | "Spa"
  | "Wellness"
  | "Fitness"
  | "Other"
  | "";

export type LocationType =
  | "shop"
  | "mobile"
  | "home"
  | "multiple"
  | "virtual"
  | "";

/** A concrete way of working — location type with the "unset" option removed. */
export type WorkModel = Exclude<LocationType, "">;

export type TeamSize = "solo" | "2-5" | "6-10" | "11+" | "";

export type StaffSetupIntent =
  | "invite_now"
  | "invite_later"
  | "not_yet"
  | "unsure"
  | "";

export type ComingFrom =
  | "Fresha"
  | "Booksy"
  | "Square"
  | "GlossGenius"
  | "Treatwell"
  | "Pen & paper"
  | "Instagram DMs"
  | "Just starting out"
  | "Something else"
  | "";

export type BookingVolume = "starting" | "1-10" | "11-30" | "31+" | "";

export type BillingPlan = "team" | "solo";

// ── Locations & delivery ─────────────────────────────────────────────

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
}

export interface MobileProfile {
  baseAddress: string;
  radiusMiles: number;
  feeType: "flat" | "perMile";
  feeAmount: number;
  noticeValue: number;
  noticeUnit: "hours" | "days";
  /** Travel buffer (minutes) added around each booking to avoid back-to-backs. */
  travelBufferMin: number;
}

export interface RemotePlatform {
  key: "zoom" | "meet" | "phone" | "teams" | "custom";
  label: string;
  desc: string;
}

// ── Booking rules & defaults ─────────────────────────────────────────

export interface Duration {
  value: number;
  unit: "hours" | "days" | "weeks" | "months";
}

export type CancellationType = "flexible" | "moderate" | "strict";

export interface CancellationPolicy {
  type: CancellationType;
  customText: string;
}

export interface PaymentMethods {
  card: boolean;
  cash: boolean;
  transfer: boolean;
  bnpl: boolean;
}

export interface DepositRule {
  required: boolean;
  amount: string;
  unit: string;
  whenCharged: "booking" | "before";
  daysBefore: number;
}

/** Business-level defaults that service-level settings inherit from. */
export interface BusinessDefaults {
  leadTime: Duration;
  maxAdvance: Duration;
  buffer: { before: number; after: number };
  cancellation: CancellationPolicy;
  /** null = unlimited */
  rescheduleLimit: number | null;
  paymentMethods: PaymentMethods;
  deposit: DepositRule;
}

/**
 * Service-level settings. Inheritable fields are `null` to mean "inherit the
 * business default"; non-inheritable fields carry real values. Resolve with
 * `effective(override, businessDefault)`.
 */
export interface ServiceSettings {
  onlineBooking: boolean;
  whoCanBook: "anyone" | string;
  prescriptionRequired: boolean;
  leadTime: Duration | null;
  maxAdvance: Duration | null;
  buffer: { before: number; after: number } | null;
  cancellation: CancellationPolicy | null;
  clientReschedulingEnabled: boolean;
  rescheduleLimit: number | null;
  paymentMethods: PaymentMethods | null;
  deposit: DepositRule | null;
  payOnArrival: boolean;
  payAfterService: boolean;
}
