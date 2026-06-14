"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock,
  CreditCard, FileText, Image as ImageIcon, MapPin, MessageSquare, Phone, Play,
  Plus, Repeat, RotateCcw, Search, ShieldCheck, StickyNote, UserRound, Users, X,
  AlertTriangle, Bell, Flag, Tag as TagIcon,
} from "lucide-react";
import {
  Sheet, DarkButton, GhostButton, Avatar, MiniCalendar, TimeChips, StatusPill,
} from "@/components/ui";
import { useAppStore, type ApptStatus } from "@/lib/store/appStore";
import {
  clientNotes, clientRows, contactFor, formTemplates, services,
  serviceCategories, tagPresets,
} from "@/lib/data/product";
import { defaultCategories } from "@/lib/tokens/categories";

// The booking lifecycle reads as a progress timeline — tap a step to move it along.
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
  defaultCategories.find((c) => c.name === (CAT_ALIAS[cat ?? ""] ?? cat))?.color ?? "#080706";

const initialsOf = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

interface BookingNote {
  date: string;
  note: string;
  imgs: number;
  kind: "note" | "alert";
}

type ManageMode = "allergy" | "staffnote" | "patch" | "tag" | "change" | null;

/**
 * Booking page — a full-page takeover opened from any appointment card,
 * agenda row or calendar block via `setApptSheet`. The service is the title,
 * the lifecycle is a tappable progress timeline, a client card carries identity
 * + quick contact + profile edits, and the body is one idea per card
 * (when/where, services, forms, notes). Money + the lifecycle action stay fixed
 * at the bottom. Profile edits (allergy, note, tag, patch test, change client)
 * are made inline and saved back to the client record without leaving.
 */
