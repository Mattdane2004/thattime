"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock,
  CreditCard, EyeOff, FileText, MapPin, MessageSquare, Play, Plus, Repeat,
  RotateCcw, Search, StickyNote, UserRound, X, AlertTriangle, Bell, Camera,
  Image as ImageIcon,
} from "lucide-react";
import { Sheet, DarkButton, MiniCalendar, TimeChips, StatusPill, GhostButton } from "@/components/app/ui";
import { useAppStore, type ApptStatus } from "@/lib/store/appStore";
import { clientNotes, services, serviceCategories } from "@/lib/data/product";
import { defaultCategories } from "@/lib/tokens/categories";

// The booking lifecycle reads as a row of steps — tap to move it along.
const lifecycle: { label: string; live: ApptStatus }[] = [
  { label: "Upcoming", live: "upcoming" },
  { label: "Arrived", live: "arrived" },
  { label: "In progress", live: "in-progress" },
  { label: "Done", live: "done" },
];

// Category colour for the service accent bar. Aliases bridge the legacy
// category names until offers.ts becomes the single catalogue (PR #3).
const CAT_ALIAS: Record<string, string> = { Cuts: "Hair", Styling: "Hair", Barber: "Barbering" };
const catColor = (cat?: string) =>
  defaultCategories.find((c) => c.name === (CAT_ALIAS[cat ?? ""] ?? cat))?.color ?? "#14181F";

interface BookingNote {
  date: string;
  note: string;
  imgs: number;
}

/**
 * Booking page — a full-page takeover opened from any appointment card,
 * agenda row or calendar block via `setApptSheet`. Identity and safety sit
 * in the header, the lifecycle is a tappable step row, the body is one idea
 * per card (when/where, actions, services, forms, notes), and money plus
 * quick actions stay fixed at the bottom. Save only appears once something
 * was actually changed.
 */
