"use client";

// Stepped booking flow — adapts to offer type (service / class / bundle /
// subscription). Service: 4 steps; class: 3; bundle & subscription: single
// review step. Tab bar is hidden on /book routes.

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Check,
  Clock,
  CalendarDays,
  Sparkles,
  Users,
  Minus,
  Plus,
  ShieldCheck,
  Layers,
  Repeat,
} from "lucide-react";
import {
  DarkButton,
  SectionLabel,
  StatusPill,
  MiniCalendar,
  TimeChips,
  timeSlots,
} from "@/components/ui";
import { Avatar, Stars, OfferTypeBadge } from "@/components/ui/consumer";
import { getSalon, type ClientOffer } from "@/lib/data/b2c";

/* ── helpers ─────────────────────────────────────────────────────── */

const parsePrice = (p: string) => Number(p.replace(/[^\d.]/g, "")) || 0;
const gbp = (n: number) => `£${n.toFixed(2)}`;

const ADD_ONS = [
  { id: "ao-1", name: "Hot-towel finish", price: 5 },
  { id: "ao-2", name: "Express conditioning treatment", price: 8 },
];

interface ClassSession {
  id: string;
  label: string;
  instructor: string;
  spotsLeft: number;
}

/* ── page shell ──────────────────────────────────────────────────── */

export default function BookPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-canvas" />}>
      <BookFlow />
    </Suspense>
  );
}

