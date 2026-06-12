"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Scissors, Banknote, MapPin, MessageSquare, RotateCcw, X,
  AlertTriangle, FileText, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, Play, CreditCard,
  Bell, Check, Pencil, Plus, Search, StickyNote, Camera, Image as ImageIcon,
} from "lucide-react";
import { DarkButton, GhostButton, MiniCalendar, TimeChips, StatusPill } from "@/components/app/ui";
import { useAppStore, type ApptStatus } from "@/lib/store/appStore";
import { clientNotes, services, serviceCategories } from "@/lib/data/product";

const statusChips: { label: string; live?: ApptStatus }[] = [
  { label: "Upcoming", live: "upcoming" },
  { label: "Arrived", live: "arrived" },
  { label: "In progress", live: "in-progress" },
  { label: "Done", live: "done" },
  { label: "No-show" },
];

interface BookingNote {
  date: string;
  note: string;
  imgs: number;
}

/**
 * Appointment details — a full-page takeover (not a bottom sheet), opened
 * from any appointment card, agenda row or calendar block via `setApptSheet`.
 * Bookings are managed here: status, reschedule, edit services, and notes
 * with before/after photos that land on the client's record. When the
 * appointment is the live Up Next one (`live`), its primary action drives
 * the shared lifecycle.
 */
