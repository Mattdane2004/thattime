"use client";

// Booking detail — hero, info rows, receipt sheet, reschedule + cancel
// (confirm sheet flips local status), message / calendar actions.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  Receipt,
  Check,
  MessageCircle,
  CalendarPlus,
  Star,
  RotateCcw,
} from "lucide-react";
import {
  StatusPill,
  Sheet,
  DarkButton,
  GhostButton,
  MiniCalendar,
  TimeChips,
} from "@/components/app/ui";
import { Avatar } from "@/components/client/shared";
import { getBooking, getSalon, type BookingStatus } from "@/lib/data/b2c";

const parsePrice = (p: string) => Number(p.replace(/[^\d.]/g, "")) || 0;
const gbp = (n: number) => `£${n.toFixed(2)}`;

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const booking = getBooking(params.id);
  const salon = booking ? getSalon(booking.salonId) : undefined;

  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // reschedule
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedDay, setReschedDay] = useState<number | null>(null);
  const [reschedTime, setReschedTime] = useState<string | null>(null);
  const [reschedDone, setReschedDone] = useState(false);

  // review
  const [reviewOpen, setReviewOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewedLocal, setReviewedLocal] = useState(false);

  if (!booking || !salon) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-[14px] text-secondary">Booking not found.</p>
      </div>
    );
  }

  const effStatus = status ?? booking.status;
  const upcoming = effStatus === "confirmed" || effStatus === "pending";
  const completed = effStatus === "completed";
  const reviewed = booking.reviewed || reviewedLocal;
  const price = parsePrice(booking.price);
  const staff = salon.staff.find((s) => s.name === booking.staff);

  const statusLabel =
    effStatus === "confirmed" ? "Confirmed" : effStatus === "pending" ? "Pending confirmation" : effStatus === "completed" ? "Completed" : "Cancelled";
  const tone = effStatus === "pending" ? "amber" : effStatus === "cancelled" ? "danger" : "light";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-surface px-3 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => router.back()} aria-label="Back" className="p-1.5 text-navy">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </motion.button>
          <p className="flex-1 font-display text-[16px] font-extrabold tracking-tight text-navy">Booking</p>
          <span className="pr-2">
            <StatusPill tone={tone}>{statusLabel}</StatusPill>
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {/* hero */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="relative h-32 w-full bg-border">
            <Image src={booking.image} alt="" fill sizes="378px" className="object-cover" />
          </div>
          <div className="p-4">
            <p className="text-[17px] font-bold text-navy">{booking.offerName}</p>
            <Link href={`/c/salon/${salon.id}`} className="mt-2 flex items-center gap-2.5">
              <Avatar initials={salon.avatar} category={salon.category} size={32} />
              <span className="flex-1 text-[13px] font-medium text-navy">{salon.name}</span>
              <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
            </Link>
          </div>
        </div>

        {/* info rows */}
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <InfoRow icon={<CalendarDays size={20} strokeWidth={1.75} />}>
            <p className="text-[14px] font-medium text-navy">
              {booking.date} · {booking.time}
            </p>
            <p className="flex items-center gap-1 text-[12px] text-secondary">
              <Clock size={12} strokeWidth={1.75} /> {booking.durationMin} min
            </p>
          </InfoRow>
          <InfoRow
            icon={
              staff ? (
                <Avatar initials={staff.initials} category={salon.category} size={36} />
              ) : (
                <Avatar initials={booking.staff.slice(0, 2).toUpperCase()} size={36} />
              )
            }
            plainIcon
          >
            <p className="text-[14px] font-medium text-navy">{booking.staff}</p>
            <p className="text-[12px] text-secondary">{staff?.role ?? "Professional"}</p>
          </InfoRow>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="pt-0.5 text-navy">
                <MapPin size={20} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-navy">{booking.address}</p>
                <div className="relative mt-2.5 h-24 overflow-hidden rounded-xl bg-border">
                  <Image src="/onboarding/map-streets.png" alt="Map" fill sizes="320px" className="object-cover" />
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  className="mt-2.5 flex items-center gap-1 text-[13px] font-semibold text-navy"
                >
                  Get directions <ChevronRight size={15} strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setReceiptOpen(true)}
            className="flex w-full items-center gap-3 p-4 text-left"
          >
            <Receipt size={20} strokeWidth={1.75} className="text-navy" />
            <span className="flex-1">
              <span className="block text-[14px] font-medium text-navy">{booking.price}</span>
              <span className="block text-[12px] text-secondary">View receipt</span>
            </span>
            <ChevronRight size={18} strokeWidth={1.75} className="text-muted" />
          </motion.button>
        </div>

        {/* actions */}
        <div className="mt-4 space-y-2.5">
          {upcoming && (
            <>
              <GhostButton onClick={() => { setReschedOpen(true); setReschedDay(null); setReschedTime(null); setReschedDone(false); }}>
                Reschedule
              </GhostButton>
              <GhostButton onClick={() => setCancelOpen(true)} className="!text-coral">
                Cancel booking
              </GhostButton>
            </>
          )}
          {completed && (
            <>
              <DarkButton onClick={() => router.push(`/c/salon/${salon.id}/book`)}>
                <RotateCcw size={18} strokeWidth={1.75} /> Book again
              </DarkButton>
              {!reviewed ? (
                <GhostButton onClick={() => { setReviewOpen(true); setStars(0); setReviewText(""); }}>
                  <Star size={18} strokeWidth={1.75} /> Leave review
                </GhostButton>
              ) : (
                <span className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface text-[14px] font-medium text-secondary">
                  <Check size={16} strokeWidth={2} /> You reviewed this visit
                </span>
              )}
            </>
          )}
          {effStatus === "cancelled" && (
            <DarkButton onClick={() => router.push(`/c/salon/${salon.id}/book`)}>Book again</DarkButton>
          )}
          <GhostButton onClick={() => router.push("/c/inbox")}>
            <MessageCircle size={18} strokeWidth={1.75} /> Message {salon.name}
          </GhostButton>
          {upcoming && (
            <GhostButton>
              <CalendarPlus size={18} strokeWidth={1.75} /> Add to calendar
            </GhostButton>
          )}
        </div>
      </div>

      {/* receipt sheet */}
      <Sheet open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Receipt" sub={`${booking.salonName} · ${booking.date}`}>
        <div className="space-y-2 pt-1">
          <Line label={booking.offerName} value={gbp(price)} />
          <Line label="Booking fees" value="£0.00" />
          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <span className="text-[14px] font-bold text-navy">Total paid</span>
            <span className="text-[15px] font-bold text-navy">{gbp(price)}</span>
          </div>
          <p className="pt-2 text-[12px] text-muted">Paid with Visa •••• 4242</p>
          <GhostButton className="mt-3" onClick={() => setReceiptOpen(false)}>
            Close
          </GhostButton>
        </div>
      </Sheet>

      {/* cancel confirm sheet */}
      <Sheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this booking?" sub={`${booking.offerName} · ${booking.date}, ${booking.time}`}>
        <div className="space-y-3 pt-1">
          <p className="rounded-xl bg-canvas p-3 text-[13px] text-secondary">
            Free cancellation until 24h before. After that, the business may charge a fee.
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setStatus("cancelled");
              setCancelOpen(false);
            }}
            className="flex h-12 w-full items-center justify-center rounded-full bg-coral text-[15px] font-semibold text-white"
          >
            Yes, cancel booking
          </motion.button>
          <GhostButton onClick={() => setCancelOpen(false)}>Keep booking</GhostButton>
        </div>
      </Sheet>

      {/* reschedule sheet */}
      <Sheet
        open={reschedOpen}
        onClose={() => setReschedOpen(false)}
        title={reschedDone ? "Rescheduled!" : "Reschedule"}
        sub={reschedDone ? undefined : `${booking.offerName} · currently ${booking.date}, ${booking.time}`}
      >
        {reschedDone ? (
          <div className="flex flex-col items-center pt-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white"
            >
              <Check size={26} strokeWidth={2.5} />
            </motion.span>
            <p className="pt-4 text-center text-[14px] text-secondary">
              Moved to {reschedDay} June at {reschedTime}. {salon.name} has been notified.
            </p>
            <DarkButton className="mt-5" onClick={() => setReschedOpen(false)}>
              Done
            </DarkButton>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <MiniCalendar selected={reschedDay} onSelect={setReschedDay} />
            <TimeChips value={reschedTime} onSelect={setReschedTime} />
            <DarkButton disabled={reschedDay === null || reschedTime === null} onClick={() => setReschedDone(true)}>
              Confirm new time
            </DarkButton>
          </div>
        )}
      </Sheet>

      {/* review sheet */}
      <Sheet open={reviewOpen} onClose={() => setReviewOpen(false)} title="Leave a review" sub={`${booking.offerName} at ${salon.name}`}>
        <div className="space-y-4 pt-1">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button key={n} type="button" whileTap={{ scale: 0.9 }} onClick={() => setStars(n)} aria-label={`${n} stars`}>
                <Star size={32} strokeWidth={1.5} className={n <= stars ? "fill-current text-navy" : "text-border"} />
              </motion.button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="How was your visit?"
            rows={4}
            className="w-full resize-none rounded-2xl border border-border bg-canvas p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
          <DarkButton
            disabled={stars === 0}
            onClick={() => {
              setReviewedLocal(true);
              setReviewOpen(false);
            }}
          >
            Submit review
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}

function InfoRow({ icon, children, plainIcon }: { icon: React.ReactNode; children: React.ReactNode; plainIcon?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className={plainIcon ? "" : "text-navy"}>{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className="text-[13px] font-medium text-navy">{value}</span>
    </div>
  );
}
