"use client";

// Notifications — filter chips, New / Earlier grouping, kind-tinted icons.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Settings, CalendarCheck, Heart, Percent, Receipt, BellOff } from "lucide-react";
import { clientNotifications, type ClientNotification, type NotificationKind } from "@/lib/data/b2c";

const FILTERS = ["All", "Bookings", "Social", "Offers"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_KINDS: Record<Filter, NotificationKind[]> = {
  All: ["booking", "social", "promo", "payment"],
  Bookings: ["booking"],
  Social: ["social"],
  Offers: ["promo"],
};

const KIND_META: Record<NotificationKind, { icon: typeof Heart; bg: string; fg: string }> = {
  booking: { icon: CalendarCheck, bg: "bg-cream", fg: "text-navy" },
  social: { icon: Heart, bg: "bg-coral/10", fg: "text-coral" },
  promo: { icon: Percent, bg: "bg-canvas", fg: "text-secondary" },
  payment: { icon: Receipt, bg: "bg-canvas", fg: "text-secondary" },
};

function NotificationRow({ n, onTap }: { n: ClientNotification; onTap: (n: ClientNotification) => void }) {
  const meta = KIND_META[n.kind];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={() => onTap(n)}
      className="flex w-full items-start gap-3 border-b border-border bg-surface px-4 py-3.5 text-left"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.fg}`}>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-navy">{n.title}</p>
        <p className="line-clamp-2 text-[13px] leading-snug text-secondary">{n.body}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
        <span className="text-[11px] text-muted">{n.time}</span>
        {n.unread && <span className="h-2 w-2 rounded-full bg-coral" />}
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");

  const visible = clientNotifications.filter((n) => FILTER_KINDS[filter].includes(n.kind));
  const fresh = visible.filter((n) => n.unread);
  const earlier = visible.filter((n) => !n.unread);

  const onTap = (n: ClientNotification) => {
    if (n.kind === "booking" || n.kind === "payment") router.push("/c/bookings");
    else if (n.salonId) router.push(`/c/salon/${n.salonId}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Notifications</h1>
        <button
          type="button"
          aria-label="Notification settings"
          onClick={() => router.push("/c/settings/notifications")}
          className="p-1.5 text-navy"
        >
          <Settings size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* filter chips */}
      <div className="flex gap-2 overflow-x-auto bg-surface px-4 py-3 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${
              filter === f ? "bg-ink text-white" : "border border-border bg-surface text-secondary"
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {fresh.length > 0 && (
          <>
            <p className="px-4 pb-2 pt-4 text-[12px] font-bold uppercase tracking-wide text-muted">New</p>
            {fresh.map((n) => (
              <NotificationRow key={n.id} n={n} onTap={onTap} />
            ))}
          </>
        )}
        {earlier.length > 0 && (
          <>
            <p className="px-4 pb-2 pt-4 text-[12px] font-bold uppercase tracking-wide text-muted">Earlier</p>
            {earlier.map((n) => (
              <NotificationRow key={n.id} n={n} onTap={onTap} />
            ))}
          </>
        )}
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
              <BellOff size={24} strokeWidth={1.75} />
            </span>
            <p className="text-[15px] font-bold text-navy">Nothing here yet</p>
            <p className="text-[13px] text-secondary">No {filter.toLowerCase()} notifications right now.</p>
          </div>
        )}
        <div className="h-6" />
      </div>
    </div>
  );
}
