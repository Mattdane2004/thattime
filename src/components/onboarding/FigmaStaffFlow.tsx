"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Lock,
  MessageCircle,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "./StatusBar";
import { useOnboardingStore } from "@/lib/store";

type StaffStep = "accept" | "password" | "profile" | "schedule" | "scheduleList" | "ready";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_LONG_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const SAMPLE_SHIFTS: Record<string, { start: string; end: string } | null> = {
  Mon: null,
  Tue: { start: "09:00", end: "18:00" },
  Wed: { start: "09:00", end: "20:00" },
  Thu: { start: "09:00", end: "20:00" },
  Fri: { start: "09:00", end: "20:00" },
  Sat: { start: "10:00", end: "16:00" },
  Sun: null,
};

function shortTime(value: string) {
  return value.replace(/^0/, "").replace(":00", "");
}

function ThatTimeWordmark() {
  return (
    <div className="font-black leading-none tracking-[-0.06em] text-[#1C1814]">
      that<span className="mx-1 inline-block h-[0.78em] w-[0.24em] translate-y-[0.08em] rounded-[2px] bg-[#FF6641]" />
      time
    </div>
  );
}

function StaffHeader({ onBack }: { onBack?: () => void }) {
  return (
    <>
      <StatusBar />
      <header className="flex h-11 shrink-0 items-center gap-3 bg-white px-[19px]">
        <div className="flex flex-1 justify-start">
          {onBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#0F1A2E] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <ArrowLeft size={21} />
            </button>
          ) : null}
        </div>
        <ThatTimeWordmark />
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            className="text-[14px] text-[#AAA] focus:outline-none focus:ring-2 focus:ring-[#111]"
          >
            Help
          </button>
        </div>
      </header>
    </>
  );
}

function StaffShell({
  children,
  cta,
  onCta,
  onBack,
  ctaDisabled = false,
  secondary,
}: {
  children: ReactNode;
  cta: string;
  onCta: () => void;
  onBack?: () => void;
  ctaDisabled?: boolean;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-white text-[#0F1A2E]">
      <StaffHeader onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6">{children}</div>
      <div className="shrink-0 bg-white px-6 pb-6 pt-4">
        {secondary}
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="flex h-[50px] w-full items-center justify-center rounded-full bg-[#111] text-[15px] font-semibold text-white transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111] disabled:bg-[#B5B5B5]"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function StaffHeading({
  title,
  subhead,
  center = false,
}: {
  title: ReactNode;
  subhead?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : undefined}>
      <h1 className="text-[32px] font-semibold leading-[34px] tracking-[0.01em] text-[#0F1A2E]">
        {title}
      </h1>
      {subhead ? (
        <p className="mt-2 text-[16px] leading-6 tracking-[-0.02em] text-[#6B7280]">{subhead}</p>
      ) : null}
    </div>
  );
}

function StaffInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] text-[#6B7280]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4] focus:border-[#111]"
      />
    </label>
  );
}

