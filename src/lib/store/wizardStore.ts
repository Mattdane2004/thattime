import { create } from "zustand";
import type { OfferType } from "@/lib/types";

// Shared draft for the service-creation wizard — the Zustand replacement for
// the legacy that-time-app App.jsx Outlet context (`draft` + `updateDraft` +
// `resetDraft`). Start with the core fields the early wizard steps need;
// extend this shape as later wizard/module screens are ported.

export interface ServiceDraft {
  type: OfferType | null;
  name: string;
  icon: string; // lucide icon key — see lib/data/serviceIcons
  category: string;
  description: string;
  privateListing: boolean;
  price: string;
  durationMin: number;
  depositEnabled: boolean;
  depositAmount: string;
  depositType: "fixed" | "percent";
  // Where it's offered — modes (multi-select) + per-mode settings.
  locationModes: LocationModes;
  locationIds: string[]; // in-salon salons; empty = all locations
  mobile: MobileSettings;
  remote: RemoteSettings;
  staffIds: string[]; // flat assignment (single-location / all-locations case)
  staffByLocation: Record<string, string[]>; // per-location assignment (multi-location case)
  subscription: SubscriptionDraft;
  bundle: BundleDraft;
  classDetails: ClassDraft;
}

// "Where is it offered?" — modes can be combined (in-salon + mobile, etc.).
export interface LocationModes {
  inSalon: boolean;
  mobile: boolean;
  remote: boolean;
}

// Mobile (travels-to-client) settings, edited from the location-step sheet.
export interface MobileSettings {
  travelFee: boolean;
  feeType: "flat" | "per_mile";
  feeAmount: string;
  radiusMiles: number;
  noticeValue: number;
  noticeUnit: "Hours" | "Days";
}

export const emptyMobile: MobileSettings = {
  travelFee: true,
  feeType: "flat",
  feeAmount: "15",
  radiusMiles: 10,
  noticeValue: 2,
  noticeUnit: "Hours",
};

// Remote (video / online) settings — which platform and the joining link.
export type RemotePlatform = "zoom" | "google_meet" | "teams" | "phone" | "custom";
export interface RemoteSettings {
  platform: RemotePlatform;
  link: string;
}

export const emptyRemote: RemoteSettings = { platform: "zoom", link: "" };

// Class-branch fields (wizard: participants → schedule → pricing).
export interface ClassDraft {
  bookingStructure: "seat_based" | "private_group";
  capacity: number;
  minParticipants: number;
  /** Cancel the session automatically if minParticipants isn't reached. */
  autoCancel: boolean;
  /** "single" = one-off class; "multi" = course of dates booked together. */
  scheduleMode: "single" | "multi";
  dates: string[];
  startTime: string;
  endTime: string;
  /** Per selected date overrides; absent means use the default start/end time. */
  dateTimes: Record<string, { startTime: string; endTime: string }>;
  /** "none" = one-off session; "weekly" repeats on the same weekday(s). */
  repeat: "none" | "weekly";
  repeatDays: string[];
  repeatEnd: "never";
  repeatWeeks: number;
}

export const emptyClassDraft: ClassDraft = {
  bookingStructure: "seat_based",
  capacity: 12,
  minParticipants: 1,
  autoCancel: false,
  scheduleMode: "single",
  dates: [],
  startTime: "09:00",
  endTime: "10:00",
  dateTimes: {},
  repeat: "none",
  repeatDays: [],
  repeatEnd: "never",
  repeatWeeks: 8,
};

// How one bundled service connects to the NEXT one in the order (Order & gaps).
export type BundleLinkKind =
  | "back_to_back" // the next service runs straight after this one (default)
  | "gap" // extra time after this service (gapMin); valid on the last row too
  | "linked" // the next service runs at the SAME time as this one (overlap)
  | "separate"; // the next service is a separate booking, gapDays later

export interface BundleLink {
  kind: BundleLinkKind;
  gapMin?: number; // kind === "gap"
  gapDays?: number; // kind === "separate"
}

export const backToBack = (): BundleLink => ({ kind: "back_to_back" });

