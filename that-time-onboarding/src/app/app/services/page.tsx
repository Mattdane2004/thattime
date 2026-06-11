"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Scissors, Users, Package, Repeat } from "lucide-react";
import type { OfferType } from "@/lib/types";
import { demoOffers, SERVICE_TYPES, statusLabel, offerMeta } from "@/lib/data/offers";

// Services list — ported from the legacy that-time-app /routes/ServicesList.jsx.
// Tabs by offer type + category filter. "New" launches the wizard at /new.
// Opening an offer (the type-specific dashboards) is backlog — see PORTING.md.

const ICON: Record<OfferType, typeof Scissors> = {
  service: Scissors,
  class: Users,
  bundle: Package,
  subscription: Repeat,
};

export default function ServicesPage() {
  const [tab, setTab] = useState<OfferType>("service");
  const [category, setCategory] = useState("all");

  const byType = useMemo(() => demoOffers.filter((o) => o.type === tab), [tab]);
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(byType.map((o) => o.category)))],
    [byType],
  );
  const visible = category === "all" ? byType : byType.filter((o) => o.category === category);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center">
          <Link href="/app/hub" aria-label="Back to hub" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </Link>
          <span className="ml-1 text-[17px] font-semibold text-navy">Services</span>
        </div>
        <Link href="/new" className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy/90">
          <Plus size={15} strokeWidth={1.75} />New
        </Link>
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SERVICE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCategory("all"); }}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                tab === t.key ? "bg-navy text-white" : "bg-canvas text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {categories.length > 2 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                  category === c ? "border-navy text-navy" : "border-border text-muted"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {visible.map((o) => {
          const Icon = ICON[o.type];
          return (
            <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                <Icon size={18} className="text-navy" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-navy">{o.name}</div>
                <div className="text-[12px] text-muted">{o.category} · {offerMeta(o)}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                o.status === "published" ? "bg-canvas text-secondary" : "border border-border text-muted"
              }`}>{statusLabel(o.status)}</span>
            </div>
          );
        })}
        {visible.length === 0 && <div className="pt-12 text-center text-[13px] text-muted">Nothing here yet</div>}
      </div>
    </div>
  );
}
