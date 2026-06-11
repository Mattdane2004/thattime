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
}

export const emptyDraft: ServiceDraft = {
  type: null,
  name: "",
  category: "",
  description: "",
  price: "",
  durationMin: 60,
};

interface WizardState {
  draft: ServiceDraft;
  updateDraft: (patch: Partial<ServiceDraft>) => void;
  resetDraft: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  draft: emptyDraft,
  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  resetDraft: () => set({ draft: emptyDraft }),
}));
