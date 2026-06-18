// Helpers for membership subscriptions: tier readbacks, readiness checks and
// legacy single-benefit fallbacks used by the dashboard and creation wizard.
import type { DemoOffer } from "./offers";
import type { MembershipScope, MembershipTier, SubscriptionDraft } from "@/lib/store/wizardStore";
import { starterMembershipTier } from "@/lib/store/wizardStore";

const PERIOD_LABEL: Record<MembershipTier["billingPeriod"], string> = {
  week: "week",
  month: "month",
  quarter: "quarter",
  year: "year",
};

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const plural = (count: number, one: string, many = `${one}s`) => (count === 1 ? one : many);

const namesFor = (ids: string[], allOffers: DemoOffer[]) =>
  ids.map((id) => allOffers.find((o) => o.id === id)?.name).filter(Boolean) as string[];

const compactNames = (names: string[], fallback: string) => {
  if (!names.length) return fallback;
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(" and ");
  return `${names[0]}, ${names[1]} +${names.length - 2} more`;
};

export function normalizeMembershipTiers(sub: SubscriptionDraft): MembershipTier[] {
  if (sub.tiers?.length) return sub.tiers;

  const tier = starterMembershipTier();
  tier.name = "Membership";
  tier.price = "";
  tier.billingPeriod = sub.billingPeriod;
  tier.serviceBookingsEnabled = sub.benefitType === "sessions";
  tier.serviceBookingAllowance = sub.includedSessions || 1;
  tier.serviceBookingScope = sub.includedServiceIds.length ? "selected" : "all";
  tier.serviceBookingIds = [...sub.includedServiceIds];
  tier.serviceDiscountEnabled = sub.benefitType === "discount";
  tier.serviceDiscountPercent = sub.memberDiscountPercent;
  tier.serviceDiscountScope = sub.includedServiceIds.length ? "selected" : "all";
  tier.serviceDiscountIds = [...sub.includedServiceIds];
  tier.accessEnabled = sub.benefitType === "access";
  tier.accessServiceIds = [...sub.includedServiceIds];
  return [tier];
}

export function tierPriceLabel(tier: MembershipTier): string {
  return tier.price ? `£${tier.price}/${PERIOD_LABEL[tier.billingPeriod]}` : `price not set/${PERIOD_LABEL[tier.billingPeriod]}`;
}

export function scopeLabel(scope: MembershipScope, selectedIds: string[], allLabel: string, selectedLabel: string) {
  return scope === "all" ? allLabel : selectedIds.length ? selectedLabel : "selected items";
}

export function parentTierFor(tier: MembershipTier, tiers: MembershipTier[]): MembershipTier | undefined {
  return tier.inheritsFromTierId ? tiers.find((candidate) => candidate.id === tier.inheritsFromTierId) : undefined;
}

export function tierInheritedSectionLabels(tier: MembershipTier, tiers: MembershipTier[]): string[] {
  const parent = parentTierFor(tier, tiers);
  if (!parent) return [];
  const labels: string[] = [];
  if (tier.inheritServiceBookings && parent.serviceBookingsEnabled) labels.push("service bookings");
  if (tier.inheritClassBookings && parent.classBookingsEnabled) labels.push("class bookings");
  if (
    tier.inheritDiscounts &&
    (parent.serviceDiscountEnabled || parent.classDiscountEnabled || parent.productDiscountEnabled)
  ) labels.push("discounts");
  if (tier.inheritAccess && parent.accessEnabled) labels.push("member-only access");
  return labels;
}

export function tierOwnBenefitCount(tier: MembershipTier): number {
  return [
    tier.serviceBookingsEnabled,
    tier.classBookingsEnabled,
    tier.serviceDiscountEnabled,
    tier.classDiscountEnabled,
    tier.productDiscountEnabled,
    tier.accessEnabled,
  ].filter(Boolean).length;
}

export function tierBenefitCount(tier: MembershipTier, tiers: MembershipTier[]): number {
  return tierOwnBenefitCount(tier) + tierInheritedSectionLabels(tier, tiers).length;
}

export function tierInheritanceLabel(tier: MembershipTier, tiers: MembershipTier[]): string {
  const parent = parentTierFor(tier, tiers);
  const sections = tierInheritedSectionLabels(tier, tiers);
  if (!parent || !sections.length) return "No inherited benefits";
  return `Includes ${parent.name || "previous tier"} ${sections.join(", ")}`;
}

export function tierServiceBookingLabel(tier: MembershipTier, offers: DemoOffer[]): string | null {
  if (!tier.serviceBookingsEnabled) return null;
  const target = tier.serviceBookingScope === "all"
    ? "all services"
    : compactNames(namesFor(tier.serviceBookingIds, offers), "selected services");
  if (tier.serviceBookingsUnlimited) return `unlimited service bookings / ${PERIOD_LABEL[tier.billingPeriod]} from ${target}`;
  const count = Math.max(1, tier.serviceBookingAllowance || 1);
  return `${count} ${plural(count, "service booking")} / ${PERIOD_LABEL[tier.billingPeriod]} from ${target}`;
}

