// ── Offer domain ─────────────────────────────────────────────────────
// An "offer" is anything sellable: a one-off service, a class/course, a
// bundle, or a subscription. Mirrors the legacy that-time-app
// src/data/offerTypes.js. The per-type `*Details` configs are large and
// feature-local — Bundle/Subscription are typed here; the much larger
// ClassDetails is intentionally DEFERRED and fully typed when the class
// wizard/dashboard screens are ported (Phase 4).

export type OfferType = "service" | "class" | "bundle" | "subscription";

export type PricingType = "free" | "fixed" | "from" | "poa";

/** Copy/labels driving the wizard + dashboard chrome for each offer type. */
export interface OfferTypeMeta {
  label: string;
  plural: string;
  singular: string;
  noun: string;
  basicsHint: string;
  namePlaceholder: string;
  priceLabel?: string;
  priceHint?: string;
  createLabel: string;
  dashboardTitleFallback: string;
}

// ── Bundle ───────────────────────────────────────────────────────────

export interface PackageTier {
  minimumSelections: number;
  discountPercent: string;
}

export interface BundleDetails {
  bundleKind: "services" | string;
  includedServiceIds: string[];
  quantity: number;
  minimumSelections: number;
  packageDiscountPercent: string;
  packageTiers: PackageTier[];
  priceMode: "fixed" | string;
  discountPercent: string;
  durationMode: "sum" | "custom" | string;
  customDurationMin: number;
  bookingBehavior: "single_booking" | string;
  serviceTimings: Record<string, unknown>;
}

// ── Subscription ─────────────────────────────────────────────────────

export interface SubscriptionDetails {
  subscriptionType: "frequency" | string;
  billingPeriod: "week" | "month" | "quarter" | "year";
  benefitType: "sessions" | string;
  includedItemIds: string[];
  includedProductIds: string[];
  includedSessions: number;
  unlimitedUsage: boolean;
  frequencyPeriod: "week" | "month" | "quarter" | "year";
  cooldown: { enabled: boolean; value: string; unit: "days" | "weeks" | string };
  storeCreditAmount: string;
  memberDiscountPercent: string;
  productDiscountPercent: string;
  accessRule: "member_only" | string;
  joiningFeeEnabled: boolean;
  joiningFee: string;
  minimumTermMonths: string;
  creditBonusEnabled: boolean;
  creditBonusPercent: string;
  creditSpendMode: "all" | string;
  cancellationNotice: { value: string; unit: "days" | "weeks" | string };
  cancellationRule: "cancel_anytime" | string;
  pauseRule: { enabled: boolean; maxDays: string; noticeDays: string };
  rollover: boolean;
}

// ── Class — DEFERRED ─────────────────────────────────────────────────
// The full classDetails shape has 40+ nested config groups (sessions,
// staffing, models, certificates, pricing variants…). Typing it now would
// be guesswork ahead of porting its screens. Top-level discriminators are
// declared; the rest stays open until Phase 4 fills it in.
export interface ClassDetails {
  bookingStructure: "seat_based" | "private_group";
  visibilityMode: "marketplace" | "private_link";
  classStructure: "single_session" | "multi_session" | "";
  deliveryMethod: "in_person" | "online" | "mixed" | "";
  difficulty: "all" | "beginner" | "intermediate" | "advanced";
  capacity: number;
  pricingType: PricingType;
  calendarColor: string;
  // TODO(phase-4): type the remaining sessions/staffing/models/certificate
  // /pricing-variant groups as the class screens are ported.
  [key: string]: unknown;
}

// ── Offer ────────────────────────────────────────────────────────────

export type OfferDetails =
  | { type: "service" }
  | { type: "class"; details: ClassDetails }
  | { type: "bundle"; details: BundleDetails }
  | { type: "subscription"; details: SubscriptionDetails };

/** A sellable offer. `categoryName` keys into the service-category palette. */
export interface Offer {
  id: string;
  type: OfferType;
  name: string;
  categoryName?: string;
  pricingType: PricingType;
  price?: string;
}