/**
 * Keep `links` aligned to `serviceIds` (one after-config per service). Preserves
 * existing links by position, pads new tail rows with back-to-back, and never
 * leaves linked/separate on the final row (no following service to bind).
 */
export function syncBundleLinks(serviceIds: string[], links: BundleLink[]): BundleLink[] {
  const next = serviceIds.map((_, i) => links[i] ?? backToBack());
  const last = next.length - 1;
  if (last >= 0 && (next[last].kind === "linked" || next[last].kind === "separate")) {
    next[last] = backToBack();
  }
  return next;
}

// Bundle-branch fields (wizard: services → order → pricing).
export interface BundleDraft {
  kind: "fixed" | "flexible";
  serviceIds: string[];
  /** After-config for each service: links[i] connects serviceIds[i] → [i+1]. */
  links: BundleLink[];
  /** Flexible packages: how many of the selected services a client picks. */
  chooseCount: number;
  /** "fixed" total price, or "" when using a package discount instead. */
  priceMode: "fixed" | "discount";
  discountPercent: string;
}

export const emptyBundle: BundleDraft = {
  kind: "fixed",
  serviceIds: [],
  links: [],
  chooseCount: 2,
  priceMode: "fixed",
  discountPercent: "",
};

export type MembershipScope = "all" | "selected";

export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  price: string;
  billingPeriod: "week" | "month" | "quarter" | "year";

  inheritsFromTierId: string;
  inheritServiceBookings: boolean;
  inheritClassBookings: boolean;
  inheritDiscounts: boolean;
  inheritAccess: boolean;

  serviceBookingsEnabled: boolean;
  serviceBookingsUnlimited: boolean;
  serviceBookingAllowance: number;
  serviceBookingScope: MembershipScope;
  serviceBookingIds: string[];

  classBookingsEnabled: boolean;
  classBookingsUnlimited: boolean;
  classBookingAllowance: number;
  classBookingScope: MembershipScope;
  classBookingIds: string[];

  serviceDiscountEnabled: boolean;
  serviceDiscountPercent: string;
  serviceDiscountScope: MembershipScope;
  serviceDiscountIds: string[];

  classDiscountEnabled: boolean;
  classDiscountPercent: string;
  classDiscountScope: MembershipScope;
  classDiscountIds: string[];

  productDiscountEnabled: boolean;
  productDiscountPercent: string;
  productDiscountScope: MembershipScope;
  productDiscountIds: string[];

  accessEnabled: boolean;
  accessServiceIds: string[];
  accessClassIds: string[];
}

export const starterMembershipTier = (): MembershipTier => ({
  id: "tier_starter",
  name: "Starter",
  description: "",
  price: "",
  billingPeriod: "month",
  inheritsFromTierId: "",
  inheritServiceBookings: false,
  inheritClassBookings: false,
  inheritDiscounts: false,
  inheritAccess: false,
  serviceBookingsEnabled: true,
  serviceBookingsUnlimited: false,
  serviceBookingAllowance: 1,
  serviceBookingScope: "selected",
  serviceBookingIds: [],
  classBookingsEnabled: false,
  classBookingsUnlimited: false,
  classBookingAllowance: 1,
  classBookingScope: "selected",
  classBookingIds: [],
  serviceDiscountEnabled: false,
  serviceDiscountPercent: "",
  serviceDiscountScope: "selected",
  serviceDiscountIds: [],
  classDiscountEnabled: false,
  classDiscountPercent: "",
  classDiscountScope: "selected",
  classDiscountIds: [],
  productDiscountEnabled: false,
  productDiscountPercent: "",
  productDiscountScope: "selected",
  productDiscountIds: [],
  accessEnabled: false,
  accessServiceIds: [],
  accessClassIds: [],
});

// Subscription-branch fields. New subscriptions use `tiers`: a membership can
// have multiple price tiers, and each tier can mix bookings, discounts and
// access. The older single-benefit fields stay as a fallback for seed data and
// legacy screens until every reader has moved to tiers.
export interface SubscriptionDraft {
  tiers?: MembershipTier[];