export function tierClassBookingLabel(tier: MembershipTier, offers: DemoOffer[]): string | null {
  if (!tier.classBookingsEnabled) return null;
  const target = tier.classBookingScope === "all"
    ? "all classes"
    : compactNames(namesFor(tier.classBookingIds, offers), "selected classes");
  if (tier.classBookingsUnlimited) return `unlimited class bookings / ${PERIOD_LABEL[tier.billingPeriod]} from ${target}`;
  const count = Math.max(1, tier.classBookingAllowance || 1);
  return `${count} ${plural(count, "class booking")} / ${PERIOD_LABEL[tier.billingPeriod]} from ${target}`;
}

export function tierDiscountLabels(tier: MembershipTier, offers: DemoOffer[], productName: (id: string) => string): string[] {
  const labels: string[] = [];
  if (tier.serviceDiscountEnabled && tier.serviceDiscountPercent) {
    labels.push(`${tier.serviceDiscountPercent}% off ${tier.serviceDiscountScope === "all" ? "all services" : compactNames(namesFor(tier.serviceDiscountIds, offers), "selected services")}`);
  }
  if (tier.classDiscountEnabled && tier.classDiscountPercent) {
    labels.push(`${tier.classDiscountPercent}% off ${tier.classDiscountScope === "all" ? "all classes" : compactNames(namesFor(tier.classDiscountIds, offers), "selected classes")}`);
  }
  if (tier.productDiscountEnabled && tier.productDiscountPercent) {
    const productNames = tier.productDiscountIds.map(productName).filter(Boolean);
    labels.push(`${tier.productDiscountPercent}% off ${tier.productDiscountScope === "all" ? "all products" : compactNames(productNames, "selected products")}`);
  }
  return labels;
}

export function tierAccessLabel(tier: MembershipTier, offers: DemoOffer[]): string | null {
  if (!tier.accessEnabled) return null;
  const serviceNames = namesFor(tier.accessServiceIds, offers);
  const classNames = namesFor(tier.accessClassIds, offers);
  const parts: string[] = [];
  if (serviceNames.length) parts.push(compactNames(serviceNames, "member-only services"));
  if (classNames.length) parts.push(compactNames(classNames, "member-only classes"));
  return parts.length ? `member-only access to ${parts.join(" and ")}` : "member-only access not set";
}

export function tierPlanSentence(
  tier: MembershipTier,
  offers: DemoOffer[],
  productName: (id: string) => string = () => "",
  allTiers: MembershipTier[] = [tier],
): string {
  const parent = parentTierFor(tier, allTiers);
  const inherited = tierInheritedSectionLabels(tier, allTiers);
  const benefits = [
    parent && inherited.length ? `${parent.name || "previous tier"}'s ${inherited.join(", ")}` : null,
    tierServiceBookingLabel(tier, offers),
    tierClassBookingLabel(tier, offers),
    ...tierDiscountLabels(tier, offers, productName),
    tierAccessLabel(tier, offers),
  ].filter(Boolean) as string[];

  const intro = `${tier.name || "This tier"} members pay ${tierPriceLabel(tier)}`;
  if (!benefits.length) return `${intro}. Add at least one member benefit.`;
  return `${intro}. They get ${benefits.join(", ")}.`;
}

export function membershipPlanSentences(
  sub: SubscriptionDraft,
  offers: DemoOffer[],
  productName: (id: string) => string = () => "",
): string[] {
  const tiers = normalizeMembershipTiers(sub);
  return tiers.map((tier) => tierPlanSentence(tier, offers, productName, tiers));
}

export function subscriptionReadinessIssues(offer: Pick<DemoOffer, "price" | "subscription">): string[] {
  const issues: string[] = [];
  const sub = offer.subscription;
  if (!sub) return ["Add at least one membership tier"];

  const tiers = normalizeMembershipTiers(sub).map((tier) => (
    !sub.tiers?.length && offer.price && !tier.price ? { ...tier, price: offer.price } : tier
  ));
  if (!tiers.length) issues.push("Add at least one membership tier");

  tiers.forEach((tier) => {
    const label = tier.name || "Tier";
    if (!tier.name.trim()) issues.push("Name every tier");
    if (!tier.price || tier.price === "0") issues.push(`Set a price for ${label}`);

    const hasBenefit = tierBenefitCount(tier, tiers) > 0;
    if (!hasBenefit) issues.push(`Add at least one benefit to ${label}`);

    if (tier.serviceBookingsEnabled && tier.serviceBookingScope === "selected" && !tier.serviceBookingIds.length) {
      issues.push(`Choose services for ${label}`);
    }
    if (tier.classBookingsEnabled && tier.classBookingScope === "selected" && !tier.classBookingIds.length) {
      issues.push(`Choose classes for ${label}`);
    }
    if (tier.serviceDiscountEnabled && (!tier.serviceDiscountPercent || (tier.serviceDiscountScope === "selected" && !tier.serviceDiscountIds.length))) {
      issues.push(`Finish service discount for ${label}`);
    }
    if (tier.classDiscountEnabled && (!tier.classDiscountPercent || (tier.classDiscountScope === "selected" && !tier.classDiscountIds.length))) {
      issues.push(`Finish class discount for ${label}`);
    }
    if (tier.productDiscountEnabled && (!tier.productDiscountPercent || (tier.productDiscountScope === "selected" && !tier.productDiscountIds.length))) {
      issues.push(`Finish product discount for ${label}`);
    }
    if (tier.accessEnabled && !tier.accessServiceIds.length && !tier.accessClassIds.length) {
      issues.push(`Choose member-only services or classes for ${label}`);
    }
  });

  return Array.from(new Set(issues));
}

