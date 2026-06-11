"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Full-width black pill CTA. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  tone = "ink",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "ink" | "orange";
}) {
  const enabled = !disabled && !loading;
  return (
    <motion.button
      type="button"
      whileTap={enabled ? { scale: 0.97 } : undefined}
      onClick={enabled ? onClick : undefined}
      aria-disabled={!enabled}
      className={`flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-colors duration-200 ${
        enabled
          ? tone === "orange"
            ? "bg-coral text-white"
            : "bg-[#111] text-white"
          : "bg-[#8E8E93] text-white/90"
      }`}
    >
      {loading ? (
        <span
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
}

/** Apple / Google / Facebook buttons. */
export function SocialButtons({ onPick }: { onPick: (p: "apple" | "google" | "facebook") => void }) {
  return (
    <div className="flex flex-col gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("apple")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-black text-[15px] font-semibold text-white"
      >
        <svg width="16" height="19" viewBox="0 0 16 19" fill="currentColor" aria-hidden>
          <path d="M13.06 10.05c.02 2.42 2.12 3.22 2.14 3.23-.02.06-.33 1.15-1.1 2.27-.67.97-1.36 1.94-2.45 1.96-1.07.02-1.42-.64-2.65-.64-1.22 0-1.6.62-2.62.66-1.05.04-1.86-1.05-2.53-2.02C2.47 13.53 1.4 9.9 2.81 7.42a3.93 3.93 0 0 1 3.32-2.02c1.03-.02 2.01.7 2.65.7.63 0 1.82-.86 3.07-.73.52.02 1.99.21 2.93 1.59-.08.05-1.75 1.02-1.72 3.09M11.05 4.05c.56-.68.94-1.63.84-2.57-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.57-.85 2.49.9.07 1.82-.46 2.38-1.14" />
        </svg>
        Continue with Apple
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("google")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white text-[15px] font-semibold text-navy shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-border"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
        Continue with Google
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("facebook")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#1877F2] text-[15px] font-semibold text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
        </svg>
        Continue with Facebook
      </motion.button>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[13px] text-muted">Or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Labelled field wrapper. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-secondary">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-[52px] w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy placeholder:text-muted focus:border-navy focus:outline-none transition-colors";

/** +44 phone entry. */
export function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-4 text-[15px] text-navy">
        + 44
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <input
        type="tel"
        inputMode="tel"
        placeholder="7123 456789"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d ]/g, ""))}
        className={inputClass}
      />
    </div>
  );
}

/** 6-box OTP input with auto-advance; calls onComplete when filled. */
export function OtpInput({ onComplete }: { onComplete?: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const done = useRef(false);

  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !done.current) {
      done.current = true;
      onComplete?.(code);
    }
  }, [digits, onComplete]);

  return (
    <div className="flex gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            setDigits((prev) => {
              const next = [...prev];
              next[i] = v;
              return next;
            });
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-[52px] w-full min-w-0 flex-1 rounded-xl border border-border bg-white text-center text-[20px] font-semibold text-navy focus:border-navy focus:outline-none"
        />
      ))}
    </div>
  );
}

/** Selection card with right-side check circle (single or multi select). */
export function SelectCard({
  icon,
  title,
  desc,
  selected,
  onClick,
  badge,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  selected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-colors ${
        selected ? "border-navy" : "border-border"
      }`}
    >
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fog text-navy">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{title}</span>
        {desc && <span className="mt-0.5 block text-[13px] leading-snug text-secondary">{desc}</span>}
      </span>
      {badge}
      <CheckCircle on={!!selected} />
    </motion.button>
  );
}

export function CheckCircle({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
        on ? "bg-[#111]" : "border border-border bg-white"
      }`}
    >
      <AnimatePresence>
        {on && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            width="11"
            height="9"
            viewBox="0 0 11 9"
            fill="none"
          >
            <path d="m1 4.5 3 3L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Small square checkbox row (terms / marketing opt-in). */
export function CheckRow({
  checked,
  onToggle,
  title,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 text-left">
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked ? "border-navy bg-fog" : "border-border bg-white"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 11 9" fill="none" aria-hidden>
            <path d="m1 4.5 3 3L10 1" stroke="#0F1A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-snug text-navy">{title}</span>
        {sub && <span className="mt-0.5 block text-[11px] text-muted">{sub}</span>}
      </span>
    </button>
  );
}

/** Password field with eye toggle + animated 3-segment strength meter. */
export function PasswordField({
  value,
  onChange,
  withMeter = true,
  hint = "Use 8 or more characters.",
}: {
  value: string;
  onChange: (v: string) => void;
  withMeter?: boolean;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const score = value.length >= 12 ? 3 : value.length >= 8 ? 2 : value.length > 0 ? 1 : 0;
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
            <path
              d="M10 1C5.5 1 2.1 4.1 1 7c1.1 2.9 4.5 6 9 6s7.9-3.1 9-6c-1.1-2.9-4.5-6-9-6Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle cx="10" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      {withMeter && (
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="h-[5px] flex-1 origin-left rounded-full"
              animate={{ backgroundColor: score >= i ? "#111111" : "#E5E5E8" }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-[13px] text-secondary">{hint}</p>
    </div>
  );
}

/** Bottom sheet with spring entrance, backdrop and grabber. */
export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white px-6 pb-8 pt-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Centered iOS-permission style dialog ("Let that time …" + Yes). */
export function PermissionDialog({
  open,
  text,
  onYes,
}: {
  open: boolean;
  text: string;
  onYes: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute inset-x-6 top-[38%] z-50 rounded-[28px] bg-white p-7"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <p className="text-center text-[16px] font-semibold text-navy">{text}</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onYes}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-navy text-[15px] font-semibold text-white"
            >
              Yes
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Coral-active progress dashes for the value carousel. */
export function ProgressDashes({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex flex-1 items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          className="h-1 flex-1 rounded-full"
          animate={{ backgroundColor: i < active ? "#FF6641" : "rgba(17,17,17,0.19)" }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}
