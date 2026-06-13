"use client";

// Personal details — editable form, change password sheet, connected accounts.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, KeyRound, Check, Apple, Globe } from "lucide-react";
import { clientUser } from "@/lib/data/b2c";
import { Sheet, DarkButton, StatusPill } from "@/components/ui";

export default function AccountDetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: clientUser.name,
    email: clientUser.details.email,
    phone: clientUser.details.phone,
    birthday: clientUser.details.birthday,
    address: clientUser.details.address,
  });
  const [saved, setSaved] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const fields: { key: keyof typeof form; label: string; type?: string }[] = [
    { key: "name", label: "Full name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "birthday", label: "Birthday" },
    { key: "address", label: "Address" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Personal details</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5">
        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">{f.label}</span>
              <input
                type={f.type ?? "text"}
                value={form[f.key]}
                onChange={set(f.key)}
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[14px] text-navy focus:outline-none"
              />
            </label>
          ))}
          <DarkButton onClick={() => setSaved(true)}>
            {saved ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </DarkButton>
          <AnimatePresence>
            {saved && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="-mt-2 text-center text-[12px] text-secondary"
              >
                Your details have been updated.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* security */}
        <p className="pb-2 pt-7 text-[12px] font-bold uppercase tracking-wide text-muted">Security</p>
        <button
          type="button"
          onClick={() => setPwOpen(true)}
          className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
            <KeyRound size={18} strokeWidth={1.75} />
          </span>
          <span className="flex-1 text-[14px] font-semibold text-navy">Change password</span>
          <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
        </button>

        {/* connected accounts */}
        <p className="pb-2 pt-7 text-[12px] font-bold uppercase tracking-wide text-muted">Connected accounts</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3.5 border-b border-border px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
              <Apple size={18} strokeWidth={1.75} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-navy">Apple</span>
            <StatusPill>Connected</StatusPill>
          </div>
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
              <Globe size={18} strokeWidth={1.75} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-navy">Google</span>
            {googleConnected ? (
              <StatusPill>Connected</StatusPill>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setGoogleConnected(true)}
                className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-white"
              >
                Connect
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* change password sheet */}
      <Sheet open={pwOpen} onClose={() => setPwOpen(false)} title="Change password">
        <div className="flex flex-col gap-4 pb-2">
          {["Current password", "New password", "Confirm new password"].map((l) => (
            <label key={l} className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">{l}</span>
              <input
                type="password"
                placeholder="••••••••"
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
            </label>
          ))}
          <DarkButton onClick={() => setPwOpen(false)}>Update password</DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
