// THE canonical catalogue — "what this business sells". Demo offers ported
// (typed) from the legacy that-time-app src/data/demoServices.js, using the
// shared OfferType contract. The product-screen lists in lib/data/product.ts
// (services, serviceCategories) are derived from here — add/edit offers in
// this file only.
import type { OfferType } from "@/lib/types";
import type { MobileSettings, RemoteSettings, ClassDraft, SubscriptionDraft, BundleLink } from "@/lib/store/wizardStore";

/** A pricing variant created in the Variants setup flow. */
export type VariantType = "duration" | "time" | "staff" | "location" | "role";

/** Shared price adjustment: markup or discount, as a £ amount or a % of base. */
export interface VariantPrice {
  mode: "add" | "discount";
  unit: "fixed" | "percent";
  amount: string;
}

/** Optional "only available when…" restrictions applied to a variant. */
export interface VariantWhen {
  staffIds: string[];
  days: string[]; // "Mon".."Sun"
  timeFrom: string;
  timeTo: string;
  allDayWhen: boolean;
  locationIds: string[];
}

/** A notification stage (Notifications module) — channels per booking stage. */
export interface NotifStage {
  id: string;
  label: string;
  channels: string[]; // "Email" | "SMS"
  inherited: boolean; // true = using the business default
}

/** Per-offer setting overrides (Settings module). Undefined value = inherit default. */
export interface OfferSettings {
  onlineBooking?: boolean;
  prescription?: boolean;
  clientReschedule?: boolean;
  payOnArrival?: boolean;
  payAfterService?: boolean;
  whoCanBook?: string;
  leadTime?: string;
  maxAdvance?: string;
  buffer?: string;
  cancellation?: string;
  rescheduleLimit?: string;
  payment?: string;
}

/** A room/equipment attached to an offer (Resources module). */
export interface OfferResource {
  id: string; // catalog resource id
  auto: boolean; // attached automatically (room via its equipment, or equipment via its room)
  reservation: "whole" | "partial";
  bufferBefore: string;
  bufferAfter: string;
  note: string;
}

/** An upsell group (Related services module) — a 3-step builder. */
export interface UpsellAudience {
  gender: string[];
  history: string[];
  engagement: string[];
}
export interface UpsellGroup {
  id: string;
  name: string;
  serviceIds: string[];
  discountOn: boolean;
  discountAmount: string;
  discountUnit: "fixed" | "percent";
  socialProof: boolean;
  audience: UpsellAudience;
}

/** A product-preference group asked of the client (Product preferences module). */
export interface PrefProduct {
  id: string; // catalog product id
  price: string; // "" = included; otherwise a +£ surcharge amount
  durationMin?: number; // extra time added when this product is chosen
}
export interface ProductPref {
  id: string;
  question: string;
  selectMode: "single" | "multi";
  required: boolean;
  products: PrefProduct[];
}

/** Single-service package deal, e.g. 10 haircuts with 10% off the total. */
export interface ServiceBundleOption {
  id: string;
  name: string;
  quantity: number;
  pricingMode: "percent" | "fixed";
  discountPercent: string;
  fixedPrice: string;
  active: boolean;
}

export interface ClassRequirements {
  courseLevel: "na" | "beginner" | "intermediate" | "advanced";
  ageLimits: boolean;
  minAge: string;
  maxAge: string;
  qualificationRequired: boolean;
  qualificationRequirement: string;
  insuranceProof: boolean;
  insuranceInstructions: string;
  studentDeclarations: boolean;
  declarationText: string;
  preparationInstructions: boolean;
  preparationText: string;
  eligibilityNotes: boolean;
  eligibilityNotesText: string;
}

