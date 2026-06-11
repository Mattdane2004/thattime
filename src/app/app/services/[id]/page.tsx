import Link from "next/link";
import { ChevronLeft, ChevronRight, Scissors, Users, Package, Repeat, Clock, Tag } from "lucide-react";
import type { OfferType } from "@/lib/types";
import { getOffer, statusLabel, OFFER_MODULES } from "@/lib/data/offers";

// Offer dashboard — ported from the legacy that-time-app offer dashboards
// (/service, /class, /bundle, /subscription). Shows the offer summary and its
// module sections; each module sub-screen is backlog (rows are inert).

const ICON: Record<OfferType, typeof Scissors> = {
  service: Scissors, class: Users, bundle: Package, subscription: Repeat,
};

export default function OfferDashboardPage({ params }: { params: { id: string } }) {
  const offer = getOffer(params.id);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 items-center px-5">
          <Link href="/app/services" aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></Link>
        </div>
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const Icon = ICON[offer.type];

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/app/services" aria-label="Back to services" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></Link>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${offer.status === "published" ? "bg-canvas text-secondary" : "border border-border text-muted"}`}>
          {statusLabel(offer.status)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Summary */}
        <div className="flex items-center gap-3.5 pb-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-canvas"><Icon size={24} className="text-navy" /></span>
          <div className="min-w-0">
            <div className="text-[18px] font-bold text-navy">{offer.name}</div>
            <div className="mt-0.5 text-[12px] capitalize text-muted">{offer.type} · {offer.category}</div>
          </div>
        </div>

        <div className="mb-5 flex gap-3">
          <div className="flex-1 rounded-2xl bg-canvas px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted"><Tag size={12} />Price</div>
            <div className="mt-1 text-[16px] font-bold text-navy">{offer.price === "0" ? "Free" : `£${offer.price}`}</div>
          </div>
          {offer.durationMin && (
            <div className="flex-1 rounded-2xl bg-canvas px-4 py-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted"><Clock size={12} />Duration</div>
              <div className="mt-1 text-[16px] font-bold text-navy">{offer.durationMin}min</div>
            </div>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <Link href={`/app/services/${offer.id}/preview`} className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-[13px] font-medium text-navy hover:bg-canvas">
            Client preview
          </Link>
          <Link href={`/app/services/${offer.id}/photos`} className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-[13px] font-medium text-navy hover:bg-canvas">
            Photos
          </Link>
        </div>

        {/* Module sections */}
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Manage</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {OFFER_MODULES.map((m, i) => {
            const cls = `flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${i > 0 ? "border-t border-border" : ""}`;
            const inner = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{m.label}</span>
                  <span className="block truncate text-[12px] text-secondary">{m.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </>
            );
            // Ported module editors link out; the rest are backlog (inert).
            const ported = ["products", "variants", "resources", "forms", "related"];
            return ported.includes(m.key) ? (
              <Link key={m.key} href={`/app/services/${offer.id}/${m.key}`} className={cls}>{inner}</Link>
            ) : (
              <button key={m.key} className={cls}>{inner}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
