"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Star, CalendarPlus, MessageSquare, MessageCircle, Phone, Plus,
  RotateCcw, X, Search, SlidersHorizontal, ChevronDown, FileText, Eye, Bell, Download,
  MapPin, Mail, Copy, Check, MoreVertical, Ban, Trash2,
  Tag as TagIcon, AlertTriangle, StickyNote, Wallet, Settings, ChevronRight,
  Camera, Image as ImageIcon, Repeat, Pencil, FlaskConical, Share2,
} from "lucide-react";
import { Segmented, DarkButton, GhostButton, Sheet, MiniCalendar, TimeChips, StatusPill } from "@/components/ui";
import { useAppStore } from "@/lib/store/appStore";
import { pastAppointments, clientForms, staffMembers, tagPresets, clientRows, contactFor } from "@/lib/data/product";
import { clientUpcomingAppointments, entitlementBalances } from "@/lib/data/finalisation";

// Client detail, organised by job-to-be-done:
//   Overview     — the dashboard: safety strip, next appointment, a
//                  needs-attention rail, and links to the dedicated
//                  wallet / reviews / settings pages (contact is a sheet)
//   Appointments — upcoming + searchable history with booking detail sheet
//   Record       — the care record: allergies, patch tests, notes & images, forms
// The 3-dot menu holds profile-level actions only (edit / VIP / merge /
// block / delete).

