import { create } from "zustand";
import type { OfferType } from "@/lib/types";

// Shared draft for the service-creation wizard — the Zustand replacement for
// the legacy that-time-app App.jsx Outlet context (`draft` + `updateDraft` +
// `resetDraft`). Start with the core fields the early wizard steps need;
// extend this shape as later wizard/module screens are ported.

export interface ServiceDraft {
  type: OfferType | null;
  name: string;
  category: string;
  description: string;
  price: string;
  durationMin: number;
  depositEnabled: boolean;
  depositAmount: string;
  locationIds: string[];
  staffIds: string[];
  subscription: SubscriptionDraft;
  bundle: BundleDraft;
}

// Bundle-branch fields (wizard: services → pricing).
export interface BundleDraft {
  kind: "fixed" | "flexible";
  serviceIds: string[];
  /** "fixed" total price, or "" when using a package discount instead. */
  priceMode: "fixed" | "discount";
  discountPercent: string;
}

export const emptyBundle: BundleDraft = {
  kind: "fixed",
  serviceIds: [],
  priceMode: "fixed",
  discountPercent: "",
};

// Subscription-branch fields (wizard: type → benefits → billing).
export interface SubscriptionDraft {
  subType: "frequency" | "credit" | "membership";
  benefitType: "sessions" | "credit" | "discount" | "access";
  billingPeriod: "week" | "month" | "quarter" | "year";
  includedSessions: number;
  unlimitedUsage: boolean;
  storeCreditAmount: string;
  memberDiscountPercent: string;
  joiningFee: string;
  minimumTermMonths: string;
}

export const emptySubscription: SubscriptionDraft = {
  subType: "frequency",
  benefitType: "sessions",
  billingPeriod: "month",
  includedSessions: 1,
  unlimitedUsage: false,
  storeCreditAmount: "",
  memberDiscountPercent: "",
  joiningFee: "",
  minimumTermMonths: "",
};

export const emptyDraft: ServiceDraft = {
  type: null,
  name: "",
  category: "",
  description: "",
  price: "",
  durationMin: 60,
  depositEnabled: false,
  depositAmount: "",
  locationIds: [],
  staffIds: [],
  subscription: emptySubscription,
  bundle: emptyBundle,
};

interface WizardState {
  draft: ServiceDraft;
  updateDraft: (patch: Partial<ServiceDraft>) => void;
  updateSubscription: (patch: Partial<SubscriptionDraft>) => void;
  updateBundle: (patch: Partial<BundleDraft>) => void;
  resetDraft: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  draft: emptyDraft,
  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  updateSubscription: (patch) =>
    set((state) => ({ draft: { ...state.draft, subscription: { ...state.draft.subscription, ...patch } } })),
  updateBundle: (patch) =>
    set((state) => ({ draft: { ...state.draft, bundle: { ...state.draft.bundle, ...patch } } })),
  resetDraft: () => set({ draft: emptyDraft }),
}));