export function AppointmentSheetHost() {
  const router = useRouter();
  const {
    apptSheet, setApptSheet, apptStatus, setApptStatus, movedTo, setMovedTo,
  } = useAppStore();
  const [view, setView] = useState<"details" | "reschedule" | "cancel" | "edit" | "note">("details");
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reminded, setReminded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [svcOverride, setSvcOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  // Edit view: null = booked-services list, otherwise the full-catalogue picker.
  const [pick, setPick] = useState<null | "change" | "add">(null);
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
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
      setPick(null);
      setSvcQuery("");
      setSvcCat("All");
      setStatusOpen(false);
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
  const priceOf = (name: string) => services.find((s) => s.name === name)?.price ?? 0;
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
      : view === "edit" ? (pick === "change" ? "Change service" : pick === "add" ? "Add a service" : "Edit booking")
        : view === "note" ? "Add note & photos"
          : "Cancel appointment";

  return (
    <motion.div
      key="appt-page"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="absolute inset-0 z-[80] flex flex-col bg-fog"
    >
      {/* Full-page header */}
      <div className="shrink-0 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          {view === "details" ? (
            <>
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-bold text-secondary">
                  {a.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[18px] font-bold text-navy">{a.client}</span>
                  <span className="block text-[12px] text-muted">{a.service} · {a.staff}</span>
                </span>
              </span>
              <button type="button" aria-label="Close booking" onClick={close} className="-mr-1 p-2 text-navy">
                <X size={20} strokeWidth={2} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => (view === "edit" && pick ? setPick(null) : setView("details"))}
              className="flex items-center gap-1 py-1 text-navy"
            >
              <ChevronLeft size={20} strokeWidth={2} />
              <span className="text-[17px] font-bold">{headerLabel}</span>
            </button>
          )}
        </div>
        {view !== "details" && (
          <p className="pl-6 pt-0.5 text-[12px] text-muted">{a.client} · {a.service} · {a.staff}</p>
        )}
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
            {view === "details" && (
              <>
                {/* Status: a deliberate dropdown — no accidental taps. */}
                <div className="relative pb-3">
                  <button
                    type="button"
                    onClick={() => setStatusOpen((o) => !o)}
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Status</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${
                          status === "No-show"
                            ? "bg-danger text-white"
                            : status === "In progress"
                              ? "bg-[#14181F] text-white"
                              : status === "Done"
                                ? "bg-[#E8F6EE] text-[#157347]"
                                : "bg-canvas text-navy"
                        }`}
                      >
                        {status}
                      </span>
                      {moved && <StatusPill tone="amber">Moved · {moved}</StatusPill>}
                    </span>
                    <motion.span animate={{ rotate: statusOpen ? 180 : 0 }} className="flex text-muted">
                      <ChevronDown size={15} strokeWidth={1.75} />
                    </motion.span>
                  </button>
                  {statusOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-x-0 top-[50px] z-20 overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_24px_rgba(15,26,46,0.12)]"
                    >
                      {statusChips.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => {
                            if (a.live && c.live) setApptStatus(c.live);
                            setLocalStatus(c.label);
                            setStatusOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] ${
                            status === c.label ? "bg-canvas font-semibold" : ""
                          } ${c.label === "No-show" ? "text-danger" : "text-navy"}`}
                        >
                          {c.label}
                          {status === c.label && <Check size={14} strokeWidth={2.5} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Safety + admin callouts — visible at a glance, never buried */}
                {(notes?.allergies || notes?.formNote) && (
                  <div className="flex flex-col gap-2 pb-3">
                    {notes.allergies && (
                      <div className="flex items-start gap-2.5 rounded-xl bg-[#FEF3C7] px-3.5 py-2.5">
                        <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#B45309]" />
                        <p className="text-[12px] font-medium leading-snug text-[#92400E]">
                          <span className="font-bold">Allergies — </span>
                          {notes.allergies.join(" · ")}
                        </p>
                      </div>
                    )}
                    {notes.formNote && (
                      <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2">
                        <FileText size={14} strokeWidth={1.75} className="shrink-0 text-secondary" />
                        <p className="flex-1 text-[12px] font-medium text-secondary">{notes.formNote}</p>
                        <button
                          type="button"
                          onClick={() => setReminded(true)}
                          disabled={reminded}
                          className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                            reminded ? "bg-canvas text-muted" : "bg-[#14181F] text-white"
                          }`}
                        >
                          {reminded ? <Check size={11} strokeWidth={2.5} /> : <Bell size={11} strokeWidth={2} />}
                          {reminded ? "Sent" : "Remind"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  {[
                    { icon: <Clock size={15} strokeWidth={1.75} />, main: moved ?? `Today · ${a.time}`, sub: a.duration },
                    {
                      icon: <Scissors size={15} strokeWidth={1.75} />,
                      main: extras.length > 0 ? `${svcName} + ${extras.length} more` : svcName,
                      sub: `with ${a.staff}`,
                    },
                    ...(totalPrice > 0 ? [{ icon: <Banknote size={15} strokeWidth={1.75} />, main: `£${totalPrice}`, sub: "Pay at checkout" }] : []),
                    { icon: <MapPin size={15} strokeWidth={1.75} />, main: "Salon Soho", sub: "Main floor" },
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                      <span className="text-secondary">{row.icon}</span>
                      <span className="flex-1 text-[14px] font-semibold text-navy">{row.main}</span>
                      <span className="text-[12px] text-muted">{row.sub}</span>
                    </div>
                  ))}
                </div>

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

                {/* Notes & photos from this visit — lands on the client's record */}
                <div className="flex items-center justify-between pb-2 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Notes & photos</p>
                  <button
                    type="button"
                    onClick={() => { setNoteDraft(""); setNotePhotos(0); setView("note"); }}
                    className="flex items-center gap-1 rounded-full bg-[#14181F] px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    Add
                  </button>
                </div>
                {bookingNotes.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => { setNoteDraft(""); setNotePhotos(0); setView("note"); }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[13px] font-medium text-secondary"
                  >
                    <StickyNote size={14} strokeWidth={1.75} />
                    Add formulas, observations or before/after photos
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
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
                            <span className="flex h-16 items-center px-1 text-[11px] text-muted">Before / after</span>
                          </div>
                        )}
                        <p className="pt-2 text-[11px] text-muted">Saved to {firstName}&rsquo;s record</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setView("edit")}
                  className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-[14px] font-semibold text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                >
                  <span className="flex items-center gap-2.5">
                    <Pencil size={14} strokeWidth={1.75} className="text-secondary" />
                    Edit booking
                  </span>
                  <ChevronRight size={15} className="text-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => { close(); router.push(`/app/clients/${slug}`); }}
                  className="mt-2.5 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-[14px] font-semibold text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                >
                  View client profile
                  <ChevronRight size={15} className="text-muted" />
                </button>

                {liveAction && (
                  <div className="pt-4">
                    <DarkButton
                      onClick={() => {
                        liveAction.run();
                        if (liveAction.label !== "Checkout") close();
                      }}
                    >
                      {liveAction.icon}
                      {liveAction.label}
                    </DarkButton>
                  </div>
                )}
              </>
            )}

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
                      setView("details");
                    }}
                  >
                    {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
                  </DarkButton>
                </div>
              </>
            )}

            {view === "edit" && pick === null && (
              <>
                <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Booked services</p>
                <div className="overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">
                      <Scissors size={15} strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-navy">{svcName}</span>
                      <span className="block text-[12px] text-muted">
                        {services.find((s) => s.name === svcName)?.duration ?? a.duration} · £{basePrice}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSvcQuery(""); setSvcCat("All"); setPick("change"); }}
                      className="shrink-0 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-semibold text-navy"
                    >
                      Change
                    </button>
                  </div>
                  {extras.map((e) => (
                    <div key={e} className="flex items-center gap-3 border-t border-border px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">
                        <Plus size={15} strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-navy">{e}</span>
                        <span className="block text-[12px] text-muted">
                          {services.find((s) => s.name === e)?.duration} · £{priceOf(e)} · added
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${e}`}
                        onClick={() => setExtras((x) => x.filter((y) => y !== e))}
                        className="p-1.5 text-muted"
                      >
                        <X size={15} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => { setSvcQuery(""); setSvcCat("All"); setPick("add"); }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-[14px] font-semibold text-navy"
                >
                  <Plus size={15} strokeWidth={2} />
                  Add another service
                </button>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <span className="text-[13px] text-secondary">
                    {1 + extras.length} service{extras.length > 0 ? "s" : ""}
                  </span>
                  <span className="text-[15px] font-bold text-navy">£{totalPrice}</span>
                </div>
                <div className="pt-4">
                  <DarkButton onClick={() => setView("details")}>Save changes</DarkButton>
                </div>
              </>
            )}

            {view === "edit" && pick !== null && (
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
                            setPick(null);
                          }}
                          className="flex items-center justify-between border-b border-border py-4 text-left last:border-0 disabled:opacity-40"
                        >
                          <span>
                            <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
                            <span className="mt-0.5 block text-[12px] text-muted">
                              {s.duration} · {s.category}
                              {alreadyAdded ? " · already on this booking" : ""}
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
                  {a.client} · {a.service} · {a.staff} at {a.time}. We&rsquo;ll let them know and free
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
    </motion.div>
  );
}
