"use client";

// Settings hub — account, preferences, support, legal, danger zone.

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Wallet,
  MapPin,
  Bell,
  Lock,
  Sun,
  HelpCircle,
  Mail,
  Star,
  LogOut,
  Trash2,
  Plus,
} from "lucide-react";
import { clientUser } from "@/lib/data/b2c";
import { Sheet, DarkButton, GhostButton } from "@/components/app/ui";

function Row({
  icon,
  label,
  sub,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 border-b border-border bg-surface px-4 py-3.5 text-left last:border-b-0"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          danger ? "bg-coral/10 text-coral" : "bg-canvas text-navy"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] font-semibold ${danger ? "text-coral" : "text-navy"}`}>{label}</span>
        {sub && <span className="block truncate text-[12px] text-secondary">{sub}</span>}
      </span>
      <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
    </button>
  );
}

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
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={`h-6 w-6 rounded-full bg-white shadow ${on ? "ml-auto" : ""}`} />
    </button>
  );
}

const SECTION = "px-4 pb-2 pt-5 text-[12px] font-bold uppercase tracking-wide text-muted";

export default function SettingsPage() {
  const router = useRouter();
  const [sheet, setSheet] = useState<
    null | "addresses" | "privacy" | "appearance" | "help" | "contact" | "rate" | "logout" | "delete"
  >(null);

  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideActivity, setHideActivity] = useState(true);
  const [appearance, setAppearance] = useState<"Light" | "Dark" | "System">("System");
  const [deleteText, setDeleteText] = useState("");

  const close = () => setSheet(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Settings</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <p className={SECTION}>Account</p>
        <div className="border-y border-border">
          <Row icon={<User size={18} strokeWidth={1.75} />} label="Personal details" sub={clientUser.details.email} onClick={() => router.push("/c/settings/account")} />
          <Row icon={<CreditCard size={18} strokeWidth={1.75} />} label="Payment methods" sub="Visa ••4242 · Apple Pay" onClick={() => router.push("/c/settings/payments")} />
          <Row icon={<Wallet size={18} strokeWidth={1.75} />} label="Wallet & loyalty" sub={`${clientUser.wallet.balance} · ${clientUser.wallet.loyaltyPoints} pts`} onClick={() => router.push("/c/settings/wallet")} />
          <Row icon={<MapPin size={18} strokeWidth={1.75} />} label="Addresses" sub={clientUser.details.address} onClick={() => setSheet("addresses")} />
        </div>

        <p className={SECTION}>Preferences</p>
        <div className="border-y border-border">
          <Row icon={<Bell size={18} strokeWidth={1.75} />} label="Notifications" sub="Push, email & SMS" onClick={() => router.push("/c/settings/notifications")} />
          <Row icon={<Lock size={18} strokeWidth={1.75} />} label="Privacy" sub="Profile visibility & blocking" onClick={() => setSheet("privacy")} />
          <Row icon={<Sun size={18} strokeWidth={1.75} />} label="Appearance" sub={appearance} onClick={() => setSheet("appearance")} />
        </div>

        <p className={SECTION}>Support</p>
        <div className="border-y border-border">
          <Row icon={<HelpCircle size={18} strokeWidth={1.75} />} label="Help centre" onClick={() => setSheet("help")} />
          <Row icon={<Mail size={18} strokeWidth={1.75} />} label="Contact us" onClick={() => setSheet("contact")} />
          <Row icon={<Star size={18} strokeWidth={1.75} />} label="Rate the app" onClick={() => setSheet("rate")} />
        </div>

        <div className="flex gap-4 px-4 pt-5 text-[12px] text-muted">
          <button type="button" className="underline-offset-2 hover:underline">Terms of service</button>
          <button type="button" className="underline-offset-2 hover:underline">Privacy policy</button>
          <button type="button" className="underline-offset-2 hover:underline">Cookies</button>
        </div>

        <p className={SECTION}>Danger zone</p>
        <div className="border-y border-border">
          <Row danger icon={<LogOut size={18} strokeWidth={1.75} />} label="Log out" onClick={() => setSheet("logout")} />
          <Row danger icon={<Trash2 size={18} strokeWidth={1.75} />} label="Delete account" sub="Permanently remove your data" onClick={() => setSheet("delete")} />
        </div>

        <p className="pt-6 text-center text-[11px] text-muted">thattime 1.0 (wireframe)</p>
      </div>

      {/* addresses sheet */}
      <Sheet open={sheet === "addresses"} onClose={close} title="Addresses">
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas px-4 py-3.5">
            <MapPin size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-navy" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-navy">Home</p>
              <p className="text-[13px] text-secondary">{clientUser.details.address}</p>
            </div>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-navy">Default</span>
          </div>
          <GhostButton onClick={close}>
            <Plus size={16} strokeWidth={2} />
            Add address
          </GhostButton>
        </div>
      </Sheet>

      {/* privacy sheet */}
      <Sheet open={sheet === "privacy"} onClose={close} title="Privacy">
        <div className="flex flex-col pb-2">
          <div className="flex items-center justify-between border-b border-border py-4">
            <div className="min-w-0 pr-4">
              <p className="text-[14px] font-semibold text-navy">Private profile</p>
              <p className="text-[12px] text-secondary">Only approved followers see your posts</p>
            </div>
            <Toggle on={privateProfile} onToggle={() => setPrivateProfile((v) => !v)} />
          </div>
          <div className="flex items-center justify-between border-b border-border py-4">
            <div className="min-w-0 pr-4">
              <p className="text-[14px] font-semibold text-navy">Hide activity</p>
              <p className="text-[12px] text-secondary">Don&apos;t show likes & reviews publicly</p>
            </div>
            <Toggle on={hideActivity} onToggle={() => setHideActivity((v) => !v)} />
          </div>
          <button type="button" onClick={close} className="flex items-center justify-between py-4 text-left">
            <span className="text-[14px] font-semibold text-navy">Blocked accounts</span>
            <span className="flex items-center gap-1 text-[12px] text-muted">
              0 <ChevronRight size={14} strokeWidth={1.75} />
            </span>
          </button>
        </div>
      </Sheet>

      {/* appearance sheet */}
      <Sheet open={sheet === "appearance"} onClose={close} title="Appearance">
        <div className="flex flex-col pb-2">
          {(["Light", "Dark", "System"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAppearance(opt)}
              className="flex items-center justify-between border-b border-border py-4 text-left last:border-b-0"
            >
              <span className="text-[14px] font-semibold text-navy">{opt}</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  appearance === opt ? "border-coral" : "border-border"
                }`}
              >
                {appearance === opt && <span className="h-3 w-3 rounded-full bg-coral" />}
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* support sheets (decorative) */}
      <Sheet open={sheet === "help"} onClose={close} title="Help centre" sub="Popular topics">
        <div className="flex flex-col pb-2">
          {["Cancelling or rescheduling a booking", "Refunds & wallet credit", "Managing memberships", "Reporting a salon"].map((t) => (
            <button key={t} type="button" onClick={close} className="flex items-center justify-between border-b border-border py-4 text-left last:border-b-0">
              <span className="pr-4 text-[14px] text-navy">{t}</span>
              <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "contact"} onClose={close} title="Contact us" sub="We usually reply within a day">
        <div className="flex flex-col gap-4 pb-2">
          <textarea
            rows={4}
            placeholder="Tell us what's going on…"
            className="w-full resize-none rounded-2xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
          <DarkButton onClick={close}>Send message</DarkButton>
        </div>
      </Sheet>

      <Sheet open={sheet === "rate"} onClose={close} title="Enjoying thattime?">
        <div className="flex flex-col items-center gap-4 pb-2 pt-2">
          <div className="flex gap-2 text-coral">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={32} strokeWidth={1.5} className={i <= 4 ? "fill-current" : ""} />
            ))}
          </div>
          <p className="text-center text-[13px] text-secondary">Your review helps independent salons get discovered.</p>
          <DarkButton onClick={close}>Rate on the App Store</DarkButton>
        </div>
      </Sheet>

      {/* log out confirm */}
      <Sheet open={sheet === "logout"} onClose={close} title="Log out?" sub="You can sign back in anytime.">
        <div className="flex flex-col gap-3 pb-2 pt-1">
          <DarkButton onClick={() => router.push("/client/signup")}>Log out</DarkButton>
          <GhostButton onClick={close}>Cancel</GhostButton>
        </div>
      </Sheet>

      {/* delete account confirm */}
      <Sheet open={sheet === "delete"} onClose={close} title="Delete account" sub="This permanently removes your bookings, posts and wallet.">
        <div className="flex flex-col gap-3 pb-2 pt-1">
          <p className="text-[13px] text-secondary">
            Type <span className="font-bold text-navy">{clientUser.name}</span> to confirm.
          </p>
          <input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder={clientUser.name}
            className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
          />
          <motion.button
            type="button"
            whileTap={deleteText === clientUser.name ? { scale: 0.97 } : undefined}
            onClick={deleteText === clientUser.name ? () => router.push("/client/signup") : undefined}
            aria-disabled={deleteText !== clientUser.name}
            className={`flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold ${
              deleteText === clientUser.name ? "bg-coral text-white" : "bg-canvas text-muted"
            }`}
          >
            Delete my account
          </motion.button>
          <GhostButton onClick={close}>Cancel</GhostButton>
        </div>
      </Sheet>
    </div>
  );
}
