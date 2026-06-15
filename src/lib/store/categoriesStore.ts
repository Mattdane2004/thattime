import { create } from "zustand";
import { defaultCategories } from "@/lib/tokens/categories";

// Service categories the user can pick (or add to) in the offer wizard. Seeded
// from the default palette; custom categories created via the "New category"
// sheet persist for the session so they're reusable across the service / class
// / bundle / subscription flows.

/** A selectable category — looser than the token `Category` so custom names fit. */
export interface PickableCategory {
  name: string;
  color: string;
}

interface CategoriesState {
  categories: PickableCategory[];
  addCategory: (cat: PickableCategory) => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: defaultCategories.map((c) => ({ name: c.name, color: c.color })),
  addCategory: (cat) =>
    set((s) =>
      s.categories.some((c) => c.name.toLowerCase() === cat.name.toLowerCase())
        ? s
        : { categories: [...s.categories, cat] },
    ),
}));
