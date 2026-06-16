"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, ImageIcon } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";

// Photo gallery — manage an offer's photos. Photos are placeholders here (no
// real upload); the list persists to the offer via updateOffer so the empty
// state and gallery reflect real setup.

const TONES = ["bg-canvas", "bg-border/60", "bg-navy/5", "bg-warning/10", "bg-success/10", "bg-danger/5"];

export default function PhotosModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 items-center px-5">
          <button type="button" aria-label="Back" onClick={() => router.push("/app/services")} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
          <span className="ml-1 text-[17px] font-semibold text-navy">Photos</span>
        </div>
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const photos = offer.photos ?? [];
  const add = () => updateOffer(offer.id, { photos: [...photos, photos.length ? Math.max(...photos) + 1 : 0] });
  const remove = (id: number) => updateOffer(offer.id, { photos: photos.filter((x) => x !== id) });

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center">
          <button type="button" aria-label="Back" onClick={() => router.push(`/app/services/${offer.id}`)} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </button>
          <span className="ml-1 text-[17px] font-semibold text-navy">Photos</span>
        </div>
        {photos.length > 0 && (
          <button onClick={add} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
            <Plus size={15} strokeWidth={1.75} />Add
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <ImageIcon size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No photos yet</div>
            <div className="mt-1 text-[13px] text-muted">Add photos so clients can see your work.</div>
            <button onClick={add} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy/90">
              <Plus size={16} strokeWidth={1.75} />Add photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((id) => (
              <div key={id} className={`relative aspect-square overflow-hidden rounded-2xl ${TONES[id % TONES.length]}`}>
                <span className="absolute inset-0 flex items-center justify-center text-[12px] text-muted">Photo {id + 1}</span>
                <button onClick={() => remove(id)} aria-label="Remove photo"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-danger shadow-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