function UpcomingAppointmentsRail({
  moved,
  onMenu,
  onViewAll,
  onOpen,
}: {
  moved: string | null;
  onMenu: () => void;
  onViewAll: () => void;
  onOpen: (appt: (typeof clientUpcomingAppointments)[number]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Upcoming appointments</p>
        <button type="button" onClick={onViewAll} className="text-[12px] font-semibold text-navy">View all</button>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {clientUpcomingAppointments.map((appt, i) => (
          <button
            key={appt.id}
            type="button"
            onClick={() => onOpen(appt)}
            className="w-[218px] shrink-0 rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(8,7,6,0.04)]"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold text-navy">{appt.service}</span>
                <span className="block pt-1 text-[12px] text-muted">{i === 0 && moved ? `Moved · ${moved}` : `${appt.date} · ${appt.time}`}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                appt.status === "pending" ? "bg-warning/10 text-warning" : appt.status === "recurring" ? "bg-canvas text-secondary" : "bg-fg-primary/10 text-navy"
              }`}>
                {appt.status === "recurring" ? "Repeats" : appt.status}
              </span>
            </span>
            <span className="block pt-3 text-[12px] text-secondary">{appt.staff} · £{appt.price}</span>
            {i === 0 && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onMenu(); }}
                className="mt-3 inline-flex h-8 items-center rounded-full border border-border px-3 text-[11px] font-semibold text-navy"
              >
                Options
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Section heading inside a tab (the Record tab is one page, not sub-tabs). */
function RecordHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pb-1 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{children}</p>
      {action}
    </div>
  );
}

interface Allergy {
  name: string;
  type: "Drug" | "Non-drug" | "Note";
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe" | "Fatal";
  note?: string; // free detail, used by the "Note" type instead of reaction/severity
}

const severityTone: Record<Allergy["severity"], string> = {
  Mild: "bg-canvas text-secondary",
  Moderate: "bg-[#FEF3C7] text-[#B45309]",
  Severe: "bg-[#FFE4DC] text-[#C2410C]",
  Fatal: "bg-danger text-white",
};

const reactionOptions = [
  "Itching", "Rash or hives", "Swelling", "Redness", "Burning or stinging",
  "Blistering", "Dry or flaky skin", "Dizziness", "Headache", "Nausea",
  "Sneezing", "Watery eyes", "Coughing", "Wheezing", "Breathing difficulty",
  "Anaphylaxis",
];
const severities = ["Mild", "Moderate", "Severe", "Fatal"] as const;

interface PatchTest {
  title: string;
  date: string;
  staff: string;
  status: "Pending" | "Passed" | "Failed";
  desc?: string;
}

const patchTone: Record<PatchTest["status"], string> = {
  Passed: "bg-[#E8F6EE] text-[#157347]",
  Pending: "bg-canvas text-muted",
  Failed: "bg-danger text-white",
};

interface ClinicalNote {
  date: string;
  appt: string | null;
  note: string;
  imgs: number;
}

const formTemplates = [
  "Consultation Form",
  "Allergy Questionnaire",
  "Aftercare Instructions",
  "Pre-Appointment Checklist",
];

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = params?.id ?? "sarah";
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const setApptSheet = useAppStore((s) => s.setApptSheet);
  const [tab, setTab] = useState("Overview");

  // Seed the profile from the real client row so every client opens their own
  // record (not a hardcoded Sarah).
  const record = clientRows.find((c) => c.id === clientId);
  const seedName = record?.name ?? "Sarah Johnson";
  const seedContact = contactFor(seedName);
  const seedEmail = seedContact.email ?? `${seedName.split(" ")[0].toLowerCase()}@email.com`;

  // Next-appointment actions
  const [nextApptMenu, setNextApptMenu] = useState(false);
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [moved, setMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // Contact + forms
  const [contactOpen, setContactOpen] = useState(false);
  const [numberCopied, setNumberCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formPick, setFormPick] = useState<string | null>(null);
  const [formSent, setFormSent] = useState<string[]>([]);
  const [sharedForms, setSharedForms] = useState<string[]>([]);
  const [reminded, setReminded] = useState(false);

  // 3-dot actions
  const [actionsOpen, setActionsOpen] = useState(false);
  const [blocked, setBlocked] = useState(record?.tags.includes("Blocked") ?? false);
  const [messageBlocked, setMessageBlocked] = useState(false);
  const [tags, setTags] = useState<string[]>(record?.tags.filter((t) => t !== "Blocked") ?? ["Regular"]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Editable client details
  const [details, setDetails] = useState({ name: seedName, phone: seedContact.phone, email: seedEmail });
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(details.name);
  const [editPhone, setEditPhone] = useState(details.phone);
  const [editEmail, setEditEmail] = useState(details.email);
  const initials = details.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const firstName = details.name.split(" ")[0];

  // Tag picker (search + create + toggle)
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  // Appointment history search + filter
  const [apptSearch, setApptSearch] = useState("");
  const [apptFilter, setApptFilter] = useState("All");
  const [apptFilterOpen, setApptFilterOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [upcomingSearch, setUpcomingSearch] = useState("");
  const [upcomingFilter, setUpcomingFilter] = useState("All");
  const [upcomingSort, setUpcomingSort] = useState("Soonest");

  // Allergy "Note" detail + note-link dropdown
  const [alNote, setAlNote] = useState("");
  const [noteApptOpen, setNoteApptOpen] = useState(false);

  // Allergies — structured records
  const [allergies, setAllergies] = useState<Allergy[]>([
    { name: "PPD (hair dye)", type: "Drug", reaction: "Itching", severity: "Severe" },
    { name: "Sensitive scalp", type: "Note", reaction: "—", severity: "Mild" },
  ]);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [alName, setAlName] = useState("");
  const [alType, setAlType] = useState<Allergy["type"]>("Non-drug");
  const [alReaction, setAlReaction] = useState<string | null>(null);
  const [alSeverity, setAlSeverity] = useState<Allergy["severity"]>("Mild");
  const [reactOpen, setReactOpen] = useState(false);
  const [expandedAllergy, setExpandedAllergy] = useState<string | null>(null);

  // Record: notes & images, patch tests
  const [notes, setNotes] = useState<ClinicalNote[]>([
    { date: "3 Mar 2026 · 11:42", appt: "Cut & Style", note: "Toner 9V for 20 mins. Scalp fine after patch test. Before/after taken.", imgs: 2 },
    { date: "10 Feb 2026 · 15:08", appt: "Cut & Style", note: "Trim only. Discussed balayage for spring — book a consult.", imgs: 0 },
    { date: "15 Jan 2026 · 09:30", appt: null, note: "Prefers quiet appointments, no small talk before 10am.", imgs: 0 },
  ]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteAppt, setNoteAppt] = useState<string | null>("General");
  const [notePhotos, setNotePhotos] = useState(0);
  const [noteDay, setNoteDay] = useState<number | null>(null);
  const [notePickDate, setNotePickDate] = useState(false);

  // Patch tests — a real record-new flow, not a one-tap stub
  const [patchTests, setPatchTests] = useState<PatchTest[]>([
    { title: "Colour patch test", date: "1 Mar 2026", staff: "Emma S.", status: "Passed", desc: "Valid for 6 months" },
  ]);
  const [ptOpen, setPtOpen] = useState(false);
  const [ptTitle, setPtTitle] = useState("");
  const [ptDay, setPtDay] = useState<number | null>(null);
  const [ptPickDate, setPtPickDate] = useState(false);
  const [ptStaff, setPtStaff] = useState<string | null>(null);
  const [ptStatus, setPtStatus] = useState<PatchTest["status"]>("Pending");
  const [ptDesc, setPtDesc] = useState("");

  // Appointments
  const [bookingSel, setBookingSel] = useState<(typeof pastAppointments)[number] | null>(null);
  const [sessionAdjust, setSessionAdjust] = useState<Record<string, number>>({});

  const unpaid = pastAppointments.find((p) => p.id === "p3");
  const severe = allergies.some((a) => a.severity === "Severe" || a.severity === "Fatal");

  // Tag picker options (presets + any already applied), searchable + create-new.
  const tagOptions = Array.from(new Set([...tagPresets, ...tags]));
  const tagMatches = tagOptions.filter((t) => t.toLowerCase().includes(tagQuery.trim().toLowerCase()));
  const canCreateTag = tagQuery.trim().length > 0 && !tagOptions.some((t) => t.toLowerCase() === tagQuery.trim().toLowerCase());

  // Notes can be linked to a past appointment (a dropdown, not tabs).
  const noteLinkOptions = ["General", ...pastAppointments.map((p) => `${p.name} · ${p.meta.split(" · ")[0]}`)];

  const field = "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none";
  const clientEntitlements = entitlementBalances.filter((e) => e.client === details.name || e.client === seedName);
  const openUpcoming = (appt: (typeof clientUpcomingAppointments)[number]) =>
    setApptSheet({
      client: details.name,
      initials,
      service: appt.service,
      staff: appt.staff,
      time: appt.time,
      duration: `£${appt.price}`,
      price: appt.price,
      status: appt.status === "pending" ? "Pending" : appt.status === "recurring" ? "Recurring" : "Confirmed",
    });

  // Needs-attention rows, most urgent first. Each is one compact row with a
  // single clear action — not a separate full-width card per concern.
  const attention: { id: string; icon: React.ReactNode; title: string; sub: string; action: string; done?: boolean; run: () => void }[] = [
    ...(unpaid
      ? [{
          id: "unpaid",
          icon: <AlertTriangle size={14} strokeWidth={2} className="text-[#B45309]" />,
          title: "£75 outstanding",
          sub: "Cut & Blow Dry · 20 Jan",
          action: "Take payment",
          run: () => router.push("/app/checkout"),
        }]
      : []),
    {
      id: "form",
      icon: <FileText size={14} strokeWidth={2} className="text-secondary" />,
      title: "Aftercare form pending",
      sub: "Sent 16 Mar · not completed",
      action: reminded ? "Reminded" : "Remind",
      done: reminded,
      run: () => setReminded(true),
    },
    {
      id: "followup",
      icon: <Repeat size={14} strokeWidth={2} className="text-secondary" />,
      title: "Colour follow-up due",
      sub: "Refresh every 6–8 weeks · last colour 3 Mar",
      action: "Book",
      run: () => setQuickAction("appointment"),
    },
  ];

  return (
    <div className="min-h-full bg-fog">
      {/* ── Header: centred profile (Figma 12273:24328) ── */}
      <div className="bg-white px-5 pb-5">
        <div className="-mx-1 flex items-center justify-between pt-4">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1 text-navy">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Client actions" onClick={() => setActionsOpen(true)} className="p-1 text-navy">
            <MoreVertical size={20} strokeWidth={1.9} />
          </button>
        </div>

        {/* Avatar with the status badge on its lower edge */}
        <div className="flex flex-col items-center pt-1">
          <div className="relative">
            <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-canvas text-[24px] font-semibold text-muted">
              {initials}
            </span>
            <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${blocked ? "bg-danger text-white" : "bg-fg-primary text-white"}`}>
              {blocked ? "Blocked" : "Active"}
            </span>
          </div>
          <h1 className="pt-4 text-[22px] font-bold tracking-tight text-navy">{details.name}</h1>

          {/* Tags + add-a-tag chip */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-secondary">{t}</span>
            ))}
            <button
              type="button"
              onClick={() => setTagSheetOpen(true)}
              className="flex items-center gap-0.5 rounded-full border border-dashed border-border px-2.5 py-1 text-[10px] font-semibold text-secondary"
            >
              Add <Plus size={10} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stats — a bordered, three-column card */}
        <div className="mt-5 flex divide-x divide-border overflow-hidden rounded-2xl border border-border">
          {[
            ["Total Bookings", "24"],
            ["Total Sales", "£1,870"],
            ["Rating", "4.8"],
          ].map(([k, v]) => (
            <div key={k} className="flex-1 bg-white px-2 py-3.5 text-center">
              <p className="text-[11px] text-muted">{k}</p>
              <p className="pt-1 text-[15px] font-bold text-navy">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky section nav: stays pinned while the page scrolls ── */}
      <div className="sticky top-0 z-30 border-b border-border bg-white px-4 pb-3 pt-2">
        <Segmented options={["Overview", "Appointments", "Record"]} value={tab} onChange={setTab} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="px-4 pt-4"
        >
          {/* ════ OVERVIEW — a dashboard: safety, what's next, the numbers, where to go ════ */}
          {tab === "Overview" && (
            <div className="flex flex-col gap-3">
              {/* Allergies & care notes — each one its own clear line */}
              <div className={`overflow-hidden rounded-2xl border bg-white shadow-[0_1px_4px_rgba(8,7,6,0.04)] ${severe ? "border-danger/40" : "border-border"}`}>
                <button
                  type="button"
                  onClick={() => setTab("Record")}
                  className="flex w-full items-center justify-between gap-3 px-4 pb-2 pt-3.5 text-left"
                >
                  <span className="flex items-center gap-2 text-[13px] font-bold text-navy">
                    <AlertTriangle size={15} strokeWidth={2} className={severe ? "text-danger" : "text-secondary"} />
                    Allergies &amp; notes
                    {allergies.length > 0 && <span className="font-semibold text-muted">· {allergies.length}</span>}
                  </span>
                  <ChevronRight size={14} className="shrink-0 text-muted" />
                </button>
                {allergies.length === 0 ? (
                  <p className="px-4 pb-4 text-[12px] text-muted">None recorded — tap to add.</p>
                ) : (
                  <div className="divide-y divide-border border-t border-border">
                    {allergies.map((a) => (
                      <div key={a.name} className="flex items-start gap-2.5 px-4 py-3">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            a.type === "Note" ? "bg-secondary" : a.severity === "Severe" || a.severity === "Fatal" ? "bg-danger" : "bg-warning"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold text-navy">{a.name}</span>
                            {a.type === "Note" ? (
                              <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-secondary">Note</span>
                            ) : (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${severityTone[a.severity]}`}>{a.severity}</span>
                            )}
                          </span>
                          <span className="block truncate pt-0.5 text-[12px] text-secondary">
                            {a.type === "Note"
                              ? a.note || "Care note"
                              : `${a.type} allergy${a.reaction !== "—" ? ` · reaction: ${a.reaction.toLowerCase()}` : ""}`}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Needs attention — surfaced right under the safety flags, above the fold */}
              {attention.length > 0 && (
                <div>
                  <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Needs attention · {attention.filter((a) => !a.done).length}
                  </p>
                  <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                    {attention.map((a) => (
                      <div key={a.id} className="flex w-[185px] shrink-0 flex-col rounded-2xl bg-white p-3.5 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas">{a.icon}</span>
                        <span className="block pt-2.5 text-[13px] font-semibold leading-tight text-navy">{a.title}</span>
                        <span className="block flex-1 pt-1 text-[11px] leading-snug text-muted">{a.sub}</span>
                        <button
                          type="button"
                          disabled={a.done}
                          onClick={a.run}
                          className={`mt-3 h-8 w-full rounded-full text-[11px] font-bold ${
                            a.done
                              ? "bg-canvas text-muted"
                              : a.id === "unpaid"
                                ? "bg-[#FEF3C7] text-[#B45309]"
                                : "bg-fg-primary text-white"
                          }`}
                        >
                          {a.done && <Check size={11} strokeWidth={3} className="mr-1 inline" />}
                          {a.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's next */}
              {!cancelled && (
                <UpcomingAppointmentsRail
                  moved={moved}
                  onMenu={() => setNextApptMenu(true)}
                  onViewAll={() => setUpcomingOpen(true)}
                  onOpen={openUpcoming}
                />
              )}

              {/* Wallet, reviews and settings are full pages now; contact stays a sheet */}
              <div>
                <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Manage</p>
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  {[
                    { icon: <Wallet size={15} strokeWidth={1.75} />, t: "Wallet & loyalty", s: "£25 credit · 320 pts · 2 rewards", run: () => router.push(`/app/clients/${clientId}/wallet`) },
                    { icon: <Star size={15} strokeWidth={1.75} />, t: "Reviews", s: "4.7 · 3 reviews · 1 awaiting reply", run: () => router.push(`/app/clients/${clientId}/reviews`) },
                    { icon: <Settings size={15} strokeWidth={1.75} />, t: "Settings & policies", s: "Booking rules, payments, marketing", run: () => router.push(`/app/clients/${clientId}/settings`) },
                    { icon: <Phone size={15} strokeWidth={1.75} />, t: "Contact details", s: `${details.phone} · ${details.email}`, run: () => { setNumberCopied(false); setContactOpen(true); } },
                  ].map((r, i) => (
                    <button key={r.t} type="button" onClick={r.run} className={`flex w-full items-center gap-3 px-4 py-4 text-left ${i > 0 ? "border-t border-border" : ""}`}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-secondary">{r.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-navy">{r.t}</span>
                        <span className="block truncate text-[11px] text-muted">{r.s}</span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ APPOINTMENTS — upcoming + history ════ */}
          {tab === "Appointments" && (
            <div className="flex flex-col gap-3">
              <RecordHeading>Upcoming</RecordHeading>
              {cancelled ? (
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  <span className="text-[13px] text-muted">No upcoming appointments.</span>
                  <button onClick={() => setQuickAction("appointment")} className="rounded-full bg-fg-primary px-3.5 py-2 text-[12px] font-semibold text-white">
                    Book
                  </button>
                </div>
              ) : (
                <UpcomingAppointmentsRail
                  moved={moved}
                  onMenu={() => setNextApptMenu(true)}
                  onViewAll={() => setUpcomingOpen(true)}
                  onOpen={openUpcoming}
                />
              )}

              <RecordHeading>History · {pastAppointments.length}</RecordHeading>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    placeholder="Search service, date, staff..."
                    className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-[13px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(8,7,6,0.04)] focus:outline-none"
                  />
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setApptFilterOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={apptFilterOpen}
                    className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold shadow-[0_1px_4px_rgba(8,7,6,0.04)] ${
                      apptFilter !== "All" ? "bg-fg-primary text-white" : "bg-white text-navy"
                    }`}
                  >
                    <SlidersHorizontal size={13} strokeWidth={1.9} />
                    {apptFilter}
                    <ChevronDown size={12} className={`transition-transform ${apptFilterOpen ? "rotate-180" : ""}`} />
                  </button>
                  {apptFilterOpen && (
                    <>
                      <button type="button" aria-hidden tabIndex={-1} onClick={() => setApptFilterOpen(false)} className="fixed inset-0 z-10 cursor-default" />
                      <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-40 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                        {["All", "Completed", "Cancelled"].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => { setApptFilter(f); setApptFilterOpen(false); }}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] ${f === apptFilter ? "bg-canvas font-semibold text-navy" : "text-secondary"}`}
                          >
                            {f}
                            {f === apptFilter && <Check size={13} strokeWidth={2.5} className="text-navy" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {(() => {
                const q = apptSearch.trim().toLowerCase();
                const filtered = pastAppointments.filter(
                  (p) => (apptFilter === "All" || p.status === apptFilter) && (!q || `${p.name} ${p.meta}`.toLowerCase().includes(q)),
                );
                if (filtered.length === 0) {
                  return <p className="rounded-2xl bg-white p-4 text-[13px] text-muted shadow-[0_1px_4px_rgba(8,7,6,0.04)]">No appointments match.</p>;
                }
                return filtered.map((p) => {
                const isUnpaid = p.id === "p3";
                return (
                  <button key={p.id} type="button" onClick={() => setBookingSel(p)} className="rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-semibold text-navy">{p.name}</p>
                      <span className="flex gap-1.5">
                        {isUnpaid && (
                          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-semibold text-[#B45309]">£75 unpaid</span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            p.status === "Completed" ? "bg-[#E8F6EE] text-[#157347]" : "bg-canvas text-muted"
                          }`}
                        >
                          {p.status}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[12px] text-muted">{p.meta}</p>
                      {p.docs > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-muted">
                          <FileText size={12} strokeWidth={1.75} />
                          {p.docs} attached
                        </span>
                      )}
                    </div>
                  </button>
                );
                });
              })()}
            </div>
          )}

          {/* ════ RECORD — the care record, one page, no sub-tabs ════ */}
          {tab === "Record" && (
            <div className="flex flex-col gap-3">
              <RecordHeading
                action={
                  <button
                    type="button"
                    aria-label="Add allergy"
                    onClick={() => {
                      setAlName(""); setAlType("Non-drug"); setAlReaction(null); setAlSeverity("Mild"); setAlNote("");
                      setAllergyOpen(true);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-navy shadow-[0_1px_4px_rgba(8,7,6,0.04)]"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                }
              >
                Allergies
              </RecordHeading>
              {allergies.length === 0 && (
                <p className="rounded-2xl bg-white p-4 text-[13px] text-muted shadow-[0_1px_4px_rgba(8,7,6,0.04)]">No known allergies.</p>
              )}
              {allergies.map((al) => {
                const expandedNow = expandedAllergy === al.name;
                return (
                  <button
                    key={al.name}
                    type="button"
                    onClick={() => setExpandedAllergy(expandedNow ? null : al.name)}
                    className="rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(8,7,6,0.04)]"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                        <AlertTriangle size={13} strokeWidth={2} className={al.severity === "Severe" || al.severity === "Fatal" ? "text-danger" : "text-secondary"} />
                        {al.name}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityTone[al.severity]}`}>
                        {al.severity}
                      </span>
                    </span>
                    <span className="block pt-0.5 text-[12px] text-muted">
                      {al.type === "Note"
                        ? al.note || "Care note"
                        : `${al.type} allergy${al.reaction !== "—" ? ` · Reaction: ${al.reaction.toLowerCase()}` : ""}`}
                    </span>
                    {expandedNow && (
                      <span className="mt-2 block border-t border-border pt-2">
                        {al.note && al.type !== "Note" && (
                          <span className="block pb-2 text-[12px] leading-snug text-secondary">{al.note}</span>
                        )}
                        <span className="flex items-center justify-between">
                          <span className="text-[11px] text-muted">Added 15 Jan 2024 · flagged on every booking</span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAllergies((a) => a.filter((x) => x.name !== al.name));
                            }}
                            className="text-[11px] font-semibold text-danger"
                          >
                            Remove
                          </span>
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setPtTitle(""); setPtDay(null); setPtPickDate(false);
                      setPtStaff(null); setPtStatus("Pending"); setPtDesc("");
                      setPtOpen(true);
                    }}
                    className="rounded-full bg-fg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Record new
                  </button>
                }
              >
                Patch tests
              </RecordHeading>
              {patchTests.map((pt, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                      <FlaskConical size={14} strokeWidth={1.75} className="text-secondary" />
                      {pt.title}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${patchTone[pt.status]}`}>{pt.status}</span>
                  </div>
                  <p className="pt-1 text-[12px] text-muted">{pt.date} · {pt.staff}</p>
                  {pt.desc && <p className="pt-1.5 text-[13px] leading-snug text-navy">{pt.desc}</p>}
                </div>
              ))}

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => { setNoteDraft(""); setNoteAppt("General"); setNotePhotos(0); setNoteDay(null); setNotePickDate(false); setNoteApptOpen(false); setNoteOpen(true); }}
                    className="rounded-full bg-fg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Add note
                  </button>
                }
              >
                Notes & images
              </RecordHeading>
              {notes.map((n, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12px] font-semibold text-navy">
                      <StickyNote size={13} strokeWidth={1.75} className="text-secondary" />
                      {n.appt ?? "General note"}
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
                </div>
              ))}

              <RecordHeading>Packages &amp; subscriptions</RecordHeading>
              {clientEntitlements.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 text-[13px] text-muted shadow-[0_1px_4px_rgba(8,7,6,0.04)]">No package or subscription sessions recorded.</p>
              ) : (
                clientEntitlements.map((e) => {
                  const adjust = sessionAdjust[e.id] ?? 0;
                  const remaining = Math.max(0, e.remaining + adjust);
                  return (
                    <div key={e.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-[14px] font-bold text-navy">{e.name}</span>
                          <span className="block pt-0.5 text-[12px] text-muted">
                            {e.kind === "subscription" ? "Subscription" : "Package"} · purchased {e.purchased} · used {e.used}
                          </span>
                        </span>
                        <span className="rounded-full bg-fg-primary/10 px-2.5 py-1 text-[11px] font-bold text-navy">{remaining} left</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-3 py-2.5">
                        <span className="text-[12px] text-secondary">Manual adjustment</span>
                        <span className="flex items-center gap-3">
                          <button type="button" aria-label="Reduce sessions" onClick={() => setSessionAdjust((s) => ({ ...s, [e.id]: (s[e.id] ?? 0) - 1 }))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy">−</button>
                          <span className="w-6 text-center text-[13px] font-bold text-navy">{adjust > 0 ? `+${adjust}` : adjust}</span>
                          <button type="button" aria-label="Add sessions" onClick={() => setSessionAdjust((s) => ({ ...s, [e.id]: (s[e.id] ?? 0) + 1 }))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy">+</button>
                        </span>
                      </div>
                      <p className="pt-2 text-[11px] text-muted">Use when importing packages from a previous system or correcting session counts.</p>
                    </div>
                  );
                })
              )}

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => { setFormPick(null); setFormOpen(true); }}
                    className="rounded-full bg-fg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Send form
                  </button>
                }
              >
                Forms
              </RecordHeading>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted">4 forms across all appointments</p>
                <span className="flex gap-1.5">
                  <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">1 pending</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-muted">1 not sent</span>
                </span>
              </div>
              {clientForms.map((f) => (
                <div key={f.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <FileText size={17} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{f.name}</span>
                    <span className="block pt-0.5 text-[12px] text-muted">{sharedForms.includes(f.id) ? "Shared by native sheet" : f.meta}</span>
                    <span className="block pt-1 text-[11px] text-muted">⎘ {f.appt}</span>
                  </span>
                  {f.state === "view" && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-semibold text-navy">
                        <Eye size={12} strokeWidth={2} /> View
                      </button>
                      <button aria-label={`Download ${f.name}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-navy">
                        <Download size={13} strokeWidth={2} />
                      </button>
                      <button
                        aria-label={`Share ${f.name}`}
                        onClick={() => setSharedForms((s) => (s.includes(f.id) ? s : [...s, f.id]))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-navy"
                      >
                        <Share2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                  {f.state === "remind" && (
                    <button
                      onClick={() => setReminded(true)}
                      disabled={reminded}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${
                        reminded ? "bg-canvas text-muted" : "bg-[#FEF3C7] text-[#B45309]"
                      }`}
                    >
                      {reminded ? <Check size={12} strokeWidth={2.5} /> : <Bell size={12} strokeWidth={2} />}
                      {reminded ? "Reminded" : "Remind"}
                    </button>
                  )}
                  {f.state === "not-sent" && (
                    <span className="shrink-0 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-medium text-muted">Not Sent</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Pinned action bar (Figma): Contact opens the sheet, Book is the CTA ── */}
      <div className="sticky bottom-0 z-20 mt-3 flex gap-2.5 border-t border-border bg-white px-4 pb-4 pt-3">
        <GhostButton className="!h-12 flex-1 !text-[14px]" onClick={() => { setNumberCopied(false); setContactOpen(true); }}>
          <MessageSquare size={15} />
          Contact
        </GhostButton>
        <DarkButton className="!h-12 flex-1 !text-[14px]" onClick={() => setQuickAction("appointment")}>
          <CalendarPlus size={15} />
          Book now
        </DarkButton>
      </div>

      {/* ── Sheets ── */}

      <Sheet open={upcomingOpen} onClose={() => setUpcomingOpen(false)} title="Upcoming appointments" sub={`${details.name} · ${clientUpcomingAppointments.length} booked`} full>
        <div className="flex gap-2 pb-3">
          <div className="relative flex-1">
            <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={upcomingSearch}
              onChange={(e) => setUpcomingSearch(e.target.value)}
              placeholder="Search upcoming..."
              className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setUpcomingSort((s) => (s === "Soonest" ? "Highest £" : "Soonest"))}
            className="rounded-full border border-border px-3 text-[12px] font-semibold text-navy"
          >
            {upcomingSort}
          </button>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none]">
          {["All", "Confirmed", "Pending", "Recurring"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setUpcomingFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                upcomingFilter === f ? "bg-fg-primary text-white" : "border border-border bg-white text-navy"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {clientUpcomingAppointments
            .filter((a) => upcomingFilter === "All" || a.status === upcomingFilter.toLowerCase())
            .filter((a) => `${a.service} ${a.staff} ${a.date}`.toLowerCase().includes(upcomingSearch.toLowerCase()))
            .sort((a, b) => upcomingSort === "Highest £" ? b.price - a.price : a.date.localeCompare(b.date))
            .map((appt) => (
              <button key={appt.id} type="button" onClick={() => { openUpcoming(appt); setUpcomingOpen(false); }} className="rounded-2xl border border-border bg-white p-4 text-left">
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-navy">{appt.service}</span>
                    <span className="block pt-0.5 text-[12px] text-muted">{appt.date} · {appt.time} · {appt.staff}</span>
                  </span>
                  <span className="shrink-0 text-[14px] font-bold text-navy">£{appt.price}</span>
                </span>
              </button>
            ))}
        </div>
      </Sheet>

      {/* 3-dot: profile-level actions only */}
      <Sheet open={actionsOpen} onClose={() => setActionsOpen(false)} title={details.name} sub="Profile actions">
        <div className="flex flex-col gap-2 pt-1">
          {[
            { icon: <Pencil size={15} />, t: "Edit details", run: () => { setEditName(details.name); setEditPhone(details.phone); setEditEmail(details.email); setActionsOpen(false); setEditOpen(true); } },
            { icon: <TagIcon size={15} />, t: "Add tags", run: () => { setActionsOpen(false); setTagQuery(""); setTagSheetOpen(true); } },
            { icon: <MessageSquare size={15} />, t: messageBlocked ? "Unblock messages" : "Block messages", run: () => { setMessageBlocked((b) => !b); setActionsOpen(false); } },
            { icon: <Ban size={15} />, t: blocked ? "Unblock client" : "Block client", run: () => { setBlocked((b) => !b); setActionsOpen(false); } },
          ].map((a) => (
            <button key={a.t} onClick={a.run} className="flex w-full items-center gap-2.5 rounded-2xl border border-border bg-white px-4 py-3.5 text-left text-[13px] font-semibold text-navy">
              <span className="text-secondary">{a.icon}</span>
              {a.t}
            </button>
          ))}
          <button
            onClick={() => { setActionsOpen(false); setDeleteOpen(true); }}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-danger/40 bg-white px-4 py-3.5 text-left text-[13px] font-semibold text-danger"
          >
            <Trash2 size={15} />
            Delete client
          </button>
        </div>
        <div className="h-2" />
      </Sheet>

      {/* Edit client details */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit details" sub="Updates the client profile">
        <label className="block pb-4">
          <span className="mb-2 block text-[13px] font-medium text-navy">Full name</span>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className={field} />
        </label>
        <label className="block pb-4">
          <span className="mb-2 block text-[13px] font-medium text-navy">Mobile</span>
          <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" className={field} />
        </label>
        <label className="block pb-5">
          <span className="mb-2 block text-[13px] font-medium text-navy">Email</span>
          <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email address" inputMode="email" className={field} />
        </label>
        <DarkButton
          disabled={!editName.trim()}
          onClick={() => { setDetails({ name: editName.trim(), phone: editPhone.trim(), email: editEmail.trim() }); setEditOpen(false); }}
        >
          Save changes
        </DarkButton>
        <div className="h-2" />
      </Sheet>

      {/* Add tags — search, pick, or create your own */}
      <Sheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title="Tags" sub="Search, pick or create your own" full>
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
            onClick={() => { setTags((t) => [...t, tagQuery.trim()]); setTagQuery(""); }}
            className="mb-1 flex w-full items-center gap-3 rounded-xl border border-dashed border-border py-3.5 pl-4 text-left"
          >
            <Plus size={16} strokeWidth={2} className="text-navy" />
            <span className="text-[15px] font-semibold text-navy">Create &ldquo;{tagQuery.trim()}&rdquo;</span>
          </button>
        )}
        <div className="flex flex-col">
          {tagMatches.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
                className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0"
              >
                <span className="flex items-center gap-3 text-[15px] font-medium text-navy">
                  <TagIcon size={15} strokeWidth={1.7} className="text-secondary" />
                  {t}
                </span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${on ? "border-fg-primary bg-fg-primary text-white" : "border-border text-transparent"}`}>
                  <Check size={13} strokeWidth={3} />
                </span>
              </button>
            );
          })}
          {tagMatches.length === 0 && !canCreateTag && <p className="py-6 text-center text-[13px] text-muted">No tags found</p>}
        </div>
        <div className="pt-5">
          <DarkButton onClick={() => setTagSheetOpen(false)}>Done</DarkButton>
        </div>
        <div className="h-2" />
      </Sheet>

      {/* Delete confirm */}
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title={`Delete ${details.name}?`}>
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          Their bookings, notes and documents will be removed after 30 days. This can be undone from Settings until then.
        </p>
        <DarkButton onClick={() => router.push("/app/clients")}>Delete client</DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setDeleteOpen(false)}>Keep</GhostButton>
        </div>
      </Sheet>

      {/* Add allergy — free-text name, reaction picked from a full dropdown,
          severity set on a slider */}
      <Sheet
        open={allergyOpen}
        onClose={() => setAllergyOpen(false)}
        title={alType === "Note" ? "Add a note" : "Add an allergy"}
        sub={alType === "Note" ? "A care note kept on the client's record" : "Flagged on every booking and checkout"}
        full
      >
        <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Type</p>
        <div className="flex gap-2">
          {(["Drug", "Non-drug", "Note"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAlType(t)}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                alType === t ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {alType === "Note" ? "What's the note about?" : "What are they allergic to?"}
        </p>
        <input
          value={alName}
          onChange={(e) => setAlName(e.target.value)}
          placeholder={alType === "Note" ? "e.g. Sensitive scalp, runs late..." : "Name the allergy..."}
          className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />

        {alType === "Note" ? (
          <>
            <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Details (optional)</p>
            <textarea
              value={alNote}
              onChange={(e) => setAlNote(e.target.value)}
              placeholder="Anything the team should know..."
              className="h-24 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </>
        ) : (
          <>
            <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Reaction</p>
            <button
              type="button"
              onClick={() => setReactOpen((o) => !o)}
              className="flex h-12 w-full items-center justify-between rounded-xl bg-canvas px-4 text-left"
            >
              <span className={`text-[14px] ${alReaction ? "font-semibold text-navy" : "text-muted"}`}>
                {alReaction ?? "Select a reaction"}
              </span>
              <motion.span animate={{ rotate: reactOpen ? 180 : 0 }} className="flex text-muted">
                <ChevronDown size={15} strokeWidth={1.75} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {reactOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border">
                    {reactionOptions.map((rx) => (
                      <button
                        key={rx}
                        type="button"
                        onClick={() => { setAlReaction(rx); setReactOpen(false); }}
                        className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-[14px] last:border-0 ${
                          alReaction === rx ? "bg-canvas font-semibold text-navy" : "text-navy"
                        }`}
                      >
                        {rx}
                        {alReaction === rx && <Check size={14} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-baseline justify-between pb-1 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Severity</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${severityTone[alSeverity]}`}>{alSeverity}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={severities.indexOf(alSeverity)}
              onChange={(e) => setAlSeverity(severities[Number(e.target.value)])}
              aria-label="Severity"
              className="w-full accent-fg-primary"
            />
            <div className="flex justify-between pt-1">
              {severities.map((sv) => (
                <span
                  key={sv}
                  className={`text-[11px] ${
                    alSeverity === sv
                      ? sv === "Severe" || sv === "Fatal" ? "font-bold text-danger" : "font-bold text-navy"
                      : "text-muted"
                  }`}
                >
                  {sv}
                </span>
              ))}
            </div>

            <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Notes (optional)</p>
            <textarea
              value={alNote}
              onChange={(e) => setAlNote(e.target.value)}
              placeholder="Products to avoid, last reaction, anything the team should know..."
              className="h-20 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </>
        )}

        <div className="pt-6">
          <DarkButton
            disabled={!alName.trim()}
            onClick={() => {
              setAllergies((a) => [
                ...a,
                {
                  name: alName.trim(),
                  type: alType,
                  reaction: alType === "Note" ? "—" : alReaction ?? "—",
                  severity: alType === "Note" ? "Mild" : alSeverity,
                  note: alNote.trim() || undefined,
                },
              ]);
              setAllergyOpen(false);
            }}
          >
            {alType === "Note"
              ? "Save note"
              : alName.trim() ? `Save ${alName.trim()} · ${alSeverity}` : "Save allergy"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Record a patch test — title, date, tester, status, notes */}
      <Sheet open={ptOpen} onClose={() => setPtOpen(false)} title="Record a patch test" sub={`Kept on ${firstName}'s record with the result`} full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">What was tested?</p>
        <input
          value={ptTitle}
          onChange={(e) => setPtTitle(e.target.value)}
          placeholder="e.g. Colour patch test, lash adhesive..."
          className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Test date</p>
        <div className="flex gap-2">
          {["Today · 4 Mar", "Pick a date"].map((d, i) => {
            const on = i === 0 ? !ptPickDate : ptPickDate;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setPtPickDate(i === 1);
                  if (i === 0) setPtDay(null);
                }}
                className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                  on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                }`}
              >
                {i === 1 && ptDay ? `${ptDay} Mar 2026` : d}
              </button>
            );
          })}
        </div>
        {ptPickDate && (
          <div className="pt-3">
            <MiniCalendar selected={ptDay} onSelect={setPtDay} />
          </div>
        )}
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Tested by</p>
        <div className="flex flex-wrap gap-2">
          {staffMembers.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPtStaff(m)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                ptStaff === m ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Status</p>
        <div className="flex gap-2">
          {(["Pending", "Passed", "Failed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setPtStatus(st)}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                ptStatus === st
                  ? st === "Failed"
                    ? "border-danger bg-danger text-white"
                    : "border-fg-primary bg-fg-primary text-white"
                  : "border-border bg-white text-navy"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Notes</p>
        <textarea
          value={ptDesc}
          onChange={(e) => setPtDesc(e.target.value)}
          placeholder="Where it was applied, what to watch for, when to check..."
          className="h-20 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="pt-5">
          <DarkButton
            disabled={!ptTitle.trim() || !ptStaff}
            onClick={() => {
              setPatchTests((x) => [
                {
                  title: ptTitle.trim(),
                  date: ptDay ? `${ptDay} Mar 2026` : "Today · 4 Mar 2026",
                  staff: ptStaff ?? "",
                  status: ptStatus,
                  desc: ptDesc.trim() || undefined,
                },
                ...x,
              ]);
              setPtOpen(false);
            }}
          >
            {ptTitle.trim() && ptStaff ? `Save · ${ptStatus.toLowerCase()}` : "Fill in the test first"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Next appointment options */}
      <Sheet open={nextApptMenu} onClose={() => setNextApptMenu(false)} title="Next appointment" sub="Cut & Style · 18 Mar 2026 · Emma S.">
        <div className="flex flex-col pt-1">
          {[
            { icon: <RotateCcw size={16} strokeWidth={1.8} />, t: "Reschedule", run: () => setResched(true) },
            {
              icon: <CalendarPlus size={16} strokeWidth={1.8} />, t: "Open booking",
              run: () => setApptSheet({
                client: details.name, initials, service: "Cut & Style",
                staff: "Emma S.", time: "10:00 AM", duration: "60m", price: 85, status: "Confirmed",
              }),
            },
          ].map((q) => (
            <button
              key={q.t}
              type="button"
              onClick={() => { setNextApptMenu(false); q.run(); }}
              className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left text-[15px] font-medium text-navy"
            >
              <span className="text-secondary">{q.icon}</span>
              {q.t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setNextApptMenu(false); setCancel(true); }}
            className="flex w-full items-center gap-3.5 py-3.5 text-left text-[15px] font-medium text-danger"
          >
            <X size={16} strokeWidth={2} />
            Cancel appointment
          </button>
        </div>
        <div className="h-2" />
      </Sheet>

      {/* Booking detail (past appointment) */}
      <Sheet
        open={bookingSel !== null}
        onClose={() => setBookingSel(null)}
        title={bookingSel?.name ?? ""}
        sub={bookingSel?.meta}
      >
        {bookingSel && (
          <>
            <div className="flex items-center gap-2 pb-3">
              <StatusPill>{bookingSel.status}</StatusPill>
              {bookingSel.id === "p3" && <StatusPill tone="amber">£75 unpaid</StatusPill>}
            </div>
            <p className="pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Notes from this visit</p>
            <div className="rounded-xl bg-canvas p-3.5">
              <p className="text-[13px] leading-snug text-navy">
                {bookingSel.id === "p1"
                  ? "Toner 9V for 20 mins. Scalp fine after patch test."
                  : "Standard service, no issues. Discussed next visit."}
              </p>
              <p className="pt-1.5 text-[11px] text-muted">{bookingSel.meta.split(" · ")[0]} · Emma S.</p>
            </div>
            {bookingSel.docs > 0 && (
              <>
                <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Attached</p>
                {Array.from({ length: bookingSel.docs }, (_, i) => (
                  <p key={i} className="flex items-center gap-2.5 border-b border-border py-2.5 text-[13px] text-navy last:border-0">
                    <FileText size={14} className="text-secondary" />
                    {i === 0 ? "Consultation form" : i === 1 ? "Aftercare instructions" : "Before / after photos"}
                    <span className="ml-auto text-[12px] font-semibold text-secondary">View</span>
                  </p>
                ))}
              </>
            )}
            <div className="flex flex-col gap-2.5 pt-5">
              {bookingSel.id === "p3" && (
                <DarkButton onClick={() => { setBookingSel(null); router.push("/app/checkout"); }}>
                  Take £75 payment
                </DarkButton>
              )}
              <GhostButton onClick={() => { setBookingSel(null); setQuickAction("appointment"); }}>
                <Repeat size={15} />
                Rebook this appointment
              </GhostButton>
            </div>
          </>
        )}
      </Sheet>

      {/* Add clinical note */}
      <Sheet open={noteOpen} onClose={() => setNoteOpen(false)} title="Add note" sub={`Timestamped on ${firstName}'s record`}>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Linked to</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setNoteApptOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={noteApptOpen}
            className="flex h-12 w-full items-center justify-between rounded-xl bg-canvas px-4 text-left"
          >
            <span className="text-[14px] font-semibold text-navy">{noteAppt ?? "General"}</span>
            <motion.span animate={{ rotate: noteApptOpen ? 180 : 0 }} className="flex text-muted">
              <ChevronDown size={15} strokeWidth={1.75} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {noteApptOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border">
                  {noteLinkOptions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => { setNoteAppt(o); setNoteApptOpen(false); }}
                      className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-[14px] last:border-0 ${
                        noteAppt === o ? "bg-canvas font-semibold text-navy" : "text-navy"
                      }`}
                    >
                      {o}
                      {noteAppt === o && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {noteAppt === "General" && (
          <>
            <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Date</p>
            <div className="flex gap-2">
              {["Today · 4 Mar", "Pick a date"].map((d, i) => {
                const on = i === 0 ? !notePickDate : notePickDate;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setNotePickDate(i === 1);
                      if (i === 0) setNoteDay(null);
                    }}
                    className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                      on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                    }`}
                  >
                    {i === 1 && noteDay ? `${noteDay} Mar 2026` : d}
                  </button>
                );
              })}
            </div>
            {notePickDate && (
              <div className="pt-3">
                <MiniCalendar selected={noteDay} onSelect={setNoteDay} />
              </div>
            )}
          </>
        )}
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Products used, formulas, observations, follow-up needed..."
          className="mt-4 h-24 w-full resize-none rounded-xl bg-canvas p-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setNotePhotos((p) => p + 1)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-[13px] font-medium text-secondary"
        >
          <Camera size={15} strokeWidth={1.75} />
          {notePhotos > 0 ? `${notePhotos} photo${notePhotos > 1 ? "s" : ""} attached · add another` : "Add before / after photos"}
        </button>
        <div className="pt-5">
          <DarkButton
            disabled={!noteDraft.trim() && notePhotos === 0}
            onClick={() => {
              setNotes((n) => [
                {
                  date: noteDay ? `${noteDay} Mar 2026` : "Today · 4 Mar 2026",
                  appt: noteAppt === "General" ? null : noteAppt,
                  note: noteDraft.trim() || "Photos attached.",
                  imgs: notePhotos,
                },
                ...n,
              ]);
              setNoteOpen(false);
            }}
          >
            Save to record
          </DarkButton>
        </div>
      </Sheet>

      {/* Reschedule */}
      <Sheet open={resched} onClose={() => setResched(false)} title="Reschedule" sub={`${details.name} · Cut & Style · Emma S.`} full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a day</p>
        <MiniCalendar selected={day} onSelect={setDay} />
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Pick a time</p>
        <TimeChips value={time} onSelect={setTime} />
        <div className="pt-6">
          <DarkButton
            disabled={!day || !time}
            onClick={() => {
              setMoved(`Sat ${day} Mar, ${time}`);
              setResched(false);
            }}
          >
            {day && time ? `Confirm · Sat ${day} Mar, ${time}` : "Confirm new time"}
          </DarkButton>
        </div>
      </Sheet>

      {/* Cancel */}
      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel this appointment?">
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          {details.name} · Cut & Style · Emma S. on 18 Mar. We&rsquo;ll let them know and free up the slot.
        </p>
        <DarkButton
          onClick={() => {
            setCancelled(true);
            setCancel(false);
          }}
        >
          Cancel appointment
        </DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setCancel(false)}>Keep it</GhostButton>
        </div>
      </Sheet>

      {/* Contact — info + actions in one place */}
      <Sheet open={contactOpen} onClose={() => setContactOpen(false)} title={`Contact ${firstName}`}>
        <div className="rounded-2xl bg-canvas p-1">
          {[
            [<Phone key="p" size={14} strokeWidth={1.75} />, details.phone],
            [<Mail key="m" size={14} strokeWidth={1.75} />, details.email],
            [<MapPin key="a" size={14} strokeWidth={1.75} />, "14 Maple Lane, London"],
          ].map(([icon, v], i) => (
            <p key={i} className={`flex items-center gap-3 px-3.5 py-3 text-[14px] text-navy ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="text-secondary">{icon}</span>
              {v}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          <DarkButton onClick={() => setContactOpen(false)}>
            <Phone size={15} />
            Call {details.phone}
          </DarkButton>
          <GhostButton onClick={() => setContactOpen(false)}>
            <MessageCircle size={15} />
            WhatsApp {firstName}
          </GhostButton>
          <GhostButton
            onClick={() => {
              setContactOpen(false);
              router.push("/app/messages/sarah");
            }}
          >
            <MessageSquare size={15} />
            Send a message
          </GhostButton>
          <GhostButton onClick={() => setNumberCopied(true)}>
            {numberCopied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} />}
            {numberCopied ? "Number copied" : "Copy number"}
          </GhostButton>
        </div>
      </Sheet>

      {/* Send new form */}
      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Send a form" sub={`${firstName} will get it by SMS and email`}>
        {formTemplates.map((t) => {
          const sent = formSent.includes(t);
          return (
            <button
              key={t}
              type="button"
              disabled={sent}
              onClick={() => setFormPick(t)}
              className="flex w-full items-center gap-3 border-b border-border py-3.5 text-left last:border-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-secondary">
                <FileText size={16} strokeWidth={1.6} />
              </span>
              <span className={`flex-1 text-[14px] font-semibold ${sent ? "text-muted" : "text-navy"}`}>{t}</span>
              {sent ? (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-muted">
                  <Check size={13} strokeWidth={2.5} /> Sent
                </span>
              ) : (
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    formPick === t ? "border-fg-primary bg-fg-primary text-white" : "border-border"
                  }`}
                >
                  {formPick === t && <Check size={11} strokeWidth={3} />}
                </span>
              )}
            </button>
          );
        })}
        <div className="pt-4">
          <DarkButton
            disabled={!formPick}
            onClick={() => {
              if (formPick) setFormSent((x) => [...x, formPick]);
              setFormOpen(false);
            }}
          >
            {formPick ? `Send ${formPick}` : "Pick a form"}
          </DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
