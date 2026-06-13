"use client";

// Bookings tab — Upcoming | Past segmented list, passes (bundles &
// memberships), reschedule + review sheets. Tab bar stays visible.

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Check, Star, Layers, Repeat, ChevronRight } from "lucide-react";
import {
  Segmented,
  SectionLabel,
  StatusPill,
  Sheet,
  DarkButton,
  GhostButton,
  MiniCalendar,
  TimeChips,
} from "@/components/ui";
import { Avatar, OfferTypeBadge } from "@/components/client/shared";
import { clientBookings, clientUser, getSalon, type ClientBookingItem } from "@/lib/data/b2c";

const statusTone = (s: ClientBookingItem["status"]) =>
  s === "pending" ? "amber" : s === "cancelled" ? "danger" : "light";

export default function BookingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Upcoming");

  // reschedule sheet
  const [reschedFor, setReschedFor] = useState<ClientBookingItem | null>(null);
  const [reschedDay, setReschedDay] = useState<number | null>(null);
  const [reschedTime, setReschedTime] = useState<string | null>(null);
  const [reschedDone, setReschedDone] = useState(false);

  // review sheet
  const [reviewFor, setReviewFor] = useState<ClientBookingItem | null>(null);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewed, setReviewed] = useState<string[]>([]);

  const upcoming = clientBookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = clientBookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const list = tab === "Upcoming" ? upcoming : past;

  const openResched = (b: ClientBookingItem) => {
    setReschedFor(b);
    setReschedDay(null);
    setReschedTime(null);
    setReschedDone(false);
  };

  const openReview = (b: ClientBookingItem) => {
    setReviewFor(b);
    setStars(0);
    setReviewText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <div className="shrink-0 px-4 pb-3 pt-5">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-navy">Bookings</h1>
        <div className="flex pt-3.5">
          <Segmented options={["Upcoming", "Past"]} value={tab} onChange={setTab} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {list.length === 0 ? (
          <EmptyState past={tab === "Past"} onCta={() => router.push("/c/home")} />
        ) : tab === "Upcoming" ? (
          <>
            <div className="space-y-3 px-4 pt-1">
              {upcoming.map((b) => (
                <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <div className="relative h-24 w-full bg-border">
                    <Image src={b.image} alt="" fill sizes="378px" className="object-cover" />
                    <span className="absolute right-3 top-3">
                      <StatusPill tone={statusTone(b.status)}>
                        {b.status === "pending" ? "Pending confirmation" : "Confirmed"}
                      </StatusPill>
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={b.avatar} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-navy">{b.offerName}</p>
                        <p className="truncate text-[12px] text-secondary">{b.salonName}</p>
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 pt-3 text-[13px] text-navy">
                      <CalendarDays size={15} strokeWidth={1.75} className="text-muted" />
                      {b.date} · {b.time} <span className="text-muted">· with {b.staff}</span>
                    </p>
                    <div className="flex gap-2.5 pt-3.5">
                      <GhostButton className="!h-10 text-[13px]" onClick={() => openResched(b)}>
                        Reschedule
                      </GhostButton>
                      <DarkButton className="!h-10 text-[13px]" onClick={() => router.push(`/c/bookings/${b.id}`)}>
                        Details
                      </DarkButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* passes */}
            <div className="pt-6">
              <SectionLabel>Your passes</SectionLabel>
            </div>
            <div className="space-y-2.5 px-4">
              {clientUser.memberships.map((m) => {
                const salon = getSalon(m.salonId);
                return (
                  <div key={m.id} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">
                        {m.kind === "bundle" ? <Layers size={20} strokeWidth={1.75} /> : <Repeat size={20} strokeWidth={1.75} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[14px] font-semibold text-navy">{m.name}</p>
                          <OfferTypeBadge type={m.kind} />
                        </div>
                        <p className="truncate text-[12px] text-secondary">{m.salonName}</p>
                      </div>
                    </div>
                    <p className="pt-2.5 text-[12px] text-secondary">{m.detail}</p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => salon && router.push(`/c/salon/${salon.id}/book`)}
                      className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-navy"
                    >
                      Book with pass <ChevronRight size={15} strokeWidth={2} />
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-2.5 px-4 pt-1">
            {past.map((b) => {
              const isReviewed = b.reviewed || reviewed.includes(b.id);
              return (
                <div key={b.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={b.avatar} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-navy">{b.offerName}</p>
                      <p className="truncate text-[12px] text-secondary">
                        {b.salonName} · {b.date}
                      </p>
                    </div>
                    <StatusPill tone={statusTone(b.status)}>
                      {b.status === "cancelled" ? "Cancelled" : "Completed"}
                    </StatusPill>
                  </div>
                  <div className="flex gap-2.5 pt-3.5">
                    <GhostButton
                      className="!h-10 text-[13px]"
                      onClick={() => router.push(`/c/salon/${b.salonId}/book`)}
                    >
                      Book again
                    </GhostButton>
                    {b.status === "completed" &&
                      (isReviewed ? (
                        <span className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-canvas text-[13px] font-medium text-secondary">
                          <Check size={15} strokeWidth={2} /> Reviewed
                        </span>
                      ) : (
                        <DarkButton className="!h-10 text-[13px]" onClick={() => openReview(b)}>
                          Leave review
                        </DarkButton>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* reschedule sheet */}
      <Sheet
        open={reschedFor !== null}
        onClose={() => setReschedFor(null)}
        title={reschedDone ? "Rescheduled!" : "Reschedule"}
        sub={reschedDone ? undefined : reschedFor ? `${reschedFor.offerName} · ${reschedFor.salonName}` : undefined}
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
              Moved to {reschedDay} June at {reschedTime}. {reschedFor?.salonName} has been notified.
            </p>
            <DarkButton className="mt-5" onClick={() => setReschedFor(null)}>
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
      <Sheet
        open={reviewFor !== null}
        onClose={() => setReviewFor(null)}
        title="Leave a review"
        sub={reviewFor ? `${reviewFor.offerName} at ${reviewFor.salonName}` : undefined}
      >
        <div className="space-y-4 pt-1">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button key={n} type="button" whileTap={{ scale: 0.9 }} onClick={() => setStars(n)} aria-label={`${n} stars`}>
                <Star
                  size={32}
                  strokeWidth={1.5}
                  className={n <= stars ? "fill-current text-navy" : "text-border"}
                />
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
              if (reviewFor) setReviewed((p) => [...p, reviewFor.id]);
              setReviewFor(null);
            }}
          >
            Submit review
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}

function EmptyState({ past, onCta }: { past: boolean; onCta: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 pt-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-muted">
        <CalendarDays size={28} strokeWidth={1.5} />
      </span>
      <p className="pt-4 text-[16px] font-bold text-navy">
        {past ? "No past bookings yet" : "Nothing booked yet"}
      </p>
      <p className="pt-1 text-[13px] text-secondary">
        {past
          ? "Your completed and cancelled visits will appear here."
          : "Find a salon you love and your appointments will live here."}
      </p>
      {!past && (
        <DarkButton className="mt-5 !w-auto px-6" onClick={onCta}>
          Explore salons
        </DarkButton>
      )}
    </div>
  );
}
