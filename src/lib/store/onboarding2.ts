"use client";

import { create } from "zustand";
import type { WeeklyScheduleDay } from "@/lib/types";

/**
 * State for the new onboarding flows (Figma "🔴 Onbaording", node 10960-10046).
 * Three branches share this store: B2B owner, staff join, B2C client.
 * Prototype-only — nothing persists.
 */

export type WorkMode = "fixed" | "travel" | "virtual";
export type TravelFeeType = "flat" | "per-mile";
export type Plan = "yearly" | "monthly";
export type Audience = "female" | "male" | "both";

type OnboardingState = {
  // Account
  phone: string;
  authMethod: "phone" | "apple" | "google" | "facebook" | null;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  marketingOptIn: boolean;
  termsAccepted: boolean;

  // Business
  businessName: string;
  businessTypes: string[]; // first entry = primary
  otherType: string;
  teamSize: string;
  workModes: WorkMode[];
  baseAddress: string;
  hideAddressUntilBooking: boolean;
  travelFrom: string;
  travelRadius: number; // miles
  travelFeeEnabled: boolean;
  travelFeeType: TravelFeeType;
  travelFeeAmount: string;
  currentTool: string;
  weeklyBookings: number;
  avgPrice: number;
  plan: Plan;
  trialTeamBand: string;

  // Staff join
  inviteCode: string;
  staffBusiness: string;
  staffRole: string;
  staffManager: string;
  staffName: { first: string; last: string };
  staffEmail: string;
  /** Did the owner pre-set this member's schedule? If not, the join flow asks them. */
  staffScheduleSet: boolean;
  /** Did the owner grant self-edit? With either flag the week becomes editable. */
  staffCanSelfEdit: boolean;
  /** The member's working week, editable in the join flow when permitted. */
  staffAvailability: WeeklyScheduleDay[];

  // B2C client
  audience: Audience | null;
  clientCategories: string[];
  clientEmail: string;
  clientName: { first: string; last: string };

  set: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  toggleBusinessType: (t: string) => void;
  toggleWorkMode: (m: WorkMode) => void;
  toggleClientCategory: (c: string, max?: number) => void;
  reset: () => void;
};

const initial = {
  phone: "",
  authMethod: null,
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  marketingOptIn: true,
  termsAccepted: false,

  businessName: "",
  businessTypes: [] as string[],
  otherType: "",
  teamSize: "",
  workModes: [] as WorkMode[],
  baseAddress: "",
  hideAddressUntilBooking: false,
  travelFrom: "",
  travelRadius: 10,
  travelFeeEnabled: true,
  travelFeeType: "flat" as TravelFeeType,
  travelFeeAmount: "15",
  currentTool: "",
  weeklyBookings: 12,
  avgPrice: 13,
  plan: "yearly" as Plan,
  trialTeamBand: "6 – 9",

  inviteCode: "",
  staffBusiness: "Salon Soho",
  staffRole: "Senior Stylist",
  staffManager: "Emma",
  staffName: { first: "Sam", last: "Taylor" },
  staffEmail: "sam@email.com",
  staffScheduleSet: true,
  staffCanSelfEdit: true,
  staffAvailability: [
    { day: "Mon", enabled: false, start: "09:00", end: "18:00" },
    { day: "Tue", enabled: true, start: "09:00", end: "18:00" },
    { day: "Wed", enabled: true, start: "09:00", end: "20:00" },
    { day: "Thu", enabled: true, start: "09:00", end: "20:00" },
    { day: "Fri", enabled: true, start: "09:00", end: "20:00" },
    { day: "Sat", enabled: true, start: "10:00", end: "16:00" },
    { day: "Sun", enabled: false, start: "09:00", end: "18:00" },
  ] as WeeklyScheduleDay[],

  audience: null,
  clientCategories: [] as string[],
  clientEmail: "",
  clientName: { first: "", last: "" },
};

export const useOnboarding2 = create<OnboardingState>((set, get) => ({
  ...initial,

  set: (key, value) => set({ [key]: value } as Partial<OnboardingState>),

  toggleBusinessType: (t) => {
    const cur = get().businessTypes;
    set({
      businessTypes: cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
    });
  },

  toggleWorkMode: (m) => {
    const cur = get().workModes;
    set({ workModes: cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m] });
  },

  toggleClientCategory: (c, max = 5) => {
    const cur = get().clientCategories;
    if (cur.includes(c)) set({ clientCategories: cur.filter((x) => x !== c) });
    else if (cur.length < max) set({ clientCategories: [...cur, c] });
  },

  reset: () => set(initial),
}));

/** Display name fallback used across the business flow. */
export function businessLabel(name: string) {
  return name.trim() || "your business";
}
