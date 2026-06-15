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
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  return (
    <ActionRow
      icon={<PoundSterling size={19} strokeWidth={1.7} />}
      title="Log Payment"
      sub="Record a payment received"
      onClick={() => {
        setQuickAction(null);
        router.push("/app/checkout");
      }}
    />
  );
}

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
  const [service, setService] = useState<(typeof services)[number] | null>(null);
  const [staff, setStaff] = useState("Emma S.");
  const [cat, setCat] = useState("All");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const reset = () => {
    setStep(0);
    setClient(null);
    setService(null);
    setStaff("Emma S.");
    setCat("All");
    setDay(null);
    setTime(null);
    setQuery("");
  };
  const close = () => {
    onClose();
    setTimeout(reset, 350);
  };

  const subFor = ["What's being booked?", service?.name ?? "", `${service?.name ?? ""} · ${client}`, "Check the details", ""][step];
  const visibleServices = services.filter((s) => cat === "All" || s.category === cat);
  const visibleClients = clientRows.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

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
            {visibleServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setService(s); setStep(1); }}
                className="flex items-center justify-between border-b border-border py-4 text-left last:border-0"
              >
                <span>
                  <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {s.duration} · {s.category}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-[15px] font-bold text-navy">
                  £{s.price}
                  <ChevronRight size={15} className="text-muted" />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

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

      {step === 2 && (
        <>
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Staff</p>
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
          <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Time</p>
          <TimeChips value={time} onSelect={setTime} />
          <div className="sticky bottom-0 -mx-6 mt-5 bg-white px-6 pb-1 pt-3">
            <DarkButton disabled={!day || !time} onClick={() => setStep(3)}>
              Review appointment
            </DarkButton>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border">
            {[
              ["Client", client],
              ["Service", service?.name],
              ["Staff", staff],
              ["Day", dowMar(day)],
              ["Time", time],
              ["Duration", service?.duration],
              ["Price", `£${service?.price}`],
            ].map(([k, v], i) => (
              <div key={k as string} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <span className="text-[13px] text-secondary">{k}</span>
                <span className="text-[14px] font-semibold text-navy">{v}</span>
              </div>
            ))}
          </div>
          <div className="pt-5">
            <DarkButton
              onClick={() => {
                useAppStore.getState().addCustomAppt({
                  client: client ?? "Walk-in",
                  service: service?.name ?? "Appointment",
                  staff,
                  day,
                  time,
                });
                setStep(4);
              }}
            >
              Add Appointment
            </DarkButton>
          </div>
        </>
      )}

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
          <p className="pt-5 text-[16px] font-bold text-navy">
            {client} · {service?.name}
          </p>
          <p className="pt-1 text-[13px] text-secondary">
            {dowMar(day)} at {time} with {staff}.
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
