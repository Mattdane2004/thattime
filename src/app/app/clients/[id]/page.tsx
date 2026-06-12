"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Star, CalendarPlus, MessageSquare, Phone, Plus,
  RotateCcw, X, Search, SlidersHorizontal, ChevronDown, FileText, Eye, Bell,
  MapPin, Mail, Copy, Check, MoreVertical, Ban, Trash2, Merge,
  Tag as TagIcon, AlertTriangle, StickyNote, Wallet, Settings, ChevronRight,
  Camera, Image as ImageIcon, Repeat, Pencil, FlaskConical,
} from "lucide-react";
import { Segmented, DarkButton, GhostButton, Sheet, MiniCalendar, TimeChips, StatusPill } from "@/components/app/ui";
import { useAppStore } from "@/lib/store/appStore";
import { pastAppointments, clientForms } from "@/lib/data/product";

// Client detail, organised by job-to-be-done:
//   Overview     — the dashboard: safety strip, next appointment, a
//                  needs-attention rail, and links to the dedicated
//                  wallet / reviews / settings pages (contact is a sheet)
//   Appointments — upcoming + searchable history with booking detail sheet
//   Record       — the care record: allergies, patch tests, notes & images, forms
// The 3-dot menu holds profile-level actions only (edit / VIP / merge /
// block / delete).

function NextAppointmentCard({ onReschedule, onCancel, moved }: { onReschedule: () => void; onCancel: () => void; moved: string | null }) {
  return (
    <div className="rounded-3xl bg-[#14181F] p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold">
          {moved ? `Moved · ${moved}` : "Next appointment"}
        </span>
        <ChevronDown size={15} className="-rotate-90 text-white/50" />
      </div>
      <p className="pt-3 text-[18px] font-bold">Cut & Style</p>
      <p className="pt-0.5 text-[13px] text-white/60">18 Mar 2026 · Emma S. · 60min · £85</p>
      <div className="flex gap-2.5 pt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onReschedule}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/12 text-[13px] font-semibold"
        >
          <RotateCcw size={13} />
          Reschedule
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCancel}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/12 text-[13px] font-semibold"
        >
          <X size={14} />
          Cancel
        </motion.button>
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
}

const severityTone: Record<Allergy["severity"], string> = {
  Mild: "bg-canvas text-secondary",
  Moderate: "bg-[#FEF3C7] text-[#B45309]",
  Severe: "bg-[#FFE4DC] text-[#C2410C]",
  Fatal: "bg-danger text-white",
};

