"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera, Check, CheckCircle2, ChevronRight, Clock, CreditCard,
  FileText, Image as ImageIcon, MapPin, MessageSquare, Phone, Play, Plus,
  RotateCcw, Search, ShieldCheck, StickyNote, UserRound, Users, X,
  AlertTriangle, Bell, Flag, Tag as TagIcon, Pencil, Scale, MoreVertical,
  Share2, Download, ReceiptText, CalendarClock, Home, Smartphone,
} from "lucide-react";
import {
  Sheet, DarkButton, GhostButton, Avatar, MiniCalendar, TimeChips, StatusPill,
} from "@/components/ui";
import { useAppStore, type ApptStatus } from "@/lib/store/appStore";
import {
  clientNotes, clientRows, contactFor, disputedClients, formCategories, formTemplates, services,
  serviceCategories, staffMembers, tagPresets,
} from "@/lib/data/product";
import {
  appointmentActivity, appointmentTypes, discountCodes, waitlistCandidates,
  type AppointmentActivityEvent,
} from "@/lib/data/finalisation";
import { defaultCategories } from "@/lib/tokens/categories";

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
type BookingTab = "Booking" | "Activity";
type PolicyMode = "enforce" | "waive" | "custom";
type RefundChoice = "full" | "deposit" | "custom";

/**
 * Booking page — a full-page takeover opened from any appointment card,
 * agenda row or calendar block via `setApptSheet`. The service is the title,
 * the lifecycle is a tappable progress timeline, a client card carries identity
 * + quick contact + profile edits, and the body is one idea per card
 * (when/where, services, forms, notes). Money + the lifecycle action stay fixed
 * at the bottom. Every sub-flow (change/add service, reschedule, cancel, note,
 * form, manage client) is a frame-scoped bottom sheet over the details page.
 */
