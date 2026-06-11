// Demo data for the Clients directory — ported (typed) from the legacy
// that-time-app src/data/clientsDirectory.js (clientList). Uses the shared
// ClientListItem contract from src/lib/types.
import type { ClientListItem } from "@/lib/types";

export const clientList: ClientListItem[] = [
  { id: "emily-davis", initials: "ED", name: "Emily Davis", rating: "4.9", schedule: "Next: 2 Apr, 14:30", tags: [{ label: "Regular", tone: "light" }] },
  { id: "amanda-white", initials: "AW", name: "Amanda White", rating: "4.3", schedule: "Next: 2 Apr, 17:30", tags: [{ label: "Regular", tone: "light" }] },
  { id: "jessica-brown", initials: "JB", name: "Jessica Brown", rating: "4.5", schedule: "Next: 3 Apr, 14:30", tags: [{ label: "VIP", tone: "light" }, { label: "Allergy", tone: "dark" }] },
  { id: "michael-chen", initials: "MC", name: "Michael Chen", rating: "2.1", schedule: "Last: 20 Feb 2026", tags: [{ label: "Blocked", tone: "mid" }], muted: true },
  { id: "patricia-taylor", initials: "PT", name: "Patricia Taylor", schedule: "Last: 5 Feb 2026", tags: [] },
  { id: "christopher-garcia", initials: "CG", name: "Christopher Garcia", schedule: "Last: 2 Jan 2026", tags: [{ label: "Inactive", tone: "light" }] },
  { id: "christopher-garcia-2", initials: "CG", name: "Christopher Garcia", schedule: "Last: 2 Jan 2026", tags: [{ label: "Inactive", tone: "light" }] },
];

export interface SortOption {
  id: "recent" | "name" | "rating" | "newest";
  label: string;
}

export const clientSortOptions: SortOption[] = [
  { id: "recent", label: "Most recent" },
  { id: "name", label: "Name (A–Z)" },
  { id: "rating", label: "Rating" },
  { id: "newest", label: "Newest first" },
];

export function sortClients(list: ClientListItem[], sort: SortOption["id"]): ClientListItem[] {
  const copy = [...list];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "rating":
      return copy.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    case "newest":
      return copy.reverse();
    default:
      return copy;
  }
}
