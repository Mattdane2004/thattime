// Service-category palette — product data colours used to colour-code
// services/verticals across the app. Mirrors the `category.*` scale in
// tailwind.config.ts. Ported (typed) from the legacy that-time-app
// src/data/categories.js during the Next.js consolidation.

export type CategoryName =
  | "Hair"
  | "Colour"
  | "Barbering"
  | "Beauty"
  | "Nails"
  | "Massage"
  | "Brows & lashes"
  | "Fitness"
  | "Wellness";

export interface Category {
  name: CategoryName;
  /** Hex swatch (#RRGGBB) */
  color: string;
}

export const defaultCategories: readonly Category[] = [
  { name: "Hair", color: "#7C3AED" },
  { name: "Colour", color: "#EC4899" },
  { name: "Barbering", color: "#475569" },
  { name: "Beauty", color: "#F43F5E" },
  { name: "Nails", color: "#F59E0B" },
  { name: "Massage", color: "#0D9488" },
  { name: "Brows & lashes", color: "#C026D3" },
  { name: "Fitness", color: "#10B981" },
  { name: "Wellness", color: "#0EA5E9" },
] as const;

/** Full swatch set offered when creating a custom category. */
export const categorySwatches: readonly string[] = [
  "#7C3AED", "#EC4899", "#F43F5E", "#F59E0B",
  "#10B981", "#0D9488", "#0EA5E9", "#6366F1",
  "#C026D3", "#84CC16", "#F97316", "#475569",
] as const;

/** Convert a hex (#RRGGBB) to rgba with the given alpha — for soft tinted backgrounds. */
export function tintFromHex(hex: string, alpha = 0.12): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