export function AppointmentSheetHost() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    apptSheet, setApptSheet, apptStatus, setApptStatus, movedTo, setMovedTo,
    lateBy: storeLateBy, setLateBy: setStoreLateBy,
    readySent: storeReadySent, setReadySent: setStoreReadySent,
  } = useAppStore();
  // The route the sheet was opened on. Detours (client profile, messages)
  // navigate without closing — the sheet hides while the path differs and
  // restores, state intact, when the user backs out to where they started.
  const [homePath, setHomePath] = useState<string | null>(null);
  const [localMoved, setLocalMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [svcOverride, setSvcOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  // Running late / I'm ready — store-backed for live bookings, local otherwise.
  const [localLateBy, setLocalLateBy] = useState<number | null>(null);
  const [localReadySent, setLocalReadySent] = useState(false);
  const [latePicker, setLatePicker] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  // Edit the booked service's price / duration on the fly.
  const [priceOverride, setPriceOverride] = useState<number | null>(null);
  const [durationOverride, setDurationOverride] = useState<string | null>(null);
  const [editSvcOpen, setEditSvcOpen] = useState(false);
  const [editPriceDraft, setEditPriceDraft] = useState("");
  const [editDurationDraft, setEditDurationDraft] = useState("");
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
  const [tagQuery, setTagQuery] = useState("");
  const [localAllergies, setLocalAllergies] = useState<string[]>([]);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [patchTest, setPatchTest] = useState<string | null>(null);
  const [clientOverride, setClientOverride] = useState<{ name: string; initials: string } | null>(null);
  // Forms attached to this booking.
  const [localForms, setLocalForms] = useState<string[]>([]);
  const [reminded, setReminded] = useState<string[]>([]);
  // Bottom sheets.
  const [serviceSheet, setServiceSheet] = useState<null | "add" | "change">(null);
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  const [rescheduleSheet, setRescheduleSheet] = useState(false);
  const [cancelSheet, setCancelSheet] = useState(false);
  const [noteSheet, setNoteSheet] = useState(false);
  const [formSheet, setFormSheet] = useState(false);
  const [formQuery, setFormQuery] = useState("");
  const [formCat, setFormCat] = useState("All");
  const [tab, setTab] = useState<BookingTab>("Booking");
  const [apptType, setApptType] = useState<"salon" | "mobile" | "online">("salon");
  const [staffOverride, setStaffOverride] = useState<string | null>(null);
  const [locationOverride, setLocationOverride] = useState("Salon Soho");
  const [discountCodeId, setDiscountCodeId] = useState<string | null>(null);
  const [lineDiscounts, setLineDiscounts] = useState<Record<string, string>>({});
  const [pendingExtras, setPendingExtras] = useState<string[]>([]);
  const [activity, setActivity] = useState<AppointmentActivityEvent[]>(appointmentActivity);
  const [sharedForms, setSharedForms] = useState<string[]>([]);
  const [downloadedForms, setDownloadedForms] = useState<string[]>([]);
  const [policyMode, setPolicyMode] = useState<PolicyMode>("enforce");
  const [refundChoice, setRefundChoice] = useState<RefundChoice>("deposit");
  const [customRefund, setCustomRefund] = useState("");
  const [waitlistOffered, setWaitlistOffered] = useState<string | null>(null);
  const [notifyMove, setNotifyMove] = useState(false);

  const open = apptSheet !== null;
  useEffect(() => {
    if (open) {
      setHomePath(window.location.pathname);
      setLocalMoved(null);
      setDay(null);
      setTime(null);
      setLocalStatus(null);
      setSvcOverride(null);
      setExtras([]);
      setLocalLateBy(null);
      setLocalReadySent(false);
      setLatePicker(false);
      setActionsOpen(false);
      setPriceOverride(null);
      setDurationOverride(null);
      setEditSvcOpen(false);
      setEditPriceDraft("");
      setEditDurationDraft("");
      setDirty(false);
      setBookingNotes([]);
      setNoteDraft("");
      setNotePhotos(0);
      setManageOpen(false);
      setManageMode(null);
      setManageDraft("");
      setClientQuery("");
      setTagQuery("");
      setLocalAllergies([]);
      setLocalTags([]);
      setPatchTest(null);
      setClientOverride(null);
      setLocalForms([]);
      setReminded([]);
      setServiceSheet(null);
      setSvcQuery("");
      setSvcCat("All");
      setRescheduleSheet(false);
      setCancelSheet(false);
      setNoteSheet(false);
      setFormSheet(false);
      setFormQuery("");
      setFormCat("All");
      setTab("Booking");
      setApptType("salon");
      setStaffOverride(null);
      setLocationOverride("Salon Soho");
      setDiscountCodeId(null);
      setLineDiscounts({});
      setPendingExtras([]);
      setActivity(appointmentActivity);
      setSharedForms([]);
      setDownloadedForms([]);
      setPolicyMode("enforce");
      setRefundChoice("deposit");
      setCustomRefund("");
      setWaitlistOffered(null);
      setNotifyMove(false);
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

  // Edited booking: service can be swapped and extras added on the fly.
  const svcName = svcOverride ?? a.service;
  const findSvc = (name: string) => services.find((s) => s.name === name);
  const priceOf = (name: string) => findSvc(name)?.price ?? 0;
  const basePrice = priceOverride ?? (svcOverride ? priceOf(svcOverride) : a.price ?? priceOf(a.service));
  const baseDuration = durationOverride ?? findSvc(svcName)?.duration ?? a.duration;
  const selectedCode = discountCodes.find((c) => c.id === discountCodeId);
  const discountFor = (name: string, price: number) => {
    const manual = Math.min(parseFloat(lineDiscounts[name] || "0") || 0, price);
    const code = selectedCode
      ? selectedCode.type === "percent"
        ? (price * selectedCode.value) / 100
        : Math.min(selectedCode.value, price)
      : 0;
    return Math.round(Math.min(price, Math.max(manual, code)) * 100) / 100;
  };
  const finalPriceOf = (name: string, price: number) => Math.max(0, Math.round((price - discountFor(name, price)) * 100) / 100);
  const baseFinalPrice = finalPriceOf(svcName, basePrice);
  const extrasTotal = extras.reduce((sum, e) => sum + finalPriceOf(e, priceOf(e)), 0);
  const originalTotal = basePrice + extras.reduce((sum, e) => sum + priceOf(e), 0);
  const totalPrice = baseFinalPrice + extrasTotal;
  const totalDiscount = Math.max(0, originalTotal - totalPrice);

  // Client identity (can be swapped from the booking page).
  const clientName = clientOverride?.name ?? a.client;
  const clientInitials = clientOverride?.initials ?? a.initials;
  const firstName = clientName.split(" ")[0];

  // Active payment dispute on this booking (prototype: keyed by client name).
  const disputed = disputedClients.includes(clientName);

  // Running late / I'm ready — store-backed when tied to the live Up Next queue.
  const lateBy = a.live ? storeLateBy : localLateBy;
  const setLateBy = a.live ? setStoreLateBy : setLocalLateBy;
  const readySent = a.live ? storeReadySent : localReadySent;
  const setReadySent = a.live ? setStoreReadySent : setLocalReadySent;
  const lateClients = lateBy ? lateBy / 5 : 0;
  const showSignals = status === "Upcoming" || status === "Arrived";
  const slug = firstName.toLowerCase();
  const contact = contactFor(clientName);
  const notes = clientNotes[clientName];
  const allergies = [...(notes?.allergies ?? []), ...localAllergies];
  const tags = [...(clientOverride ? [] : a.tags ?? []), ...localTags];
  const staffName = staffOverride ?? a.staff;
  const depositPaid = a.deposit ?? 0;
  const paymentLabel =
    totalPrice <= 0 ? "Paid by subscription"
    : depositPaid > 0 ? `Deposit paid · £${depositPaid} / £${totalPrice}`
    : status === "Done" ? "Paid in full"
    : "Unpaid";
  const typeMeta = appointmentTypes.find((t) => t.id === apptType) ?? appointmentTypes[0];
  const typeIcon = apptType === "online" ? <Camera size={13} strokeWidth={1.9} /> : apptType === "mobile" ? <Smartphone size={13} strokeWidth={1.9} /> : <Home size={13} strokeWidth={1.9} />;

  const logEvent = (title: string, body: string, kind: AppointmentActivityEvent["kind"]) => {
    setActivity((events) => [
      { id: `local-${events.length + 1}`, time: "Now", title, body, kind },
      ...events,
    ]);
  };

  // Forms on this booking: the seeded consultation form + anything added.
  const forms: { name: string; sub: string }[] = [
    ...(notes?.formNote ? [{ name: "Consultation form", sub: "Not completed yet" }] : []),
    ...localForms.map((name) => ({ name, sub: "Just added · not completed" })),
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

  const goPay = () => { close(); useAppStore.getState().startAppointmentCheckout(); router.push("/app/checkout"); };

  const openService = (mode: "add" | "change") => {
    setSvcQuery("");
    setSvcCat("All");
    setPendingExtras([]);
    setServiceSheet(mode);
  };
  const openManage = (mode: ManageMode) => { setManageOpen(false); setManageDraft(""); setClientQuery(""); setTagQuery(""); setManageMode(mode); };

  // Tag picker: presets plus any already on the booking, searchable.
  const tagOptions = Array.from(new Set([...tagPresets, ...tags]));
  const tagMatches = tagOptions.filter((t) => t.toLowerCase().includes(tagQuery.trim().toLowerCase()));
  const canCreateTag = tagQuery.trim().length > 0 && !tagOptions.some((t) => t.toLowerCase() === tagQuery.trim().toLowerCase());
  const toggleTag = (t: string) => {
    if (tags.includes(t) && !localTags.includes(t)) return; // original tag, can't remove
    setLocalTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  };

  const ServiceRow = ({ name, price, removable, durationLabel, onEdit }: { name: string; price: number; removable?: boolean; durationLabel?: string; onEdit?: () => void }) => (
    <div className="flex items-stretch gap-3.5 rounded-2xl bg-white p-4 shadow-sm">
      <span className="w-1 shrink-0 rounded-full" style={{ background: catColor(findSvc(name)?.category) }} />
      <button
        type="button"
        onClick={() => openService("change")}
        className="min-w-0 flex-1 text-left"
        disabled={removable}
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-semibold text-navy">{name}</span>
          <span className="shrink-0 text-right text-[15px] font-semibold text-navy">
            £{finalPriceOf(name, price)}
            {discountFor(name, price) > 0 && <span className="block text-[11px] font-medium text-muted line-through">£{price}</span>}
          </span>
        </span>
        <span className="block pt-0.5 text-[12px] text-muted">
          {a.time} · {durationLabel ?? findSvc(name)?.duration ?? a.duration} · {staffName}
        </span>
      </button>
      <label className="flex w-16 shrink-0 flex-col self-center rounded-xl bg-canvas px-2 py-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Disc</span>
        <span className="flex items-center gap-0.5">
          <span className="text-[11px] font-bold text-muted">£</span>
          <input
            value={lineDiscounts[name] ?? ""}
            onChange={(e) => {
              setLineDiscounts((d) => ({ ...d, [name]: e.target.value.replace(/[^0-9.]/g, "") }));
              setDirty(true);
            }}
            inputMode="decimal"
            aria-label={`${name} discount`}
            className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-navy focus:outline-none"
          />
        </span>
      </label>
      {onEdit && (
        <button
          type="button"
          aria-label={`Edit ${name} price and duration`}
          onClick={onEdit}
          className="self-center p-1 text-muted"
        >
          <Pencil size={15} strokeWidth={1.9} />
        </button>
      )}
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
      {/* ── Header: the service title + actions (⋮) ── */}
      <div className="shrink-0 bg-white px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-[20px] font-bold text-navy">{svcName}</span>
            <span className="flex items-center gap-2 pt-0.5 text-[12px] text-muted">
              {moved ?? `Wed 10 Jun · ${a.time}`}
              {moved && <StatusPill tone="amber">moved</StatusPill>}
            </span>
          </span>
          <button type="button" aria-label="Close booking" onClick={close} className="-mr-1 -mt-1 shrink-0 p-2 text-navy">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Slim status note — only when there's something to flag */}
        {(status === "No-show" || lateBy || readySent) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[12px] font-medium">
            {status === "No-show" && (
              <span className="flex items-center gap-1.5 text-danger"><AlertTriangle size={13} strokeWidth={2} /> Marked as no-show</span>
            )}
            {lateBy ? (
              <span className="flex items-center gap-1.5 text-warning">
                <Clock size={13} strokeWidth={2} /> Running {lateBy} min late · next {lateClients} {lateClients === 1 ? "client" : "clients"} notified
              </span>
            ) : null}
            {readySent && (
              <span className="flex items-center gap-1.5 text-secondary"><Check size={13} strokeWidth={2.5} /> {firstName} notified — can come in</span>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="mb-3 flex rounded-full bg-white p-1 shadow-sm">
          {(["Booking", "Activity"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                tab === t ? "bg-fg-primary text-white" : "text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Activity" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="flex items-center gap-2 text-[14px] font-bold text-navy">
                <ReceiptText size={15} strokeWidth={1.8} />
                Evidence tracker
              </p>
              <p className="pt-1 text-[12px] leading-snug text-muted">
                Price changes, reminders, payment links, forms, disputes, cancellations and policy outcomes are logged here.
              </p>
            </div>
            {activity.map((e) => (
              <div key={e.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    {e.kind === "payment" ? <CreditCard size={15} strokeWidth={1.8} />
                      : e.kind === "form" ? <FileText size={15} strokeWidth={1.8} />
                      : e.kind === "policy" ? <ShieldCheck size={15} strokeWidth={1.8} />
                      : e.kind === "dispute" ? <Scale size={15} strokeWidth={1.8} />
                      : e.kind === "edit" ? <Pencil size={15} strokeWidth={1.8} />
                      : <CalendarClock size={15} strokeWidth={1.8} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-navy">{e.title}</span>
                      <span className="shrink-0 text-[11px] text-muted">{e.time}</span>
                    </span>
                    <span className="block pt-1 text-[12px] leading-snug text-secondary">{e.body}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
        {/* ── Active dispute — urgent, sits above everything ── */}
        {disputed && (
          <div className="mb-3 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <Scale size={17} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-danger">Active payment dispute</p>
              <p className="pt-0.5 text-[12px] leading-snug text-secondary">
                {firstName} has disputed a charge on this booking. Resolve before taking further payment.
              </p>
              <button
                type="button"
                onClick={() => router.push("/app/messages")}
                className="mt-2.5 flex h-9 items-center gap-1.5 rounded-full bg-danger px-3.5 text-[12px] font-semibold text-white"
              >
                Review dispute
                <ChevronRight size={14} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <StatusPill tone={depositPaid > 0 ? "amber" : status === "Done" ? "dark" : "light"}>{paymentLabel}</StatusPill>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-secondary shadow-sm">
            {typeIcon}
            {typeMeta.label}
          </span>
          {selectedCode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-secondary shadow-sm">
              <TagIcon size={12} strokeWidth={2} />
              {selectedCode.code}
            </span>
          )}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {appointmentTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setApptType(t.id);
                setDirty(true);
                logEvent("Appointment type changed", `Type set to ${t.label}.`, "edit");
              }}
              className={`rounded-2xl border px-2 py-2.5 text-center ${
                apptType === t.id ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
              }`}
            >
              <span className="block text-[12px] font-bold">{t.label}</span>
              <span className={`block pt-0.5 text-[10px] leading-tight ${apptType === t.id ? "text-white/70" : "text-muted"}`}>{t.sub}</span>
            </button>
          ))}
        </div>

        {/* ── At a glance — three-column summary (date/time already in the header) ── */}
        <div className="mb-3 grid grid-cols-3 divide-x divide-border rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            onClick={() => {
              const idx = staffMembers.indexOf(staffName);
              const next = staffMembers[(idx + 1) % staffMembers.length] ?? a.staff;
              setStaffOverride(next);
              setDirty(true);
              logEvent("Staff changed", `Staff changed from ${staffName} to ${next}.`, "edit");
            }}
            className="px-3 py-3.5 text-left"
          >
            <span className="flex items-center gap-1.5 text-[11px] text-muted"><UserRound size={12} strokeWidth={1.8} /> With</span>
            <span className="mt-1 block truncate text-[13px] font-semibold text-navy">{staffName}</span>
          </button>
          <div className="px-3 py-3.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted"><Clock size={12} strokeWidth={1.8} /> Duration</span>
            <span className="mt-1 block truncate text-[13px] font-semibold text-navy">{baseDuration}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = locationOverride === "Salon Soho" ? "Client address" : locationOverride === "Client address" ? "Online link" : "Salon Soho";
              setLocationOverride(next);
              setDirty(true);
              logEvent("Location changed", `Location changed from ${locationOverride} to ${next}.`, "edit");
            }}
            className="px-3 py-3.5 text-left"
          >
            <span className="flex items-center gap-1.5 text-[11px] text-muted"><MapPin size={12} strokeWidth={1.8} /> Location</span>
            <span className="mt-1 block truncate text-[13px] font-semibold text-navy">{locationOverride}</span>
          </button>
        </div>

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

        {/* ── Services ── */}
        <p className="px-1 pb-2.5 pt-6 text-[16px] font-bold text-navy">Services</p>
        <div className="flex flex-col gap-2.5">
          <ServiceRow
            name={svcName}
            price={basePrice}
            durationLabel={baseDuration}
            onEdit={() => {
              setEditPriceDraft(String(basePrice));
              setEditDurationDraft(baseDuration ?? "");
              setEditSvcOpen(true);
            }}
          />
          {extras.map((e) => (
            <ServiceRow key={e} name={e} price={priceOf(e)} removable />
          ))}
        </div>
        <button
          type="button"
          onClick={() => openService("add")}
          className="mt-3 flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-[13px] font-semibold text-navy"
        >
          <Plus size={14} strokeWidth={2} />
          Add service
        </button>

        <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[13px] font-bold text-navy">Discount code</p>
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
            {discountCodes.map((code) => {
              const on = discountCodeId === code.id;
              return (
                <button
                  key={code.id}
                  type="button"
                  onClick={() => {
                    setDiscountCodeId(on ? null : code.id);
                    setDirty(true);
                    logEvent(on ? "Discount code removed" : "Discount code applied", `${code.code} ${on ? "removed from" : "applied to"} this booking.`, "payment");
                  }}
                  className={`w-[142px] shrink-0 rounded-xl border px-3 py-2.5 text-left ${
                    on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-canvas text-navy"
                  }`}
                >
                  <span className="block text-[12px] font-bold">{code.label}</span>
                  <span className={`block truncate pt-0.5 text-[10px] ${on ? "text-white/70" : "text-muted"}`}>{code.scope}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span className="text-secondary">Original total</span>
            <span className="font-semibold text-navy">£{originalTotal}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
              <span className="text-secondary">Discounts</span>
              <span className="font-semibold text-navy">−£{totalDiscount}</span>
            </div>
          )}
          {depositPaid > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
              <span className="text-secondary">Deposit paid</span>
              <span className="font-semibold text-navy">−£{depositPaid}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border bg-canvas px-4 py-3.5">
            <span className="text-[14px] font-bold text-navy">Balance due</span>
            <span className="text-[18px] font-bold text-navy">£{Math.max(0, totalPrice - depositPaid)}</span>
          </div>
        </div>

        {/* ── Forms ── */}
        <SectionHeader title="Forms" onAdd={() => { setFormQuery(""); setFormCat("All"); setFormSheet(true); }} addLabel="Add form" />
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
                    <span className="block pt-0.5 text-[12px] text-muted">
                      {sharedForms.includes(f.name) ? "Shared by native sheet" : downloadedForms.includes(f.name) ? "Downloaded" : f.sub}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Download ${f.name}`}
                    onClick={() => {
                      setDownloadedForms((d) => (d.includes(f.name) ? d : [...d, f.name]));
                      logEvent("Form downloaded", `${f.name} downloaded from the booking card.`, "form");
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
                  >
                    <Download size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Share ${f.name}`}
                    onClick={() => {
                      setSharedForms((s) => (s.includes(f.name) ? s : [...s, f.name]));
                      logEvent("Form shared", `${f.name} shared via native OS sheet.`, "form");
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
                  >
                    <Share2 size={13} strokeWidth={2} />
                  </button>
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
            onClick={() => { setFormQuery(""); setFormCat("All"); setFormSheet(true); }}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-white/50 py-6 text-center"
          >
            <FileText size={18} strokeWidth={1.5} className="text-muted" />
            <span className="text-[13px] font-semibold text-navy">Attach a form</span>
            <span className="text-[12px] text-muted">Consultation, allergy, patch test &amp; more</span>
          </button>
        )}

        {/* ── Notes & photos ── */}
        <SectionHeader title="Notes &amp; photos" onAdd={() => { setNoteDraft(""); setNotePhotos(0); setNoteSheet(true); }} addLabel="Add note" />
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
            onClick={() => { setNoteDraft(""); setNotePhotos(0); setNoteSheet(true); }}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-white/50 py-6 text-center"
          >
            <StickyNote size={18} strokeWidth={1.5} className="text-muted" />
            <span className="text-[13px] font-semibold text-navy">Add a note</span>
            <span className="text-[12px] text-muted">Products, formulas, before &amp; after photos</span>
          </button>
        )}
          </>
        )}
      </div>

      {/* ── Fixed money + actions bar ── */}
      <div className="shrink-0 border-t border-border bg-white px-5 pb-6 pt-3">
        {dirty ? (
          <DarkButton onClick={() => { setDirty(false); close(); }}>Save changes</DarkButton>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Booking actions"
              onClick={() => setActionsOpen(true)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-white text-navy"
            >
              <MoreVertical size={18} strokeWidth={2} />
            </button>
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
                  : "flex-1 bg-fg-primary text-white"
              }`}
            >
              <CreditCard size={16} strokeWidth={1.9} />
              {totalPrice > 0 ? `Pay £${totalPrice}` : "Pay"}
            </button>
          </div>
        )}
      </div>

      {/* ── Change / add a service ── */}
      <Sheet
        open={serviceSheet !== null}
        onClose={() => setServiceSheet(null)}
        title={serviceSheet === "change" ? "Change service" : "Add a service"}
        sub={serviceSheet === "change" ? "Swap the booked service" : "Add to this booking"}
        full
      >
        <div className="relative pb-3">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={svcQuery}
            onChange={(e) => setSvcQuery(e.target.value)}
            placeholder="Search your services..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
          {serviceCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSvcCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                svcCat === c ? "bg-fg-primary text-white" : "border border-border bg-white text-secondary"
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
              const isCurrent = serviceSheet === "change" && s.name === svcName;
              const alreadyAdded = serviceSheet === "add" && (extras.includes(s.name) || s.name === svcName);
              const pending = pendingExtras.includes(s.name);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => {
                    if (serviceSheet === "change") {
                      setSvcOverride(s.name);
                      setExtras((x) => x.filter((e) => e !== s.name));
                      setDirty(true);
                      logEvent("Service changed", `Primary service changed to ${s.name}.`, "edit");
                      setServiceSheet(null);
                    } else {
                      setPendingExtras((x) => (x.includes(s.name) ? x.filter((e) => e !== s.name) : [...x, s.name]));
                    }
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
                    {isCurrent || pending ? <Check size={15} strokeWidth={2.5} /> : <ChevronRight size={15} className="text-muted" />}
                  </span>
                </button>
              );
            })}
        </div>
        {serviceSheet === "add" && (
          <div className="sticky bottom-0 -mx-6 mt-4 bg-white px-6 pb-1 pt-3">
            <DarkButton
              disabled={pendingExtras.length === 0}
              onClick={() => {
                setExtras((x) => [...x, ...pendingExtras.filter((e) => !x.includes(e))]);
                setDirty(true);
                logEvent("Services added", `${pendingExtras.join(", ")} added to this appointment.`, "edit");
                setServiceSheet(null);
              }}
            >
              {pendingExtras.length ? `Add ${pendingExtras.length} service${pendingExtras.length === 1 ? "" : "s"}` : "Select services"}
            </DarkButton>
          </div>
        )}
      </Sheet>

      {/* ── Reschedule ── */}
      <Sheet open={rescheduleSheet} onClose={() => setRescheduleSheet(false)} title="Reschedule" sub={`${clientName} · ${svcName}`} full>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
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
              setNotifyMove(true);
              logEvent("Appointment moved", `Moved from ${a.time} to ${label}. Client notification pending.`, "edit");
              setRescheduleSheet(false);
            }}
          >
            {day && time ? `Confirm · Sat ${day} Jun, ${time}` : "Confirm new time"}
          </DarkButton>
        </div>
      </Sheet>

      <Sheet open={notifyMove} onClose={() => setNotifyMove(false)} title={`Notify ${firstName}?`} sub="Appointment moved">
        <div className="rounded-2xl bg-canvas p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Message preview</p>
          <p className="pt-2 text-[14px] leading-relaxed text-navy">
            Hi {firstName}, your {svcName} appointment has moved from {a.time} to {moved ?? localMoved}. Reply here if that no longer works.
          </p>
        </div>
        <div className="pt-5">
          <DarkButton onClick={() => { logEvent("Client notified", `${firstName} was notified about the move to ${moved ?? localMoved}.`, "message"); setNotifyMove(false); }}>
            Send update
          </DarkButton>
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <button type="button" onClick={() => { logEvent("Move notification skipped", `${firstName} was not notified about the move.`, "message"); setNotifyMove(false); }} className="h-11 rounded-full border border-border text-[13px] font-semibold text-navy">Skip</button>
            <button
              type="button"
              onClick={() => {
                if (a.live) setMovedTo(null);
                else setLocalMoved(null);
                logEvent("Move undone", `Move from ${a.time} was undone.`, "edit");
                setNotifyMove(false);
              }}
              className="h-11 rounded-full border border-border text-[13px] font-semibold text-navy"
            >
              Undo
            </button>
          </div>
        </div>
      </Sheet>

      {/* ── Cancel ── */}
      <Sheet open={cancelSheet} onClose={() => setCancelSheet(false)} title="Cancel / no-show" sub={`${clientName} · ${svcName}`}>
        <div className="rounded-2xl border border-warning/30 bg-warning/[0.06] p-4">
          <p className="text-[13px] font-bold text-navy">Policy outcome</p>
          <p className="pt-1 text-[12px] leading-snug text-secondary">
            24h cancellation policy applies. Calculated outcome: keep the £{depositPaid || 40} deposit and refund £{Math.max(0, totalPrice - (depositPaid || 40))}.
          </p>
        </div>
        <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Policy handling</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["enforce", "Enforce"],
            ["waive", "Waive"],
            ["custom", "Custom"],
          ] as [PolicyMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPolicyMode(mode)}
              className={`rounded-full border py-2 text-[12px] font-semibold ${policyMode === mode ? "border-fg-primary bg-fg-primary text-white" : "border-border text-navy"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Refund amount</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["full", "Full"],
            ["deposit", "Deposit only"],
            ["custom", "Custom"],
          ] as [RefundChoice, string][]).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRefundChoice(mode)}
              className={`rounded-2xl border px-2 py-3 text-[12px] font-semibold ${refundChoice === mode ? "border-fg-primary bg-fg-primary text-white" : "border-border text-navy"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {refundChoice === "custom" && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border px-4">
            <span className="text-[18px] font-bold text-muted">£</span>
            <input
              value={customRefund}
              onChange={(e) => setCustomRefund(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="Custom amount"
              className="h-12 min-w-0 flex-1 bg-transparent text-[18px] font-bold text-navy placeholder:text-[14px] placeholder:font-normal placeholder:text-muted focus:outline-none"
            />
          </div>
        )}
        <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Offer freed slot to waitlist</p>
        <div className="flex flex-col gap-2.5 pb-4">
          {waitlistCandidates.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setWaitlistOffered(w.id);
                logEvent("Waitlist offered", `Freed slot offered to ${w.name}.`, "message");
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${
                waitlistOffered === w.id ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${waitlistOffered === w.id ? "bg-white/15 text-white" : "bg-canvas text-secondary"}`}>{w.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{w.name}</span>
                <span className={`block truncate pt-0.5 text-[11px] ${waitlistOffered === w.id ? "text-white/70" : "text-muted"}`}>{w.service} · {w.preference}</span>
              </span>
              <span className="text-[11px] font-bold">{waitlistOffered === w.id ? "Offered" : "Offer"}</span>
            </button>
          ))}
        </div>
        <DarkButton
          onClick={() => {
            if (a.live) setApptStatus("cancelled");
            setLocalStatus("Cancelled");
            logEvent(
              "Cancellation policy resolved",
              `${policyMode} policy · ${refundChoice === "custom" ? `£${customRefund || 0}` : refundChoice} refund selected. ${waitlistOffered ? "Waitlist slot offered." : "No waitlist offer sent."}`,
              "policy",
            );
            setCancelSheet(false);
            setTab("Activity");
          }}
        >
          Cancel and log outcome
        </DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setCancelSheet(false)}>Keep it</GhostButton>
        </div>
        <div className="h-2" />
      </Sheet>

      {/* ── Booking actions (⋮) — running late, ready, reschedule, cancel, message ── */}
      <Sheet open={actionsOpen} onClose={() => setActionsOpen(false)} title="Booking actions" sub={`${clientName} · ${svcName}`}>
        <div className="flex flex-col pt-1">
          {[
            ...(showSignals
              ? [
                  { icon: <Clock size={17} strokeWidth={1.8} />, label: lateBy ? `Running ${lateBy} min late · update` : "Mark running late", run: () => { setActionsOpen(false); setLatePicker(true); } },
                  { icon: readySent ? <Check size={17} strokeWidth={2.3} /> : <Bell size={17} strokeWidth={1.8} />, label: readySent ? "Ready sent · undo" : "I'm ready for them", run: () => { setReadySent(!readySent); setActionsOpen(false); } },
                ]
              : []),
            { icon: <MessageSquare size={17} strokeWidth={1.8} />, label: `Message ${firstName}`, run: () => { setActionsOpen(false); router.push(`/app/messages/${slug}`); } },
            { icon: <RotateCcw size={17} strokeWidth={1.8} />, label: "Reschedule", run: () => { setActionsOpen(false); setDay(null); setTime(null); setRescheduleSheet(true); } },
            { icon: <AlertTriangle size={17} strokeWidth={1.8} />, label: "Mark no-show", run: () => { setActionsOpen(false); setLocalStatus("No-show"); setCancelSheet(true); logEvent("No-show started", `${clientName} marked as no-show. Policy review opened.`, "policy"); }, danger: true },
            { icon: <X size={17} strokeWidth={1.8} />, label: "Cancel appointment", run: () => { setActionsOpen(false); setCancelSheet(true); }, danger: true },
          ].map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={q.run}
              className={`flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left text-[15px] font-medium last:border-0 ${q.danger ? "text-danger" : "text-navy"}`}
            >
              <span className={q.danger ? "text-danger" : "text-secondary"}>{q.icon}</span>
              {q.label}
            </button>
          ))}
        </div>
        <div className="h-2" />
      </Sheet>

      {/* ── Running late — pick how late; we shift the diary and notify clients ── */}
      <Sheet open={latePicker} onClose={() => setLatePicker(false)} title="Running late?" sub={`${clientName} · ${a.time}`}>
        <p className="pb-3 text-[13px] leading-relaxed text-secondary">
          Let your upcoming clients know. We&rsquo;ll shift the diary and notify whoever&rsquo;s affected.
        </p>
        <div className="space-y-2">
          {[5, 10, 15].map((m) => {
            const clients = m / 5;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setLateBy(m); setLatePicker(false); }}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left ${
                  lateBy === m ? "border-fg-primary bg-canvas" : "border-border bg-white"
                }`}
              >
                <span className="text-[14px] font-semibold text-navy">+{m} min</span>
                <span className="text-[12px] text-muted">affects next {clients} {clients === 1 ? "client" : "clients"}</span>
              </button>
            );
          })}
        </div>
        {lateBy && (
          <div className="pt-4">
            <GhostButton onClick={() => { setLateBy(null); setLatePicker(false); }}>Clear — I&rsquo;m back on time</GhostButton>
          </div>
        )}
        <div className="h-2" />
      </Sheet>

      {/* ── Edit price & duration ── */}
      <Sheet open={editSvcOpen} onClose={() => setEditSvcOpen(false)} title="Edit service" sub={svcName}>
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Price (£)</p>
        <input
          value={editPriceDraft}
          onChange={(e) => setEditPriceDraft(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          placeholder="0"
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:outline-none"
        />
        <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Duration</p>
        <input
          value={editDurationDraft}
          onChange={(e) => setEditDurationDraft(e.target.value)}
          placeholder="e.g. 90m, 1h 30m"
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="pt-5">
          <DarkButton
            onClick={() => {
              const p = parseInt(editPriceDraft, 10);
              if (!Number.isNaN(p)) setPriceOverride(p);
              if (editDurationDraft.trim()) setDurationOverride(editDurationDraft.trim());
              setDirty(true);
              setEditSvcOpen(false);
            }}
          >
            Save changes
          </DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

      {/* ── Add note & photos ── */}
      <Sheet open={noteSheet} onClose={() => setNoteSheet(false)} title="Add note & photos" sub={`Saved to ${firstName}'s record`}>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Products used, formulas, observations, follow-up needed..."
          className="h-28 w-full resize-none rounded-xl border border-border bg-white p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setNotePhotos((p) => p + 1)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-[13px] font-medium text-secondary"
        >
          <Camera size={15} strokeWidth={1.75} />
          {notePhotos > 0 ? `${notePhotos} photo${notePhotos > 1 ? "s" : ""} attached · add another` : "Add before / after photos"}
        </button>
        {notePhotos > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {Array.from({ length: notePhotos }, (_, j) => (
              <span key={j} className="flex h-16 w-16 items-center justify-center rounded-xl bg-canvas text-muted">
                <ImageIcon size={18} strokeWidth={1.5} />
              </span>
            ))}
          </div>
        )}
        <div className="pt-5">
          <DarkButton
            disabled={!noteDraft.trim() && notePhotos === 0}
            onClick={() => {
              setBookingNotes((n) => [
                { date: "Today · 10 Jun 2026", note: noteDraft.trim() || "Photos attached.", imgs: notePhotos, kind: "note" },
                ...n,
              ]);
              setNoteSheet(false);
            }}
          >
            Save to record
          </DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

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

      {/* ── Add tag — searchable list with create-new ── */}
      <Sheet open={manageMode === "tag"} onClose={() => setManageMode(null)} title="Add a tag" sub="Search, pick, or create your own" full>
        <div className="relative pb-3">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search or create a tag..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        {canCreateTag && (
          <button
            type="button"
            onClick={() => { setLocalTags((x) => [...x, tagQuery.trim()]); setTagQuery(""); }}
            className="mb-1 flex w-full items-center gap-3 rounded-xl border border-dashed border-border py-3.5 pl-4 text-left"
          >
            <Plus size={16} strokeWidth={2} className="text-navy" />
            <span className="text-[15px] font-semibold text-navy">Create &ldquo;{tagQuery.trim()}&rdquo;</span>
          </button>
        )}
        <div className="flex flex-col">
          {tagMatches.map((t) => {
            const selected = tags.includes(t);
            const locked = selected && !localTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                disabled={locked}
                onClick={() => toggleTag(t)}
                className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0 disabled:opacity-60"
              >
                <span className="flex items-center gap-3 text-[15px] font-medium text-navy">
                  <TagIcon size={15} strokeWidth={1.7} className="text-secondary" />
                  {t}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    selected ? "border-fg-primary bg-fg-primary text-white" : "border-border text-transparent"
                  }`}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
              </button>
            );
          })}
          {tagMatches.length === 0 && !canCreateTag && (
            <p className="py-6 text-center text-[13px] text-muted">No tags found</p>
          )}
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

      {/* ── Add a form — searchable + filterable ── */}
      <Sheet open={formSheet} onClose={() => setFormSheet(false)} title="Add a form" sub="Sent to the client to complete" full>
        <div className="relative pb-3">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={formQuery}
            onChange={(e) => setFormQuery(e.target.value)}
            placeholder="Search forms..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
          {formCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                formCat === c ? "bg-fg-primary text-white" : "border border-border bg-white text-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          {formTemplates
            .filter((f) => formCat === "All" || f.category === formCat)
            .filter((f) => f.name.toLowerCase().includes(formQuery.toLowerCase()))
            .map((f) => {
              const added = forms.some((x) => x.name === f.name);
              return (
                <button
                  key={f.name}
                  type="button"
                  disabled={added}
                  onClick={() => { setLocalForms((x) => [...x, f.name]); setFormSheet(false); }}
                  className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left last:border-0 disabled:opacity-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <FileText size={16} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-navy">{f.name}</span>
                    <span className="block text-[12px] text-muted">{f.category}</span>
                  </span>
                  {added ? <Check size={16} strokeWidth={2.5} className="text-navy" /> : <Plus size={16} strokeWidth={2} className="text-muted" />}
                </button>
              );
            })}
          {formTemplates.filter((f) => (formCat === "All" || f.category === formCat) && f.name.toLowerCase().includes(formQuery.toLowerCase())).length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted">No forms found</p>
          )}
        </div>
      </Sheet>
    </motion.div>
  );
}
