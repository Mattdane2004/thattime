"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Coins, MessageSquare, Trash2 } from "lucide-react";
import { Sheet, DarkButton, GhostButton, ToggleRow, SettingsGroup, BackHeader } from "@/components/ui";
import { clientPlatformFeeOptions } from "@/lib/data/finalisation";

// Client settings & policies — a dedicated page (was a bottom sheet),
// grouped Apple-Settings style: every rule that applies to this one client,
// including holding their bookings for manual review and blocking with a
// recorded reason.

const blockReasons = ["No-shows", "Repeated late cancellations", "Rude or abusive", "Payment issues", "Other"];

export default function ClientSettingsPage() {
  const router = useRouter();

  // Booking
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [manualReview, setManualReview] = useState(false);
  const [afterOne, setAfterOne] = useState(true);
  const [bookDays, setBookDays] = useState<string[]>(["Thu"]);
  const [policy, setPolicy] = useState("24h notice");

  // Payments
  const [payPrefs, setPayPrefs] = useState<string[]>(["Card"]);
  const [deposit, setDeposit] = useState(false);
  const [feePref, setFeePref] = useState<(typeof clientPlatformFeeOptions)[number]["id"]>("inherit");

  // Communication
  const [marketing, setMarketing] = useState({ email: true, sms: false, confirmations: true });
  const [messageBlocked, setMessageBlocked] = useState(false);

  // Access
  const [blocked, setBlocked] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [blockNote, setBlockNote] = useState("");
  const [savedReason, setSavedReason] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="min-h-full bg-fog pb-6">
      <BackHeader title="Settings & policies" sub="Only applies to Sarah Johnson" />

      <div className="flex flex-col gap-5 px-4 pt-4">
        <SettingsGroup label="Booking">
          <ToggleRow
            title="Allow online booking"
            sub="Can book through the client app and your booking page"
            on={onlineBooking}
            onToggle={() => setOnlineBooking((v) => !v)}
          />
          <ToggleRow
            divider
            title="Require manual review"
            sub="Their requests wait for your approval before confirming"
            on={manualReview}
            onToggle={() => setManualReview((v) => !v)}
          />
          <ToggleRow
            divider
            title="Only show slots after 1 PM"
            sub="Hides morning availability for this client"
            on={afterOne}
            onToggle={() => setAfterOne((v) => !v)}
          />
          <div className="border-t border-border px-4 py-3.5">
            <p className="text-[14px] font-medium text-navy">Preferred days</p>
            <div className="flex flex-wrap gap-2 pt-2.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => {
                const on = bookDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => setBookDays((x) => (on ? x.filter((y) => y !== d) : [...x, d]))}
                    className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                      on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-border px-4 py-3.5">
            <p className="text-[14px] font-medium text-navy">Cancellation policy</p>
            <div className="flex gap-2 pt-2.5">
              {["24h notice", "48h notice", "No fee"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPolicy(p)}
                  className={`flex-1 rounded-full border py-2.5 text-[12px] font-semibold ${
                    policy === p ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup label="Payments">
          <div className="px-4 py-3.5">
            <p className="text-[14px] font-medium text-navy">Payment preferences</p>
            <div className="flex gap-2 pt-2.5">
              {["Card", "Cash", "Finance"].map((p) => {
                const on = payPrefs.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setPayPrefs((x) => (on ? x.filter((y) => y !== p) : [...x, p]))}
                    className={`flex-1 rounded-full border py-2.5 text-[13px] font-semibold ${
                      on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <ToggleRow
            divider
            title="Require a deposit"
            sub="25% up front on colour and treatments over £100"
            on={deposit}
            onToggle={() => setDeposit((v) => !v)}
          />
          <div className="border-t border-border px-4 py-3.5">
            <p className="flex items-center gap-2 text-[14px] font-medium text-navy">
              <Coins size={15} strokeWidth={1.75} className="text-secondary" />
              Platform fee preference
            </p>
            <p className="pt-0.5 text-[11px] leading-snug text-muted">Business default applies first, then this client override, then any one-off checkout choice.</p>
            <div className="mt-3 flex flex-col gap-2">
              {clientPlatformFeeOptions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFeePref(o.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left ${feePref === o.id ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}
                >
                  <span className="block text-[13px] font-semibold">{o.label}</span>
                  <span className={`block pt-0.5 text-[11px] ${feePref === o.id ? "text-white/70" : "text-muted"}`}>{o.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup label="Communication">
          <ToggleRow
            title="Booking confirmations & reminders"
            sub="SMS and email for upcoming appointments"
            on={marketing.confirmations}
            onToggle={() => setMarketing((m) => ({ ...m, confirmations: !m.confirmations }))}
          />
          <ToggleRow
            divider
            title="Email marketing"
            sub="Campaigns, offers and newsletters"
            on={marketing.email}
            onToggle={() => setMarketing((m) => ({ ...m, email: !m.email }))}
          />
          <ToggleRow
            divider
            title="SMS marketing"
            sub="Offers by text — reminders stay on"
            on={marketing.sms}
            onToggle={() => setMarketing((m) => ({ ...m, sms: !m.sms }))}
          />
          <ToggleRow
            divider
            title={<span className="inline-flex items-center gap-2"><MessageSquare size={15} strokeWidth={1.75} /> Block messages only</span>}
            sub="Stops this client messaging without blocking bookings"
            on={messageBlocked}
            onToggle={() => setMessageBlocked((v) => !v)}
          />
        </SettingsGroup>

        <SettingsGroup label="Access">
          <button
            type="button"
            onClick={() => {
              if (blocked) {
                setBlocked(false);
                setSavedReason(null);
              } else {
                setBlockReason(null);
                setBlockNote("");
                setBlockOpen(true);
              }
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Ban size={16} strokeWidth={1.8} className="shrink-0 text-secondary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">{blocked ? "Unblock client" : "Block client"}</span>
              <span className="block pt-0.5 text-[11px] text-muted">
                {blocked ? `Blocked · ${savedReason}` : "Stops all bookings · a reason is recorded for the team"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left"
          >
            <Trash2 size={16} strokeWidth={1.8} className="shrink-0 text-danger" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-danger">Delete client</span>
              <span className="block pt-0.5 text-[11px] text-muted">Removes bookings, notes and documents after 30 days</span>
            </span>
          </button>
        </SettingsGroup>
      </div>

      {/* Block with a required reason */}
      <Sheet open={blockOpen} onClose={() => setBlockOpen(false)} title="Block Sarah Johnson?" sub="She won't be able to book until unblocked">
        <p className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Why is she being blocked?</p>
        <div className="flex flex-wrap gap-2">
          {blockReasons.map((r) => (
            <button
              key={r}
              onClick={() => setBlockReason(r)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                blockReason === r ? "border-danger bg-danger text-white" : "border-border bg-white text-navy"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {blockReason === "Other" && (
          <input
            autoFocus
            value={blockNote}
            onChange={(e) => setBlockNote(e.target.value)}
            placeholder="Add a short note for the team..."
            className="mt-3 h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
        )}
        <p className="pt-3 text-[12px] leading-snug text-muted">
          The reason is kept on the profile so the whole team knows why. Blocking never notifies the client.
        </p>
        <div className="pt-4">
          <DarkButton
            disabled={!blockReason || (blockReason === "Other" && !blockNote.trim())}
            onClick={() => {
              const reason = blockReason === "Other" ? blockNote.trim() : blockReason;
              setSavedReason(reason);
              setBlocked(true);
              setBlockOpen(false);
            }}
          >
            {blockReason ? `Block · ${blockReason === "Other" ? blockNote.trim() || "Other" : blockReason}` : "Pick a reason first"}
          </DarkButton>
          <GhostButton className="mt-3" onClick={() => setBlockOpen(false)}>Keep her active</GhostButton>
        </div>
      </Sheet>

      {/* Delete confirm */}
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Sarah Johnson?">
        <p className="pb-5 text-[14px] leading-relaxed text-secondary">
          Her bookings, notes and documents will be removed after 30 days. This can be undone from Settings until then.
        </p>
        <DarkButton onClick={() => router.push("/app/clients")}>Delete client</DarkButton>
        <div className="pt-3">
          <GhostButton onClick={() => setDeleteOpen(false)}>Keep</GhostButton>
        </div>
      </Sheet>
    </div>
  );
}