export interface ClassAgendaItem {
  id: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export interface ClassMaterial {
  id: string;
  title: string;
  attachTo: string;
  type: "pdf" | "pre_read" | "preparation" | "course_structure" | "other";
  access: "before_booking" | "after_booking" | "internal";
  notes: string;
  fileName: string;
}

export interface ClassCertificate {
  enabled: boolean;
  name: string;
  issueRule: "completion" | "attendance" | "assessment";
  expiryMonths: string;
  notes: string;
  passCriteria?: string;
}

export interface ClassModels {
  enabled: boolean;
  gender: string;
  minAge: string;
  maxAge: string;
  require18: boolean;
  candidateRequirements: string;
  evidenceRequired: boolean;
  evidencePrompt: string;
  suitabilityConfirmation: string;
  modelsPerStudent: string;
  applicationCap: string;
  applicationDeadline: string;
  safetyCheck: boolean;
  noShowFee: string;
  applicationLink: string;
}

export interface OfferVariant {
  id: string;
  type: VariantType;
  name: string;
  price: VariantPrice;
  /** Duration in minutes — the tier duration, or an override for staff/etc. */
  durationMin?: number;
  durationOverride?: boolean;
  /** staff / location / role variants: the entity this applies to. */
  entityId?: string;
  entityLabel?: string;
  entitySub?: string;
  /** time & day variants. */
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  allDay?: boolean;
  /** "Only available when…" restrictions. */
  when?: VariantWhen;
}

export interface DemoOffer {
  id: string;
  type: OfferType;
  name: string;
  category: string;
  price: string;
  durationMin?: number;
  status: "published" | "draft";
  /** Optional glyph key (lib/data/serviceIcons) chosen in the wizard. */
  icon?: string;

  // Wizard-collected fields, persisted so the dashboard renders the real offer.
  // All optional → back-compatible with the seed catalogue below and existing
  // reader screens. Carried through by `offerFromDraft` (offersStore.ts) per type.

  /** Short client-facing description (all types). */
  description?: string;
  /** Hidden from the public marketplace but still shareable by link/invite. */
  privateListing?: boolean;
  /** Booking deposit (service / class). */
  deposit?: { enabled: boolean; amount: string; type: "fixed" | "percent" };
  /** Free cancellation window, e.g. "24h" / "48h" / "none" (service / class). */
  cancellation?: string;
  /** Where it's offered (service / class). */
  locationModes?: { inSalon: boolean; mobile: boolean; remote: boolean };
  /** In-salon location ids; empty = all locations (service / class). */
  locationIds?: string[];
  /** Mobile (travels-to-client) settings (service / class). */
  mobile?: MobileSettings;
  /** Remote (video) settings — platform + link (service / class). */
  remote?: RemoteSettings;
  /** Staff/instructors who deliver it (service / class). */
  staffIds?: string[];
  /** Per-location staff assignment when multiple salons are selected. */
  staffByLocation?: Record<string, string[]>;
  /** Class-specific snapshot (capacity, schedule, structure). */
  classDetails?: ClassDraft;
  /** Bundle-specific snapshot (contents + order/timing + pricing mode). */
  bundle?: { kind: "fixed" | "flexible"; serviceIds: string[]; links?: BundleLink[]; chooseCount: number; priceMode: "fixed" | "discount"; discountPercent: string };
  /** Subscription-specific snapshot (type, benefit, billing). */
  subscription?: SubscriptionDraft;

  // Advanced-module data — persisted live via `updateOffer` from the module
  // editors under /app/services/[id]/*. All optional; absent = module untouched.

