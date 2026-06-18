"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus, UserPlus, Clock, PoundSterling, ChevronLeft, ChevronRight,
  Search, UserRound, CheckCircle2, Plus, ChevronDown, Check, Users, Building2, AlertTriangle,
} from "lucide-react";
import { useAppStore, type CalendarBlockedTime, type CustomAppointment } from "@/lib/store/appStore";
import { Sheet, DarkButton, GhostButton, MiniCalendar, TimeChips, timeSlots } from "@/components/ui";
import {
  services, serviceCategories, staffMembers, clientRows, blockTypes, classTemplates, threeDayGrid, teamColumns,
} from "@/lib/data/product";
import { appointmentTypes, bookingDefaults, entitlementBalances } from "@/lib/data/finalisation";

// Weekday for a day-of-month in the demo's reference month (1 March 2026 = Sun),
// so confirmations show the real day instead of a hardcoded "Fri".
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dowMar = (d: number | null) => (d == null ? "" : `${DOW[(d - 1) % 7]} ${d} Mar`);

// Slots outside the 09:00–16:00 working day — booking one prompts a surcharge.
const oohSlots = ["07:00", "07:30", "08:00", "08:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const blockStartTimes = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const blockEndTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "20:00"];
const minsOf = (duration: string) => parseInt(duration, 10) || 0;
const fmtDur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ""}` : `${min}m`);
const timeToMinutes = (time: string) => {
  const [h, m = "0"] = time.split(":");
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};
const minutesToTime = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const fmtTime12 = (time: string | null | undefined) => {
  if (!time) return "";
  const mins = timeToMinutes(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const slotSummary = (slot: { day: number; time: string; staff?: string } | null) =>
  slot ? `${dowMar(slot.day)} at ${fmtTime12(slot.time)}${slot.staff ? ` · ${slot.staff}` : ""}` : "";
const chipTimes = timeSlots.filter((s) => s.free).map((s) => s.t);
const isChipTime = (time: string) => chipTimes.includes(time);
const blockFrequencies = ["Doesn't repeat", "Daily", "Weekly", "Fortnightly", "Monthly"];

type BookingConflict = {
  key?: string;
  customId?: string;
  label: string;
  staff: string;
  time: string;
};

const isBookingBlock = (block: { kind?: string; name: string; service?: string }) =>
  block.kind !== "break" && block.kind !== "blocked" && block.kind !== "processing" && !block.name.includes("Break");
const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && aEnd > bStart;
const apptDurationMins = (duration?: string) => {
  if (!duration) return 60;
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)h/);
  const minuteMatch = duration.match(/(\d+)\s*m/);
  if (hourMatch || minuteMatch) {
    return Math.max(15, Math.round((parseFloat(hourMatch?.[1] ?? "0") * 60) + parseInt(minuteMatch?.[1] ?? "0", 10)));
  }
  return Math.max(15, parseInt(duration, 10) || 60);
};

/**
 * Quick Actions: the "+" tab opens a menu sheet; each row launches a flow.
 * New Appointment is a 4-step sheet (service → client → time → review → done).
 * Tapping empty calendar space opens the "choose" sheet first — the slot
 * could be an appointment, a class, or a break.
 */
export function QuickActionsHost() {
  const { quickAction, setQuickAction, slotDraft, clearSlotDraft } = useAppStore();
  const slotText = slotSummary(slotDraft);

  return (
    <>
      <Sheet open={quickAction === "menu"} onClose={() => setQuickAction(null)} aboveNav>
        <h2 className="pb-5 text-center text-[18px] font-bold text-navy">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <ActionRow
            icon={<CalendarPlus size={19} strokeWidth={1.7} />}
            title="Add New Appointment"
            sub="Schedule a new booking"
            onClick={() => { clearSlotDraft(); setQuickAction("appointment"); }}
          />
          <ActionRow
            icon={<UserPlus size={19} strokeWidth={1.7} />}
            title="Add New Client"
            sub="Register a new customer"
            onClick={() => setQuickAction("client")}
          />
          <ActionRow
            icon={<Clock size={19} strokeWidth={1.7} />}
            title="Block Time"
            sub="Block time in your calendar"
            onClick={() => { clearSlotDraft(); setQuickAction("block"); }}
          />
          <LogPaymentRow />
        </div>
        <div className="h-2" />
      </Sheet>

      {/* "What are you adding?" — entry point from empty calendar space / gap slots */}
      <Sheet
        open={quickAction === "choose"}
        onClose={() => { setQuickAction(null); clearSlotDraft(); }}
        title="Fill this slot"
        sub={slotText || "What are you adding to the calendar?"}
      >
        <div className="flex flex-col gap-3 pt-1">
          <ActionRow
            icon={<CalendarPlus size={19} strokeWidth={1.7} />}
            title="Appointment"
            sub="A booking for one client"
            onClick={() => setQuickAction("appointment")}
          />
          <ActionRow
            icon={<Users size={19} strokeWidth={1.7} />}
            title="Class"
            sub="A seat-based session for a group"
            onClick={() => setQuickAction("class")}
          />
          <ActionRow
            icon={<Clock size={19} strokeWidth={1.7} />}
            title="Break or blocked time"
            sub="Keep this time free"
            onClick={() => setQuickAction("block")}
          />
        </div>
        <div className="h-2" />
      </Sheet>

      <NewAppointmentFlow open={quickAction === "appointment"} onClose={() => setQuickAction(null)} />
      <NewClassSheet open={quickAction === "class"} onClose={() => setQuickAction(null)} />
      <NewClientSheet open={quickAction === "client"} onClose={() => setQuickAction(null)} />
      <BlockTimeSheet open={quickAction === "block"} onClose={() => setQuickAction(null)} />
    </>
  );
}

function LogPaymentRow() {
  const router = useRouter();
  return (
    <ActionRow
      icon={<PoundSterling size={19} strokeWidth={1.7} />}
      title="Take a Payment"
      sub="Open the till — assign a client and items"
      onClick={() => { const s = useAppStore.getState(); s.setQuickAction(null); s.startBlankCheckout(); router.push("/app/checkout"); }}
    />
  );
}

// ── (legacy LogPaymentSheet removed — the client picker is now a spoke on the checkout hub) ──

function ActionRow({
  icon, title, sub, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-navy">{title}</span>
        <span className="mt-0.5 block text-[12px] text-muted">{sub}</span>
      </span>
    </motion.button>
  );
}

// ── New Appointment (4 steps) ──

function NewAppointmentFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const slotDraft = useAppStore((s) => s.slotDraft);
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<string | null>(null);
  const [picked, setPicked] = useState<(typeof services)[number][]>([]);
  const [assign, setAssign] = useState<Record<string, string>>({}); // serviceId → staff
  const [cat, setCat] = useState("All");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [apptType, setApptType] = useState<"salon" | "mobile" | "online">("salon");
  const [outOfHours, setOutOfHours] = useState(false);
  const [showOoh, setShowOoh] = useState(false);
  const [applySurcharge, setApplySurcharge] = useState(true);
  const [surcharge, setSurcharge] = useState("15");
  const [query, setQuery] = useState("");
  const [entitlementId, setEntitlementId] = useState<string | null>(null);
  const [depositOn, setDepositOn] = useState(true);
  const [depositUnit, setDepositUnit] = useState<"percent" | "amount">("percent");
  const [depositValue, setDepositValue] = useState(String(bookingDefaults.deposit.value));
  const [paymentRequest, setPaymentRequest] = useState<"link" | "card">("link");
  const [linkHours, setLinkHours] = useState(String(bookingDefaults.deposit.linkLimitHours));
  const [recurring, setRecurring] = useState(bookingDefaults.recurring[0]);
  const [multiDate, setMultiDate] = useState(false);
  const [linkedDay, setLinkedDay] = useState<number | null>(null);
  const [linkedTime, setLinkedTime] = useState<string | null>(null);
  const [linkedServiceId, setLinkedServiceId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setStep(0); setClient(null); setPicked([]); setAssign({}); setCat("All");
    setDay(null); setTime(null); setCustomTime(""); setApptType("salon"); setOutOfHours(false); setShowOoh(false);
    setApplySurcharge(true); setSurcharge("15"); setQuery(""); setEntitlementId(null);
    setDepositOn(true); setDepositUnit("percent"); setDepositValue(String(bookingDefaults.deposit.value));
    setPaymentRequest("link"); setLinkHours(String(bookingDefaults.deposit.linkLimitHours));
    setRecurring(bookingDefaults.recurring[0]); setMultiDate(false); setLinkedDay(null); setLinkedTime(null); setLinkedServiceId(null); setPending(false);
  };
  useEffect(() => {
    if (!open || !slotDraft) return;
    setDay(slotDraft.day);
    if (isChipTime(slotDraft.time)) {
      setTime(slotDraft.time);
      setCustomTime("");
    } else {
      setTime(null);
      setCustomTime(slotDraft.time);
    }
    const slotMins = timeToMinutes(slotDraft.time);
    const outsideHours = slotMins < 9 * 60 || slotMins > 16 * 60;
    setOutOfHours(outsideHours);
    setShowOoh(outsideHours);
  }, [open, slotDraft]);

  const close = () => {
    useAppStore.getState().clearSlotDraft();
    onClose();
    setTimeout(reset, 350);
  };

  const defaultStaff = slotDraft?.staff ?? staffMembers[0];
  const staffOf = (id: string) => assign[id] ?? defaultStaff;
  const surchargeNum = outOfHours && applySurcharge ? Math.max(0, parseFloat(surcharge) || 0) : 0;
  const servicesTotal = picked.reduce((s, p) => s + p.price, 0);
  const totalPrice = servicesTotal + surchargeNum;
  const totalMin = picked.reduce((s, p) => s + minsOf(p.duration), 0);
  const selectedTime = customTime.trim() || time;
  const cappedLinkHours = Math.min(24, Math.max(1, parseInt(linkHours, 10) || 24));
  const depositNum = Math.max(0, parseFloat(depositValue) || 0);
  const depositAmount = depositOn ? Math.round((depositUnit === "percent" ? (totalPrice * depositNum) / 100 : depositNum) * 100) / 100 : 0;
  const eligibleEntitlements = entitlementBalances.filter((e) => e.client === client && e.remaining > 0 && picked.some((p) => e.appliesTo.includes(p.name)));
  const selectedEntitlement = eligibleEntitlements.find((e) => e.id === entitlementId) ?? null;
  const linkedService = services.find((s) => s.id === linkedServiceId) ?? picked[0] ?? null;
  const toggleService = (s: (typeof services)[number]) =>
    setPicked((p) => (p.some((x) => x.id === s.id) ? p.filter((x) => x.id !== s.id) : [...p, s]));

  const subFor = [
    "What's being booked?",
    picked.length ? `${picked.length} service${picked.length > 1 ? "s" : ""} · £${servicesTotal}` : "",
    client ?? "",
    "Check the details",
    "",
  ][step];
  const visibleServices = services.filter((s) => cat === "All" || s.category === cat);
  const visibleClients = clientRows.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const chooseClient = (name: string) => {
    setClient(name);
    const match = entitlementBalances.find((e) => e.client === name && e.remaining > 0 && picked.some((p) => e.appliesTo.includes(p.name)));
    setEntitlementId(match?.id ?? null);
    setStep(2);
  };

  const summary = picked.map((p) => p.name).join(" + ") || "Appointment";

  return (
    <Sheet
      open={open}
      onClose={close}
      full={step < 4}
      title={
        step === 4 ? "Appointment added" : (
          <span className="flex items-center gap-2">
            {step > 0 && (
              <button type="button" aria-label="Back" onClick={() => setStep((s) => s - 1)} className="-ml-1 text-navy">
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
            )}
            New Appointment
          </span>
        )
      }
      sub={subFor || undefined}
    >
      {/* Step 0 — services (multi-select) */}
      {step === 0 && (
        <>
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
            {serviceCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                  cat === c ? "bg-fg-primary text-white" : "bg-canvas text-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            {visibleServices.map((s) => {
              const on = picked.some((x) => x.id === s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s)}
                  className="flex items-center justify-between gap-3 border-b border-border py-4 text-left last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{s.duration} · {s.category}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-navy">£{s.price}</span>
                    <motion.span
                      animate={{ scale: on ? 1 : 0.92 }}
                      transition={{ type: "spring", stiffness: 480, damping: 28 }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </motion.span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="sticky bottom-0 -mx-6 mt-4 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={picked.length === 0} onClick={() => setStep(1)}>
              {picked.length ? `Continue · ${picked.length} service${picked.length > 1 ? "s" : ""} · £${servicesTotal}` : "Select a service"}
            </DarkButton>
          </div>
        </>
      )}

      {/* Step 1 — client */}
      {step === 1 && (
        <div className="flex flex-col gap-1.5">
          <div className="relative pb-2">
            <Search size={15} strokeWidth={1.75} className="absolute left-4 top-[18px] -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients..."
              className="h-11 w-full rounded-xl bg-canvas pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => chooseClient("New client")}
            className="flex items-center gap-3 rounded-xl py-2.5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-primary text-white">
              <Plus size={18} strokeWidth={2} />
            </span>
            <span className="text-[15px] font-semibold text-navy">New client</span>
          </button>
          <button
            type="button"
            onClick={() => chooseClient("Walk-in")}
            className="flex items-center gap-3 rounded-xl py-2.5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-secondary">
              <UserRound size={17} strokeWidth={1.6} />
            </span>
            <span className="text-[15px] font-semibold text-navy">Walk-in</span>
          </button>
          <div className="my-1 h-px bg-border" />
          {visibleClients.map((c) => {
            const credit = entitlementBalances.find((e) => e.client === c.name && e.remaining > 0 && picked.some((p) => e.appliesTo.includes(p.name)));
            return (
            <button
              key={c.id}
              type="button"
              onClick={() => chooseClient(c.name)}
              className="flex items-center gap-3 rounded-xl py-2.5 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-secondary">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-navy">{c.name}</span>
                <span className="block text-[12px] text-muted">
                  {credit ? `${credit.remaining} sessions left · ${credit.name}` : c.meta}
                </span>
              </span>
              <ChevronRight size={15} className="text-muted" />
            </button>
            );
          })}
        </div>
      )}

      {/* Step 2 — per-service staff + day + time (with out-of-hours surcharge) */}
      {step === 2 && (
        <>
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Who&rsquo;s doing what</p>
          <div className="flex flex-col gap-3 pb-1">
            {picked.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border p-3.5">
                <div className="flex items-center justify-between pb-2.5">
                  <span className="text-[14px] font-semibold text-navy">{s.name}</span>
                  <span className="text-[12px] text-muted">{s.duration} · £{s.price}</span>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
                  {staffMembers.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAssign((a) => ({ ...a, [s.id]: m }))}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                        staffOf(s.id) === m ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {eligibleEntitlements.length > 0 && (
            <div className="mt-3 rounded-2xl border border-border bg-white p-3.5">
              <p className="text-[13px] font-bold text-navy">Pending sessions</p>
              <p className="pt-0.5 text-[12px] text-muted">Use a remaining package/subscription session, or book something new.</p>
              <div className="mt-3 flex flex-col gap-2">
                {eligibleEntitlements.map((e) => {
                  const on = entitlementId === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEntitlementId(on ? null : e.id)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left ${
                        on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-canvas text-navy"
                      }`}
                    >
                      <span>
                        <span className="block text-[13px] font-semibold">{e.name}</span>
                        <span className={`block text-[11px] ${on ? "text-white/70" : "text-muted"}`}>{e.used}/{e.purchased} used · {e.remaining} remaining</span>
                      </span>
                      <span className="text-[12px] font-bold">{on ? "Using" : "Use"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Appointment type</p>
          <div className="grid grid-cols-3 gap-2">
            {appointmentTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setApptType(t.id)}
                className={`rounded-2xl border px-2 py-3 text-center transition-colors ${
                  apptType === t.id ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                }`}
              >
                <span className="block text-[12px] font-bold">{t.label}</span>
                <span className={`block pt-0.5 text-[10px] leading-tight ${apptType === t.id ? "text-white/70" : "text-muted"}`}>{t.sub}</span>
              </button>
            ))}
          </div>

          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Day</p>
          {slotDraft && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-fg-primary/20 bg-canvas px-4 py-3">
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Picked from calendar</span>
                <span className="block pt-0.5 text-[14px] font-bold text-navy">{slotSummary(slotDraft)}</span>
              </span>
              <CalendarPlus size={18} strokeWidth={1.8} className="text-secondary" />
            </div>
          )}
          <MiniCalendar selected={day} onSelect={setDay} />

          <div className="flex items-center justify-between pb-2 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Time</p>
            <span className="text-[11px] text-muted">Working hours 09:00–16:00</span>
          </div>
          <TimeChips value={outOfHours || customTime ? null : time} onSelect={(t) => { setTime(t); setCustomTime(""); setOutOfHours(false); }} />
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-white px-4">
            <Clock size={14} strokeWidth={1.8} className="text-muted" />
            <input
              value={customTime}
              onChange={(e) => { setCustomTime(e.target.value); setTime(null); setOutOfHours(false); }}
              placeholder="Custom time, e.g. 12:45"
              className="h-11 min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-navy placeholder:font-normal placeholder:text-muted focus:outline-none"
            />
          </div>

          {/* Out-of-hours: reveal early/late slots, then surface a surcharge */}
          <button
            type="button"
            onClick={() => setShowOoh((v) => !v)}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-canvas px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold text-navy">
              <Clock size={14} strokeWidth={1.8} /> Book outside working hours
            </span>
            <motion.span animate={{ rotate: showOoh || outOfHours ? 180 : 0 }} className="flex text-muted">
              <ChevronDown size={16} />
            </motion.span>
          </button>
          {(showOoh || outOfHours) && (
            <div className="flex flex-wrap gap-2.5 pt-3">
              {oohSlots.map((t) => {
                const active = outOfHours && time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTime(t); setCustomTime(""); setOutOfHours(true); }}
                    className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
                      active ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}

          {outOfHours && (
            <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/[0.06] p-4">
              <button
                type="button"
                onClick={() => setApplySurcharge((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                  <Clock size={15} strokeWidth={1.8} className="text-warning" /> Out-of-hours surcharge
                </span>
                <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${applySurcharge ? "justify-end bg-fg-primary" : "justify-start bg-border"}`}>
                  <span className="h-5 w-5 rounded-full bg-white" />
                </span>
              </button>
              <p className="pt-1.5 text-[12px] text-secondary">
                {time} is outside working hours. Add a surcharge for the early/late slot.
              </p>
              {applySurcharge && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-white px-4">
                  <span className="text-[16px] font-bold text-navy">£</span>
                  <input
                    value={surcharge}
                    onChange={(e) => setSurcharge(e.target.value.replace(/[^0-9.]/g, ""))}
                    inputMode="decimal"
                    aria-label="Surcharge amount"
                    className="h-11 w-full bg-transparent text-[16px] font-bold text-navy focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Repeat</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
            {bookingDefaults.recurring.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurring(r)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                  recurring === r ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setMultiDate((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3.5 text-left">
            <span>
              <span className="block text-[14px] font-semibold text-navy">Multi-date booking</span>
              <span className="block pt-0.5 text-[12px] text-muted">Link patch tests, follow-ups and services in one booking set.</span>
            </span>
            <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${multiDate ? "justify-end bg-fg-primary" : "justify-start bg-border"}`}>
              <span className="h-5 w-5 rounded-full bg-white" />
            </span>
          </button>
          {multiDate && (
            <div className="mt-3 rounded-2xl bg-canvas p-3.5">
              <p className="text-[13px] font-bold text-navy">Linked date</p>
              <div className="pt-3">
                <MiniCalendar selected={linkedDay} onSelect={setLinkedDay} />
              </div>
              <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Time</p>
              <TimeChips value={linkedTime} onSelect={setLinkedTime} />
              <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Service</p>
              <div className="flex flex-wrap gap-2">
                {picked.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLinkedServiceId(s.id)}
                    className={`rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                      (linkedServiceId ?? picked[0]?.id) === s.id ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 mt-5 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={!day || !selectedTime || (multiDate && (!linkedDay || !linkedTime))} onClick={() => setStep(3)}>
              Review appointment
            </DarkButton>
          </div>
        </>
      )}

      {/* Step 3 — review */}
      {step === 3 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[13px] text-secondary">Client</span>
              <span className="text-[14px] font-semibold text-navy">{client}</span>
            </div>
            {picked.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-t border-border px-4 py-3.5">
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-navy">{s.name}</span>
                  <span className="block text-[12px] text-muted">{s.duration} · {staffOf(s.id)}</span>
                </span>
                <span className="text-[14px] font-semibold text-navy">£{s.price}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
              <span className="text-[13px] text-secondary">When</span>
              <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                {dowMar(day)} · {selectedTime}
                {outOfHours && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Out of hours</span>}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
              <span className="text-[13px] text-secondary">Type</span>
              <span className="text-[14px] font-semibold text-navy">{appointmentTypes.find((t) => t.id === apptType)?.label}</span>
            </div>
            {multiDate && linkedService && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
                <span className="text-[13px] text-secondary">Linked date</span>
                <span className="text-right text-[14px] font-semibold text-navy">{linkedService.name}<br /><span className="text-[12px] text-muted">{dowMar(linkedDay)} · {linkedTime}</span></span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
              <span className="text-[13px] text-secondary">Total duration</span>
              <span className="text-[14px] font-semibold text-navy">{fmtDur(totalMin)}</span>
            </div>
            {selectedEntitlement && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
                <span className="text-[13px] text-secondary">Pending session</span>
                <span className="text-right text-[14px] font-semibold text-navy">{selectedEntitlement.name}<br /><span className="text-[12px] text-muted">{selectedEntitlement.remaining} remaining</span></span>
              </div>
            )}
            {recurring !== "Doesn't repeat" && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
                <span className="text-[13px] text-secondary">Repeats</span>
                <span className="text-[14px] font-semibold text-navy">{recurring}</span>
              </div>
            )}
            <div className="border-t border-border px-4 py-3.5">
              <button type="button" onClick={() => setDepositOn((v) => !v)} className="flex w-full items-center justify-between text-left">
                <span>
                  <span className="block text-[13px] text-secondary">Deposit / booking fee</span>
                  <span className="block pt-0.5 text-[14px] font-semibold text-navy">
                    {depositOn ? `${depositUnit === "percent" ? `${depositValue}%` : `£${depositValue}`} · ${paymentRequest === "link" ? `payment link ${cappedLinkHours}h` : "card on file"}` : "Not requested"}
                  </span>
                </span>
                <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${depositOn ? "justify-end bg-fg-primary" : "justify-start bg-border"}`}>
                  <span className="h-5 w-5 rounded-full bg-white" />
                </span>
              </button>
              {depositOn && (
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex items-center rounded-xl bg-canvas px-3">
                    {depositUnit === "amount" && <span className="text-[13px] font-bold text-muted">£</span>}
                    <input value={depositValue} onChange={(e) => setDepositValue(e.target.value.replace(/[^0-9.]/g, ""))} className="h-10 min-w-0 flex-1 bg-transparent text-[14px] font-bold text-navy focus:outline-none" />
                    {depositUnit === "percent" && <span className="text-[13px] font-bold text-muted">%</span>}
                  </div>
                  <button type="button" onClick={() => setDepositUnit((u) => (u === "percent" ? "amount" : "percent"))} className="rounded-xl border border-border px-3 text-[12px] font-semibold text-navy">
                    {depositUnit === "percent" ? "Use £" : "Use %"}
                  </button>
                  <button type="button" onClick={() => setPaymentRequest("link")} className={`rounded-xl py-2 text-[12px] font-semibold ${paymentRequest === "link" ? "bg-fg-primary text-white" : "border border-border text-navy"}`}>Payment link</button>
                  <button type="button" onClick={() => setPaymentRequest("card")} className={`rounded-xl py-2 text-[12px] font-semibold ${paymentRequest === "card" ? "bg-fg-primary text-white" : "border border-border text-navy"}`}>Card on file</button>
                  {paymentRequest === "link" && (
                    <div className="col-span-2 flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                      <span className="text-[12px] text-muted">Link expires</span>
                      <input value={linkHours} onChange={(e) => setLinkHours(e.target.value.replace(/\D/g, ""))} className="h-8 w-12 bg-transparent text-right text-[13px] font-bold text-navy focus:outline-none" />
                      <span className="text-[12px] text-muted">hours max 24</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setPending((v) => !v)} className="flex w-full items-center justify-between border-t border-border px-4 py-3.5 text-left">
              <span>
                <span className="block text-[13px] text-secondary">Appointment request state</span>
                <span className="block text-[14px] font-semibold text-navy">{pending ? "Pending salon approval" : "Confirmed immediately"}</span>
              </span>
              <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${pending ? "justify-end bg-fg-primary" : "justify-start bg-border"}`}>
                <span className="h-5 w-5 rounded-full bg-white" />
              </span>
            </button>
            {surchargeNum > 0 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
                <span className="text-[13px] text-secondary">Out-of-hours surcharge</span>
                <span className="text-[14px] font-semibold text-navy">£{surchargeNum}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border bg-canvas px-4 py-3.5">
              <span className="text-[14px] font-bold text-navy">Total</span>
              <span className="text-[16px] font-bold text-navy">£{totalPrice}</span>
            </div>
          </div>
          <div className="pt-5">
            <DarkButton
              onClick={() => {
                const uniqStaff = Array.from(new Set(picked.map((p) => staffOf(p.id))));
                const store = useAppStore.getState();
                store.addCustomAppt({
                  client: client ?? "Walk-in",
                  service: summary,
                  staff: uniqStaff.length > 1 ? `${uniqStaff[0]} +${uniqStaff.length - 1}` : uniqStaff[0] ?? staffMembers[0],
                  day,
                  time: selectedTime,
                  duration: fmtDur(totalMin),
                  outOfHours,
                  appointmentType: apptType,
                  paymentStatus: selectedEntitlement ? "subscription" : depositAmount > 0 ? "deposit" : "unpaid",
                  deposit: depositAmount,
                  paymentLinkHours: paymentRequest === "link" ? cappedLinkHours : undefined,
                  pending,
                  recurring: recurring === "Doesn't repeat" ? null : recurring,
                  bookingSetId: multiDate ? `set-${Date.now()}` : undefined,
                  entitlementLabel: selectedEntitlement?.name,
                  price: totalPrice,
                  occurrences: multiDate && linkedService
                    ? [
                        { id: "primary", day, time: selectedTime, service: summary, staff: uniqStaff[0] ?? staffMembers[0] },
                        { id: "linked", day: linkedDay, time: linkedTime, service: linkedService.name, staff: staffOf(linkedService.id) },
                      ]
                    : undefined,
                });
                store.focusSchedule(day ?? 12, "Calendar");
                setStep(4);
              }}
            >
              Add Appointment · £{totalPrice}
            </DarkButton>
          </div>
        </>
      )}

      {/* Step 4 — success */}
      {step === 4 && (
        <div className="flex flex-col items-center pb-2 pt-2 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-fg-primary text-white"
          >
            <CheckCircle2 size={28} strokeWidth={1.6} />
          </motion.span>
          <p className="pt-5 text-[16px] font-bold text-navy">{client}</p>
          <p className="pt-1 text-[13px] text-secondary">{summary}</p>
          <p className="pt-0.5 text-[13px] text-secondary">
            {dowMar(day)} at {selectedTime} · {fmtDur(totalMin)} · £{totalPrice}
          </p>
          <p className="pt-1 text-[12px] text-muted">
            {multiDate ? "Linked booking set" : recurring !== "Doesn't repeat" ? `${recurring} series` : pending ? "Pending approval" : "Confirmed"}
            {depositAmount > 0 ? ` · £${depositAmount} deposit requested` : ""}
          </p>
          <div className="w-full pt-6">
            <DarkButton
              onClick={() => {
                close();
                router.push("/app/schedule");
              }}
            >
              View in schedule
            </DarkButton>
            <div className="pt-3">
              <GhostButton onClick={close}>Done</GhostButton>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ── New Class (from the calendar "choose" sheet) ──

function NewClassSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const slotDraft = useAppStore((s) => s.slotDraft);
  const [template, setTemplate] = useState(classTemplates[0]);
  const [staff, setStaff] = useState("Emma S.");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open || !slotDraft) return;
    setDay(slotDraft.day);
    setTime(slotDraft.time);
    if (slotDraft.staff) setStaff(slotDraft.staff);
  }, [open, slotDraft]);

  const close = () => {
    useAppStore.getState().clearSlotDraft();
    onClose();
    setTimeout(() => {
      setTemplate(classTemplates[0]);
      setStaff("Emma S.");
      setDay(null);
      setTime(null);
      setDone(false);
    }, 350);
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      full={!done}
      title={done ? "Class scheduled" : "New Class"}
      sub={done ? undefined : "Seats open for booking once saved"}
    >
      {done ? (
        <div className="flex flex-col items-center pb-2 pt-2 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-fg-primary text-white"
          >
            <CheckCircle2 size={28} strokeWidth={1.6} />
          </motion.span>
          <p className="pt-5 text-[16px] font-bold text-navy">{template.name}</p>
          <p className="pt-1 text-[13px] text-secondary">
            {dowMar(day)} at {time} with {staff} · {template.sub}
          </p>
          <div className="w-full pt-6">
            <DarkButton
              onClick={() => {
                close();
                router.push("/app/schedule");
              }}
            >
              View in schedule
            </DarkButton>
            <div className="pt-3">
              <GhostButton onClick={close}>Done</GhostButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Class type</p>
          <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
            {classTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t)}
                className={`w-[124px] shrink-0 rounded-2xl border p-3.5 text-center transition-colors ${
                  template.id === t.id ? "border-navy" : "border-border"
                }`}
              >
                <span className="block text-[20px]">{t.emoji}</span>
                <span className="mt-1.5 block text-[13px] font-bold leading-tight text-navy">{t.name}</span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted">{t.sub}</span>
              </button>
            ))}
          </div>

          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Run by</p>
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
            {staffMembers.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setStaff(m)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                  staff === m ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Day</p>
          <MiniCalendar selected={day} onSelect={setDay} />
          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Start time</p>
          <TimeChips value={time} onSelect={setTime} />

          <div className="sticky bottom-0 -mx-6 mt-5 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={!day || !time} onClick={() => setDone(true)}>
              Schedule class
            </DarkButton>
          </div>
        </>
      )}
    </Sheet>
  );
}

// ── New Client ──

function NewClientSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [more, setMore] = useState(false);
  const [source, setSource] = useState("Phone");
  const [saved, setSaved] = useState(false);

  const input = "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none";
  const valid = name.trim() && mobile.trim();

  const close = () => {
    onClose();
    setTimeout(() => {
      setName(""); setMobile(""); setEmail(""); setMore(false); setSaved(false);
    }, 350);
  };

  return (
    <Sheet open={open} onClose={close} title="New Client" sub="For phone or walk-in onboarding">
      {saved ? (
        <div className="flex flex-col items-center pb-2 pt-4 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-fg-primary text-white"
          >
            <Check size={26} strokeWidth={2.2} />
          </motion.span>
          <p className="pt-5 text-[16px] font-bold text-navy">{name} added</p>
          <p className="pt-1 text-[13px] text-secondary">They&rsquo;ll appear in your client list.</p>
          <div className="w-full pt-6">
            <DarkButton onClick={close}>Done</DarkButton>
          </div>
        </div>
      ) : (
        <>
          <label className="block pb-4">
            <span className="mb-2 block text-[13px] font-medium text-navy">Full name</span>
            <input className={input} placeholder="e.g. Maya Patel" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block pb-4">
            <span className="mb-2 block text-[13px] font-medium text-navy">Mobile</span>
            <input className={input} placeholder="(555) 000-0000" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </label>
          <label className="block pb-4">
            <span className="mb-2 block text-[13px] font-medium text-navy">Email (optional)</span>
            <input className={input} placeholder="name@email.com" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <button type="button" onClick={() => setMore((m) => !m)} className="flex w-full items-center justify-between py-2">
            <span className="text-[15px] font-bold text-navy">More details</span>
            <span className="flex items-center gap-1 text-[12px] text-muted">
              Optional
              <motion.span animate={{ rotate: more ? 180 : 0 }} className="flex">
                <ChevronDown size={14} />
              </motion.span>
            </span>
          </button>
          {more && (
            <div className="pt-2">
              {["Address|Street, city", "Birthday|e.g. 14 June", "Pronouns|e.g. She / her", "Occupation|e.g. Teacher"].map((row) => {
                const [label, ph] = row.split("|");
                return (
                  <label key={label} className="block pb-4">
                    <span className="mb-2 block text-[13px] font-medium text-navy">{label}</span>
                    <input className={input} placeholder={ph} />
                  </label>
                );
              })}
              <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">How they found you</p>
              <div className="flex flex-wrap gap-2 pb-2">
                {["Phone", "Walk-in", "Referral", "Other"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                      source === s ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 mt-3 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={!valid} onClick={() => setSaved(true)}>
              Add Client
            </DarkButton>
          </div>
        </>
      )}
    </Sheet>
  );
}

// ── Block time ──

type BlockDraft = Omit<CalendarBlockedTime, "id">;
type PendingBlockSave = { draft: BlockDraft; conflicts: BookingConflict[] };

function findBlockConflicts(draft: BlockDraft, customAppts: CustomAppointment[], sourceView: "Calendar" | "Team" = "Calendar") {
  const start = draft.wholeDay ? 0 : timeToMinutes(draft.startTime);
  const end = draft.wholeDay ? 24 * 60 : timeToMinutes(draft.endTime);
  const studioWide = draft.staff.length >= staffMembers.length;
  const includesStaff = (staff: string) => studioWide || draft.staff.includes(staff);
  const conflicts: BookingConflict[] = [];

  const seededDay = threeDayGrid.find((d) => Number(d.date) === draft.day);
  seededDay?.blocks.forEach((block, i) => {
    if (!isBookingBlock(block)) return;
    const staff = "Emma S.";
    if (!includesStaff(staff)) return;
    const blockStart = Math.round(block.start * 60);
    const blockEnd = Math.round((block.start + block.span) * 60);
    if (!overlaps(start, end, blockStart, blockEnd)) return;
    conflicts.push({
      key: `seed:calendar:${seededDay.date}:${i}:${block.name}`,
      label: block.name,
      staff,
      time: `${minutesToTime(blockStart)}-${minutesToTime(blockEnd)}`,
    });
  });

  if (sourceView === "Team") {
    teamColumns.forEach((column) => {
      if (!includesStaff(column.name)) return;
      column.blocks.forEach((block, i) => {
        if (!isBookingBlock(block)) return;
        const blockStart = Math.round(block.start * 60);
        const blockEnd = Math.round((block.start + block.span) * 60);
        if (!overlaps(start, end, blockStart, blockEnd)) return;
        conflicts.push({
          key: `seed:team:${column.id}:${i}:${block.name}`,
          label: block.name,
          staff: column.name,
          time: `${minutesToTime(blockStart)}-${minutesToTime(blockEnd)}`,
        });
      });
    });
  }

  customAppts.forEach((appt) => {
    const occurrences = appt.occurrences?.length
      ? appt.occurrences
      : [{ id: "primary", day: appt.day, time: appt.time, service: appt.service, staff: appt.staff }];
    occurrences.forEach((occ) => {
      if (occ.day !== draft.day || !occ.time) return;
      const staff = (occ.staff || appt.staff).split(" +")[0];
      if (!includesStaff(staff)) return;
      const apptStart = timeToMinutes(occ.time);
      const apptEnd = apptStart + apptDurationMins(appt.duration);
      if (!overlaps(start, end, apptStart, apptEnd)) return;
      conflicts.push({
        customId: appt.id,
        label: appt.client,
        staff,
        time: `${occ.time}-${minutesToTime(apptEnd)}`,
      });
    });
  });

  return conflicts;
}

function BlockTimeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { blockEdit, setBlockEdit, deleteBlockKey, deleteCalendarBlock, slotDraft, customAppts, cancelCustomAppointments } = useAppStore();
  const [type, setType] = useState("custom");
  const [day, setDay] = useState<number | null>(4);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [team, setTeam] = useState<string[]>(["Emma S."]);
  const [scope, setScope] = useState<"members" | "studio">("members");
  const [wholeDay, setWholeDay] = useState(false);
  const [allowOnline, setAllowOnline] = useState(false);
  const [frequency, setFrequency] = useState(blockFrequencies[0]);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<PendingBlockSave | null>(null);
  const [newType, setNewType] = useState(false);
  const [paid, setPaid] = useState(true);

  const input = "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none";
  const editing = !!blockEdit;

  useEffect(() => {
    if (!open) return;
    const existingBlock = blockEdit?.calendarBlockId
      ? useAppStore.getState().calendarBlocks.find((b) => b.id === blockEdit.calendarBlockId)
      : null;
    const nextDay = blockEdit?.day ?? slotDraft?.day ?? 4;
    const nextStart = blockEdit?.time ?? slotDraft?.time ?? "12:00";
    const nextEnd = existingBlock?.endTime
      ?? (blockEdit?.wholeDay ? "23:59" : minutesToTime(Math.min(timeToMinutes(nextStart) + 60, 23 * 60 + 59)));
    const nextTeam = existingBlock?.staff ?? (slotDraft?.staff ? [slotDraft.staff] : ["Emma S."]);
    setType(blockEdit?.blockType ?? "custom");
    setWholeDay(!!blockEdit?.wholeDay);
    setTitle(blockEdit?.title ?? "");
    setStartTime(nextStart);
    setEndTime(nextEnd);
    setDay(nextDay);
    setTeam(nextTeam);
    setScope(nextTeam.length >= staffMembers.length ? "studio" : "members");
    setAllowOnline(existingBlock?.allowOnline ?? false);
    setFrequency(existingBlock?.frequency ?? blockEdit?.frequency ?? blockFrequencies[0]);
    setFrequencyOpen(false);
    setPendingSave(null);
  }, [open, blockEdit, slotDraft]);

  const close = () => {
    setBlockEdit(null);
    setPendingSave(null);
    setFrequencyOpen(false);
    useAppStore.getState().clearSlotDraft();
    onClose();
  };
  const buildDraft = (): BlockDraft => {
    const safeStart = wholeDay ? "00:00" : startTime;
    const safeEnd = wholeDay
      ? "23:59"
      : timeToMinutes(endTime) > timeToMinutes(startTime)
        ? endTime
        : blockEndTimes.find((t) => timeToMinutes(t) > timeToMinutes(startTime)) ?? "18:00";
    const pickedType = blockTypes.find((t) => t.id === type);
    const pickedStaff = scope === "studio" ? staffMembers : team.length ? team : [slotDraft?.staff ?? "Emma S."];
    return {
      title: title.trim() || pickedType?.name || "Blocked time",
      blockType: type,
      day: day ?? slotDraft?.day ?? 12,
      staff: pickedStaff,
      startTime: safeStart,
      endTime: safeEnd,
      wholeDay,
      allowOnline,
      frequency,
    };
  };
  const commitBlock = (draft: BlockDraft, cancelBookings: boolean) => {
    const store = useAppStore.getState();
    if (cancelBookings && pendingSave?.conflicts.length) {
      pendingSave.conflicts.forEach((conflict) => {
        if (conflict.key) store.deleteBlockKey(conflict.key);
      });
      const customIds = Array.from(new Set(pendingSave.conflicts.map((c) => c.customId).filter(Boolean) as string[]));
      if (customIds.length) cancelCustomAppointments(customIds);
    }
    if (blockEdit?.calendarBlockId) {
      store.updateCalendarBlock(blockEdit.calendarBlockId, draft);
    } else if (!blockEdit) {
      store.addCalendarBlock(draft);
    }
    store.focusSchedule(draft.day, "Calendar");
    close();
  };
  const saveBlock = () => {
    const draft = buildDraft();
    const conflicts = findBlockConflicts(draft, customAppts, slotDraft?.view ?? "Calendar");
    if (conflicts.length) {
      setPendingSave({ draft, conflicts });
      return;
    }
    commitBlock(draft, false);
  };

  return (
    <>
      <Sheet open={open && !newType} onClose={close} title={editing ? "Edit blocked time" : "Add blocked time"} full>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Block time type</p>
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
          {blockTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`w-[108px] shrink-0 rounded-2xl border p-3.5 text-center transition-colors ${
                type === t.id ? "border-navy" : "border-border"
              }`}
            >
              <span className="block text-[20px]">{t.emoji}</span>
              <span className="mt-1.5 block text-[13px] font-bold text-navy">{t.name}</span>
              <span className="mt-0.5 block text-[10px] leading-tight text-muted">{t.sub}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNewType(true)}
            className="w-[108px] shrink-0 rounded-2xl border border-dashed border-border p-3.5 text-center"
          >
            <span className="mx-auto flex h-7 w-7 items-center justify-center text-secondary">
              <Plus size={18} />
            </span>
            <span className="mt-1.5 block text-[13px] font-semibold text-secondary">New type</span>
          </button>
        </div>

        <label className="block pb-4">
          <span className="mb-2 block text-[13px] font-medium text-navy">
            Title <span className="font-normal text-muted">(Optional)</span>
          </span>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lunch meeting" />
        </label>

        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Date</p>
        {slotDraft && !editing && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-fg-primary/20 bg-canvas px-4 py-3">
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Picked from calendar</span>
              <span className="block pt-0.5 text-[14px] font-bold text-navy">{slotSummary(slotDraft)}</span>
            </span>
            <Clock size={18} strokeWidth={1.8} className="text-secondary" />
          </div>
        )}
        <MiniCalendar selected={day} onSelect={setDay} />

        <button type="button" onClick={() => setWholeDay((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3.5 text-left">
          <span>
            <span className="block text-[14px] font-semibold text-navy">Block whole day</span>
            <span className="block pt-0.5 text-[12px] text-muted">Use shift editing if you need to open a closed day.</span>
          </span>
          <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${wholeDay ? "justify-end bg-fg-primary" : "justify-start bg-border"}`}>
            <span className="h-5 w-5 rounded-full bg-white" />
          </span>
        </button>

        <div className={`pt-4 ${wholeDay ? "opacity-45" : ""}`}>
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Start time</p>
          <div className="flex flex-wrap gap-2">
            {wholeDay ? (
              <button type="button" disabled className="rounded-full bg-fg-primary px-3.5 py-2 text-[12px] font-semibold text-white disabled:opacity-100">
                00:00
              </button>
            ) : (
              blockStartTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setStartTime(t);
                    if (timeToMinutes(endTime) <= timeToMinutes(t)) {
                      setEndTime(blockEndTimes.find((e) => timeToMinutes(e) > timeToMinutes(t)) ?? "18:00");
                    }
                  }}
                  className={`rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                    startTime === t ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                  }`}
                >
                  {t}
                </button>
              ))
            )}
          </div>
          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">End time</p>
          <div className="flex flex-wrap gap-2">
            {wholeDay ? (
              <button type="button" disabled className="rounded-full bg-fg-primary px-3.5 py-2 text-[12px] font-semibold text-white disabled:opacity-100">
                23:59
              </button>
            ) : (
              blockEndTimes.map((t) => {
                const disabled = timeToMinutes(t) <= timeToMinutes(startTime);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => setEndTime(t)}
                    className={`rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                      endTime === t ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                    } disabled:opacity-35`}
                  >
                    {t}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <p className="pt-2 text-right text-[11px] text-muted">{wholeDay ? "Whole day blocked" : `${startTime} – ${endTime}`}</p>

        <p className="pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Who is blocked</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setScope("studio");
            setTeam(staffMembers);
          }}
          className={`mb-3 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            scope === "studio" ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
          }`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${scope === "studio" ? "bg-white/20 text-white" : "bg-canvas text-secondary"}`}>
            <Building2 size={19} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold">Block for the whole studio.</span>
            <span className={`block pt-0.5 text-[12px] ${scope === "studio" ? "text-white/70" : "text-muted"}`}>
              Every team member becomes unavailable for this time.
            </span>
          </span>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${scope === "studio" ? "border-white bg-white text-fg-primary" : "border-border text-transparent"}`}>
            <Check size={13} strokeWidth={3} />
          </span>
        </motion.button>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Individual team members</p>
        <div className="flex flex-wrap gap-2">
          {staffMembers.map((m) => {
            const on = scope === "studio" || team.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  if (scope === "studio") {
                    setScope("members");
                    setTeam([m]);
                    return;
                  }
                  setScope("members");
                  setTeam((t) => (on ? t.filter((x) => x !== m) : [...t, m]));
                }}
                className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                  on ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Frequency</p>
        <button
          type="button"
          onClick={() => setFrequencyOpen((v) => !v)}
          className="flex h-12 w-full items-center justify-between rounded-xl bg-canvas px-4 text-left text-[14px] font-semibold text-navy"
        >
          {frequency}
          <motion.span animate={{ rotate: frequencyOpen ? 180 : 0 }} className="flex text-muted">
            <ChevronDown size={14} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {frequencyOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 overflow-hidden rounded-xl border border-border bg-white"
            >
              {blockFrequencies.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setFrequency(option);
                    setFrequencyOpen(false);
                  }}
                  className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-[13px] font-semibold text-navy last:border-0"
                >
                  {option}
                  {frequency === option && <Check size={14} strokeWidth={2.5} className="text-fg-primary" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <label className="block pt-4">
          <span className="mb-2 flex items-center justify-between text-[13px] font-medium text-navy">
            Description <span className="text-[11px] font-normal uppercase text-muted">(Optional) · 0/255</span>
          </span>
          <textarea className="h-24 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none" placeholder="Add description or note" />
        </label>

        <button type="button" onClick={() => setAllowOnline((v) => !v)} className="flex w-full items-center gap-3 py-4 text-left">
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border ${
              allowOnline ? "border-navy bg-canvas" : "border-border bg-white"
            }`}
          >
            {allowOnline && <Check size={12} strokeWidth={3} className="text-navy" />}
          </span>
          <span className="text-[13px] text-navy">Online booking allowed during blocked time</span>
        </button>

        <div className="sticky bottom-0 -mx-6 bg-white px-6 pb-1 pt-2">
          <DarkButton onClick={saveBlock}>Save</DarkButton>
          {editing && (
            <button
              type="button"
              onClick={() => {
                if (blockEdit?.calendarBlockId) deleteCalendarBlock(blockEdit.calendarBlockId);
                else if (blockEdit?.key) deleteBlockKey(blockEdit.key);
                close();
              }}
              className="mt-3 w-full text-center text-[14px] font-semibold text-danger"
            >
              Delete block
            </button>
          )}
        </div>
      </Sheet>

      <Sheet
        open={open && !!pendingSave}
        onClose={() => setPendingSave(null)}
        title="Would you like to cancel all bookings?"
        sub={pendingSave ? `${pendingSave.conflicts.length} booking${pendingSave.conflicts.length > 1 ? "s" : ""} overlap this block.` : undefined}
      >
        {pendingSave && (
          <>
            <div className="rounded-2xl border border-warning/35 bg-warning/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                  <AlertTriangle size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-navy">
                    {dowMar(pendingSave.draft.day)} · {pendingSave.draft.wholeDay ? "Whole day" : `${fmtTime12(pendingSave.draft.startTime)}-${fmtTime12(pendingSave.draft.endTime)}`}
                  </span>
                  <span className="block pt-0.5 text-[12px] text-secondary">
                    The blocked time sits on top of existing bookings.
                  </span>
                </span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white">
                {pendingSave.conflicts.slice(0, 4).map((conflict, i) => (
                  <div key={`${conflict.label}-${conflict.time}-${i}`} className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-0">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-navy">{conflict.label}</span>
                      <span className="block text-[11px] text-muted">{conflict.staff}</span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-secondary">{conflict.time}</span>
                  </div>
                ))}
                {pendingSave.conflicts.length > 4 && (
                  <div className="px-3 py-2 text-[12px] font-semibold text-muted">
                    +{pendingSave.conflicts.length - 4} more
                  </div>
                )}
              </div>
            </div>
            <div className="pt-5">
              <DarkButton onClick={() => commitBlock(pendingSave.draft, true)}>
                Cancel bookings and block time
              </DarkButton>
              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => commitBlock(pendingSave.draft, false)}
                  className="h-11 rounded-full border border-border px-3 text-[13px] font-semibold text-navy"
                >
                  Keep bookings
                </button>
                <button
                  type="button"
                  onClick={() => setPendingSave(null)}
                  className="h-11 rounded-full border border-border px-3 text-[13px] font-semibold text-navy"
                >
                  Go back
                </button>
              </div>
            </div>
          </>
        )}
      </Sheet>

      {/* Nested: add a blocked time type */}
      <Sheet
        open={open && newType}
        onClose={() => setNewType(false)}
        title="Add a blocked time type"
        sub="Create a new blocked time type"
      >
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Type</p>
        <div className="flex gap-3 pb-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canvas text-[20px]">🥪</span>
          <input className={input} placeholder="e.g. Patch test" />
        </div>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Duration</p>
        <span className="flex h-12 items-center justify-between rounded-xl bg-canvas px-4 text-[14px] text-navy">
          1 hour
          <ChevronDown size={14} className="text-muted" />
        </span>
        <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Compensation</p>
        <div className="flex gap-2 pb-5">
          {["Paid", "Unpaid"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPaid(p === "Paid")}
              className={`rounded-full px-5 py-2 text-[13px] font-medium ${
                (p === "Paid") === paid ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <DarkButton onClick={() => setNewType(false)}>Save</DarkButton>
      </Sheet>
    </>
  );
}