  benefitType: "sessions" | "credit" | "discount" | "access";
  billingPeriod: "week" | "month" | "quarter" | "year";

  // Sessions benefit
  includedSessions: number;
  unlimitedUsage: boolean;
  rollover: boolean;              // unused sessions carry into next period
  sessionCooldownEnabled: boolean;
  sessionCooldownDays: number;   // minimum days between redemptions

  // Credit benefit
  storeCreditAmount: string;
  creditBonusEnabled: boolean;   // give more than they pay (e.g. pay £30 → £33)
  creditBonusPercent: string;    // bonus percentage on top of paid amount
  creditSpendMode: "all" | "selected"; // restrict credit to chosen services

  // Discount benefit
  memberDiscountPercent: string;

  // Included services — empty = all services (not applicable for credit "all" mode)
  includedServiceIds: string[];

  // Billing & terms
  joiningFeeEnabled: boolean;
  joiningFee: string;
  minimumTermEnabled?: boolean;
  minimumTermMonths: string;
  cancellationRule: "cancel_anytime" | "after_term";
  cancellationNoticeDays: string;

  // Pause rules (dashboard-level; stored on model from creation)
  pauseEnabled: boolean;
  pauseMaxDays: string;
  pauseNoticeDays: string;
}

export const emptySubscription: SubscriptionDraft = {
  tiers: [starterMembershipTier()],
  benefitType: "sessions",
  billingPeriod: "month",
  includedSessions: 1,
  unlimitedUsage: false,
  rollover: false,
  sessionCooldownEnabled: false,
  sessionCooldownDays: 1,
  storeCreditAmount: "",
  creditBonusEnabled: false,
  creditBonusPercent: "",
  creditSpendMode: "all",
  memberDiscountPercent: "",
  includedServiceIds: [],
  joiningFeeEnabled: false,
  joiningFee: "",
  minimumTermEnabled: false,
  minimumTermMonths: "",
  cancellationRule: "cancel_anytime",
  cancellationNoticeDays: "",
  pauseEnabled: false,
  pauseMaxDays: "",
  pauseNoticeDays: "",
};

export const emptyDraft: ServiceDraft = {
  type: null,
  name: "",
  icon: "scissors",
  category: "",
  description: "",
  privateListing: false,
  price: "",
  durationMin: 60,
  depositEnabled: false,
  depositAmount: "",
  depositType: "fixed",
  locationModes: { inSalon: true, mobile: false, remote: false },
  locationIds: [],
  mobile: emptyMobile,
  remote: emptyRemote,
  staffIds: [],
  staffByLocation: {},
  subscription: emptySubscription,
  bundle: emptyBundle,
  classDetails: emptyClassDraft,
};

interface WizardState {
  draft: ServiceDraft;
  updateDraft: (patch: Partial<ServiceDraft>) => void;
  updateMobile: (patch: Partial<MobileSettings>) => void;
  updateRemote: (patch: Partial<RemoteSettings>) => void;
  updateSubscription: (patch: Partial<SubscriptionDraft>) => void;
  updateBundle: (patch: Partial<BundleDraft>) => void;
  updateClass: (patch: Partial<ClassDraft>) => void;
  resetDraft: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  draft: emptyDraft,
  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  updateMobile: (patch) =>
    set((state) => ({ draft: { ...state.draft, mobile: { ...state.draft.mobile, ...patch } } })),
  updateRemote: (patch) =>
    set((state) => ({ draft: { ...state.draft, remote: { ...state.draft.remote, ...patch } } })),
  updateSubscription: (patch) =>
    set((state) => ({ draft: { ...state.draft, subscription: { ...state.draft.subscription, ...patch } } })),
  updateBundle: (patch) =>
    set((state) => ({ draft: { ...state.draft, bundle: { ...state.draft.bundle, ...patch } } })),
  updateClass: (patch) =>
    set((state) => ({ draft: { ...state.draft, classDetails: { ...state.draft.classDetails, ...patch } } })),
  resetDraft: () => set({ draft: emptyDraft }),
}));