  /** Per-stage notification channel config (Notifications module). */
  notifications?: NotifStage[];
  /** Attached intake/consent forms with a required flag (Forms module). */
  forms?: { id: string; required: boolean }[];
  /** Per-offer setting overrides (Settings module); absent keys inherit defaults. */
  settings?: OfferSettings;
  /** Attached rooms/equipment (Resources module). */
  resources?: OfferResource[];
  /** Upsell groups (Related services module). */
  upsellGroups?: UpsellGroup[];
  /** Photo placeholder ids (gallery module). */
  photos?: number[];
  /** Pricing variants created via the Variants setup flow. */
  variants?: OfferVariant[];
  /** Product-preference question groups (Product preferences module). */
  productPrefs?: ProductPref[];
  /** Same-service bundle/package options (service module). */
  serviceBundles?: ServiceBundleOption[];
  /** Class prerequisites, eligibility, declarations and preparation rules. */
  requirements?: ClassRequirements;
  /** Class agenda / syllabus items, attached to class dates. */
  agenda?: ClassAgendaItem[];
  /** Class materials & resources for students/staff. */
  materials?: ClassMaterial[];
  /** Class completion & certificate rules. */
  certificate?: ClassCertificate;
  /** Model/demo-client application setup for practical classes. */
  models?: ClassModels;
  /** Kit, PPE, tools or student items to bring. */
  kitItems?: string[];
}

export const demoOffers: DemoOffer[] = [
  { id: "svc_classic_haircut", type: "service", name: "Classic haircut", category: "Hair", price: "35", durationMin: 45, status: "published" },
  { id: "svc_beard_trim", type: "service", name: "Beard trim", category: "Barbering", price: "15", durationMin: 20, status: "published" },
  { id: "svc_colour_consult", type: "service", name: "Colour consultation", category: "Colour", price: "0", durationMin: 20, status: "published" },
  { id: "svc_root_tint", type: "service", name: "Root tint", category: "Colour", price: "55", durationMin: 90, status: "published" },
  { id: "svc_blow_dry", type: "service", name: "Blow dry", category: "Hair", price: "30", durationMin: 45, status: "published" },
  { id: "svc_lash_lift", type: "service", name: "Lash lift", category: "Lashes", price: "45", durationMin: 60, status: "published" },
  { id: "svc_brow_shape_tint", type: "service", name: "Brow shape & tint", category: "Brows", price: "25", durationMin: 30, status: "published" },
  { id: "svc_gel_manicure", type: "service", name: "Gel manicure", category: "Nails", price: "35", durationMin: 45, status: "published" },
  { id: "svc_skin_consultation", type: "service", name: "Skin consultation", category: "Skin", price: "0", durationMin: 30, status: "draft" },
  { id: "svc_relaxing_massage", type: "service", name: "Relaxing massage", category: "Massage", price: "60", durationMin: 60, status: "published" },
  { id: "svc_pt_session", type: "service", name: "Personal training session", category: "Fitness", price: "40", durationMin: 60, status: "published" },
  // Salon services referenced by name across the mid-fi product screens
  // (agenda rows, calendar grids, Up Next queue) — categories follow the
  // canonical CategoryName vocabulary in lib/tokens/categories.ts.
  { id: "svc_cut_style", type: "service", name: "Cut & Style", category: "Hair", price: "85", durationMin: 60, status: "published",
    forms: [{ id: "f4", required: false }], resources: [{ id: "sp1", auto: false, reservation: "whole", bufferBefore: "", bufferAfter: "", note: "" }] },
  { id: "svc_cut_colour", type: "service", name: "Cut & Colour", category: "Colour", price: "140", durationMin: 90, status: "published" },
  { id: "svc_blow_dry_style", type: "service", name: "Blow Dry & Style", category: "Hair", price: "55", durationMin: 60, status: "published" },
  { id: "svc_colour_treatment", type: "service", name: "Colour Treatment", category: "Colour", price: "180", durationMin: 120, status: "published",
    forms: [{ id: "f3", required: true }, { id: "f2", required: false }],
    resources: [{ id: "sp2", auto: false, reservation: "whole", bufferBefore: "", bufferAfter: "", note: "" }] },
  { id: "svc_haircut", type: "service", name: "Haircut", category: "Hair", price: "65", durationMin: 45, status: "published" },
  { id: "svc_cut_beard", type: "service", name: "Cut & Beard", category: "Barbering", price: "95", durationMin: 60, status: "published" },
  { id: "cls_beginner_yoga", type: "class", name: "Beginner yoga", category: "Fitness", price: "12", status: "published" },
  { id: "cls_styling_workshop", type: "class", name: "Hair styling workshop", category: "Hair", price: "85", status: "draft" },
  { id: "cls_colour_masterclass", type: "class", name: "Colour Masterclass", category: "Colour", price: "65", status: "published" },
  { id: "bun_cut_colour", type: "bundle", name: "Cut + colour package", category: "Hair", price: "225", status: "published",
    bundle: { kind: "fixed", serviceIds: ["svc_cut_style", "svc_colour_treatment"], links: [{ kind: "gap", gapMin: 15 }, { kind: "back_to_back" }], chooseCount: 2, priceMode: "discount", discountPercent: "15" } },
  { id: "sub_monthly_cuts", type: "subscription", name: "Monthly cuts membership", category: "Hair", price: "45", status: "published",
    subscription: { benefitType: "sessions", billingPeriod: "month", includedSessions: 1, unlimitedUsage: false, rollover: false, sessionCooldownEnabled: false, sessionCooldownDays: 1, storeCreditAmount: "", creditBonusEnabled: false, creditBonusPercent: "", creditSpendMode: "all", memberDiscountPercent: "", includedServiceIds: ["svc_classic_haircut", "svc_haircut", "svc_cut_style"], joiningFeeEnabled: false, joiningFee: "", minimumTermMonths: "1", cancellationRule: "cancel_anytime", cancellationNoticeDays: "", pauseEnabled: true, pauseMaxDays: "30", pauseNoticeDays: "7" } },
  { id: "sub_colour_credit", type: "subscription", name: "Colour credit", category: "Colour", price: "80", status: "published",
    subscription: { benefitType: "credit", billingPeriod: "month", includedSessions: 0, unlimitedUsage: false, rollover: true, sessionCooldownEnabled: false, sessionCooldownDays: 1, storeCreditAmount: "100", creditBonusEnabled: true, creditBonusPercent: "10", creditSpendMode: "selected", memberDiscountPercent: "", includedServiceIds: ["svc_colour_treatment", "svc_cut_colour"], joiningFeeEnabled: true, joiningFee: "20", minimumTermMonths: "3", cancellationRule: "after_term", cancellationNoticeDays: "30", pauseEnabled: true, pauseMaxDays: "60", pauseNoticeDays: "7" } },
  { id: "sub_vip", type: "subscription", name: "VIP membership", category: "Hair", price: "25", status: "draft",
    subscription: { benefitType: "discount", billingPeriod: "month", includedSessions: 0, unlimitedUsage: false, rollover: false, sessionCooldownEnabled: false, sessionCooldownDays: 1, storeCreditAmount: "", creditBonusEnabled: false, creditBonusPercent: "", creditSpendMode: "all", memberDiscountPercent: "15", includedServiceIds: [], joiningFeeEnabled: false, joiningFee: "", minimumTermMonths: "", cancellationRule: "cancel_anytime", cancellationNoticeDays: "", pauseEnabled: false, pauseMaxDays: "", pauseNoticeDays: "" } },
];

export const SERVICE_TYPES: { key: OfferType; label: string }[] = [
  { key: "service", label: "Services" },
  { key: "class", label: "Classes" },
  { key: "bundle", label: "Bundles" },
  { key: "subscription", label: "Subscriptions" },
];

export const statusLabel = (s: DemoOffer["status"]) => (s === "published" ? "Active" : "Draft");

export const offerMeta = (o: DemoOffer): string => {
  const price = o.price === "0" ? "Free" : `£${o.price}`;
  return o.durationMin ? `${price} · ${o.durationMin}min` : price;
};

export const getOffer = (id: string): DemoOffer | undefined =>
  demoOffers.find((o) => o.id === id);
