"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, UserRound, Wallet } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { demoOffers, offerMeta } from "@/lib/data/offers";
import { teamRoster } from "@/lib/data/team";
import { bookingDays, clientBusiness } from "@/lib/data/clientApp";
import { useClientBooking, ANY_PROFESSIONAL } from "@/lib/store/clientBooking";

export default function ReviewBookingPage() {
  const router = useRouter();
  const { serviceIds, staffId, dayId, time } = useClientBooking();
  const items = serviceIds
    .map((id) => demoOffers.find((o) => o.id === id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));
  const total = items.reduce((sum, o) => sum + Number(o.price), 0);
  const staffName =
    staffId === ANY_PROFESSIONAL
      ? "Any professional"
      : teamRoster.find((t) => t.id === staffId)?.name ?? "Not selected";
  const dayLabel = bookingDays.find((d) => d.id === dayId)?.label;

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={items.length === 0 || !dayId || !time}
          onClick={() => router.push("/client/book/confirmed")}
        >
          Confirm booking
        </PrimaryButton>
      }
    >
      <Title sub="Check everything looks right before you confirm.">Review and confirm</Title>

      <div className="flex flex-col gap-4 px-6 pb-4 pt-4">
        {/* Where / when / who */}
        <div className="rounded-2xl border border-border bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <MapPin size={17} strokeWidth={1.8} className="shrink-0 text-muted" />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-navy">{clientBusiness.name}</span>
              <span className="block text-[12px] text-secondary">{clientBusiness.address}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3">
            <CalendarDays size={17} strokeWidth={1.8} className="shrink-0 text-muted" />
            <span className="text-[14px] font-semibold text-navy">
              {dayLabel && time ? `${dayLabel} 2026 · ${time}` : "Time not selected"}
            </span>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3">
            <UserRound size={17} strokeWidth={1.8} className="shrink-0 text-muted" />
            <span className="text-[14px] font-semibold text-navy">{staffName}</span>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-border bg-white">
          {items.length === 0 && (
            <p className="px-4 py-3 text-[13px] text-muted">No services selected yet.</p>
          )}
          {items.map((o, i) => (
            <div
              key={o.id}
              className={`flex items-center justify-between px-4 py-3 ${i ? "border-t border-border" : ""}`}
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-navy">{o.name}</span>
                <span className="block text-[12px] text-secondary">{offerMeta(o)}</span>
              </span>
              <span className="text-[14px] font-semibold text-navy">
                {o.price === "0" ? "Free" : `£${o.price}`}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-[14px] font-bold text-navy">Total</span>
            <span className="text-[15px] font-bold text-navy">£{total}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <Wallet size={17} strokeWidth={1.8} className="shrink-0 text-muted" />
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-navy">Pay at the venue</span>
            <span className="block text-[12px] text-secondary">Nothing is charged now.</span>
          </span>
        </div>

        <p className="px-1 text-[12px] leading-snug text-muted">
          Free cancellation up to 24 hours before your appointment. After that a 50% fee may apply.
        </p>
      </div>
    </Screen>
  );
}