function formatStartDate(value: string) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return "Today";
  return target.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function FigmaStaffFlow() {
  const router = useRouter();
  const state = useOnboardingStore();
  const [step, setStep] = useState<StaffStep>("accept");
  const [firstName, setFirstName] = useState(state.joinedStaffFirstName || state.firstName || "Sam");
  const [lastName, setLastName] = useState("Taylor");
  const [email, setEmail] = useState(state.joinedStaffEmail || state.email || "sam@email.com");
  const [phone, setPhone] = useState(state.phone.replace("+44 ", "") || "7123 456789");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>(state.staffPhotoDataUrl || "");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const businessName = state.joinedBusinessName || "Salon Soho";
  const managerName = state.joinedManagerName || "Emma";
  const role = state.joinedStaffRole || "Senior Stylist";
  const startDateLabel = formatStartDate(state.joinedStaffStartDate);
  const workingDays = state.joinedStaffWorkingDays.length > 0
    ? state.joinedStaffWorkingDays
    : ["Tue", "Wed", "Thu", "Fri", "Sat"];
  const workingStart = state.joinedStaffWorkingStart || "09:00";
  const workingEnd = state.joinedStaffWorkingEnd || "18:00";

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  }

  function finishStaffSetup() {
    state.setField("firstName", firstName.trim() || "Sam");
    state.setField("email", email.trim() || "sam@email.com");
    state.setField("phone", `+44 ${phone.trim() || "7123 456789"}`);
    state.setField("joinedBusinessName", businessName);
    state.setField("joinedManagerName", managerName);
    state.setField("staffPassword", password);
    state.setField("staffPhotoDataUrl", photoUrl);
    state.setField("photoAdded", Boolean(photoUrl));
    state.setField("accountType", "staff");
    state.setField("audience", "staff");
    router.push("/staff/home");
  }

  const content = (() => {
    switch (step) {
      case "accept":
        return (
          <StaffShell
            cta="Accept invite"
            onCta={() => setStep("password")}
            onBack={() => router.push("/onboarding/welcome")}
            secondary={
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#FF6641]/30 bg-white px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7F2] text-[#FF6641]">
                  <Lock size={16} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[14px] font-semibold text-[#0F1A2E]">Invited by {managerName}</div>
                  <div className="text-[12px] leading-4 text-[#6B7280]">If this doesn&apos;t look right, contact your manager before accepting.</div>
                </div>
              </div>
            }
          >
            <StaffHeading
              title={
                <>
                  You&apos;re invited to join <span className="text-[#FF6641]">{businessName}</span>
                </>
              }
              subhead={
                <>
                  {managerName} set you up as a <strong>{role}</strong>. Accept and finish your setup in under a minute.
                </>
              }
              center
            />
            <div className="mt-7 grid grid-cols-3 gap-2 text-center">
              {[
                ["Business", businessName],
                ["Role", role],
                ["Start date", startDateLabel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#F5F5F7] px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">{label}</div>
                  <div className="mt-1 truncate text-[12px] font-bold text-[#0F1A2E]">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4 px-4">
              {[
                [CalendarDays, "Manage your bookings on the go"],
                [UserRound, "Client notes and history at a glance"],
                [MessageCircle, `Message ${managerName}, the team and clients in one place`],
                [Bell, "Reminders that keep your day on track"],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof CalendarDays;
                return (
                  <div key={text as string} className="flex items-center gap-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black/5">
                      <ItemIcon size={19} />
                    </span>
                    <span className="text-[13px] font-medium text-[#0F1A2E]">{text as string}</span>
                  </div>
                );
              })}
            </div>
          </StaffShell>
        );

      case "password":
        return (
          <StaffShell
            cta="Continue"
            onCta={() => setStep("profile")}
            onBack={() => setStep("accept")}
            ctaDisabled={password.length < 8}
          >
            <StaffHeading
              title="Set a password"
              subhead={
                <>
                  Use 8 or more characters. You&apos;ll use this with <strong>{email}</strong> to log in.
                </>
              }
            />
            <div className="mt-9">
              <span className="mb-2 block text-[14px] text-[#6B7280]">Password</span>
              <div className="flex h-[56px] w-full items-center rounded-xl border border-[#E5E5E8] bg-white px-4 focus-within:border-[#111]">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4]"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="ml-3 text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  <Eye size={18} />
                </button>
              </div>
              <p className="mt-2 text-[12px] text-[#9CA3AF]">
                {password.length === 0
                  ? "At least 8 characters."
                  : password.length < 8
                  ? `${8 - password.length} more to go.`
                  : "Looks good."}
              </p>
            </div>
          </StaffShell>
        );

      case "profile":
        return (
          <StaffShell cta="Save profile" onCta={() => setStep("schedule")} onBack={() => setStep("password")}>
            <StaffHeading
              title="Create your profile"
              subhead="This is what your manager and clients will see around the schedule."
            />
            <div className="mt-7 flex flex-col items-center">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#F5F5F7] text-[#6B7280] transition focus:outline-none focus:ring-2 focus:ring-[#111]"
                aria-label="Upload profile photo"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Plus size={24} />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoUrl ? (
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="mt-3 text-[13px] text-[#6B7280] underline focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  Remove photo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("schedule")}
                  className="mt-3 text-[13px] text-[#9CA3AF] underline focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  Skip for now
                </button>
              )}
            </div>
            <div className="mt-7">
              <p className="mb-2 text-[14px] text-[#6B7280]">Name</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  autoFocus
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none focus:border-[#111]"
                />
                <input
                  aria-label="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none focus:border-[#111]"
                />
              </div>
            </div>
            <div className="mt-5">
              <StaffInput label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[14px] text-[#6B7280]">Mobile number</p>
              <div className="grid grid-cols-[92px_1fr] gap-3">
                <div className="flex h-[56px] items-center justify-center rounded-xl border border-[#E5E5E8] bg-white text-[16px] font-medium">
                  +44
                </div>
                <input
                  aria-label="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel-national"
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none focus:border-[#111]"
                />
              </div>
            </div>
          </StaffShell>
        );

      case "schedule": {
        const workingCount = Object.values(SAMPLE_SHIFTS).filter((s) => s !== null).length;
        return (
          <StaffShell
            cta="Continue"
            onCta={() => setStep("scheduleList")}
            onBack={() => setStep("profile")}
          >
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
              Your starting week · Layout 1
            </p>
            <div className="mt-3">
              <StaffHeading
                title={
                  <>
                    Here&apos;s your week,{" "}
                    <span className="text-[#FF6641]">{firstName.split(" ")[0]}</span>
                  </>
                }
                subhead={`${managerName} has you in ${workingCount} days a week. Welcome aboard.`}
                center
              />
            </div>

            <div className="mt-10 grid grid-cols-7 gap-1.5">
              {DAY_LABELS.map((day, idx) => {
                const shift = SAMPLE_SHIFTS[day];
                const off = shift === null;
                const range = shift ? `${shortTime(shift.start)}–${shortTime(shift.end)}` : "";
                return (
                  <motion.div
                    key={day}
                    aria-label={`${day} ${off ? "off" : range}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + idx * 0.06, duration: 0.3, ease: "easeOut" }}
                    className={[
                      "flex min-h-[78px] flex-col items-center justify-center rounded-2xl px-1 text-center transition",
                      off
                        ? "border border-[#E5E5E8] bg-white text-[#C9CDD3]"
                        : "bg-[#FF6641] text-white shadow-[0_10px_22px_rgba(255,102,65,0.28)]",
                    ].join(" ")}
                  >
                    <span className="text-[16px] font-extrabold leading-none">{day[0]}</span>
                    {off ? (
                      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C9CDD3]">Off</span>
                    ) : (
                      <span className="mt-1.5 text-[11px] font-semibold leading-none tracking-tight">{range}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-10 text-center text-[13px] leading-5 text-[#6B7280]">
              Not quite right? Let {managerName} tweak it any time.
            </p>
          </StaffShell>
        );
      }

      case "scheduleList": {
        const workingCount = Object.values(SAMPLE_SHIFTS).filter((s) => s !== null).length;
        return (
          <StaffShell
            cta="Looks good"
            onCta={() => setStep("ready")}
            onBack={() => setStep("schedule")}
          >
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
              Your starting week · Layout 2
            </p>
            <div className="mt-3">
              <StaffHeading
                title={
                  <>
                    Here&apos;s your week,{" "}
                    <span className="text-[#FF6641]">{firstName.split(" ")[0]}</span>
                  </>
                }
                subhead={`${managerName} has you in ${workingCount} days a week. Welcome aboard.`}
                center
              />
            </div>

            <div className="mt-8 space-y-2">
              {DAY_LABELS.map((day, idx) => {
                const shift = SAMPLE_SHIFTS[day];
                const off = shift === null;
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.04, duration: 0.24, ease: "easeOut" }}
                    className={[
                      "flex items-center justify-between rounded-2xl px-4 py-3 transition",
                      off
                        ? "bg-[#F7F7F9] text-[#9CA3AF]"
                        : "border border-[#E5E5E8] bg-white text-[#0F1A2E]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold",
                          off ? "bg-white text-[#C9CDD3]" : "bg-[#FF6641] text-white",
                        ].join(" ")}
                      >
                        {day[0]}
                      </span>
                      <span className="text-[15px] font-semibold">{DAY_LONG_NAMES[day]}</span>
                    </div>
                    <span className={off ? "text-[14px]" : "text-[15px] font-semibold tabular-nums"}>
                      {off ? "Off" : `${shift!.start} – ${shift!.end}`}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-8 text-center text-[13px] leading-5 text-[#6B7280]">
              Not quite right? Let {managerName} tweak it any time.
            </p>
          </StaffShell>
        );
      }

      case "ready": {
        const startsInFuture =
          state.joinedStaffStartDate &&
          new Date(state.joinedStaffStartDate).setHours(0, 0, 0, 0) >
            new Date().setHours(0, 0, 0, 0);
        return (
          <StaffShell cta="Go to my schedule" onCta={finishStaffSetup} onBack={() => setStep("scheduleList")}>
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <motion.div
                className="flex h-28 w-28 items-center justify-center rounded-full bg-[#FFF1EA] text-[#FF6641]"
                initial={{ scale: 0.84, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Check size={46} strokeWidth={2.6} />
              </motion.div>
              <h1 className="mt-8 text-[32px] font-semibold leading-[34px] tracking-[0.01em] text-[#0F1A2E]">
                You&apos;re on the team.
              </h1>
              <p className="mt-3 text-[16px] leading-6 text-[#6B7280]">
                Your schedule, clients, and messages for {businessName} will appear here.
              </p>
              <div className="mt-8 w-full rounded-2xl border border-[#E5E5E8] bg-white p-4 text-left">
                <div className="flex items-center gap-3">
                  <Clock3 size={18} className="text-[#FF6641]" />
                  <div>
                    <div className="text-[14px] font-semibold text-[#0F1A2E]">
                      {startsInFuture ? `You start ${startDateLabel}` : "Today"}
                    </div>
                    <div className="text-[13px] text-[#6B7280]">
                      {startsInFuture
                        ? "We'll have your schedule ready."
                        : "3 bookings waiting in your schedule"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaffShell>
        );
      }

      default:
        return null;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className="h-full"
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -22 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

export function FigmaStaffCodeEntry() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [code, setCode] = useState(store.joinCode || "SOHO-247");

  return (
    <div className="flex h-full flex-col bg-white text-[#0F1A2E]">
      <StaffHeader onBack={() => router.push("/onboarding/welcome")} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6">
        <StaffHeading
          title="Got your invite code?"
          subhead="Paste the code from your manager and we'll take you to your staff setup."
        />
        <div className="mt-9">
          <StaffInput label="Invite code" value={code} onChange={(value) => setCode(value.toUpperCase())} autoComplete="one-time-code" />
        </div>
        <div className="mt-5 rounded-2xl bg-[#F5F5F7] p-4 text-[14px] leading-5 text-[#6B7280]">
          No code? Ask whoever runs the business to send one over.
        </div>
      </div>
      <div className="shrink-0 bg-white px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={() => {
            store.setField("joinCode", code.trim() || "SOHO-247");
            if (!store.joinedBusinessName) store.setField("joinedBusinessName", "Salon Soho");
            if (!store.joinedManagerName) store.setField("joinedManagerName", "Emma");
            store.setField("accountType", "staff");
            store.setField("audience", "staff");
            router.push("/onboarding/staff/confirm");
          }}
          className="flex h-[50px] w-full items-center justify-center rounded-full bg-[#111] text-[15px] font-semibold text-white transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