const reactionOptions = ["Itching", "Rash", "Swelling", "Dizziness", "Coughing", "Chills", "Breathing difficulty"];

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
  const [tab, setTab] = useState("Overview");

  // Next-appointment actions
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
  const [reminded, setReminded] = useState(false);

  // 3-dot actions
  const [actionsOpen, setActionsOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [tags, setTags] = useState<string[]>(["Regular"]);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
  const [patchRecorded, setPatchRecorded] = useState(false);

  // Appointments
  const [bookingSel, setBookingSel] = useState<(typeof pastAppointments)[number] | null>(null);

  const unpaid = pastAppointments.find((p) => p.id === "p3");
  const severe = allergies.some((a) => a.severity === "Severe" || a.severity === "Fatal");

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
    <div className="min-h-full bg-fog pb-6">
      {/* ── Header: identity, primary actions, stats — generous spacing ── */}
      <div className="bg-white px-5 pb-6">
        <div className="-mx-1 flex items-center justify-between pt-4">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1 text-navy">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Client actions"
            onClick={() => setActionsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <MoreVertical size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-canvas text-[20px] font-semibold text-muted">
            SJ
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-[22px] font-bold text-navy">Sarah Johnson</h1>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${blocked ? "bg-danger text-white" : "bg-[#14181F] text-white"}`}>
                {blocked ? "Blocked" : "Active"}
              </span>
            </div>
            <span className="mt-1.5 flex items-center gap-2 text-[13px] font-medium text-navy">
              <span className="flex items-center gap-1"><Star size={13} className="fill-current" /> 4.8</span>
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-secondary">{t}</span>
              ))}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 pt-6">
          <DarkButton className="!h-11 flex-[1.2] !text-[14px]" onClick={() => setQuickAction("appointment")}>
            <CalendarPlus size={15} />
            Book
          </DarkButton>
          <GhostButton className="!h-11 flex-1 !text-[14px]" onClick={() => router.push("/app/messages/sarah")}>
            <MessageSquare size={15} />
            Message
          </GhostButton>
          <GhostButton
            className="!h-11 !w-12 shrink-0"
            ariaLabel="Contact options"
            onClick={() => {
              setNumberCopied(false);
              setContactOpen(true);
            }}
          >
            <Phone size={15} />
          </GhostButton>
        </div>

        {/* Stats breathe on their own line — no boxes */}
        <div className="flex divide-x divide-border pt-6">
          {[
            ["Last Visit", "3 Mar 2026"],
            ["Total Bookings", "24"],
            ["Total Sales", "£1,870"],
          ].map(([k, v]) => (
            <div key={k} className="flex-1 text-center first:pl-0 last:pr-0">
              <p className="text-[11px] text-muted">{k}</p>
              <p className="pt-1 text-[14px] font-bold text-navy">{v}</p>
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
          {/* ════ OVERVIEW — a dashboard: what's next, what needs doing, where to go ════ */}
          {tab === "Overview" && (
            <div className="flex flex-col gap-4">
              {/* Safety first: one slim line, taps through to the record */}
              <button
                type="button"
                onClick={() => setTab("Record")}
                className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)] ${
                  severe ? "border-danger/40" : "border-border"
                }`}
              >
                <AlertTriangle size={16} strokeWidth={2} className={severe ? "shrink-0 text-danger" : "shrink-0 text-secondary"} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-navy">Allergies</span>
                  <span className="block truncate pt-0.5 text-[12px] text-secondary">
                    {allergies.length
                      ? allergies.map((a) => `${a.name} · ${a.severity}`).join("   ")
                      : "None recorded — tap to add"}
                  </span>
                </span>
                <ChevronRight size={14} className="shrink-0 text-muted" />
              </button>

              {/* What's next lives at the top of the dashboard */}
              {!cancelled && (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}

              {/* Needs attention: a glanceable horizontal rail, one card per item */}
              {attention.length > 0 && (
                <div>
                  <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Needs attention · {attention.filter((a) => !a.done).length}
                  </p>
                  <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                    {attention.map((a) => (
                      <div key={a.id} className="flex w-[185px] shrink-0 flex-col rounded-2xl bg-white p-3.5 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
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
                                : "bg-[#14181F] text-white"
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

              {/* Wallet, reviews and settings are full pages now; contact stays a sheet */}
              <div>
                <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Manage</p>
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  {[
                    { icon: <Wallet size={15} strokeWidth={1.75} />, t: "Wallet & loyalty", s: "£25 credit · 320 pts · 2 rewards", run: () => router.push(`/app/clients/${clientId}/wallet`) },
                    { icon: <Star size={15} strokeWidth={1.75} />, t: "Reviews", s: "4.7 · 3 reviews · 1 awaiting reply", run: () => router.push(`/app/clients/${clientId}/reviews`) },
                    { icon: <Settings size={15} strokeWidth={1.75} />, t: "Settings & policies", s: "Booking rules, payments, marketing", run: () => router.push(`/app/clients/${clientId}/settings`) },
                    { icon: <Phone size={15} strokeWidth={1.75} />, t: "Contact details", s: "(555) 234-5678 · sarah.j@email.com", run: () => { setNumberCopied(false); setContactOpen(true); } },
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
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <span className="text-[13px] text-muted">No upcoming appointments.</span>
                  <button onClick={() => setQuickAction("appointment")} className="rounded-full bg-[#14181F] px-3.5 py-2 text-[12px] font-semibold text-white">
                    Book
                  </button>
                </div>
              ) : (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}

              <RecordHeading>History · {pastAppointments.length}</RecordHeading>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    placeholder="Search service, date, staff..."
                    className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-[13px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)] focus:outline-none"
                  />
                </div>
                <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-medium text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <SlidersHorizontal size={13} strokeWidth={1.75} />
                  All
                  <ChevronDown size={12} className="text-muted" />
                </button>
              </div>
              {pastAppointments.map((p) => {
                const isUnpaid = p.id === "p3";
                return (
                  <button key={p.id} type="button" onClick={() => setBookingSel(p)} className="rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
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
              })}
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
                      setAlName(""); setAlType("Non-drug"); setAlReaction(null); setAlSeverity("Mild");
                      setAllergyOpen(true);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                }
              >
                Allergies
              </RecordHeading>
              {allergies.length === 0 && (
                <p className="rounded-2xl bg-white p-4 text-[13px] text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)]">No known allergies.</p>
              )}
              {allergies.map((al) => {
                const expandedNow = expandedAllergy === al.name;
                return (
                  <button
                    key={al.name}
                    type="button"
                    onClick={() => setExpandedAllergy(expandedNow ? null : al.name)}
                    className="rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
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
                      {al.type === "Note" ? "Note" : `${al.type} allergy`}{al.reaction !== "—" ? ` · Reaction: ${al.reaction.toLowerCase()}` : ""}
                    </span>
                    {expandedNow && (
                      <span className="mt-2 flex items-center justify-between border-t border-border pt-2">
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
                    )}
                  </button>
                );
              })}

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => setPatchRecorded(true)}
                    disabled={patchRecorded}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${patchRecorded ? "bg-white text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)]" : "bg-[#14181F] text-white"}`}
                  >
                    {patchRecorded ? "Recorded" : "Record new"}
                  </button>
                }
              >
                Patch tests
              </RecordHeading>
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                    <FlaskConical size={14} strokeWidth={1.75} className="text-secondary" />
                    Colour patch test
                  </span>
                  <span className="rounded-full bg-[#E8F6EE] px-2.5 py-1 text-[10px] font-semibold text-[#157347]">Passed</span>
                </div>
                <p className="pt-1 text-[12px] text-muted">1 Mar 2026 · valid for 6 months · Emma S.</p>
              </div>
              {patchRecorded && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                      <FlaskConical size={14} strokeWidth={1.75} className="text-secondary" />
                      Colour patch test
                    </span>
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-muted">Result pending</span>
                  </div>
                  <p className="pt-1 text-[12px] text-muted">Today · 4 Mar 2026 · check after 48h</p>
                </div>
              )}

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => { setNoteDraft(""); setNoteAppt("General"); setNotePhotos(0); setNoteOpen(true); }}
                    className="rounded-full bg-[#14181F] px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Add note
                  </button>
                }
              >
                Notes & images
              </RecordHeading>
              {notes.map((n, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
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

              <RecordHeading
                action={
                  <button
                    type="button"
                    onClick={() => { setFormPick(null); setFormOpen(true); }}
                    className="rounded-full bg-[#14181F] px-3 py-1.5 text-[11px] font-bold text-white"
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
                <div key={f.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <FileText size={17} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{f.name}</span>
                    <span className="block pt-0.5 text-[12px] text-muted">{f.meta}</span>
                    <span className="block pt-1 text-[11px] text-muted">⎘ {f.appt}</span>
                  </span>
                  {f.state === "view" && (
                    <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-semibold text-navy">
                      <Eye size={12} strokeWidth={2} /> View
                    </button>
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

      {/* ── Sheets ── */}

      {/* 3-dot: profile-level actions only */}
      <Sheet open={actionsOpen} onClose={() => setActionsOpen(false)} title="Sarah Johnson" sub="Profile actions">
        <div className="flex flex-col gap-2 pt-1">
          {[
            { icon: <Pencil size={15} />, t: "Edit details", run: () => setActionsOpen(false) },
            { icon: <TagIcon size={15} />, t: tags.includes("VIP") ? "VIP tag added ✓" : "Add VIP tag", run: () => setTags((t) => (t.includes("VIP") ? t : [...t, "VIP"])) },
            { icon: <Merge size={15} />, t: "Merge duplicate profile", run: () => setActionsOpen(false) },
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

      {/* Delete confirm */}
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Sarah Johnson?">
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          Their bookings, notes and documents will be removed after 30 days. This can be undone from Settings until then.
        </p>
        <DarkButton onClick={() => router.push("/app/clients")}>Delete client</DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setDeleteOpen(false)}>Keep</GhostButton>
        </div>
      </Sheet>

      {/* Add allergy */}
      <Sheet open={allergyOpen} onClose={() => setAllergyOpen(false)} title="Add an allergy" sub="Flagged on every booking and checkout" full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">What are they allergic to?</p>
        <input
          value={alName}
          onChange={(e) => setAlName(e.target.value)}
          placeholder="e.g. PPD, nuts, latex, penicillin..."
          className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
        />
        <div className="flex gap-2 pt-2">
          {["PPD", "Nuts", "Latex", "Penicillin"].map((s) => (
            <button key={s} onClick={() => setAlName(s)} className="rounded-full border border-border px-3 py-1.5 text-[12px] text-navy">
              {s}
            </button>
          ))}
        </div>
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Type</p>
        <div className="flex gap-2">
          {(["Drug", "Non-drug", "Note"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAlType(t)}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                alType === t ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Reaction</p>
        <div className="flex flex-wrap gap-2">
          {reactionOptions.map((rx) => (
            <button
              key={rx}
              onClick={() => setAlReaction(rx)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                alReaction === rx ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {rx}
            </button>
          ))}
        </div>
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Severity</p>
        <div className="flex gap-2">
          {(["Mild", "Moderate", "Severe", "Fatal"] as const).map((sv) => (
            <button
              key={sv}
              onClick={() => setAlSeverity(sv)}
              className={`flex-1 rounded-full border py-2.5 text-[12px] font-semibold ${
                alSeverity === sv
                  ? sv === "Fatal" || sv === "Severe"
                    ? "border-danger bg-danger text-white"
                    : "border-[#14181F] bg-[#14181F] text-white"
                  : "border-border bg-white text-navy"
              }`}
            >
              {sv}
            </button>
          ))}
        </div>
        <div className="pt-6">
          <DarkButton
            disabled={!alName.trim()}
            onClick={() => {
              setAllergies((a) => [
                ...a,
                { name: alName.trim(), type: alType, reaction: alReaction ?? "—", severity: alSeverity },
              ]);
              setAllergyOpen(false);
            }}
          >
            {alName.trim() ? `Save ${alName.trim()} · ${alSeverity}` : "Save allergy"}
          </DarkButton>
        </div>
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
      <Sheet open={noteOpen} onClose={() => setNoteOpen(false)} title="Add note" sub="Timestamped on Sarah's record">
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Linked to</p>
        <div className="flex flex-wrap gap-2">
          {["General", "Cut & Style · 3 Mar", "Cut & Style · 10 Feb"].map((o) => (
            <button
              key={o}
              onClick={() => setNoteAppt(o)}
              className={`rounded-full border px-3.5 py-2 text-[12px] font-medium ${
                noteAppt === o ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
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
                  date: "Today · 4 Mar 2026",
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
      <Sheet open={resched} onClose={() => setResched(false)} title="Reschedule" sub="Sarah Johnson · Cut & Style · Emma S." full>
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
          Sarah Johnson · Cut & Style · Emma S. on 18 Mar. We&rsquo;ll let them know and free up the slot.
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
      <Sheet open={contactOpen} onClose={() => setContactOpen(false)} title="Contact Sarah">
        <div className="rounded-2xl bg-canvas p-1">
          {[
            [<Phone key="p" size={14} strokeWidth={1.75} />, "(555) 234-5678"],
            [<Mail key="m" size={14} strokeWidth={1.75} />, "sarah.j@email.com"],
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
            Call (555) 234-5678
          </DarkButton>
          <GhostButton onClick={() => setNumberCopied(true)}>
            {numberCopied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} />}
            {numberCopied ? "Number copied" : "Copy number"}
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
        </div>
      </Sheet>

      {/* Send new form */}
      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Send a form" sub="Sarah will get it by SMS and email">
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
                    formPick === t ? "border-[#14181F] bg-[#14181F] text-white" : "border-border"
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
