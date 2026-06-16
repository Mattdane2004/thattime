// THE canonical catalogue — "what this business sells". Demo offers ported
// (typed) from the legacy that-time-app src/data/demoServices.js, using the
// shared OfferType contract. The product-screen lists in lib/data/product.ts
// (services, serviceCategories) are derived from here — add/edit offers in
// this file only.
import type { OfferType } from "@/lib/types";
import type { MobileSettings, RemoteSettings, ClassDraft, SubscriptionDraft } from "@/lib/store/wizardStore";

/** A pricing variant created in the Variants setup flow. */
export type VariantType = "duration" | "staff" | "time" | "location";
export interface OfferVariant {
  id: string;
  type: VariantType;
  label: string;
  /** Price difference vs the base price, signed string e.g. "+10" / "-5". */
  priceDelta: string;
  /** Duration difference in minutes (duration variants). */
  durationDelta?: number;
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
  /** Booking deposit (service / class). */
  deposit?: { enabled: boolean; amount: string };
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
  /** Bundle-specific snapshot (contents + pricing mode). */
  bundle?: { kind: "fixed" | "flexible"; serviceIds: string[]; chooseCount: number; priceMode: "fixed" | "discount"; discountPercent: string };
  /** Subscription-specific snapshot (type, benefit, billing). */
  subscription?: SubscriptionDraft;

  // Advanced-module data — persisted live via `updateOffer` from the module
  // editors under /app/services/[id]/*. All optional; absent = module untouched.

  /** Enabled client-notification keys (all types). */
  notifications?: string[];
  /** Selected catalogue ids per advanced module (persisted by their editors). */
  formIds?: string[];
  productIds?: string[];
  resourceIds?: string[];
  relatedIds?: string[];
  /** Photo placeholder ids (gallery module). */
  photos?: number[];
  /** Pricing variants created via the Variants setup flow. */
  variants?: OfferVariant[];
  /** Class prerequisites & what-to-bring. */
  requirements?: { minAge: string; prerequisites: string; whatToBring: string };
  /** Class agenda / syllabus items. */
  agenda?: { title: string }[];
  /** Class materials & resources. */
  materials?: { name: string }[];
  /** Class completion & certificate rules. */
  certificate?: { enabled: boolean; passCriteria: string };
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
  { id: "svc_cut_style", type: "service", name: "Cut & Style", category: "Hair", price: "85", durationMin: 60, status: "published" },
  { id: "svc_cut_colour", type: "service", name: "Cut & Colour", category: "Colour", price: "140", durationMin: 90, status: "published" },
  { id: "svc_blow_dry_style", type: "service", name: "Blow Dry & Style", category: "Hair", price: "55", durationMin: 60, status: "published" },
  { id: "svc_colour_treatment", type: "service", name: "Colour Treatment", category: "Colour", price: "180", durationMin: 120, status: "published" },
  { id: "svc_haircut", type: "service", name: "Haircut", category: "Hair", price: "65", durationMin: 45, status: "published" },
  { id: "svc_cut_beard", type: "service", name: "Cut & Beard", category: "Barbering", price: "95", durationMin: 60, status: "published" },
  { id: "cls_beginner_yoga", type: "class", name: "Beginner yoga", category: "Fitness", price: "12", status: "published" },
  { id: "cls_styling_workshop", type: "class", name: "Hair styling workshop", category: "Hair", price: "85", status: "draft" },
  { id: "cls_colour_masterclass", type: "class", name: "Colour Masterclass", category: "Colour", price: "65", status: "published" },
  { id: "bun_cut_colour", type: "bundle", name: "Cut + colour package", category: "Hair", price: "120", status: "published" },
  { id: "sub_monthly_cuts", type: "subscription", name: "Monthly cuts membership", category: "Hair", price: "45", status: "published" },
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