export function AppointmentSheetHost() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    apptSheet, setApptSheet, apptStatus, setApptStatus, movedTo, setMovedTo,
  } = useAppStore();
  // The route the sheet was opened on. Detours (client profile, messages)
  // navigate without closing — the sheet hides while the path differs and
  // restores, state intact, when the user backs out to where they started.
  const [homePath, setHomePath] = useState<string | null>(null);
  const [view, setView] = useState<"details" | "reschedule" | "cancel" | "note" | "picker">("details");
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [svcOverride, setSvcOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [pick, setPick] = useState<"change" | "add">("add");
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  // Save only shows after an actual edit this session.
  const [dirty, setDirty] = useState(false);
  // Notes & photos attached to this booking (saved to the client record).
  const [bookingNotes, setBookingNotes] = useState<BookingNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [notePhotos, setNotePhotos] = useState(0);
  // Profile edits made from the booking page.
  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<ManageMode>(null);
  const [manageDraft, setManageDraft] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [localAllergies, setLocalAllergies] = useState<string[]>([]);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [patchTest, setPatchTest] = useState<string | null>(null);
  const [clientOverride, setClientOverride] = useState<{ name: string; initials: string } | null>(null);
  // Forms attached to this booking.
  const [formSheet, setFormSheet] = useState(false);
  const [localForms, setLocalForms] = useState<string[]>([]);
  const [reminded, setReminded] = useState<string[]>([]);

  const open = apptSheet !== null;
  useEffect(() => {
    if (open) {
      setHomePath(window.location.pathname);
      setView("details");
      setLocalMoved(null);
      setDay(null);
      setTime(null);
      setLocalStatus(null);
      setSvcOverride(null);
      setExtras([]);
      setPick("add");
      setSvcQuery("");
      setSvcCat("All");
      setDirty(false);
      setBookingNotes([]);
      setNoteDraft("");
      setNotePhotos(0);
      setManageOpen(false);
      setManageMode(null);
      setManageDraft("");
      setClientQuery("");
      setLocalAllergies([]);
      setLocalTags([]);
      setPatchTest(null);
      setClientOverride(null);
      setFormSheet(false);
      setLocalForms([]);
      setReminded([]);
    }
  }, [open]);

  const a = apptSheet;
  const close = () => setApptSheet(null);
  if (!a) return null;
  // Suspended during a detour — keep state, render nothing until back.
  if (homePath && pathname !== homePath) return null;

  const moved = a.live ? movedTo : localMoved;
  const status = a.live
    ? apptStatus === "upcoming" ? "Upcoming"
      : apptStatus === "arrived" ? "Arrived"
      : apptStatus === "in-progress" ? "In progress"
      : "Done"
    : localStatus ?? (a.status === "Confirmed" ? "Upcoming" : a.status ?? "Upcoming");
  const phaseIdx = lifecycle.findIndex((s) => s.label === status);

  // Edited booking: service can be swapped and extras added on the fly.
  const svcName = svcOverride ?? a.service;
  const findSvc = (name: string) => services.find((s) => s.name === name);
  const priceOf = (name: string) => findSvc(name)?.price ?? 0;
  const basePrice = svcOverride ? priceOf(svcOverride) : a.price ?? priceOf(a.service);
  const totalPrice = basePrice + extras.reduce((sum, e) => sum + priceOf(e), 0);

  // Client identity (can be swapped from the booking page).
  const clientName = clientOverride?.name ?? a.client;
  const clientInitials = clientOverride?.initials ?? a.initials;
  const firstName = clientName.split(" ")[0];
  const slug = firstName.toLowerCase();
  const contact = contactFor(clientName);
  const notes = clientNotes[clientName];
  const allergies = [...(notes?.allergies ?? []), ...localAllergies];
  const tags = [...(clientOverride ? [] : a.tags ?? []), ...localTags];

  // Forms on this booking: the seeded consultation form + anything added.
  const forms: { name: string; sub: string; done: boolean }[] = [
    ...(notes?.formNote ? [{ name: "Consultation form", sub: "Not completed yet", done: false }] : []),
    ...localForms.map((name) => ({ name, sub: "Just added · not completed", done: false })),
  ];

  const markStatus = (live: ApptStatus, label: string) => {
    if (a.live) setApptStatus(live);
    setLocalStatus(label);
  };

  // Bottom-bar lifecycle action keyed to the displayed phase (works whether or
  // not the booking is tied to the live Up Next queue).
  const lifeAction =
    status === "Upcoming"
      ? { label: "Check In", icon: <CheckCircle2 size={16} strokeWidth={2} />, run: () => markStatus("arrived", "Arrived") }
      : status === "Arrived"
        ? { label: "Start service", icon: <Play size={15} strokeWidth={2} />, run: () => markStatus("in-progress", "In progress") }
        : status === "In progress"
          ? { label: "Mark done", icon: <Check size={16} strokeWidth={2.5} />, run: () => markStatus("done", "Done") }
          : null;

  const goPay = () => { close(); router.push("/app/checkout"); };

  const headerLabel =
    view === "reschedule" ? "Reschedule"
      : view === "picker" ? (pick === "change" ? "Change service" : "Add a service")
        : view === "note" ? "Add note & photos"
          : "Cancel appointment";

  const openManage = (mode: ManageMode) => { setManageOpen(false); setManageDraft(""); setClientQuery(""); setManageMode(mode); };

  const ServiceRow = ({ name, price, removable }: { name: string; price: number; removable?: boolean }) => (
    <div className="flex items-stretch gap-3.5 rounded-2xl bg-white p-4 shadow-sm">
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

  const SectionHeader = ({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) => (
    <div className="flex items-center justify-between px-1 pb-2.5 pt-6">
      <p className="text-[16px] font-bold text-navy">{title}</p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-sm"
        >
          <Plus size={13} strokeWidth={2.5} />
          {addLabel ?? "Add"}
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
          {/* ── Header: the service, when, and the lifecycle timeline ── */}
          <div className="shrink-0 bg-white px-4 pb-4 pt-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-[20px] font-bold text-navy">{svcName}</span>
                <span className="flex items-center gap-2 pt-0.5 text-[12px] text-muted">
                  {moved ?? `Wed 10 Jun · ${a.time}`}
                  {moved && <StatusPill tone="amber">moved</StatusPill>}
                </span>
              </span>
              <button type="button" aria-label="Close booking" onClick={close} className="-mr-1 -mt-1 p-2 text-navy">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Lifecycle as a tappable progress timeline */}
            {status === "No-show" ? (
              <div className="flex items-center gap-2 pt-4 text-[13px] font-semibold text-danger">
                <AlertTriangle size={15} strokeWidth={2} /> Marked as no-show
              </div>
            ) : (
              <div className="relative pt-5">
                <div className="absolute left-8 right-8 top-[13px] h-[2px] rounded-full bg-canvas" />
                <div
                  className="absolute left-8 top-[13px] h-[2px] rounded-full bg-fg-primary transition-all duration-300"
                  style={{ width: `calc((100% - 4rem) * ${Math.max(0, phaseIdx) / (lifecycle.length - 1)})` }}
                />
                <div className="relative flex justify-between">
                  {lifecycle.map((s, i) => {
                    const done = phaseIdx > i;
                    const active = phaseIdx === i;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => markStatus(s.live, s.label)}
                        className="flex w-16 flex-col items-center gap-1.5"
                      >
                        <span
                          className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 transition-colors ${
                            done || active
                              ? "border-fg-primary bg-fg-primary text-white"
                              : "border-border bg-white text-transparent"
                          }`}
                        >
                          {done ? <Check size={13} strokeWidth={3} /> : <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-border"}`} />}
                        </span>
                        <span className={`text-center text-[10.5px] font-semibold leading-tight ${active || done ? "text-navy" : "text-muted"}`}>
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
            {/* ── Client card: identity, quick contact, profile edits ── */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar size="lg" initials={clientInitials} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold text-navy">{clientName}</span>
                  <span className="block truncate text-[13px] text-muted">{contact.phone}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Call ${firstName}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-navy"
                >
                  <Phone size={16} strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  aria-label={`Message ${firstName}`}
                  onClick={() => router.push(`/app/messages/${slug}`)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-navy"
                >
                  <MessageSquare size={16} strokeWidth={1.9} />
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-secondary">{t}</span>
                  ))}
                </div>
              )}
              {allergies.length > 0 && (
                <p className="flex items-center gap-2 pt-3 text-[12px] font-medium text-navy">
                  <AlertTriangle size={13} strokeWidth={2} className="shrink-0 text-danger" />
                  {allergies.join(" · ")}
                </p>
              )}
              {patchTest && (
                <p className="flex items-center gap-2 pt-2 text-[12px] font-medium text-navy">
                  <ShieldCheck size={13} strokeWidth={2} className="shrink-0 text-success" />
                  Patch test · {patchTest}
                </p>
              )}

              <div className="mt-3.5 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="flex w-full items-center justify-between text-[13px] font-semibold text-navy"
                >
                  <span className="flex items-center gap-2"><UserRound size={15} strokeWidth={1.9} className="text-secondary" /> Manage client</span>
                  <ChevronRight size={16} strokeWidth={2} className="text-muted" />
                </button>
              </div>
            </div>

            {/* ── When and where ── */}
            <div className="mt-3 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="flex items-center gap-3 text-[14px] font-semibold text-navy">
                  <Calendar size={15} strokeWidth={1.8} className="text-secondary" />
                  {moved ?? "Wed 10 Jun"}
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

            {/* ── Reschedule / cancel the appointment ── */}
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              {[
                { icon: <RotateCcw size={16} strokeWidth={1.7} />, label: "Reschedule", run: () => setView("reschedule") },
                { icon: <X size={16} strokeWidth={1.9} />, label: "Cancel", run: () => setView("cancel") },
              ].map((t) => (
                <motion.button
                  key={t.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={t.run}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[13px] font-semibold text-navy shadow-sm"
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

            {/* ── Forms ── */}
            <SectionHeader title="Forms" onAdd={() => setFormSheet(true)} addLabel="Add form" />
            {forms.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {forms.map((f) => {
                  const isReminded = reminded.includes(f.name);
                  return (
                    <div key={f.name} className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                        <FileText size={17} strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-navy">{f.name}</span>
                        <span className="block pt-0.5 text-[12px] text-muted">{f.sub}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setReminded((r) => (r.includes(f.name) ? r : [...r, f.name]))}
                        disabled={isReminded}
                        className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                          isReminded ? "bg-canvas text-muted" : "bg-fg-primary text-white"
                        }`}
                      >
                        {isReminded ? <Check size={12} strokeWidth={2.5} /> : <Bell size={12} strokeWidth={2} />}
                        {isReminded ? "Reminded" : "Remind"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFormSheet(true)}
                className="flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-white/50 py-6 text-center"
              >
                <FileText size={18} strokeWidth={1.5} className="text-muted" />
                <span className="text-[13px] font-semibold text-navy">Attach a form</span>
                <span className="text-[12px] text-muted">Consultation, allergy, patch test &amp; more</span>
              </button>
            )}

            {/* ── Notes & photos ── */}
            <SectionHeader title="Notes &amp; photos" onAdd={() => { setNoteDraft(""); setNotePhotos(0); setView("note"); }} addLabel="Add note" />
            {bookingNotes.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {bookingNotes.map((n, i) => (
                  <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[12px] font-semibold text-navy">
                        {n.kind === "alert"
                          ? <><Flag size={13} strokeWidth={1.9} className="text-danger" /> Staff note</>
                          : <><StickyNote size={13} strokeWidth={1.75} className="text-secondary" /> This visit</>}
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
            ) : (
              <button
                type="button"
                onClick={() => { setNoteDraft(""); setNotePhotos(0); setView("note"); }}
                className="flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-white/50 py-6 text-center"
              >
                <StickyNote size={18} strokeWidth={1.5} className="text-muted" />
                <span className="text-[13px] font-semibold text-navy">Add a note</span>
                <span className="text-[12px] text-muted">Products, formulas, before &amp; after photos</span>
              </button>
            )}
          </div>

          {/* ── Fixed money + actions bar ── */}
          <div className="shrink-0 border-t border-border bg-white px-5 pb-6 pt-3">
            {dirty ? (
              <DarkButton onClick={() => { setDirty(false); close(); }}>Save changes</DarkButton>
            ) : (
              <div className="flex gap-2.5">
                {lifeAction && (
                  <DarkButton className="flex-1" onClick={lifeAction.run}>
                    {lifeAction.icon}
                    {lifeAction.label}
                  </DarkButton>
                )}
                <button
                  type="button"
                  onClick={goPay}
                  className={`flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${
                    lifeAction
                      ? "flex-1 border border-border bg-white text-navy"
                      : "w-full bg-fg-primary text-white"
                  }`}
                >
                  <CreditCard size={16} strokeWidth={1.9} />
                  {totalPrice > 0 ? `Pay £${totalPrice}` : "Pay"}
                </button>
              </div>
            )}
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
            <p className="pl-6 pt-0.5 text-[12px] text-muted">{clientName} · {svcName} · {a.staff}</p>
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
                      className="h-28 w-full resize-none rounded-xl bg-white p-4 text-[14px] text-navy placeholder:text-muted shadow-sm focus:outline-none"
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
                            { date: "Today · 10 Jun 2026", note: noteDraft.trim() || "Photos attached.", imgs: notePhotos, kind: "note" },
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
                          const label = `Sat ${day} Jun, ${time}`;
                          if (a.live) setMovedTo(label);
                          else setLocalMoved(label);
                          setDirty(true);
                          setView("details");
                        }}
                      >
                        {day && time ? `Confirm · Sat ${day} Jun, ${time}` : "Confirm new time"}
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
                        className="h-11 w-full rounded-xl bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted shadow-sm focus:outline-none"
                      />
                    </div>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
                      {serviceCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSvcCat(c)}
                          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                            svcCat === c ? "bg-fg-primary text-white" : "bg-white text-secondary shadow-sm"
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
                      {clientName} · {svcName} · {a.staff} at {a.time}. We&rsquo;ll let them know and free
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

      {/* ── Manage client — profile edits made from the booking ── */}
      <Sheet open={manageOpen} onClose={() => setManageOpen(false)} title={`Manage ${clientName}`} sub="Saved to their client profile">
        <div className="flex flex-col pt-1">
          {[
            { icon: <AlertTriangle size={17} strokeWidth={1.8} />, t: "Add allergy", run: () => openManage("allergy") },
            { icon: <Flag size={17} strokeWidth={1.8} />, t: "Add staff note", run: () => openManage("staffnote") },
            { icon: <ShieldCheck size={17} strokeWidth={1.8} />, t: "Add patch test", run: () => openManage("patch") },
            { icon: <TagIcon size={17} strokeWidth={1.8} />, t: "Add tag", run: () => openManage("tag") },
            { icon: <Users size={17} strokeWidth={1.8} />, t: "Change client", run: () => openManage("change") },
            { icon: <UserRound size={17} strokeWidth={1.8} />, t: "View full profile", run: () => { setManageOpen(false); router.push(`/app/clients/${slug}`); } },
          ].map((q) => (
            <button
              key={q.t}
              type="button"
              onClick={q.run}
              className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left text-[15px] font-medium text-navy last:border-0"
            >
              <span className="text-secondary">{q.icon}</span>
              {q.t}
            </button>
          ))}
        </div>
        <div className="h-2" />
      </Sheet>

      {/* ── Manage sub-forms ── */}
      <Sheet
        open={manageMode === "allergy"}
        onClose={() => setManageMode(null)}
        title="Add an allergy"
        sub="Flagged on every booking and checkout"
      >
        <input
          autoFocus
          value={manageDraft}
          onChange={(e) => setManageDraft(e.target.value)}
          placeholder="e.g. PPD, fragrance, latex..."
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="pt-4">
          <DarkButton
            disabled={!manageDraft.trim()}
            onClick={() => {
              setLocalAllergies((x) => [...x, manageDraft.trim()]);
              setManageMode(null);
            }}
          >
            Add allergy
          </DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

      <Sheet
        open={manageMode === "staffnote"}
        onClose={() => setManageMode(null)}
        title="Add a staff note"
        sub="Private — only your team sees this"
      >
        <textarea
          autoFocus
          value={manageDraft}
          onChange={(e) => setManageDraft(e.target.value)}
          placeholder="e.g. Prefers quieter appointments, always running late..."
          className="h-28 w-full resize-none rounded-xl border border-border bg-white p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="pt-4">
          <DarkButton
            disabled={!manageDraft.trim()}
            onClick={() => {
              setBookingNotes((n) => [{ date: "Today · 10 Jun 2026", note: manageDraft.trim(), imgs: 0, kind: "alert" }, ...n]);
              setManageMode(null);
            }}
          >
            Save note
          </DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

      <Sheet
        open={manageMode === "patch"}
        onClose={() => setManageMode(null)}
        title="Record a patch test"
        sub="Confirms the client is cleared for colour"
      >
        <p className="pb-4 text-[14px] leading-relaxed text-secondary">
          Record that {firstName}&rsquo;s patch test was carried out today. It&rsquo;ll show on this booking and their profile.
        </p>
        <DarkButton onClick={() => { setPatchTest("Recorded today · 10 Jun 2026"); setManageMode(null); }}>
          Mark patch test done
        </DarkButton>
        <div className="h-2" />
      </Sheet>

      <Sheet open={manageMode === "tag"} onClose={() => setManageMode(null)} title="Add a tag">
        <div className="flex flex-wrap gap-2 pt-1">
          {tagPresets.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setLocalTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
                disabled={on && !localTags.includes(t)}
                className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
                  on ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="pt-5">
          <DarkButton onClick={() => setManageMode(null)}>Done</DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

      <Sheet open={manageMode === "change"} onClose={() => setManageMode(null)} title="Change client" sub="Move this booking to another client" full>
        <div className="relative pb-3">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Search clients..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          {clientRows
            .filter((c) => c.name.toLowerCase().includes(clientQuery.toLowerCase()))
            .map((c) => {
              const current = c.name === clientName;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={current}
                  onClick={() => { setClientOverride({ name: c.name, initials: initialsOf(c.name) }); setManageMode(null); }}
                  className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0 disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <Avatar size="sm" initials={initialsOf(c.name)} />
                    <span>
                      <span className="block text-[15px] font-semibold text-navy">{c.name}</span>
                      <span className="block text-[12px] text-muted">{c.meta}</span>
                    </span>
                  </span>
                  {current && <Check size={16} strokeWidth={2.5} className="text-navy" />}
                </button>
              );
            })}
        </div>
      </Sheet>

      {/* ── Add a form ── */}
      <Sheet open={formSheet} onClose={() => setFormSheet(false)} title="Add a form" sub="Sent to the client to complete">
        <div className="flex flex-col pt-1">
          {formTemplates.map((name) => {
            const added = forms.some((f) => f.name === name);
            return (
              <button
                key={name}
                type="button"
                disabled={added}
                onClick={() => { setLocalForms((x) => [...x, name]); setFormSheet(false); }}
                className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left last:border-0 disabled:opacity-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                  <FileText size={16} strokeWidth={1.7} />
                </span>
                <span className="flex-1 text-[15px] font-medium text-navy">{name}</span>
                {added ? <Check size={16} strokeWidth={2.5} className="text-navy" /> : <Plus size={16} strokeWidth={2} className="text-muted" />}
              </button>
            );
          })}
        </div>
        <div className="h-2" />
      </Sheet>
    </motion.div>
  );
}