export function AppointmentSheetHost() {
  const router = useRouter();
  const {
    apptSheet, setApptSheet, apptStatus, setApptStatus, movedTo, setMovedTo,
  } = useAppStore();
  const [view, setView] = useState<"details" | "reschedule" | "cancel" | "note" | "picker">("details");
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reminded, setReminded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [svcOverride, setSvcOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [pick, setPick] = useState<"change" | "add">("add");
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  const [actionsSheet, setActionsSheet] = useState(false);
  // Save only shows after an actual edit this session.
  const [dirty, setDirty] = useState(false);
  // Notes & photos attached to this booking (saved to the client record).
  const [bookingNotes, setBookingNotes] = useState<BookingNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [notePhotos, setNotePhotos] = useState(0);

  const open = apptSheet !== null;
  useEffect(() => {
    if (open) {
      setView("details");
      setLocalMoved(null);
      setDay(null);
      setTime(null);
      setReminded(false);
      setLocalStatus(null);
      setSvcOverride(null);
      setExtras([]);
      setPick("add");
      setSvcQuery("");
      setSvcCat("All");
      setActionsSheet(false);
      setDirty(false);
      setBookingNotes([]);
      setNoteDraft("");
      setNotePhotos(0);
    }
  }, [open]);

  const a = apptSheet;
  const close = () => setApptSheet(null);
  if (!a) return null;

  const moved = a.live ? movedTo : localMoved;
  const status = a.live
    ? apptStatus === "upcoming" ? "Upcoming"
      : apptStatus === "arrived" ? "Arrived"
      : apptStatus === "in-progress" ? "In progress"
      : "Done"
    : localStatus ?? (a.status === "Confirmed" ? "Upcoming" : a.status ?? "Upcoming");

  // Edited booking: service can be swapped and extras added on the fly.
  const svcName = svcOverride ?? a.service;
  const findSvc = (name: string) => services.find((s) => s.name === name);
  const priceOf = (name: string) => findSvc(name)?.price ?? 0;
  const basePrice = svcOverride ? priceOf(svcOverride) : a.price ?? priceOf(a.service);
  const totalPrice = basePrice + extras.reduce((sum, e) => sum + priceOf(e), 0);

  const firstName = a.client.split(" ")[0];
  const slug = firstName.toLowerCase();
  const notes = clientNotes[a.client];

  const liveAction =
    a.live && apptStatus === "upcoming"
      ? { label: "Check In", icon: <CheckCircle2 size={15} />, run: () => setApptStatus("arrived") }
      : a.live && apptStatus === "arrived"
        ? { label: "Start service", icon: <Play size={14} />, run: () => setApptStatus("in-progress") }
        : a.live && apptStatus === "in-progress"
          ? { label: "Checkout", icon: <CreditCard size={15} />, run: () => { close(); router.push("/app/checkout"); } }
          : null;

  const headerLabel =
    view === "reschedule" ? "Reschedule"
      : view === "picker" ? (pick === "change" ? "Change service" : "Add a service")
        : view === "note" ? "Add note & photos"
          : "Cancel appointment";

  const ServiceRow = ({ name, price, removable }: { name: string; price: number; removable?: boolean }) => (
    <div className="flex items-stretch gap-3.5 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
      <span className="w-1 shrink-0 rounded-full" style={{ background: catColor(findSvc(name)?.category) }} />
      <button
        type="button"
        onClick={() => { setSvcQuery(""); setSvcCat("All"); setPick("change"); setView("picker"); }}
        className="min-w-0 flex-1 text-left"
        disabled={removable}
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-semibold text-navy">{name}</span>
          <span className="shrink-0 text-[15px] font-semibold text-navy">£{price}</span>
        </span>
        <span className="block pt-0.5 text-[12px] text-muted">
          {a.time} · {findSvc(name)?.duration ?? a.duration} · {a.staff}
        </span>
      </button>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={() => { setExtras((x) => x.filter((y) => y !== name)); setDirty(true); }}
          className="self-center p-1 text-muted"
        >
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      key="appt-page"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="absolute inset-0 z-[80] flex flex-col bg-fog"
    >
      {view === "details" ? (
        <>
          {/* ── Header: who, when, and where the booking stands ── */}
          <div className="shrink-0 bg-white px-4 pb-4 pt-4">
            <div className="flex items-start justify-between">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-canvas text-[14px] font-bold text-secondary">
                  {a.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[18px] font-bold text-navy">{a.client}</span>
                  <span className="block pt-0.5 text-[12px] text-muted">
                    {moved ?? `Wed 4 Mar · ${a.time}`}
                    {moved && <StatusPill tone="amber"> moved</StatusPill>}
                  </span>
                </span>
              </span>
              <button type="button" aria-label="Close booking" onClick={close} className="-mr-1 p-2 text-navy">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            {notes?.allergies && (
              <p className="flex items-center gap-2 pt-3 text-[12px] font-medium text-navy">
                <AlertTriangle size={13} strokeWidth={2} className="shrink-0 text-danger" />
                {notes.allergies.join(" · ")}
              </p>
            )}
            {/* Lifecycle as a tappable step row — no dropdowns, no sheets */}
            <div className="flex gap-1.5 pt-3.5">
              {lifecycle.map((s) => {
                const active = status === s.label;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      if (a.live) setApptStatus(s.live);
                      setLocalStatus(s.label);
                    }}
                    className={`flex-1 rounded-full py-2 text-[11px] font-semibold transition-colors ${
                      active ? "bg-[#14181F] text-white" : "bg-canvas text-secondary"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
              {status === "No-show" && (
                <span className="flex flex-1 items-center justify-center rounded-full bg-danger py-2 text-[11px] font-semibold text-white">
                  No-show
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
            {/* ── When and where ── */}
            <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="flex items-center gap-3 text-[14px] font-semibold text-navy">
                  <Calendar size={15} strokeWidth={1.8} className="text-secondary" />
                  {moved ?? "Wed 4 Mar"}
                </span>
                <span className="flex items-center gap-2.5 text-[14px] font-semibold text-navy">
                  <Clock size={15} strokeWidth={1.8} className="text-secondary" />
                  {a.time}
                </span>
              </div>
              <div className="mx-4 border-t border-border" />
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="flex items-center gap-3 text-[14px] text-navy">
                  <Repeat size={15} strokeWidth={1.8} className="text-secondary" />
                  Doesn&rsquo;t repeat
                </span>
                <span className="flex items-center gap-2.5 text-[14px] text-navy">
                  <MapPin size={15} strokeWidth={1.8} className="text-secondary" />
                  Salon Soho
                </span>
              </div>
            </div>

            {/* ── The three things you reach for most ── */}
            <div className="grid grid-cols-3 gap-2.5 pt-3">
              {[
                {
                  icon: <MessageSquare size={17} strokeWidth={1.7} />, label: "Message",
                  run: () => { close(); router.push(`/app/messages/${slug}`); },
                },
                { icon: <RotateCcw size={17} strokeWidth={1.7} />, label: "Reschedule", run: () => setView("reschedule") },
                { icon: <X size={17} strokeWidth={1.7} />, label: "Cancel", run: () => setView("cancel") },
              ].map((t) => (
                <motion.button
                  key={t.label}
                  whileTap={{ scale: 0.96 }}
                  onClick={t.run}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-[12px] font-medium text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                >
                  {t.icon}
                  {t.label}
                </motion.button>
              ))}
            </div>

            {/* ── Services ── */}
            <p className="px-1 pb-2.5 pt-6 text-[16px] font-bold text-navy">Services</p>
            <div className="flex flex-col gap-2.5">
              <ServiceRow name={svcName} price={basePrice} />
              {extras.map((e) => (
                <ServiceRow key={e} name={e} price={priceOf(e)} removable />
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setSvcQuery(""); setSvcCat("All"); setPick("add"); setView("picker"); }}
              className="mt-3 flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-[13px] font-semibold text-navy"
            >
              <Plus size={14} strokeWidth={2} />
              Add service
            </button>

            {/* ── Forms attached to this visit ── */}
            {notes?.formNote && (
              <>
                <p className="px-1 pb-2.5 pt-6 text-[16px] font-bold text-navy">Forms</p>
                <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <FileText size={17} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">Consultation form</span>
                    <span className="block pt-0.5 text-[12px] text-muted">Not completed yet</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReminded(true)}
                    disabled={reminded}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                      reminded ? "bg-canvas text-muted" : "bg-[#14181F] text-white"
                    }`}
                  >
                    {reminded ? <Check size={12} strokeWidth={2.5} /> : <Bell size={12} strokeWidth={2} />}
                    {reminded ? "Reminded" : "Remind"}
                  </button>
                </div>
              </>
            )}

            {/* ── Notes & photos saved on this booking ── */}
            {bookingNotes.length > 0 && (
              <>
                <p className="px-1 pb-2.5 pt-6 text-[16px] font-bold text-navy">Notes & photos</p>
                <div className="flex flex-col gap-2.5">
                  {bookingNotes.map((n, i) => (
                    <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] font-semibold text-navy">
                          <StickyNote size={13} strokeWidth={1.75} className="text-secondary" />
                          This visit
                        </span>
                        <span className="text-[11px] text-muted">{n.date}</span>
                      </div>
                      <p className="pt-2 text-[13px] leading-snug text-navy">{n.note}</p>
                      {n.imgs > 0 && (
                        <div className="flex gap-2 pt-3">
                          {Array.from({ length: n.imgs }, (_, j) => (
                            <span key={j} className="flex h-16 w-16 items-center justify-center rounded-xl bg-canvas text-muted">
                              <ImageIcon size={18} strokeWidth={1.5} />
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="pt-2 text-[11px] text-muted">Saved to {firstName}&rsquo;s record</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Fixed money + actions bar ── */}
          <div className="shrink-0 border-t border-border bg-white px-5 pb-6 pt-3">
            {totalPrice > 0 && (
              <button
                type="button"
                onClick={() => { close(); router.push("/app/checkout"); }}
                className="flex w-full items-baseline justify-between"
              >
                <span className="flex items-center gap-1 text-[14px] font-bold text-navy">
                  To pay
                  <ChevronRight size={13} strokeWidth={2.5} className="text-muted" />
                </span>
                <span className="text-[16px] font-bold text-navy">£{totalPrice}</span>
              </button>
            )}
            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                aria-label="Quick actions"
                onClick={() => setActionsSheet(true)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-navy"
              >
                <span className="flex flex-col gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-[3px] w-[3px] rounded-full bg-navy" />
                  ))}
                </span>
              </button>
              {dirty ? (
                <DarkButton className="flex-1" onClick={() => { setDirty(false); close(); }}>
                  Save changes
                </DarkButton>
              ) : liveAction ? (
                <DarkButton
                  className="flex-1"
                  onClick={() => {
                    liveAction.run();
                    if (liveAction.label !== "Checkout") close();
                  }}
                >
                  {liveAction.icon}
                  {liveAction.label}
                </DarkButton>
              ) : (
                <DarkButton className="flex-1" onClick={close}>Done</DarkButton>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── Sub-view header ── */}
          <div className="shrink-0 bg-white px-4 pb-3 pt-4">
            <button
              type="button"
              onClick={() => setView("details")}
              className="flex items-center gap-1 py-1 text-navy"
            >
              <ChevronLeft size={20} strokeWidth={2} />
              <span className="text-[17px] font-bold">{headerLabel}</span>
            </button>
            <p className="pl-6 pt-0.5 text-[12px] text-muted">{a.client} · {svcName} · {a.staff}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
              >
                {view === "note" && (
                  <>
                    <textarea
                      autoFocus
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Products used, formulas, observations, follow-up needed..."
                      className="h-28 w-full resize-none rounded-xl bg-white p-4 text-[14px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNotePhotos((p) => p + 1)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-[13px] font-medium text-secondary"
                    >
                      <Camera size={15} strokeWidth={1.75} />
                      {notePhotos > 0 ? `${notePhotos} photo${notePhotos > 1 ? "s" : ""} attached · add another` : "Add before / after photos"}
                    </button>
                    <p className="pt-3 text-[12px] leading-snug text-muted">
                      Saved against this booking and added to {firstName}&rsquo;s record — the team sees it on every future visit.
                    </p>
                    <div className="pt-5">
                      <DarkButton
                        disabled={!noteDraft.trim() && notePhotos === 0}
                        onClick={() => {
                          setBookingNotes((n) => [
                            { date: "Today · 4 Mar 2026", note: noteDraft.trim() || "Photos attached.", imgs: notePhotos },
                            ...n,
                          ]);
                          setView("details");
                        }}
                      >
                        Save to record
                      </DarkButton>
                    </div>
                  </>
                )}

                {view === "reschedule" && (
                  <>
                    <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
                    <MiniCalendar selected={day} onSelect={setDay} />
                    <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
                    <TimeChips value={time} onSelect={setTime} />
                    <div className="pt-6">
                      <DarkButton
                        disabled={!day || !time}
                        onClick={() => {
                          const label = `Sat ${day} Mar, ${time}`;
                          if (a.live) setMovedTo(label);
                          else setLocalMoved(label);
                          setDirty(true);
                          setView("details");
                        }}
                      >
                        {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
                      </DarkButton>
                    </div>
                  </>
                )}

                {view === "picker" && (
                  <>
                    <div className="relative pb-3">
                      <Search size={15} strokeWidth={1.75} className="absolute left-4 top-[22px] -translate-y-1/2 text-muted" />
                      <input
                        autoFocus
                        value={svcQuery}
                        onChange={(e) => setSvcQuery(e.target.value)}
                        placeholder="Search your services..."
                        className="h-11 w-full rounded-xl bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)] focus:outline-none"
                      />
                    </div>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
                      {serviceCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSvcCat(c)}
                          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                            svcCat === c ? "bg-[#14181F] text-white" : "bg-white text-secondary shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {services
                        .filter((s) => svcCat === "All" || s.category === svcCat)
                        .filter((s) => s.name.toLowerCase().includes(svcQuery.toLowerCase()))
                        .map((s) => {
                          const isCurrent = pick === "change" && s.name === svcName;
                          const alreadyAdded = pick === "add" && (extras.includes(s.name) || s.name === svcName);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => {
                                if (pick === "change") {
                                  setSvcOverride(s.name);
                                  setExtras((x) => x.filter((e) => e !== s.name));
                                } else {
                                  setExtras((x) => [...x, s.name]);
                                }
                                setDirty(true);
                                setView("details");
                              }}
                              className="flex items-center justify-between border-b border-border py-4 text-left last:border-0 disabled:opacity-40"
                            >
                              <span className="flex items-center gap-3">
                                <span className="h-8 w-1 rounded-full" style={{ background: catColor(s.category) }} />
                                <span>
                                  <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
                                  <span className="mt-0.5 block text-[12px] text-muted">
                                    {s.duration}
                                    {alreadyAdded ? " · already on this booking" : ""}
                                  </span>
                                </span>
                              </span>
                              <span className="flex items-center gap-2 text-[15px] font-bold text-navy">
                                £{s.price}
                                {isCurrent ? <Check size={15} strokeWidth={2.5} /> : <ChevronRight size={15} className="text-muted" />}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </>
                )}

                {view === "cancel" && (
                  <>
                    <p className="pb-5 text-[14px] leading-relaxed text-secondary">
                      {a.client} · {svcName} · {a.staff} at {a.time}. We&rsquo;ll let them know and free
                      up the slot.
                    </p>
                    <DarkButton
                      onClick={() => {
                        if (a.live) setApptStatus("cancelled");
                        close();
                      }}
                    >
                      Cancel appointment
                    </DarkButton>
                    <div className="pt-3">
                      <GhostButton onClick={() => setView("details")}>Keep it</GhostButton>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ── Quick actions ── */}
      <Sheet open={actionsSheet} onClose={() => setActionsSheet(false)} title="Quick actions">
        <div className="flex flex-col pt-1">
          {[
            { icon: <StickyNote size={17} strokeWidth={1.8} />, t: "Add note & photos", run: () => { setNoteDraft(""); setNotePhotos(0); setView("note"); } },
            { icon: <UserRound size={17} strokeWidth={1.8} />, t: "View client profile", run: () => { close(); router.push(`/app/clients/${slug}`); } },
            { icon: <EyeOff size={16} strokeWidth={1.8} />, t: "Mark as no-show", run: () => setLocalStatus("No-show") },
          ].map((q) => (
            <button
              key={q.t}
              type="button"
              onClick={() => { setActionsSheet(false); q.run(); }}
              className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left text-[15px] font-medium text-navy"
            >
              <span className="text-secondary">{q.icon}</span>
              {q.t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setActionsSheet(false); setView("cancel"); }}
            className="flex w-full items-center gap-3.5 py-3.5 text-left text-[15px] font-medium text-danger"
          >
            <X size={17} strokeWidth={2} />
            Cancel appointment
          </button>
        </div>
        <div className="h-2" />
      </Sheet>
    </motion.div>
  );
}
