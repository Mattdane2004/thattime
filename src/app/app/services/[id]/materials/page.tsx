"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, FileText } from "lucide-react";
import { ScreenHeader, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";

// Materials module (class) — pre-reads and after-class resources. A simple
// named list; add / remove persists to the offer via updateOffer.

export default function MaterialsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [draft, setDraft] = useState("");

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Materials" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const items = offer.materials ?? [];
  const add = () => {
    const name = draft.trim();
    if (!name) return;
    updateOffer(offer.id, { materials: [...items, { name }] });
    setDraft("");
  };
  const remove = (i: number) => updateOffer(offer.id, { materials: items.filter((_, idx) => idx !== i) });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Materials" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex gap-2 pb-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a material or resource"
            aria-label="New material"
            className={`${fieldInput} flex-1`}
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            aria-label="Add material"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="pt-8 text-center text-[13px] text-muted">No materials yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas">
                  <FileText size={15} className="text-secondary" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1 text-[14px] text-navy">{it.name}</span>
                <button type="button" onClick={() => remove(i)} aria-label="Remove" className="shrink-0 text-muted hover:text-danger">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
