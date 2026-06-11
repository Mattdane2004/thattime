// Business locations — ported (typed) from the legacy that-time-app
// src/data/business.js (businessLocations). Uses the shared BusinessLocation type.
import type { BusinessLocation } from "@/lib/types";

export const businessLocations: BusinessLocation[] = [
  { id: "loc1", name: "Salon Soho", address: "14 Greek Street" },
  { id: "loc2", name: "Salon Brixton", address: "4 Atlantic Rd" },
  { id: "loc3", name: "Salon Chelsea", address: "88 Kings Rd" },
];
