"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Star, CalendarPlus, MessageSquare, Phone, Plus,
  RotateCcw, X, Search, SlidersHorizontal, ChevronDown, FileText, Eye, Bell,
  Send, MapPin, Mail, Copy, Check, MoreVertical, Ban, Trash2, Merge,
  Tag as TagIcon, AlertTriangle, StickyNote, Wallet, Settings, ChevronRight,
  Camera, Image as ImageIcon, BadgePercent, Repeat, Pencil, FlaskConical,
} from "lucide-react";
import { Segmented, DarkButton, GhostButton, Sheet, MiniCalendar, TimeChips, StatusPill } from "@/components/app/ui";
import { useAppStore } from "@/lib/store/appStore";
import { pastAppointments, clientForms, clientReviews } from "@/lib/data/product";

// Client detail — Overview / Bookings / Documents / Reviews, with a 3-dot
// action menu, structured allergies, wallet & loyalty, clinical notes with
// images, booking detail + rebook, review replies and client settings.

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "fill-navy text-navy" : "text-border"} />
      ))}
    </span>
  );
}

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
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const [tab, setTab] = useState("Overview");

  // Next-appointment actions (existing behaviour)
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [moved, setMoved] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // Contact + forms (existing behaviour)
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

  // Allergies — structured, Fresha-style
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

  // Wallet & loyalty
  const [walletBalance, setWalletBalance] = useState(25);
  const [walletOpen, setWalletOpen] = useState(false);
  const [topup, setTopup] = useState<number | null>(null);

  // Settings & policies
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [payPrefs, setPayPrefs] = useState<string[]>(["Card"]);
  const [marketing, setMarketing] = useState({ email: true, sms: false });
  const [bookDays, setBookDays] = useState<string[]>(["Thu"]);
  const [afterOne, setAfterOne] = useState(true);
  const [policy, setPolicy] = useState("24h notice");

  // Documents: notes & images
  const [docTab, setDocTab] = useState("Forms");
  const [notes, setNotes] = useState<ClinicalNote[]>([
    { date: "3 Mar 2026 · 11:42", appt: "Cut & Style", note: "Toner 9V for 20 mins. Scalp fine after patch test. Before/after taken.", imgs: 2 },
    { date: "10 Feb 2026 · 15:08", appt: "Cut & Style", note: "Trim only. Discussed balayage for spring — book a consult.", imgs: 0 },
    { date: "15 Jan 2026 · 09:30", appt: null, note: "Prefers quiet appointments, no small talk before 10am.", imgs: 0 },
  ]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteAppt, setNoteAppt] = useState<string | null>("General");
  const [notePhotos, setNotePhotos] = useState(0);

  // Bookings
  const [bookingSel, setBookingSel] = useState<(typeof pastAppointments)[number] | null>(null);

  // Reviews
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyDraft, setReplyDraft] = useState("");
  const [askReview, setAskReview] = useState(false);
  const [askSent, setAskSent] = useState(false);

  const unpaid = pastAppointments.find((p) => p.id === "p3");

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="bg-white pb-3">
        <div className="flex items-center justify-between px-4 pt-4">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
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

        <div className="flex items-center gap-4 px-4 pt-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-[18px] font-semibold text-muted">
            SJ
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-navy">Sarah Johnson</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${blocked ? "bg-danger text-white" : "bg-[#14181F] text-white"}`}>
                {blocked ? "Blocked" : "Active"}
              </span>
            </div>
            <span className="mt-1 flex items-center gap-2 text-[13px] font-medium text-navy">
              <span className="flex items-center gap-1"><Star size={13} className="fill-current" /> 4.8</span>
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-secondary">{t}</span>
              ))}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 px-4 pt-4">
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

        <div className="px-4 pt-4">
          <Segmented options={["Overview", "Bookings", "Documents", "Reviews"]} value={tab} onChange={setTab} />
        </div>
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
          {tab === "Overview" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  ["Last Visit", "3 Mar 2026"],
                  ["Total Bookings", "24"],
                  ["Total Sales", "£1,870"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white p-3.5 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                    <p className="text-[11px] text-muted">{k}</p>
                    <p className="pt-1 text-[14px] font-bold text-navy">{v}</p>
                  </div>
                ))}
              </div>

              {/* Outstanding payment flag */}
              {unpaid && (
                <button
                  type="button"
                  onClick={() => router.push("/app/checkout")}
                  className="flex items-center gap-3 rounded-2xl bg-[#FEF3C7] px-4 py-3 text-left"
                >
                  <AlertTriangle size={15} strokeWidth={2} className="shrink-0 text-[#B45309]" />
                  <span className="flex-1 text-[13px] font-semibold text-[#92400E]">
                    £75 outstanding — Cut & Blow Dry, 20 Jan
                  </span>
                  <span className="text-[12px] font-bold text-[#92400E]">Take payment ›</span>
                </button>
              )}

              {/* Follow-up due */}
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="flex items-center gap-2 text-[13px] font-bold text-navy">
                  <Repeat size={14} strokeWidth={2} className="text-secondary" />
                  Follow-up due
                </p>
                <p className="pt-1 text-[12px] leading-snug text-secondary">
                  Colour treatments need a refresh every 6–8 weeks. Sarah&rsquo;s last colour was 3 Mar.
                </p>
                <div className="flex gap-2 pt-3">
                  <button onClick={() => setQuickAction("appointment")} className="h-9 flex-1 rounded-full bg-[#14181F] text-[12px] font-semibold text-white">
                    Book follow-up
                  </button>
                  <button onClick={() => router.push("/app/messages/sarah")} className="h-9 flex-1 rounded-full border border-border text-[12px] font-semibold text-navy">
                    Send reminder
                  </button>
                </div>
              </div>

              {!cancelled && (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}

              {/* Wallet & loyalty */}
              <button type="button" onClick={() => setWalletOpen(true)} className="rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
                    <Wallet size={14} strokeWidth={1.75} />
                    Wallet & loyalty
                  </p>
                  <ChevronRight size={14} className="text-muted" />
                </div>
                <div className="flex gap-6 pt-2.5">
                  <span>
                    <span className="block text-[16px] font-bold text-navy">£{walletBalance}</span>
                    <span className="block text-[11px] text-muted">Wallet balance</span>
                  </span>
                  <span>
                    <span className="block text-[16px] font-bold text-navy">320 pts</span>
                    <span className="block text-[11px] text-muted">2 rewards available</span>
                  </span>
                </div>
              </button>

              {/* Allergies — structured records, not just pills */}
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <div className="flex items-center justify-between pb-1">
                  <p className="text-[13px] font-medium text-muted">Allergies</p>
                  <button
                    type="button"
                    aria-label="Add allergy"
                    onClick={() => {
                      setAlName(""); setAlType("Non-drug"); setAlReaction(null); setAlSeverity("Mild");
                      setAllergyOpen(true);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-navy"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>
                {allergies.length === 0 && <p className="py-2 text-[13px] text-muted">No known allergies.</p>}
                <div className="flex flex-col gap-2 pt-1">
                  {allergies.map((al) => {
                    const expandedNow = expandedAllergy === al.name;
                    return (
                      <button
                        key={al.name}
                        type="button"
                        onClick={() => setExpandedAllergy(expandedNow ? null : al.name)}
                        className="rounded-xl border border-border p-3 text-left"
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
                </div>
              </div>

              {/* Command centre */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                {[
                  { icon: <FileText size={15} strokeWidth={1.75} />, t: "Documents", s: "Forms, notes & images, patch tests", run: () => setTab("Documents") },
                  { icon: <BadgePercent size={15} strokeWidth={1.75} />, t: "Loyalty & rewards", s: "320 pts · free blow dry at 400", run: () => setWalletOpen(true) },
                  { icon: <Settings size={15} strokeWidth={1.75} />, t: "Settings & policies", s: "Payments, notifications, cancellation", run: () => setSettingsOpen(true) },
                ].map((r, i) => (
                  <button key={r.t} type="button" onClick={r.run} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? "border-t border-border" : ""}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-secondary">{r.icon}</span>
                    <span className="flex-1">
                      <span className="block text-[14px] font-semibold text-navy">{r.t}</span>
                      <span className="block text-[11px] text-muted">{r.s}</span>
                    </span>
                    <ChevronRight size={14} className="text-muted" />
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <p className="pb-2 text-[13px] font-medium text-muted">Contact</p>
                {[
                  [<Phone key="p" size={14} strokeWidth={1.75} />, "(555) 234-5678"],
                  [<Mail key="m" size={14} strokeWidth={1.75} />, "sarah.j@email.com"],
                  [<MapPin key="a" size={14} strokeWidth={1.75} />, "14 Maple Lane, London"],
                ].map(([icon, v], i) => (
                  <p key={i} className="flex items-center gap-3 py-1.5 text-[14px] text-navy">
                    <span className="text-secondary">{icon}</span>
                    {v}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tab === "Bookings" && (
            <div className="flex flex-col gap-3">
              {!cancelled && (
                <NextAppointmentCard moved={moved} onReschedule={() => setResched(true)} onCancel={() => setCancel(true)} />
              )}
              <div className="relative">
                <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  placeholder="Search service, date, staff..."
                  className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-[13px] text-navy placeholder:text-muted shadow-[0_1px_4px_rgba(15,26,46,0.04)] focus:outline-none"
                />
              </div>
              <button className="flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-navy shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                <SlidersHorizontal size={13} strokeWidth={1.75} />
                All
                <ChevronDown size={12} className="text-muted" />
              </button>
              <p className="text-[12px] text-muted">4 past appointments · tap one for notes, forms and rebooking</p>
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
                        <span className="flex gap-1 text-muted">
                          {Array.from({ length: p.docs }, (_, i) => (
                            <FileText key={i} size={12} strokeWidth={1.75} />
                          ))}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "Documents" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {["Forms", "Notes & images", "Patch tests"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDocTab(d)}
                    className={`rounded-full px-3.5 py-2 text-[12px] font-semibold ${
                      docTab === d ? "bg-[#14181F] text-white" : "bg-white text-secondary shadow-[0_1px_4px_rgba(15,26,46,0.04)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {docTab === "Forms" && (
                <>
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
                        <span className="flex gap-2 pt-2">
                          <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-secondary">View</span>
                          <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-secondary">Edit</span>
                          <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-secondary">Amend answers</span>
                        </span>
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
                  <DarkButton onClick={() => { setFormPick(null); setFormOpen(true); }}>
                    <Send size={15} />
                    Send New Form
                  </DarkButton>
                </>
              )}

              {docTab === "Notes & images" && (
                <>
                  <p className="text-[12px] text-muted">
                    Clinical record — every note is timestamped and linked to its appointment.
                  </p>
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
                  <DarkButton onClick={() => { setNoteDraft(""); setNoteAppt("General"); setNotePhotos(0); setNoteOpen(true); }}>
                    <Plus size={15} />
                    Add note or images
                  </DarkButton>
                </>
              )}

              {docTab === "Patch tests" && (
                <>
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
                  <GhostButton onClick={() => setActionsOpen(true)}>
                    <Plus size={15} />
                    Record a patch test
                  </GhostButton>
                </>
              )}
            </div>
          )}

          {tab === "Reviews" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-bold text-navy">
                  <Star size={15} className="fill-current" />
                  4.7 <span className="font-normal text-muted">(3 reviews)</span>
                </p>
                <button
                  onClick={() => { setAskSent(false); setAskReview(true); }}
                  className="rounded-full bg-[#14181F] px-3.5 py-2 text-[12px] font-semibold text-white"
                >
                  Ask for a review
                </button>
              </div>
              {clientReviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
                  <div className="flex items-center gap-2.5">
                    <Stars n={r.stars} />
                    <span className="text-[11px] text-muted">{r.date}</span>
                  </div>
                  <p className="pt-2 text-[14px] leading-snug text-navy">{r.text}</p>
                  <p className="pt-1.5 text-[12px] text-muted">{r.service}</p>
                  {replies[r.id] ? (
                    <div className="mt-3 rounded-xl bg-canvas p-3">
                      <p className="text-[11px] font-semibold text-secondary">You replied</p>
                      <p className="pt-1 text-[13px] text-navy">{replies[r.id]}</p>
                    </div>
                  ) : replyFor === r.id ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        autoFocus
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder="Write a public reply..."
                        className="h-10 flex-1 rounded-full bg-canvas px-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
                      />
                      <button
                        aria-label="Send reply"
                        disabled={!replyDraft.trim()}
                        onClick={() => {
                          setReplies((x) => ({ ...x, [r.id]: replyDraft }));
                          setReplyFor(null);
                          setReplyDraft("");
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14181F] text-white disabled:opacity-40"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setReplyFor(r.id)} className="mt-2.5 text-[12px] font-semibold text-navy underline">
                      Reply
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Sheets ── */}

      {/* 3-dot actions */}
      <Sheet open={actionsOpen} onClose={() => setActionsOpen(false)} title="Sarah Johnson" sub="Quick actions">
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { icon: <Pencil size={15} />, t: "Edit details", run: () => setActionsOpen(false) },
            { icon: <MessageSquare size={15} />, t: "Send message", run: () => { setActionsOpen(false); router.push("/app/messages/sarah"); } },
            { icon: <TagIcon size={15} />, t: tags.includes("VIP") ? "VIP ✓" : "Add VIP tag", run: () => setTags((t) => (t.includes("VIP") ? t : [...t, "VIP"])) },
            { icon: <AlertTriangle size={15} />, t: "Add allergy", run: () => { setActionsOpen(false); setAlName(""); setAllergyOpen(true); } },
            { icon: <StickyNote size={15} />, t: "Add note", run: () => { setActionsOpen(false); setTab("Documents"); setDocTab("Notes & images"); setNoteOpen(true); } },
            { icon: <FlaskConical size={15} />, t: "Add patch test", run: () => { setActionsOpen(false); setTab("Documents"); setDocTab("Patch tests"); } },
            { icon: <Star size={15} />, t: "Add review", run: () => { setActionsOpen(false); setTab("Reviews"); setAskReview(true); } },
            { icon: <Merge size={15} />, t: "Merge profile", run: () => setActionsOpen(false) },
          ].map((a) => (
            <button key={a.t} onClick={a.run} className="flex items-center gap-2.5 rounded-2xl border border-border bg-white px-3.5 py-3.5 text-left text-[13px] font-semibold text-navy">
              <span className="text-secondary">{a.icon}</span>
              {a.t}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-3">
          <button
            onClick={() => { setBlocked((b) => !b); setActionsOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-border bg-white px-4 py-3.5 text-left text-[13px] font-semibold text-navy"
          >
            <Ban size={15} className="text-secondary" />
            {blocked ? "Unblock client" : "Block client"}
          </button>
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

      {/* Wallet & loyalty */}
      <Sheet open={walletOpen} onClose={() => setWalletOpen(false)} title="Wallet & loyalty" sub="Sarah Johnson">
        <div className="flex items-center justify-between rounded-2xl bg-[#14181F] p-4 text-white">
          <span>
            <span className="block text-[22px] font-bold">£{walletBalance}</span>
            <span className="block text-[11px] text-white/60">Wallet balance</span>
          </span>
          <span className="text-right">
            <span className="block text-[22px] font-bold">320</span>
            <span className="block text-[11px] text-white/60">Loyalty points</span>
          </span>
        </div>
        <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Top up or reward</p>
        <div className="flex gap-2">
          {[5, 10, 25].map((v) => (
            <button
              key={v}
              onClick={() => setTopup(v)}
              className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                topup === v ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              +£{v}
            </button>
          ))}
        </div>
        <p className="pt-3 text-[12px] leading-snug text-muted">
          Use credit to apologise for a mix-up, reward loyalty, or pre-load a package. Sarah sees it at checkout automatically.
        </p>
        <div className="pt-4">
          <DarkButton
            disabled={!topup}
            onClick={() => {
              if (topup) setWalletBalance((b) => b + topup);
              setTopup(null);
            }}
          >
            {topup ? `Add £${topup} credit` : "Pick an amount"}
          </DarkButton>
        </div>
        <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Rewards</p>
        {["Free blow dry · 400 pts", "10% off colour · 250 pts"].map((rw) => (
          <p key={rw} className="flex items-center justify-between border-b border-border py-3 text-[13px] text-navy last:border-0">
            {rw}
            <span className="text-[12px] font-semibold text-secondary">Apply</span>
          </p>
        ))}
      </Sheet>

      {/* Client settings & policies */}
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings & policies" sub="Only applies to Sarah Johnson" full>
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Payment preferences</p>
        <div className="flex gap-2">
          {["Card", "Cash", "Finance"].map((p) => {
            const on = payPrefs.includes(p);
            return (
              <button
                key={p}
                onClick={() => setPayPrefs((x) => (on ? x.filter((y) => y !== p) : [...x, p]))}
                className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                  on ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
        <p className="pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Marketing & notifications</p>
        {[
          { k: "email", label: "Email marketing" },
          { k: "sms", label: "SMS reminders & marketing" },
        ].map(({ k, label }) => {
          const on = marketing[k as "email" | "sms"];
          return (
            <button
              key={k}
              onClick={() => setMarketing((m) => ({ ...m, [k]: !on }))}
              className="flex w-full items-center justify-between border-b border-border py-3.5 text-left"
            >
              <span className="text-[14px] text-navy">{label}</span>
              <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-[#14181F]" : "bg-border"}`}>
                <motion.span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow" animate={{ left: on ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
              </span>
            </button>
          );
        })}
        <p className="pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Booking preferences</p>
        <div className="flex flex-wrap gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => {
            const on = bookDays.includes(d);
            return (
              <button
                key={d}
                onClick={() => setBookDays((x) => (on ? x.filter((y) => y !== d) : [...x, d]))}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                  on ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <button onClick={() => setAfterOne((v) => !v)} className="flex w-full items-center justify-between py-3.5 text-left">
          <span className="text-[14px] text-navy">Only show slots after 1 PM</span>
          <span className={`relative h-7 w-12 rounded-full transition-colors ${afterOne ? "bg-[#14181F]" : "bg-border"}`}>
            <motion.span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow" animate={{ left: afterOne ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
          </span>
        </button>
        <p className="pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Cancellation policy</p>
        <div className="flex gap-2 pb-4">
          {["24h notice", "48h notice", "No fee"].map((p) => (
            <button
              key={p}
              onClick={() => setPolicy(p)}
              className={`flex-1 rounded-full border py-2.5 text-[12px] font-semibold ${
                policy === p ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <DarkButton onClick={() => setSettingsOpen(false)}>Save preferences</DarkButton>
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

      {/* Ask for a review */}
      <Sheet open={askReview} onClose={() => setAskReview(false)} title="Ask for a review" sub="Sent by SMS and in-app">
        {askSent ? (
          <div className="flex flex-col items-center pb-2 pt-4 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14181F] text-white">
              <Check size={26} strokeWidth={2.2} />
            </motion.span>
            <p className="pt-5 text-[16px] font-bold text-navy">Request sent</p>
            <p className="pt-1 text-[13px] text-secondary">We&rsquo;ll nudge you if Sarah hasn&rsquo;t replied in a week.</p>
            <div className="w-full pt-6">
              <DarkButton onClick={() => setAskReview(false)}>Done</DarkButton>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-canvas p-4">
              <p className="text-[11px] font-semibold text-muted">PREVIEW</p>
              <p className="pt-2 text-[14px] leading-relaxed text-navy">
                Hi Sarah! Thanks for visiting Salon Soho. If you have a minute, we&rsquo;d love a quick review of your Cut & Style — it really helps. ⭐
              </p>
            </div>
            <div className="pt-5">
              <DarkButton onClick={() => setAskSent(true)}>
                <Send size={15} />
                Send review request
              </DarkButton>
            </div>
          </>
        )}
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

      {/* Contact */}
      <Sheet open={contactOpen} onClose={() => setContactOpen(false)} title="Contact Sarah" sub="(555) 234-5678">
        <div className="flex flex-col gap-2.5 pt-1">
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
