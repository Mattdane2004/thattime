"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, MapPin } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";

// Service preview — how clients see an offer. Functional port of the legacy
// that-time-app /routes/ServicePreview.jsx (the full client booking flow is the
// separate B2C app; this is the offer card preview).

export default function ServicePreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));

  const locationLabel = (() => {
    const m = offer?.locationModes;
    if (!m) return "";
    return [m.inSalon && "In-salon", m.mobile && "Mobile", m.remote && "Remote"].filter(Boolean).join(" · ");
  })();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 items-center px-4">
        <button type="button" onClick={() => router.back()} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Client preview</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="flex h-40 items-center justify-center bg-canvas text-[12px] text-muted">Photo</div>

        <div className="px-5 pb-8 pt-5">
          <div className="text-[22px] font-bold leading-tight text-navy">{offer?.name ?? "Offer"}</div>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-muted">
            <span>{offer?.category}</span>
            {offer?.durationMin && <span className="flex items-center gap-1"><Clock size={13} />{offer.durationMin} min</span>}
          </div>

          {offer?.description && (
            <p className="mt-4 text-[14px] leading-relaxed text-secondary">{offer.description}</p>
          )}

          {locationLabel && (
            <div className="mt-5 flex items-center gap-2 text-[13px] text-secondary">
              <MapPin size={15} className="text-muted" />{locationLabel}
            </div>
          )}
        </div>
      </div>

      {/* Sticky book bar */}
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button className="flex h-12 w-full items-center justify-between rounded-full bg-navy px-6 text-[15px] font-semibold text-white">
          <span>Book now</span>
          <span>{offer ? (offer.price === "0" ? "Free" : `£${offer.price}`) : ""}</span>
        </button>
      </div>
    </div>
  );
}
