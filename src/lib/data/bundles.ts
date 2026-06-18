// Bundle timeline maths — pure, SSR-safe. The Order & gaps step (Figma
// 12231-52864) and the bundle dashboard timeline (12231-53053) both derive their
// "Estimated …" headline from these helpers. `links[i]` is the after-config of
// `serviceIds[i]` (see wizardStore BundleLink).
import type { DemoOffer } from "@/lib/data/offers";
import type { BundleLink } from "@/lib/store/wizardStore";

const DEFAULT_DUR = 60;

/** A service's chair-time in minutes; falls back to a sensible default. */
export function serviceDuration(offer: DemoOffer | undefined): number {
  return offer?.durationMin ?? DEFAULT_DUR;
}

export interface BundleEstimate {
  /** In-chair minutes summed across visits — within-visit gaps count, multi-day separation does not. */
  totalMin: number;
  /** Number of separate-day bookings (1 = a single visit). */
  visits: number;
}

/**
 * Walk the ordered services accounting for the connectors:
 * `linked` services run concurrently (the group counts once, taking the longest),
 * `gap` adds its extra minutes to the visit, `separate` closes the visit and opens
 * a new one (the between-day wait is not chair-time).
 */
export function estimateBundle(serviceIds: string[], links: BundleLink[], offers: DemoOffer[]): BundleEstimate {
  const dur = (id: string) => serviceDuration(offers.find((o) => o.id === id));
  const n = serviceIds.length;
  let totalMin = 0;
  let visits = 1;
  let i = 0;
  while (i < n) {
    // Absorb a run of linked services into one concurrent group.
    let groupMax = dur(serviceIds[i]);
    while (i < n - 1 && links[i]?.kind === "linked") {
      i++;
      groupMax = Math.max(groupMax, dur(serviceIds[i]));
    }
    totalMin += groupMax;
    const lk = links[i];
    if (lk?.kind === "gap") totalMin += lk.gapMin ?? 0;
    if (i < n - 1 && lk?.kind === "separate") visits += 1;
    i++;
  }
  return { totalMin, visits };
}

/** "2h 30m" / "45m" / "0m". */
export function fmtDuration(min: number): string {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}m`;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

/** Headline for the timeline card, e.g. "2h 30m" or "1h 30m · 2 bookings". */
export function bundleTimelineLabel(est: BundleEstimate): string {
  const base = fmtDuration(est.totalMin);
  return est.visits > 1 ? `${base} · ${est.visits} bookings` : base;
}

// ── Dashboard summaries (Figma 12231-53053 / 53287) ──────────────────────────

type BundleOffer = DemoOffer & { bundle: NonNullable<DemoOffer["bundle"]> };

/** Sum of the component services' individual prices ("list value"). */
export function bundleListValue(offer: BundleOffer, offers: DemoOffer[]): number {
  return offer.bundle.serviceIds
    .map((id) => Number(offers.find((o) => o.id === id)?.price || 0))
    .reduce((a, b) => a + b, 0);
}

/** Price row value, e.g. "10% off · list value £105" or "£50 · list value £105". */
export function bundlePriceSummary(offer: BundleOffer, offers: DemoOffer[]): string {
  const list = bundleListValue(offer, offers);
  const lead =
    offer.bundle.priceMode === "discount"
      ? `${offer.bundle.discountPercent || "0"}% off`
      : offer.price === "0"
      ? "Free"
      : `£${offer.price}`;
  return `${lead} · list value £${list}`;
}

/** Included-services row value, e.g. "4 selected · Classic haircut, Colour consultation +2 more". */
export function includedServicesSummary(offer: BundleOffer, offers: DemoOffer[]): string {
  const names = offer.bundle.serviceIds
    .map((id) => offers.find((o) => o.id === id)?.name)
    .filter(Boolean) as string[];
  if (!names.length) return "No services selected";
  const head = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? ` +${names.length - 2} more` : "";
  return `${names.length} selected · ${head}${more}`;
}

/** Whether the bundle has enough set up to publish (≥2 services + a price/discount). */
export function bundleReadyToPublish(offer: BundleOffer): boolean {
  const priced = offer.bundle.priceMode === "discount" ? Boolean(offer.bundle.discountPercent) : offer.price !== "0";
  return offer.bundle.serviceIds.length >= 2 && priced;
}

/** Counts of component services that carry forms / resources (inherited properties). */
export function inheritedFromServices(offer: BundleOffer, offers: DemoOffer[]): { forms: number; resources: number } {
  const components = offer.bundle.serviceIds.map((id) => offers.find((o) => o.id === id)).filter(Boolean) as DemoOffer[];
  return {
    forms: components.filter((o) => (o.forms?.length ?? 0) > 0).length,
    resources: components.filter((o) => (o.resources?.length ?? 0) > 0).length,
  };
}

/** Flattened forms inherited from the bundle's component services, tagged with their source. */
export function inheritedForms(serviceIds: string[], offers: DemoOffer[]): { id: string; required: boolean; from: string }[] {
  return serviceIds.flatMap((sid) => {
    const svc = offers.find((o) => o.id === sid);
    return (svc?.forms ?? []).map((f) => ({ id: f.id, required: f.required, from: svc!.name }));
  });
}

/** Flattened resources inherited from the bundle's component services, tagged with their source. */
export function inheritedResources(serviceIds: string[], offers: DemoOffer[]): { id: string; from: string }[] {
  return serviceIds.flatMap((sid) => {
    const svc = offers.find((o) => o.id === sid);
    return (svc?.resources ?? []).map((r) => ({ id: r.id, from: svc!.name }));
  });
}

/** Short label for the connector under a service row; null for back-to-back. */
export function linkLabel(link: BundleLink | undefined): string | null {
  if (!link) return null;
  switch (link.kind) {
    case "gap":
      return `${fmtDuration(link.gapMin ?? 0)} extra time`;
    case "linked":
      return "Linked";
    case "separate":
      return `${link.gapDays ?? 1}-day gap`;
    default:
      return null;
  }
}
