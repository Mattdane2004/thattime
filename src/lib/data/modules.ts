// Catalogs for the offer module editors — ported (typed) from the legacy
// that-time-app demoFormsCatalog / demoResourcesCatalog / demoVariants.

export interface FormTemplate {
  id: string;
  name: string;
  fieldCount: number;
  description: string;
}

export const formsCatalog: FormTemplate[] = [
  { id: "f1", name: "Health questionnaire", fieldCount: 12, description: "General health screening — allergies, medications, conditions." },
  { id: "f2", name: "Consent form", fieldCount: 4, description: "Standard treatment consent and signature." },
  { id: "f3", name: "Patch test record", fieldCount: 6, description: "Records patch test results 24h before colour services." },
  { id: "f4", name: "New client intake", fieldCount: 10, description: "First-visit basics — contact, history, preferences." },
  { id: "f5", name: "Allergy info", fieldCount: 5, description: "Quick allergy check before any product use." },
  { id: "f6", name: "Photo consent", fieldCount: 3, description: "Permission to take and share before/after photos." },
];

export interface Resource {
  id: string;
  type: "space" | "equipment";
  name: string;
  capacity?: number;
}

export const resourcesCatalog: Resource[] = [
  { id: "sp1", type: "space", name: "Treatment room A", capacity: 1 },
  { id: "sp2", type: "space", name: "Treatment room B", capacity: 1 },
  { id: "sp3", type: "space", name: "VIP suite", capacity: 1 },
  { id: "sp4", type: "space", name: "Tanning studio", capacity: 2 },
  { id: "eq1", type: "equipment", name: "Wash basin" },
  { id: "eq2", type: "equipment", name: "UV lamp" },
  { id: "eq3", type: "equipment", name: "Steamer" },
  { id: "eq4", type: "equipment", name: "Tanning bed 1" },
  { id: "eq5", type: "equipment", name: "Laser machine" },
];

export interface Variant {
  id: string;
  type: "duration" | "staff" | "time";
  name: string;
  durationDelta?: number;
  priceDelta: number;
}

export const variantsCatalog: Variant[] = [
  { id: "v1", type: "duration", name: "Quick trim", durationDelta: -15, priceDelta: -10 },
  { id: "v2", type: "duration", name: "Standard", durationDelta: 0, priceDelta: 0 },
  { id: "v3", type: "duration", name: "Extended", durationDelta: 15, priceDelta: 10 },
  { id: "v4", type: "duration", name: "Deluxe 90 min", durationDelta: 30, priceDelta: 20 },
  { id: "v7", type: "staff", name: "With Alex (senior)", priceDelta: 15 },
  { id: "v8", type: "staff", name: "With Priya", priceDelta: 0 },
  { id: "v11", type: "staff", name: "With Nina (apprentice)", priceDelta: -10 },
];

export const variantTypes = ["duration", "staff", "time"] as const;

/** Signed currency/minute delta as a label, e.g. "+£10", "−15 min", "—". */
export const deltaLabel = (n: number | undefined, unit: "£" | "min"): string => {
  if (!n) return "—";
  const sign = n > 0 ? "+" : "−";
  const mag = Math.abs(n);
  return unit === "£" ? `${sign}£${mag}` : `${sign}${mag} min`;
};
