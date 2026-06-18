import type { DemoOffer, ServiceBundleOption } from "@/lib/data/offers";

const money = (value: number) => {
  if (!Number.isFinite(value)) return "£0";
  return `£${Number.isInteger(value) ? value : value.toFixed(2)}`;
};

export function serviceBundleFullPrice(offer: Pick<DemoOffer, "price">, bundle: Pick<ServiceBundleOption, "quantity">) {
  return (Number(offer.price) || 0) * Math.max(1, bundle.quantity || 1);
}

export function serviceBundlePrice(offer: Pick<DemoOffer, "price">, bundle: Pick<ServiceBundleOption, "quantity" | "pricingMode" | "discountPercent" | "fixedPrice">) {
  const full = serviceBundleFullPrice(offer, bundle);
  if (bundle.pricingMode === "fixed") {
    return Math.max(0, Number(bundle.fixedPrice) || 0);
  }
  const discount = Math.min(100, Math.max(0, Number(bundle.discountPercent) || 0));
  return Math.max(0, full * (1 - discount / 100));
}

export function serviceBundleSavings(offer: Pick<DemoOffer, "price">, bundle: Pick<ServiceBundleOption, "quantity" | "pricingMode" | "discountPercent" | "fixedPrice">) {
  return Math.max(0, serviceBundleFullPrice(offer, bundle) - serviceBundlePrice(offer, bundle));
}

export function serviceBundleSummary(offer: Pick<DemoOffer, "price" | "name">, bundle: ServiceBundleOption) {
  const full = serviceBundleFullPrice(offer, bundle);
  const price = serviceBundlePrice(offer, bundle);
  const savings = serviceBundleSavings(offer, bundle);
  const pricing = bundle.pricingMode === "fixed"
    ? `${money(price)} bundle price`
    : `${Number(bundle.discountPercent) || 0}% off`;
  return `${bundle.quantity} ${offer.name} bookings · ${pricing} · saves ${money(savings)} vs ${money(full)}`;
}

export function serviceBundleClientLine(offer: Pick<DemoOffer, "price" | "name">, bundle: ServiceBundleOption) {
  return `${bundle.quantity} x ${offer.name} for ${money(serviceBundlePrice(offer, bundle))}`;
}

export { money as formatServiceBundleMoney };
