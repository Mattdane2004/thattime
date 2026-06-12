"use client";

// Draft state for the client-side booking flow (/client/book/*) — one store
// per concern: this is the consumer's in-progress booking, distinct from the
// business product state in appStore.ts and the signup flow in onboarding2.ts.
import { create } from "zustand";

export const ANY_PROFESSIONAL = "any";

type ClientBookingStore = {
  serviceIds: string[];
  /** Team member id from lib/data/team.ts, or ANY_PROFESSIONAL. */
  staffId: string | null;
  dayId: string | null;
  time: string | null;
  toggleService: (id: string) => void;
  setStaff: (id: string) => void;
  setSlot: (dayId: string, time: string) => void;
  reset: () => void;
};

export const useClientBooking = create<ClientBookingStore>((set) => ({
  serviceIds: [],
  staffId: null,
  dayId: null,
  time: null,
  toggleService: (id) =>
    set((s) => ({
      serviceIds: s.serviceIds.includes(id)
        ? s.serviceIds.filter((x) => x !== id)
        : [...s.serviceIds, id],
    })),
  setStaff: (staffId) => set({ staffId }),
  setSlot: (dayId, time) => set({ dayId, time }),
  reset: () => set({ serviceIds: [], staffId: null, dayId: null, time: null }),
}));
