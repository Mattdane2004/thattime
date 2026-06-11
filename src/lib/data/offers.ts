// Demo offers for the Services list — ported (typed) from the legacy
// that-time-app src/data/demoServices.js. Uses the shared OfferType contract.
import type { OfferType } from "@/lib/types";

export interface DemoOffer {
  id: string;
  type: OfferType;
  name: string;
  category: string;
  price: string;
  durationMin?: number;
  status: "published" | "draft";
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
  { id: "cls_beginner_yoga", type: "class", name: "Beginner yoga", category: "Fitness", price: "12", status: "published" },
  { id: "cls_styling_workshop", type: "class", name: "Hair styling workshop", category: "Hair", price: "85", status: "draft" },
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

// Module sections shown on an offer dashboard (the legacy /service /class etc.
// dashboards). Each is a sub-screen still on the backlog.
export const OFFER_MODULES: { key: string; label: string; desc: string }[] = [
  { key: "variants", label: "Variants", desc: "Duration, staff & location pricing" },
  { key: "products", label: "Products", desc: "Retail add-ons for this offer" },
  { key: "resources", label: "Resources", desc: "Rooms & equipment needed" },
  { key: "forms", label: "Forms", desc: "Intake & consent forms" },
  { key: "related", label: "Related", desc: "Cross-sell other offers" },
  { key: "settings", label: "Settings", desc: "Booking rules & policies" },
  { key: "notifications", label: "Notifications", desc: "Client reminders & messages" },
];
