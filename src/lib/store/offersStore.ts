import { create } from "zustand";
import { demoOffers, type DemoOffer } from "@/lib/data/offers";
import type { ServiceDraft } from "@/lib/store/wizardStore";
import { nextId } from "@/lib/ids";

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

/**
 * Build a catalogue entry from a completed wizard draft. One shared seam for
 * all four offer types — the common envelope plus the type-specific sub-block,
 * so the dashboard renders the real offer instead of placeholders.
 */
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
  if (type === "subscription") {
    const tierPrices = (draft.subscription.tiers ?? [])
      .map((tier) => Number(tier.price))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (tierPrices.length) price = String(Math.min(...tierPrices));
  }

  // Shared envelope — every type carries these.
  const offer: DemoOffer = {
    id: nextId(prefix),
    type,
    name: draft.name.trim(),
    category: draft.category,
    price: price || "0",
    status: "draft",
    icon: draft.icon,
    description: draft.description.trim() || undefined,
    privateListing: draft.privateListing,
  };

  // Type-specific sub-block — only carry what each type's wizard collected.
  const deposit = draft.depositEnabled
    ? { enabled: true, amount: draft.depositAmount, type: draft.depositType }
    : undefined;
  if (type === "service" || type === "class") {
    offer.locationModes = { ...draft.locationModes };
    offer.locationIds = [...draft.locationIds];
    if (draft.locationModes.mobile) offer.mobile = { ...draft.mobile };
    if (draft.locationModes.remote) offer.remote = { ...draft.remote };
    offer.staffIds = [...draft.staffIds];
    if (Object.keys(draft.staffByLocation).length) offer.staffByLocation = { ...draft.staffByLocation };
    offer.deposit = deposit;
  }
  if (type === "service") {
    offer.durationMin = draft.durationMin;
  }
  if (type === "class") {
    offer.classDetails = { ...draft.classDetails };
  }
  if (type === "bundle") {
    offer.bundle = {
      kind: draft.bundle.kind,
      serviceIds: [...draft.bundle.serviceIds],
      links: draft.bundle.links.map((l) => ({ ...l })),
      chooseCount: draft.bundle.chooseCount,
      priceMode: draft.bundle.priceMode,
      discountPercent: draft.bundle.discountPercent,
    };
    offer.deposit = deposit;
  }
  if (type === "subscription") {
    offer.subscription = { ...draft.subscription };
  }

  return offer;
}
