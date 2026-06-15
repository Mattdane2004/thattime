import { create } from "zustand";
import { demoOffers, type DemoOffer } from "@/lib/data/offers";
import type { ServiceDraft } from "@/lib/store/wizardStore";

// Offer catalogue state — seeded from the demo catalogue so offers created in
// the wizard show up in the Services list and dashboards within a session.

interface OffersState {
  offers: DemoOffer[];
  addOffer: (offer: DemoOffer) => void;
  updateOffer: (id: string, patch: Partial<DemoOffer>) => void;
  setStatus: (id: string, status: DemoOffer["status"]) => void;
  removeOffer: (id: string) => void;
}

export const useOffersStore = create<OffersState>((set) => ({
  offers: demoOffers,
  addOffer: (offer) => set((s) => ({ offers: [offer, ...s.offers] })),
  updateOffer: (id, patch) =>
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
  setStatus: (id, status) =>
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, status } : o)) })),
  removeOffer: (id) => set((s) => ({ offers: s.offers.filter((o) => o.id !== id) })),
}));

/** Build a catalogue entry from a completed wizard draft. */
export function offerFromDraft(draft: ServiceDraft, allOffers: DemoOffer[]): DemoOffer {
  const type = draft.type ?? "service";
  const prefix = { service: "svc", class: "cls", bundle: "bun", subscription: "sub" }[type];
  let price = draft.price;
  if (type === "bundle" && draft.bundle.priceMode === "discount") {
    const sum = draft.bundle.serviceIds
      .map((id) => Number(allOffers.find((o) => o.id === id)?.price || 0))
      .reduce((a, b) => a + b, 0);
    price = String(Math.round(sum * (1 - Number(draft.bundle.discountPercent || 0) / 100)));
  }
  return {
    id: `${prefix}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    name: draft.name.trim(),
    category: draft.category,
    price: price || "0",
    durationMin: type === "service" ? draft.durationMin : undefined,
    status: "draft",
    icon: draft.icon,
  };
}
