"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { StaffEditor, staffComplete, type StaffValue } from "@/components/offer/StaffEditor";

// Dashboard staff editor (Figma 12216:39599) — full-screen route reusing the
// shared StaffEditor on the offer.

export default function StaffEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 items-center px-5">
          <button type="button" aria-label="Back" onClick={() => router.push("/app/services")} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        </div>
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const value: StaffValue = {
    locationModes: offer.locationModes ?? { inSalon: true, mobile: false, remote: false },
    locationIds: offer.locationIds ?? [],
    staffIds: offer.staffIds ?? [],
    staffByLocation: offer.staffByLocation ?? {},
  };
  const count = staffComplete(value)
    ? value.staffIds.length || new Set(Object.values(value.staffByLocation).flat()).size
    : 0;
  const isClass = offer.type === "class";

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <button type="button" aria-label="Back" onClick={() => router.push(`/app/services/${offer.id}`)} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        <span className="text-center">
          <span className="block text-[15px] font-semibold text-navy">{isClass ? "Instructors" : "Staff"}</span>
          <span className="block text-[11px] text-muted">{offer.name}</span>
        </span>
        <span className="text-[13px] text-muted">Help</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-2">
        <StaffEditor value={value} isClass={isClass} onChange={(patch) => updateOffer(offer.id, patch)} />
      </div>
      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Save{count ? ` · ${count} selected` : ""}
        </button>
      </div>
    </div>
  );
}
