"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Camera } from "lucide-react";

// Photo gallery — manage an offer's photos. Functional port of the legacy
// that-time-app /routes/PhotoGallery.jsx. Photos are local placeholders here
// (persisting to the offer is backlog).

const TONES = ["bg-canvas", "bg-border/60", "bg-navy/5", "bg-warning/10", "bg-success/10", "bg-danger/5"];

export default function PhotosModulePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<number[]>([0, 1]);

  const add = () => setPhotos((p) => [...p, p.length ? Math.max(...p) + 1 : 0]);
  const remove = (id: number) => setPhotos((p) => p.filter((x) => x !== id));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </button>
          <span className="ml-1 text-[17px] font-semibold text-navy">Photos</span>
        </div>
        <button onClick={add} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
          <Plus size={15} strokeWidth={1.75} />Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center pt-16 text-center">
            <Camera size={28} className="text-muted" />
            <div className="mt-3 text-[14px] font-medium text-navy">No photos yet</div>
            <div className="mt-1 text-[12px] text-muted">Add photos so clients can see your work.</div>
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
