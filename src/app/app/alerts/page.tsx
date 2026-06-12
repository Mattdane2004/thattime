"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, MessageSquare, Star, Sparkles, Heart } from "lucide-react";
import { alertGroups, alertFilters, ALERT_FILTER_KIND, type AlertKind } from "@/lib/data/alerts";

// Alerts — activity feed. Ported from the legacy that-time-app
// /routes/main/Alerts.jsx. Grouped by day with a category filter.

const ICON: Record<AlertKind, typeof Calendar> = {
  appointment: Calendar, message: MessageSquare, review: Star, update: Sparkles, favourite: Heart,
};

export default function AlertsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("All");
  const kind = ALERT_FILTER_KIND[filter];

  const groups = alertGroups
    .map((g) => ({ ...g, items: kind === "all" ? g.items : g.items.filter((i) => i.kind === kind) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">Alerts</span>
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {alertFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${filter === f ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.label}</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {g.items.map((item, i) => {
                const Icon = ICON[item.kind];
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Icon size={16} className="text-navy" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-navy">{item.title}</div>
                      <div className="truncate text-[12px] text-muted">{item.detail}</div>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && <div className="pt-12 text-center text-[13px] text-muted">Nothing here</div>}
      </div>
    </div>
  );
}
