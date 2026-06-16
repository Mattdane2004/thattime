"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader, Toggle } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";

// Notifications module — per-offer client reminders (all offer types). Toggling
// a row persists immediately to the offer via updateOffer.

const NOTIFS = [
  { key: "confirmation", label: "Booking confirmation", desc: "Sent immediately after booking" },
  { key: "reminder_24h", label: "24-hour reminder", desc: "The day before the appointment" },
  { key: "reminder_1h", label: "1-hour reminder", desc: "Shortly before the start time" },
  { key: "followup", label: "Thank-you & follow-up", desc: "Sent after the appointment" },
  { key: "rebook", label: "Rebooking nudge", desc: "Encourages a repeat booking" },
];

const DEFAULT_ON = ["confirmation", "reminder_24h"];

export default function NotificationsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Notifications" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const enabled = offer.notifications ?? DEFAULT_ON;
  const toggle = (key: string) =>
    updateOffer(offer.id, {
      notifications: enabled.includes(key) ? enabled.filter((k) => k !== key) : [...enabled, key],
    });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Notifications" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <p className="px-1 pb-3 text-[13px] text-muted">
          Choose which automated messages clients receive for {offer.name}.
        </p>
        <div className="overflow-hidden rounded-2xl border border-border">
          {NOTIFS.map((n, i) => (
            <button
              key={n.key}
              onClick={() => toggle(n.key)}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span className="min-w-0 flex-1 pr-3">
                <span className="block text-[14px] font-medium text-navy">{n.label}</span>
                <span className="block text-[12px] text-muted">{n.desc}</span>
              </span>
              <Toggle on={enabled.includes(n.key)} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
