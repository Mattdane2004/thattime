// Retail product catalogue — ported (typed) from the legacy that-time-app
// src/data/demoProductsCatalog.js. Products that can be attached to an offer.

export interface Product {
  id: string;
  category: string;
  name: string;
  basePrice: number;
}

export const productCategories = ["Oils", "Treatments", "Shampoos"] as const;

export const productsCatalog: Product[] = [
  { id: "p1", category: "Oils", name: "Moroccanoil Treatment", basePrice: 8 },
  { id: "p2", category: "Oils", name: "Argan Oil", basePrice: 5 },
  { id: "p3", category: "Oils", name: "OGX Coconut Oil", basePrice: 4 },
  { id: "p4", category: "Oils", name: "Olaplex No.7 Bonding Oil", basePrice: 12 },
  { id: "p5", category: "Treatments", name: "Hydrating Mask", basePrice: 10 },
  { id: "p6", category: "Treatments", name: "Clarifying Scrub", basePrice: 8 },
  { id: "p7", category: "Treatments", name: "Keratin Smoothing", basePrice: 18 },
  { id: "p8", category: "Shampoos", name: "Colour-Safe Shampoo", basePrice: 9 },
  { id: "p9", category: "Shampoos", name: "Volumising Shampoo", basePrice: 7 },
  { id: "p10", category: "Shampoos", name: "Purple Toning Shampoo", basePrice: 11 },
];
