"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Scissors, Users, Package, Repeat, Search, SlidersHorizontal } from "lucide-react";
import type { OfferType } from "@/lib/types";
import { SERVICE_TYPES, offerMeta } from "@/lib/data/offers";
import { useOffersStore } from "@/lib/store/offersStore";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";

// Offerings list (Figma 12135:46107) — "Everything you offer, in one place."
// Type tabs, search, category chips with counts, and category-grouped rows.

const ICON: Record<OfferType, typeof Scissors> = {
  service: Scissors,
  class: Users,
  bundle: Package,
  subscription: Repeat,
};

const catColor = (name: string) => defaultCategories.find((c) => c.name === name)?.color ?? "#9CA3AF";

export default function ServicesPage() {
  const router = useRouter();
  const offers = useOffersStore((s) => s.offers);
  const [tab, setTab] = useState<OfferType>("service");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const byType = useMemo(() => offers.filter((o) => o.type === tab), [offers, tab]);
  const searched = useMemo(
    () => byType.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase())),
    [byType, query],
  );
  const categories = useMemo(
    () => Array.from(new Set(byType.map((o) => o.category))),
    [byType],
  );
  const visible = category === "all" ? searched : searched.filter((o) => o.category === category);
  const grouped = useMemo(() => {
    const out: { category: string; items: typeof visible }[] = [];
    for (const cat of categories) {
      const items = visible.filter((o) => o.category === cat);
      if (items.length) out.push({ category: cat, items });
    }
    return out;
  }, [categories, visible]);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 items-center justify-between px-5">
        <button type="button" onClick={() => router.back()} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <Link href="/new" className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
          <Plus size={15} strokeWidth={1.75} />New
        </Link>
      </div>

      <div className="px-5 pb-3">
        <div className="text-[26px] font-bold tracking-tight text-navy">Offerings</div>
        <div className="mt-0.5 text-[13px] text-muted">Everything you offer, in one place.</div>
      </div>

      <div className="border-b border-border px-5">
        <div className="flex gap-5 overflow-x-auto">
          {SERVICE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCategory("all"); }}
              className={`shrink-0 border-b-2 pb-2.5 text-[13px] font-semibold transition-colors ${
                tab === t.key ? "border-navy text-navy" : "border-transparent text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-2 pt-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-xl bg-canvas pl-10 pr-3 text-[13px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </div>
        <button aria-label="Filters" className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-navy">
          <SlidersHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <button
          onClick={() => setCategory("all")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
            category === "all" ? "bg-navy text-white" : "bg-canvas text-secondary"
          }`}
        >
          All<span className={`rounded-full px-1.5 text-[11px] ${category === "all" ? "bg-white/20" : "bg-surface"}`}>{searched.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
              category === c ? "bg-navy text-white" : "bg-canvas text-secondary"
            }`}
          >
            {c}
            <span className={`rounded-full px-1.5 text-[11px] ${category === c ? "bg-white/20" : "bg-surface"}`}>
              {searched.filter((o) => o.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {grouped.map(({ category: cat, items }) => (
          <div key={cat} className="pb-4">
            <div className="flex items-center justify-between px-1 pb-2 pt-1">
              <span className="text-[14px] font-semibold text-navy">{cat}</span>
              <span className="text-[12px] text-muted">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((o) => {
                const Icon = ICON[o.type];
                const color = catColor(o.category);
                return (
                  <Link
                    key={o.id}
                    href={`/app/services/${o.id}`}
                    className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-surface py-3 pr-3 hover:border-navy/20"
                  >
                    <span className="h-12 w-1 shrink-0 rounded-r" style={{ backgroundColor: color }} />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: tintFromHex(color, 0.14) }}>
                      <Icon size={17} style={{ color }} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-semibold text-navy">{o.name}</span>
                        {o.status === "draft" && (
                          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted">Draft</span>
                        )}
                      </span>
                      <span className="block text-[12px] text-muted">{offerMeta(o)}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-muted" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="pt-12 text-center">
            <div className="text-[14px] font-medium text-navy">Nothing here yet</div>
            <div className="mt-1 text-[12px] text-muted">
              {query ? "Try a different search." : `Add your first ${tab} to get started.`}
            </div>
            <Link href="/new" className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-navy px-4 text-[13px] font-semibold text-white">
              <Plus size={14} />New offering
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
