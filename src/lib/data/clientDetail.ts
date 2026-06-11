// Client profile data for /app/clients/[id] — ported (typed) from the legacy
// that-time-app src/data/clientsDirectory.js (the Sarah Johnson detail). Most
// demo profiles reuse this layout with their own header identity, mirroring
// the original getClientDetail() behaviour.
import type { Client } from "@/lib/types";
import { clientList } from "./clients";

export type ClientProfile = Pick<
  Client,
  "id" | "initials" | "name" | "status" | "rating" | "joined" | "listTags" | "details" | "allergies" | "overview" | "reviews"
> & {
  bookings: { pastCount: string; items: Array<{ id: string; service: string; detail: string; status: string }> };
};

const sarah: ClientProfile = {
  id: "sarah-johnson",
  initials: "SJ",
  name: "Sarah Johnson",
  status: "Active",
  rating: "4.8",
  joined: "Jan 2024",
  listTags: [{ label: "VIP", tone: "light" }],
  details: {
    phone: "(555) 234-5678",
    email: "sarah.j@email.com",
    address: "14 Maple Lane, London",
    birthday: "14 June",
    pronouns: "She / her",
    occupation: "Teacher",
    emergencyContact: { name: "Tom Johnson", phone: "(555) 234-9911" },
  },
  allergies: [
    { id: "al1", name: "PPD (hair dye)", type: "Drug", severity: "Severe", reaction: "Scalp irritation and swelling", patchTestRequired: true },
    { id: "al2", name: "Sensitive scalp", type: "Non-drug", severity: "Mild", reaction: "Redness after colour treatments", patchTestRequired: false },
  ],
  overview: {
    stats: [
      { label: "Last Visit", value: "3 Mar 2026" },
      { label: "Total Bookings", value: "24" },
      { label: "Client Since", value: "Jan 2024" },
    ],
    nextAppointment: { service: "Cut & Style", detail: "18 Mar 2026 · Emma S. · 60min · £85" },
    allergies: ["Sensitive scalp", "PPD allergy"],
    contact: { phone: "(555) 234-5678", email: "sarah.j@email.com", address: "14 Maple Lane, London" },
  },
  reviews: {
    average: "4.7",
    count: "(3 reviews)",
    items: [
      { id: "r1", stars: 5, date: "3 Mar 2026", text: "Absolutely love my new colour! Emma always knows exactly what I want.", service: "Cut & Style" },
      { id: "r2", stars: 5, date: "10 Feb 2026", text: "Great experience as always. Very relaxing atmosphere.", service: "Cut & Style" },
      { id: "r3", stars: 4, date: "20 Jan 2026", text: "Lovely cut, just took a bit longer than expected.", service: "Cut & Blow Dry" },
    ],
  },
  bookings: {
    pastCount: "4 past appointments",
    items: [
      { id: "b1", service: "Cut & Style", detail: "3 Mar 2026 · Emma S. · 60min · £85", status: "Completed" },
      { id: "b2", service: "Cut & Style", detail: "10 Feb 2026 · Emma S. · 60min · £85", status: "Completed" },
      { id: "b3", service: "Cut & Blow Dry", detail: "20 Jan 2026 · Emma S. · 45min · £75", status: "Completed" },
      { id: "b4", service: "Cut & Style", detail: "9 Dec 2025 · Alex M. · 60min · £85", status: "Cancelled" },
    ],
  },
};

/** Resolve a profile for any directory id, swapping in that client's header. */
export function getClientProfile(id: string): ClientProfile {
  const base = clientList.find((c) => c.id === id);
  if (!base) return sarah;
  return { ...sarah, id, name: base.name, initials: base.initials, rating: base.rating ?? sarah.rating, listTags: base.tags };
}
