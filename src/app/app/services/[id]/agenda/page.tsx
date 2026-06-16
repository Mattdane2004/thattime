"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ScreenHeader, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";

// Agenda & syllabus module (class) — an ordered list of session items.
// Adding / removing an item persists to the offer via updateOffer.

export default function AgendaModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [draft, setDraft] = useState("");

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Agenda" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const items = offer.agenda ?? [];
  const add = () => {
    const title = draft.trim();
    if (!title) return;
    updateOffer(offer.id, { agenda: [...items, { title }] });
    setDraft("");
  };
  const remove = (i: number) => updateOffer(offer.id, { agenda: items.filter((_, idx) => idx !== i) });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Agenda & syllabus" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex gap-2 pb-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add an agenda item"
            aria-label="New agenda item"
            className={`${fieldInput} flex-1`}
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            aria-label="Add agenda item"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="pt-8 text-center text-[13px] text-muted">No agenda items yet.</p>
        ) : (
          <ol className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-navy">{i + 1}</span>
                <span className="min-w-0 flex-1 text-[14px] text-navy">{it.title}</span>
                <button type="button" onClick={() => remove(i)} aria-label="Remove" className="shrink-0 text-muted hover:text-danger">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
