"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Layers, Repeat, GraduationCap } from "lucide-react";
import type { OfferType } from "@/lib/types/offer";
import type { CategoryName } from "@/lib/tokens/categories";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";

/** Initials avatar tinted by the salon's service category. */
export function Avatar({
  initials,
  category,
  size = 40,
  ring = false,
}: {
  initials: string;
  category?: CategoryName;
  size?: number;
  ring?: boolean;
}) {
  const color = defaultCategories.find((c) => c.name === category)?.color;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        ring ? "ring-2 ring-coral ring-offset-2" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: color ? tintFromHex(color, 0.14) : "var(--canvas)",
        color: color ?? "var(--navy)",
      }}
    >
      {initials}
    </span>
  );
}

export function Stars({ rating, count, size = 12 }: { rating: string; count?: number; size?: number }) {
  return (
    <span className="flex items-center gap-1 text-[13px] font-medium text-navy">
      {rating}
      <Star size={size} className="fill-current" />
      {count !== undefined && <span className="font-normal text-secondary">({count.toLocaleString()})</span>}
    </span>
  );
}

const OFFER_TYPE_META: Record<OfferType, { label: string; icon: ReactNode } | null> = {
  service: null,
  class: { label: "Class", icon: <GraduationCap size={11} strokeWidth={2} /> },
  bundle: { label: "Bundle", icon: <Layers size={11} strokeWidth={2} /> },
  subscription: { label: "Membership", icon: <Repeat size={11} strokeWidth={2} /> },
};

/** Small badge distinguishing classes / bundles / memberships from plain services. */
export function OfferTypeBadge({ type }: { type: OfferType }) {
  const meta = OFFER_TYPE_META[type];
  if (!meta) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-white">
      {meta.icon}
      {meta.label}
    </span>
  );
}

/** Coral toggle switch (consumer settings). Distinct from the business Toggle. */
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-coral" : "bg-border"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`h-6 w-6 rounded-full bg-white shadow ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}

/** Label/value summary row (booking & checkout summaries). `accent` highlights coral. */
export function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${accent ? "font-medium text-coral" : "text-secondary"}`}>{label}</span>
      <span className={`text-[13px] font-medium ${accent ? "text-coral" : "text-navy"}`}>{value}</span>
    </div>
  );
}

/** Square grid tile for Instagram-style post grids. */
export function GridTile({ image, onClick, badge }: { image: string; onClick?: () => void; badge?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="relative block aspect-square w-full overflow-hidden bg-border">
      <Image src={image} alt="" fill sizes="126px" className="object-cover" />
      {badge && <span className="absolute right-1.5 top-1.5">{badge}</span>}
    </button>
  );
}
