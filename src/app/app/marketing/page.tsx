"use client";

import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft, ChevronRight, Megaphone, Send, Zap, Star, Gift, Tag, BadgePercent,
} from "lucide-react";

// Marketing hub — ported from the legacy that-time-app /routes/Marketing.jsx
// (marketingGroups). Grouped tool list; destinations are inert pending their
// screen ports (see PORTING.md).

interface Tool { key: string; label: string; desc: string; icon: LucideIcon }

const GROUPS: { title: string; items: Tool[] }[] = [
  {
    title: "Engage",
    items: [
      { key: "campaigns", label: "Campaigns", desc: "Targeted promos & announcements", icon: Megaphone },
      { key: "blasts", label: "Blast campaigns", desc: "One-off broadcasts to segments", icon: Send },
      { key: "automations", label: "Automations", desc: "Triggered flows — birthdays, win-back", icon: Zap },
      { key: "reviews", label: "Reviews", desc: "Aggregate feed & responses", icon: Star },
    ],
  },
  {
    title: "Offers",
    items: [
      { key: "rewards", label: "Rewards", desc: "Loyalty points & tiers", icon: Gift },
      { key: "discount-codes", label: "Discount codes", desc: "Promo codes for clients", icon: Tag },
      { key: "sales", label: "Sales", desc: "Limited-time service pricing", icon: BadgePercent },
    ],
  },
];

export default function MarketingPage() {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex h-16 items-center px-4">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-surface">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">Marketing</span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-8 pt-2">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{group.title}</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {group.items.map((item, i) => (
                <button key={item.key} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${i > 0 ? "border-t border-border" : ""}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas">
                    <item.icon size={16} className="text-navy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-navy">{item.label}</span>
                    <span className="block truncate text-[12px] text-secondary">{item.desc}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
