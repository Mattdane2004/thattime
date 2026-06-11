"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { productsCatalog, productCategories } from "@/lib/data/products";

// Products module editor — a functional port of the legacy that-time-app
// service "Products" module. Attach retail products to an offer; selection is
// local state (persisting to the offer is backlog).

export default function ProductsModulePage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<string[]>([]);

  const visible = category === "All" ? productsCatalog : productsCatalog.filter((p) => p.category === category);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href={`/app/services/${params.id}`} aria-label="Back to offer" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <span className="ml-1 text-[17px] font-semibold text-navy">Products</span>
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...productCategories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                category === c ? "bg-navy text-white" : "bg-canvas text-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-1 text-[12px] text-muted">{selected.length} added to this offer</div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {visible.map((p) => {
          const isSel = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${isSel ? "border-navy" : "border-border hover:bg-canvas"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">{p.name}</span>
                <span className="block text-[12px] text-muted">{p.category} · £{p.basePrice}</span>
              </span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isSel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>
                {isSel ? <Check size={15} /> : <Plus size={15} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
