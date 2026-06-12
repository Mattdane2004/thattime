"use client";

// Notification preferences — channel masters, grouped granular toggles, quiet hours.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { Sheet, DarkButton } from "@/components/app/ui";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-coral" : "bg-border"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`h-6 w-6 rounded-full bg-white shadow ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onToggle,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3.5 last:border-b-0">
      <div className="min-w-0 pr-4">
        <p className="text-[14px] font-semibold text-navy">{label}</p>
        {sub && <p className="text-[12px] text-secondary">{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

const SECTION = "px-4 pb-2 pt-6 text-[12px] font-bold uppercase tracking-wide text-muted";

export default function NotificationSettingsPage() {
  const router = useRouter();

  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [prefs, setPrefs] = useState({
    confirmations: true,
    reminders: true,
    changes: true,
    newPosts: true,
    likes: false,
    mentions: true,
    offers: true,
    recommendations: false,
  });
  const [quietOpen, setQuietOpen] = useState(false);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("07:30");

  const flip = (k: keyof typeof prefs) => () => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const flipChannel = (k: keyof typeof channels) => () => setChannels((c) => ({ ...c, [k]: !c[k] }));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Notifications</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <p className={SECTION}>Channels</p>
        <div className="border-y border-border bg-surface">
          <ToggleRow label="Push" sub="Alerts on this device" on={channels.push} onToggle={flipChannel("push")} />
          <ToggleRow label="Email" sub="emma.carter@gmail.com" on={channels.email} onToggle={flipChannel("email")} />
          <ToggleRow label="SMS" sub="+44 7700 900123" on={channels.sms} onToggle={flipChannel("sms")} />
        </div>

        <p className={SECTION}>Bookings</p>
        <div className="border-y border-border bg-surface">
          <ToggleRow label="Confirmations" on={prefs.confirmations} onToggle={flip("confirmations")} />
          <ToggleRow label="Reminders" sub="24h and 1h before" on={prefs.reminders} onToggle={flip("reminders")} />
          <ToggleRow label="Changes & cancellations" on={prefs.changes} onToggle={flip("changes")} />
        </div>

        <p className={SECTION}>Social</p>
        <div className="border-y border-border bg-surface">
          <ToggleRow label="New posts from followed" on={prefs.newPosts} onToggle={flip("newPosts")} />
          <ToggleRow label="Likes & comments" on={prefs.likes} onToggle={flip("likes")} />
          <ToggleRow label="Mentions" on={prefs.mentions} onToggle={flip("mentions")} />
        </div>

        <p className={SECTION}>Marketing</p>
        <div className="border-y border-border bg-surface">
          <ToggleRow label="Offers & promos" sub="Last-minute slots & deals" on={prefs.offers} onToggle={flip("offers")} />
          <ToggleRow label="Recommendations" sub="Salons we think you'll love" on={prefs.recommendations} onToggle={flip("recommendations")} />
        </div>

        <p className={SECTION}>Quiet hours</p>
        <div className="border-y border-border bg-surface">
          <button
            type="button"
            onClick={() => setQuietOpen(true)}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
              <Moon size={18} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-navy">Quiet hours</span>
              <span className="block text-[12px] text-secondary">
                {quietFrom} – {quietTo}, every day
              </span>
            </span>
            <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
          </button>
        </div>
      </div>

      {/* quiet hours sheet */}
      <Sheet open={quietOpen} onClose={() => setQuietOpen(false)} title="Quiet hours" sub="No pushes during this window.">
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">From</span>
              <input
                value={quietFrom}
                onChange={(e) => setQuietFrom(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-center text-[15px] font-bold text-navy focus:outline-none"
              />
            </label>
            <label className="block flex-1">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">Until</span>
              <input
                value={quietTo}
                onChange={(e) => setQuietTo(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-center text-[15px] font-bold text-navy focus:outline-none"
              />
            </label>
          </div>
          <DarkButton onClick={() => setQuietOpen(false)}>Save quiet hours</DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