function BookFlow() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const salon = getSalon(params.id);

  const preselect = search.get("offer");
  const [offerId, setOfferId] = useState<string | null>(preselect);
  const offer = salon?.offers.find((o) => o.id === offerId) ?? null;

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  // service state
  const [addOns, setAddOns] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string>("any");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [daypart, setDaypart] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [notes, setNotes] = useState("");

  // class state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState(1);
  const [names, setNames] = useState<string[]>(["Emma Carter", "", "", ""]);

  const sessions: ClassSession[] = useMemo(() => {
    if (!offer || offer.type !== "class" || !salon) return [];
    const instructor = salon.staff[0]?.name ?? "Instructor";
    const alt = salon.staff[1]?.name ?? instructor;
    return [
      { id: "ss-1", label: offer.nextSession ?? "Sat 20 Jun, 10:00", instructor, spotsLeft: offer.spotsLeft ?? 3 },
      { id: "ss-2", label: "Mon 22 Jun, 18:30", instructor: alt, spotsLeft: 6 },
      { id: "ss-3", label: "Wed 24 Jun, 09:30", instructor, spotsLeft: 0 },
      { id: "ss-4", label: "Sat 27 Jun, 10:00", instructor: alt, spotsLeft: 2 },
    ];
  }, [offer, salon]);

  if (!salon) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-[14px] text-secondary">Salon not found.</p>
      </div>
    );
  }

  const type = offer?.type ?? "service";
  const totalSteps = !offer ? 4 : type === "service" ? 4 : type === "class" ? 3 : 1;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };
  const back = () => (step > 1 ? go(step - 1) : router.back());

  const toCheckout = () =>
    router.push(`/c/checkout?salon=${salon.id}&offer=${offer?.id ?? ""}`);

  /* price summary for review steps */
  const base = offer ? parsePrice(offer.price) : 0;
  const addOnTotal = ADD_ONS.filter((a) => addOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const classTotal = base * attendees;

  const filteredSlots =
    daypart === "all"
      ? timeSlots
      : timeSlots.filter(({ t }) => {
          const h = Number(t.slice(0, 2));
          if (daypart === "morning") return h < 12;
          if (daypart === "afternoon") return h >= 12 && h < 17;
          return h >= 17;
        });

  const staffName =
    staffId === "any" ? "Any professional" : salon.staff.find((s) => s.id === staffId)?.name ?? "";

  const canContinue =
    !offer
      ? false
      : type === "service"
        ? step === 3
          ? day !== null && time !== null
          : true
        : type === "class"
          ? step === 1
            ? sessionId !== null
            : true
          : true;

  /* step content */
  const renderStep = () => {
    if (!offer)
      return (
        <StepWrap key="pick" dir={dir}>
          <SectionLabel>Choose a service</SectionLabel>
          <div className="space-y-2.5 px-4">
            {salon.offers
              .filter((o) => o.type === "service")
              .map((o) => (
                <OfferRow key={o.id} offer={o} onPick={() => { setOfferId(o.id); }} />
              ))}
          </div>
        </StepWrap>
      );

    if (type === "service") {
      if (step === 1)
        return (
          <StepWrap key="s1" dir={dir}>
            <SectionLabel>Your service</SectionLabel>
            <div className="px-4">
              <div className="rounded-2xl border-2 border-ink bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-navy">{offer.name}</p>
                    <p className="mt-0.5 text-[13px] text-secondary">{offer.description}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted">
                      <Clock size={14} strokeWidth={1.75} /> {offer.durationMin} min
                    </p>
                  </div>
                  <span className="text-[15px] font-bold text-navy">{offer.price}</span>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <SectionLabel>Add-ons <span className="font-normal text-muted">(optional)</span></SectionLabel>
            </div>
            <div className="space-y-2.5 px-4">
              {ADD_ONS.map((a) => {
                const on = addOns.includes(a.id);
                return (
                  <motion.button
                    key={a.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setAddOns((p) => (on ? p.filter((x) => x !== a.id) : [...p, a.id]))
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left ${on ? "border-ink" : "border-border"}`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-ink bg-ink text-white" : "border-border bg-surface"}`}
                    >
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className="flex-1 text-[14px] font-medium text-navy">{a.name}</span>
                    <span className="text-[14px] font-semibold text-navy">+{gbp(a.price)}</span>
                  </motion.button>
                );
              })}
            </div>
          </StepWrap>
        );
      if (step === 2)
        return (
          <StepWrap key="s2" dir={dir}>
            <SectionLabel>Choose your professional</SectionLabel>
            <div className="space-y-2.5 px-4">
              <ProCard
                selected={staffId === "any"}
                onClick={() => setStaffId("any")}
                title="Any professional"
                sub="Maximum availability"
                icon={<Sparkles size={20} strokeWidth={1.75} className="text-coral" />}
              />
              {salon.staff.map((s) => (
                <ProCard
                  key={s.id}
                  selected={staffId === s.id}
                  onClick={() => setStaffId(s.id)}
                  title={s.name}
                  sub={s.role}
                  rating={s.rating}
                  avatar={<Avatar initials={s.initials} category={salon.category} size={44} />}
                />
              ))}
            </div>
          </StepWrap>
        );
      if (step === 3)
        return (
          <StepWrap key="s3" dir={dir}>
            <SectionLabel>Pick a date</SectionLabel>
            <div className="px-4">
              <MiniCalendar selected={day} onSelect={(d) => setDay(d)} />
            </div>
            <div className="pt-5">
              <SectionLabel>Pick a time</SectionLabel>
            </div>
            <div className="flex gap-2 px-4 pb-3">
              {(["all", "morning", "afternoon", "evening"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDaypart(p)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium capitalize ${daypart === p ? "border-ink bg-ink text-white" : "border-border bg-surface text-secondary"}`}
                >
                  {p === "all" ? "All day" : p}
                </button>
              ))}
            </div>
            <div className="px-4">
              {filteredSlots.length > 0 ? (
                <TimeChipsFiltered slots={filteredSlots} value={time} onSelect={setTime} />
              ) : (
                <p className="py-6 text-center text-[13px] text-muted">No slots in this window.</p>
              )}
            </div>
          </StepWrap>
        );
      // step 4 — review
      return (
        <StepWrap key="s4" dir={dir}>
          <SectionLabel>Review your booking</SectionLabel>
          <div className="px-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Avatar initials={salon.avatar} category={salon.category} size={40} />
                <div>
                  <p className="text-[14px] font-semibold text-navy">{salon.name}</p>
                  <p className="text-[12px] text-secondary">{salon.address}</p>
                </div>
              </div>
              <ReviewRow label="Service" value={offer.name} />
              <ReviewRow label="Professional" value={staffName} />
              <ReviewRow label="Date & time" value={`${day ? `${day} June` : "—"} · ${time ?? "—"}`} />
              <ReviewRow label="Duration" value={`${offer.durationMin} min`} />
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                <PriceLine label={offer.name} value={gbp(base)} />
                {ADD_ONS.filter((a) => addOns.includes(a.id)).map((a) => (
                  <PriceLine key={a.id} label={a.name} value={gbp(a.price)} />
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[14px] font-bold text-navy">Total</span>
                  <span className="text-[15px] font-bold text-navy">{gbp(base + addOnTotal)}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface p-3 text-[12px] text-secondary">
              <ShieldCheck size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-navy" />
              Free cancellation until 24 hours before your appointment.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for the business (allergies, preferences…)"
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-border bg-surface p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
        </StepWrap>
      );
    }

    if (type === "class") {
      if (step === 1)
        return (
          <StepWrap key="c1" dir={dir}>
            <SectionLabel>Choose a session</SectionLabel>
            <div className="space-y-2.5 px-4">
              {sessions.map((s) => {
                const full = s.spotsLeft === 0;
                const selected = sessionId === s.id;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    whileTap={!full ? { scale: 0.97 } : undefined}
                    onClick={() => !full && setSessionId(s.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left ${selected ? "border-2 border-ink" : "border-border"} ${full ? "opacity-60" : ""}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                      <CalendarDays size={20} strokeWidth={1.75} className="text-navy" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-navy">{s.label}</span>
                      <span className="block text-[12px] text-secondary">with {s.instructor}</span>
                    </span>
                    {full ? (
                      <StatusPill>Waitlist</StatusPill>
                    ) : (
                      <StatusPill tone={s.spotsLeft <= 3 ? "amber" : "light"}>
                        {s.spotsLeft} spot{s.spotsLeft === 1 ? "" : "s"} left
                      </StatusPill>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </StepWrap>
        );
      if (step === 2)
        return (
          <StepWrap key="c2" dir={dir}>
            <SectionLabel>Who&apos;s coming?</SectionLabel>
            <div className="px-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                <span className="flex items-center gap-2 text-[14px] font-medium text-navy">
                  <Users size={20} strokeWidth={1.75} /> Spots
                </span>
                <div className="flex items-center gap-3">
                  <Stepper dir="down" disabled={attendees <= 1} onClick={() => setAttendees((n) => Math.max(1, n - 1))} />
                  <span className="w-5 text-center text-[16px] font-bold text-navy">{attendees}</span>
                  <Stepper dir="up" disabled={attendees >= 4} onClick={() => setAttendees((n) => Math.min(4, n + 1))} />
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: attendees }).map((_, i) => (
                  <input
                    key={i}
                    value={names[i]}
                    onChange={(e) =>
                      setNames((p) => p.map((n, j) => (j === i ? e.target.value : n)))
                    }
                    placeholder={`Attendee ${i + 1} name`}
                    className="w-full rounded-2xl border border-border bg-surface p-3.5 text-[14px] text-navy placeholder:text-muted focus:outline-none"
                  />
                ))}
              </div>
            </div>
          </StepWrap>
        );
      // step 3 — review
      const sess = sessions.find((s) => s.id === sessionId);
      return (
        <StepWrap key="c3" dir={dir}>
          <SectionLabel>Review your booking</SectionLabel>
          <div className="px-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Avatar initials={salon.avatar} category={salon.category} size={40} />
                <div>
                  <p className="text-[14px] font-semibold text-navy">{salon.name}</p>
                  <p className="text-[12px] text-secondary">{salon.address}</p>
                </div>
              </div>
              <ReviewRow label="Class" value={offer.name} />
              <ReviewRow label="Session" value={sess?.label ?? "—"} />
              <ReviewRow label="Instructor" value={sess?.instructor ?? "—"} />
              <ReviewRow label="Attendees" value={names.slice(0, attendees).filter(Boolean).join(", ") || `${attendees}`} />
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                <PriceLine label={`${offer.name} × ${attendees}`} value={gbp(classTotal)} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[14px] font-bold text-navy">Total</span>
                  <span className="text-[15px] font-bold text-navy">{gbp(classTotal)}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface p-3 text-[12px] text-secondary">
              <ShieldCheck size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-navy" />
              Free cancellation until 24 hours before the session starts.
            </p>
          </div>
        </StepWrap>
      );
    }

    if (type === "bundle")
      return (
        <StepWrap key="b1" dir={dir}>
          <div className="px-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <OfferTypeBadge type="bundle" />
                  <p className="mt-2 font-display text-[18px] font-extrabold tracking-tight text-navy">{offer.name}</p>
                  <p className="mt-0.5 text-[13px] text-secondary">{offer.description}</p>
                </div>
                <span className="text-[16px] font-bold text-navy">{offer.price}</span>
              </div>
              {offer.saving && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral">
                  <Sparkles size={12} strokeWidth={2} /> {offer.saving}
                </span>
              )}
              <div className="mt-4 space-y-2 border-t border-border pt-3.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">What&apos;s included</p>
                {(offer.includes ?? []).map((inc) => (
                  <p key={inc} className="flex items-center gap-2.5 text-[14px] text-navy">
                    <Check size={16} strokeWidth={2.25} className="text-navy" /> {inc}
                  </p>
                ))}
              </div>
              <p className="mt-3.5 flex items-center gap-2 border-t border-border pt-3.5 text-[12px] text-secondary">
                <Clock size={14} strokeWidth={1.75} /> Use within 6 months of purchase
              </p>
            </div>
            <div className="mt-5">
              <p className="px-0 pb-3 text-[16px] font-bold text-navy">How it works</p>
              <div className="space-y-2.5">
                <HowRow n={1} icon={<Layers size={18} strokeWidth={1.75} />} text="Buy once — the pack lands in your wallet instantly." />
                <HowRow n={2} icon={<CalendarDays size={18} strokeWidth={1.75} />} text="Book any time and pay with a pass, not your card." />
                <HowRow n={3} icon={<Sparkles size={18} strokeWidth={1.75} />} text="Track remaining uses from your Bookings tab." />
              </div>
            </div>
          </div>
        </StepWrap>
      );

    // subscription
    return (
      <StepWrap key="m1" dir={dir}>
        <div className="px-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <OfferTypeBadge type="subscription" />
                <p className="mt-2 font-display text-[18px] font-extrabold tracking-tight text-navy">{offer.name}</p>
                <p className="mt-0.5 text-[13px] text-secondary">{offer.description}</p>
              </div>
              <div className="text-right">
                <span className="block text-[16px] font-bold text-navy">{offer.price}</span>
                <span className="text-[11px] text-muted">{offer.billing}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-3.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Member benefits</p>
              {(offer.benefits ?? []).map((b) => (
                <p key={b} className="flex items-center gap-2.5 text-[14px] text-navy">
                  <Check size={16} strokeWidth={2.25} className="text-navy" /> {b}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <p className="pb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">Billing terms</p>
            <PriceLine label={`Membership (${offer.billing})`} value={offer.price} />
            <PriceLine label="Joining fee" value="£0.00" />
            <div className="mt-2 space-y-1.5 border-t border-border pt-2.5">
              <p className="flex items-center gap-2 text-[12px] text-secondary">
                <Repeat size={14} strokeWidth={1.75} /> Cancel anytime with 30 days&apos; notice
              </p>
              <p className="flex items-center gap-2 text-[12px] text-secondary">
                <Clock size={14} strokeWidth={1.75} /> Pause for up to 60 days a year
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[14px] font-bold text-navy">First payment today</span>
              <span className="text-[15px] font-bold text-navy">{gbp(base)}</span>
            </div>
          </div>
        </div>
      </StepWrap>
    );
  };

  const ctaLabel =
    !offer
      ? "Choose a service"
      : type === "bundle"
        ? "Buy bundle"
        : type === "subscription"
          ? "Start membership"
          : step < totalSteps
            ? "Continue"
            : "Continue to payment";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-surface px-3 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={back} aria-label="Back" className="p-1.5 text-navy">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </motion.button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[16px] font-extrabold tracking-tight text-navy">
              {offer ? offer.name : "Book"}
            </p>
            <p className="truncate text-[12px] text-secondary">{salon.name}</p>
          </div>
          {totalSteps > 1 && (
            <div className="flex items-center gap-1.5 pr-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i + 1 === step ? "w-5 bg-ink" : i + 1 < step ? "w-1.5 bg-ink" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* body */}
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* footer */}
      <div className="shrink-0 border-t border-border bg-surface px-4 pb-5 pt-3">
        <DarkButton
          disabled={!canContinue}
          onClick={() => {
            if (!offer) return;
            if (step < totalSteps) go(step + 1);
            else toCheckout();
          }}
        >
          {ctaLabel}
        </DarkButton>
      </div>
    </div>
  );
}

/* ── small pieces ────────────────────────────────────────────────── */

function StepWrap({ children, dir }: { children: React.ReactNode; dir: number }) {
  return (
    <motion.div
      custom={dir}
      initial={{ opacity: 0, x: dir > 0 ? 24 : -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir > 0 ? -24 : 24 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function OfferRow({ offer, onPick }: { offer: ClientOffer; onPick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onPick}
      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-left"
    >
      <span>
        <span className="block text-[14px] font-semibold text-navy">{offer.name}</span>
        <span className="mt-0.5 block text-[12px] text-secondary">{offer.description}</span>
        <span className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
          <Clock size={13} strokeWidth={1.75} /> {offer.durationMin} min
        </span>
      </span>
      <span className="text-[14px] font-bold text-navy">{offer.price}</span>
    </motion.button>
  );
}

function ProCard({
  selected,
  onClick,
  title,
  sub,
  rating,
  avatar,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  rating?: string;
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ${selected ? "border-2 border-ink" : "border border-border"}`}
    >
      {avatar ?? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-navy">{title}</span>
        <span className="block text-[12px] text-secondary">{sub}</span>
      </span>
      {rating && <Stars rating={rating} />}
      {selected && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </motion.button>
  );
}

function Stepper({ dir, disabled, onClick }: { dir: "up" | "down"; disabled?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      onClick={disabled ? undefined : onClick}
      aria-label={dir === "up" ? "Add attendee" : "Remove attendee"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border ${disabled ? "border-border text-muted" : "border-ink text-navy"}`}
    >
      {dir === "up" ? <Plus size={16} strokeWidth={2} /> : <Minus size={16} strokeWidth={2} />}
    </motion.button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pt-3">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className="max-w-[60%] truncate text-right text-[13px] font-semibold text-navy">{value}</span>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className="text-[13px] font-medium text-navy">{value}</span>
    </div>
  );
}

function HowRow({ n, icon, text }: { n: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">{icon}</span>
      <p className="text-[13px] text-navy">
        <span className="font-semibold">{n}. </span>
        {text}
      </p>
    </div>
  );
}

/** TimeChips clone that accepts a filtered slot list (daypart filters). */
function TimeChipsFiltered({
  slots,
  value,
  onSelect,
}: {
  slots: { t: string; free: boolean }[];
  value: string | null;
  onSelect: (t: string) => void;
}) {
  if (slots.length === timeSlots.length) return <TimeChips value={value} onSelect={onSelect} />;
  return (
    <div className="flex flex-wrap gap-2.5">
      {slots.map(({ t, free }) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            disabled={!free}
            onClick={() => onSelect(t)}
            className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
              active
                ? "border-ink bg-ink text-white"
                : free
                  ? "border-border bg-surface text-navy"
                  : "border-border bg-surface text-muted line-through"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
