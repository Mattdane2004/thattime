"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { demoOffers, offerMeta } from "@/lib/data/offers";

// Related services module — cross-sell other offers alongside this one. Ported
// from the legacy that-time-app RelatedServices module. Local selection state.

export default function RelatedModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Any other offer can be suggested alongside this one.
  const options = demoOffers.filter((o) => o.id !== params.id);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">Related</span>
      </div>
      <div className="px-4 pb-2 text-[12px] text-muted">{selected.length} suggested at checkout</div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {options.map((o) => {
          const sel = selected.includes(o.id);
          return (
            <button key={o.id} onClick={() => toggle(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">{o.name}</span>
                <span className="block text-[12px] text-muted">{o.category} · {offerMeta(o)}</span>
              </span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{sel ? <Check size={15} /> : <Plus size={15} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
