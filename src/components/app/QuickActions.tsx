"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarPlus, UserPlus, Clock, PoundSterling, ChevronLeft, ChevronRight,
  Search, UserRound, CheckCircle2, Plus, ChevronDown, Check, Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store/appStore";
import { Sheet, DarkButton, GhostButton, MiniCalendar, TimeChips } from "@/components/ui";
import {
  services, serviceCategories, staffMembers, clientRows, blockTypes, classTemplates,
} from "@/lib/data/product";

// Weekday for a day-of-month in the demo's reference month (1 March 2026 = Sun),
// so confirmations show the real day instead of a hardcoded "Fri".
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dowMar = (d: number | null) => (d == null ? "" : `${DOW[(d - 1) % 7]} ${d} Mar`);

// Slots outside the 09:00–16:00 working day — booking one prompts a surcharge.
const oohSlots = ["07:00", "07:30", "08:00", "08:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const minsOf = (duration: string) => parseInt(duration, 10) || 0;
const fmtDur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ""}` : `${min}m`);

/**
 * Quick Actions: the "+" tab opens a menu sheet; each row launches a flow.
 * New Appointment is a 4-step sheet (service → client → time → review → done).
 * Tapping empty calendar space opens the "choose" sheet first — the slot
 * could be an appointment, a class, or a break.
 */
export function QuickActionsHost() {
  const { quickAction, setQuickAction } = useAppStore();

  return (
    <>
      <Sheet open={quickAction === "menu"} onClose={() => setQuickAction(null)} aboveNav>
        <h2 className="pb-5 text-center text-[18px] font-bold text-navy">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <ActionRow
            icon={<CalendarPlus size={19} strokeWidth={1.7} />}
            title="Add New Appointment"
            sub="Schedule a new booking"
            onClick={() => setQuickAction("appointment")}
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
            onClick={() => setQuickAction("block")}
          />
          <LogPaymentRow />
        </div>
        <div className="h-2" />
      </Sheet>

      {/* "What are you adding?" — entry point from empty calendar space / gap slots */}
      <Sheet
        open={quickAction === "choose"}
        onClose={() => setQuickAction(null)}
        title="Fill this slot"
        sub="What are you adding to the calendar?"
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
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<string | null>(null);
  const [picked, setPicked] = useState<(typeof services)[number][]>([]);
  const [assign, setAssign] = useState<Record<string, string>>({}); // serviceId → staff
  const [cat, setCat] = useState("All");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [outOfHours, setOutOfHours] = useState(false);
  const [showOoh, setShowOoh] = useState(false);
  const [applySurcharge, setApplySurcharge] = useState(true);
  const [surcharge, setSurcharge] = useState("15");
  const [query, setQuery] = useState("");

  const reset = () => {
    setStep(0); setClient(null); setPicked([]); setAssign({}); setCat("All");
    setDay(null); setTime(null); setOutOfHours(false); setShowOoh(false);
    setApplySurcharge(true); setSurcharge("15"); setQuery("");
  };
  const close = () => {
    onClose();
    setTimeout(reset, 350);
  };

  const staffOf = (id: string) => assign[id] ?? staffMembers[0];
  const surchargeNum = outOfHours && applySurcharge ? Math.max(0, parseFloat(surcharge) || 0) : 0;
  const servicesTotal = picked.reduce((s, p) => s + p.price, 0);
  const totalPrice = servicesTotal + surchargeNum;
  const totalMin = picked.reduce((s, p) => s + minsOf(p.duration), 0);
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
            onClick={() => { setClient("New client"); setStep(2); }}
            className="flex items-center gap-3 rounded-xl py-2.5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-primary text-white">
              <Plus size={18} strokeWidth={2} />
            </span>
            <span className="text-[15px] font-semibold text-navy">New client</span>
          </button>
          <button
            type="button"
            onClick={() => { setClient("Walk-in"); setStep(2); }}
            className="flex items-center gap-3 rounded-xl py-2.5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-secondary">
              <UserRound size={17} strokeWidth={1.6} />
            </span>
            <span className="text-[15px] font-semibold text-navy">Walk-in</span>
          </button>
          <div className="my-1 h-px bg-border" />
          {visibleClients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setClient(c.name); setStep(2); }}
              className="flex items-center gap-3 rounded-xl py-2.5 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-secondary">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-navy">{c.name}</span>
                <span className="block text-[12px] text-muted">{c.meta}</span>
              </span>
              <ChevronRight size={15} className="text-muted" />
            </button>
          ))}
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

          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Day</p>
          <MiniCalendar selected={day} onSelect={setDay} />

          <div className="flex items-center justify-between pb-2 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Time</p>
            <span className="text-[11px] text-muted">Working hours 09:00–16:00</span>
          </div>
          <TimeChips value={outOfHours ? null : time} onSelect={(t) => { setTime(t); setOutOfHours(false); }} />

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
                    onClick={() => { setTime(t); setOutOfHours(true); }}
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

          <div className="sticky bottom-0 -mx-6 mt-5 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={!day || !time} onClick={() => setStep(3)}>
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
                {dowMar(day)} · {time}
                {outOfHours && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Out of hours</span>}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
              <span className="text-[13px] text-secondary">Total duration</span>
              <span className="text-[14px] font-semibold text-navy">{fmtDur(totalMin)}</span>
            </div>
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
                useAppStore.getState().addCustomAppt({
                  client: client ?? "Walk-in",
                  service: summary,
                  staff: uniqStaff.length > 1 ? `${uniqStaff[0]} +${uniqStaff.length - 1}` : uniqStaff[0] ?? staffMembers[0],
                  day,
                  time,
                  duration: fmtDur(totalMin),
                  outOfHours,
                });
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
            {dowMar(day)} at {time} · {fmtDur(totalMin)} · £{totalPrice}
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
  const [template, setTemplate] = useState(classTemplates[0]);
  const [staff, setStaff] = useState("Emma S.");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const close = () => {
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

function BlockTimeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState("custom");
  const [day, setDay] = useState<number | null>(4);
  const [team, setTeam] = useState<string[]>(["Emma S."]);
  const [allowOnline, setAllowOnline] = useState(false);
  const [newType, setNewType] = useState(false);
  const [paid, setPaid] = useState(true);

  const input = "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none";

  return (
    <>
      <Sheet open={open && !newType} onClose={onClose} title="Add blocked time" full>
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
          <input className={input} placeholder="e.g. Lunch meeting" />
        </label>

        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Date</p>
        <MiniCalendar selected={day} onSelect={setDay} />

        <div className="flex gap-3 pt-4">
          {["Start time|12:00", "End time|12:30"].map((row) => {
            const [label, v] = row.split("|");
            return (
              <label key={label} className="block flex-1">
                <span className="mb-2 block text-[13px] font-medium text-navy">{label}</span>
                <span className="flex h-12 items-center justify-between rounded-xl bg-canvas px-4 text-[14px] text-navy">
                  {v}
                  <ChevronDown size={14} className="text-muted" />
                </span>
              </label>
            );
          })}
        </div>
        <p className="pt-1 text-right text-[11px] text-muted">30 min duration</p>

        <p className="pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Team members</p>
        <div className="flex flex-wrap gap-2">
          {staffMembers.map((m) => {
            const on = team.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => setTeam((t) => (on ? t.filter((x) => x !== m) : [...t, m]))}
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
        <span className="flex h-12 items-center justify-between rounded-xl bg-canvas px-4 text-[14px] text-navy">
          Doesn&rsquo;t repeat
          <ChevronDown size={14} className="text-muted" />
        </span>

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
          <DarkButton onClick={onClose}>Save</DarkButton>
        </div>
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