export function subscriptionPlanSentence(
  sub: SubscriptionDraft,
  _offerOrPrice: Pick<DemoOffer, "price"> | string,
  allOffers: DemoOffer[],
): string {
  return membershipPlanSentences(sub, allOffers)[0] ?? "Add at least one membership tier.";
}

export function subscriptionBenefitLabel(sub: SubscriptionDraft): string {
  const tiers = normalizeMembershipTiers(sub);
  const count = tiers.length;
  const benefits = tiers.reduce((total, tier) => total + tierBenefitCount(tier, tiers), 0);
  return `${count} ${plural(count, "tier")} · ${benefits} ${plural(benefits, "benefit")}`;
}

export function subscriptionBillingLabel(price: string, sub: SubscriptionDraft): string {
  const tiers = normalizeMembershipTiers(sub);
  const priced = tiers.filter((tier) => tier.price);
  if (!priced.length) return price && price !== "0" ? `From £${price}` : "Tier prices not set";
  if (priced.length === 1) return tierPriceLabel(priced[0]);
  const lowest = priced.reduce((min, tier) => Math.min(min, Number(tier.price) || min), Number(priced[0].price));
  return `From £${lowest}/${PERIOD_LABEL[priced[0].billingPeriod]}`;
}

export function subscriptionTermsLabel(sub: SubscriptionDraft): string {
  const parts: string[] = [];
  if (sub.joiningFeeEnabled && sub.joiningFee) parts.push(`£${sub.joiningFee} joining fee`);
  if (sub.minimumTermEnabled && sub.minimumTermMonths) parts.push(`${sub.minimumTermMonths}-month minimum`);
  parts.push(sub.cancellationRule === "cancel_anytime" ? "cancel anytime" : "cancel after minimum term");
  return parts.join(" · ");
}

export function subscriptionIncludedLabel(sub: SubscriptionDraft, allOffers: DemoOffer[]): string {
  const tiers = normalizeMembershipTiers(sub);
  const serviceIds = new Set<string>();
  const classIds = new Set<string>();
  tiers.forEach((tier) => {
    tier.serviceBookingIds.forEach((id) => serviceIds.add(id));
    tier.serviceDiscountIds.forEach((id) => serviceIds.add(id));
    tier.accessServiceIds.forEach((id) => serviceIds.add(id));
    tier.classBookingIds.forEach((id) => classIds.add(id));
    tier.classDiscountIds.forEach((id) => classIds.add(id));
    tier.accessClassIds.forEach((id) => classIds.add(id));
  });
  const parts: string[] = [];
  if (tiers.some((tier) => tier.serviceBookingScope === "all" || tier.serviceDiscountScope === "all")) parts.push("all services");
  if (tiers.some((tier) => tier.classBookingScope === "all" || tier.classDiscountScope === "all")) parts.push("all classes");
  if (serviceIds.size) parts.push(compactNames(namesFor(Array.from(serviceIds), allOffers), "selected services"));
  if (classIds.size) parts.push(compactNames(namesFor(Array.from(classIds), allOffers), "selected classes"));
  return parts.length ? parts.join(" · ") : "No included items yet";
}

export function subscriptionReadyToPublish(offer: DemoOffer): boolean {
  return subscriptionReadinessIssues(offer).length === 0;
}

export function coveredServiceNames(sub: SubscriptionDraft, allOffers: DemoOffer[]): string[] {
  const ids = normalizeMembershipTiers(sub).flatMap((tier) => [
    ...tier.serviceBookingIds,
    ...tier.serviceDiscountIds,
    ...tier.accessServiceIds,
  ]);
  return namesFor(Array.from(new Set(ids)), allOffers);
}

export function subscriptionCoverageLabel(sub: SubscriptionDraft, allOffers: DemoOffer[]): string {
  return subscriptionIncludedLabel(sub, allOffers).toLowerCase();
}

export function subscriptionAllowanceLabel(sub: SubscriptionDraft): string {
  return subscriptionBenefitLabel(sub);
}

export function benefitUsesServices() {
  return true;
}

export { PERIOD_LABEL as subscriptionPeriodLabels, titleCase as titleCasePeriod };
