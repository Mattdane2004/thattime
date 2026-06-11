"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Apple,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Dumbbell,
  Eye,
  EyeOff,
  Flower2,
  HandHeart,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  Paintbrush,
  Scissors,
  Search,
  Sparkles,
  Star,
  Store,
  UserPlus,
  Users,
} from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { BackButton } from "./BackButton";
import { Chip } from "./Chip";
import { CodeInput } from "./CodeInput";
import { Input } from "./Input";
import { MobileFrame } from "./MobileFrame";
import { OnboardingScreen } from "./OnboardingScreen";
import { PrimaryCTA } from "./PrimaryCTA";
import { SelectionCard } from "./SelectionCard";
import { StatusBar } from "./StatusBar";
import { ToggleRow } from "./ToggleRow";
import {
  ClockIllustration,
  ShopIllustration,
  UnlockIllustration,
  WelcomeIllustration,
} from "../illustrations/LineIllustrations";
import {
  mockGetLocation,
  mockJoinByCode,
  mockSendSMS,
  mockSignIn,
  mockSocialAuth,
  mockVerifyCode,
} from "@/lib/mocks";
import {
  calculateSavings,
  getMapPreviewLocation,
  getPricingTier,
  getVerticalTheme,
  isRecognisedPlatform,
} from "@/lib/savings";
import {
  type BookingVolume,
  type ComingFrom,
  type StaffSetupIntent,
  type TeamSize,
  type Vertical,
  type WorkModel,
  useOnboardingStore,
} from "@/lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const verticalOptions: Array<{
  value: Exclude<Vertical, "">;
  icon: ReactNode;
}> = [
  { value: "Hair Salon", icon: <Scissors size={16} /> },
  { value: "Barbershop", icon: <Scissors size={16} /> },
  { value: "Nails", icon: <Paintbrush size={16} /> },
  { value: "Beauty", icon: <Sparkles size={16} /> },
  { value: "Spa", icon: <Flower2 size={16} /> },
  { value: "Wellness", icon: <HandHeart size={16} /> },
  { value: "Fitness", icon: <Dumbbell size={16} /> },
  { value: "Other", icon: <Store size={16} /> },
];

const platformOptions: Exclude<ComingFrom, "">[] = [
  "Fresha",
  "Booksy",
  "Square",
  "GlossGenius",
  "Treatwell",
  "Pen & paper",
  "Instagram DMs",
  "Just starting out",
  "Something else",
];

const goalOptions = [
  "Get more bookings",
  "Reduce no-shows",
  "Save time on admin",
  "Take payments easily",
  "Look more professional",
  "Replace what I use today",
];

const volumeOptions: Array<{ value: Exclude<BookingVolume, "">; label: string }> = [
  { value: "starting", label: "Just starting out (0)" },
  { value: "1-10", label: "1-10 a week" },
  { value: "11-30", label: "11-30 a week" },
  { value: "31+", label: "31+ a week" },
];

const teamSizeOptions: Array<{ value: Exclude<TeamSize, "">; label: string; helper: string }> = [
  { value: "solo", label: "Just me", helper: "Solo for now." },
  { value: "2-5", label: "2 to 5", helper: "A small team." },
  { value: "6-10", label: "6 to 10", helper: "A studio-sized team." },
  { value: "11+", label: "11 or more", helper: "We'll tailor this for you." },
];

const staffSetupOptions: Array<{
  value: Exclude<StaffSetupIntent, "">;
  label: string;
  helper: string;
}> = [
  {
    value: "invite_later",
    label: "Invite them later",
    helper: "Keep moving and add the team from your checklist.",
  },
  {
    value: "invite_now",
    label: "I want to add staff now",
    helper: "We'll make team invites your first setup step.",
  },
  {
    value: "not_yet",
    label: "Not yet",
    helper: "Useful if you are solo or still hiring.",
  },
  {
    value: "unsure",
    label: "I'm not sure",
    helper: "No pressure — we will keep it flexible.",
  },
];

const workModelOptions: Array<{
  value: WorkModel;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    value: "shop",
    title: "At my place",
    description: "Clients come to your shop, salon, studio, or space.",
    icon: <Store size={24} />,
  },
  {
    value: "mobile",
    title: "I travel to clients",
    description: "You work at their home, office, venue, or event.",
    icon: <MapPin size={24} />,
  },
  {
    value: "home",
    title: "From home",
    description: "You work from home and can choose privacy settings later.",
    icon: <Home size={24} />,
  },
  {
    value: "virtual",
    title: "Virtual appointments",
    description: "You work online, but we still keep an address on file.",
    icon: <Sparkles size={24} />,
  },
  {
    value: "multiple",
    title: "More than one place",
    description: "Use the base address now and add the rest after setup.",
    icon: <Building2 size={24} />,
  },
];

function firstNameFallback(name: string) {
  return name.trim() || "Alex";
}

function businessNameFallback(name: string) {
  return name.trim() || "Your new store";
}

function useResendTimer() {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  return {
    seconds,
    reset: () => setSeconds(30),
  };
}

function PasswordStrength({ password }: { password: string }) {
  const score =
    password.length >= 12 ? 3 : password.length >= 8 && /\d/.test(password) ? 2 : password.length >= 8 ? 1 : 0;
  const labels = ["Weak", "Medium", "Strong"];

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={[
              "h-1.5 rounded-full transition-colors",
              score >= item ? "bg-navy" : "bg-border",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-2 text-[13px] text-secondary">
        {score > 0 ? labels[score - 1] : "At least 8 characters"}
      </div>
    </div>
  );
}

function AuthButton({
  label,
  icon,
  loading,
  dark,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  dark?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={[
        "flex h-14 w-full items-center justify-center gap-3 rounded-xl border text-[16px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:opacity-70",
        dark
          ? "border-navy bg-navy text-white"
          : "border-border bg-white text-navy hover:border-navy/25",
      ].join(" ")}
    >
      {loading ? (
        <span
          className={`h-5 w-5 rounded-full border-2 border-t-transparent ${dark ? "border-white" : "border-navy"}`}
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </motion.button>
  );
}

type SocialProvider = "apple" | "google" | "facebook";
type AuthLoadingProvider = SocialProvider | "email" | null;

function ThatTimeMark() {
  return (
    <div className="text-[17px] font-bold tracking-[-0.01em] text-[#1C1814]">
      that<span className="px-0.5 text-[#8D8B88]">·</span>time
    </div>
  );
}

function FacebookGlyph() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-[18px] font-bold leading-none text-white">
      f
    </span>
  );
}

function GoogleGlyph() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[18px] font-bold leading-none text-[#4285F4]">
      G
    </span>
  );
}

function normalizeEmail(value: string, fallback = "you@yourshop.com") {
  const trimmed = value.trim();
  return EMAIL_RE.test(trimmed) ? trimmed : fallback;
}

function applyEmailDomain(value: string, domain: string) {
  const local = value.split("@")[0]?.trim() || "you";
  return `${local.replace(/\s+/g, "").toLowerCase()}${domain}`;
}

function DomainChips({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (email: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {["@gmail.com", "@hotmail.com", "@hotmail.co.uk"].map((domain) => (
        <button
          key={domain}
          type="button"
          onClick={() => setEmail(applyEmailDomain(email, domain))}
          className="rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-[#6E6B67] ring-1 ring-[#D9D6D1] transition hover:text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-navy"
        >
          {domain}
        </button>
      ))}
    </div>
  );
}

function AccountAccessLayout({
  title,
  subhead,
  email,
  setEmail,
  loadingProvider,
  onEmailContinue,
  onSocial,
  backHref,
  children,
  footer,
}: {
  title: string;
  subhead: string;
  email: string;
  setEmail: (email: string) => void;
  loadingProvider: AuthLoadingProvider;
  onEmailContinue: () => void;
  onSocial: (provider: SocialProvider) => void;
  backHref: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#F5F5F7]">
        <StatusBar />
        <header className="shrink-0 px-6 pb-2">
          <div className="relative flex h-12 items-center justify-center">
            <div className="absolute left-0">
              <BackButton href={backHref} />
            </div>
            <ThatTimeMark />
            <button
              type="button"
              className="absolute right-0 text-[14px] font-semibold text-[#1C1814] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
            >
              Help
            </button>
          </div>
        </header>
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-7">
          <h1 className="max-w-[315px] text-[40px] font-bold leading-[1.04] tracking-[-0.01em] text-[#081316]">
            {title}
          </h1>
          <p className="mt-6 max-w-[320px] text-[20px] leading-[1.4] text-[#77736F]">
            {subhead}
          </p>
          {children}
          <div className="mt-7">
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold text-[#6E6B67]">
                Email
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@yourshop.com"
                className="h-14 w-full rounded-xl border border-[#D3D2D0] bg-white px-4 text-[16px] text-[#081316] outline-none transition placeholder:text-[#A4A3A1] focus:border-[#081316]"
              />
            </label>
            <DomainChips email={email} setEmail={setEmail} />
            <button
              type="button"
              onClick={onEmailContinue}
              disabled={loadingProvider !== null}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-[#081316] text-[16px] font-bold text-white transition hover:bg-[#15212B] focus:outline-none focus:ring-2 focus:ring-[#081316] focus:ring-offset-2 disabled:opacity-70"
            >
              {loadingProvider === "email" ? (
                <span
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  style={{ animation: "spin 0.8s linear infinite" }}
                  aria-label="Loading"
                />
              ) : (
                "Continue"
              )}
            </button>
          </div>
          <div className="my-6 flex items-center gap-4 text-[13px] font-medium uppercase tracking-[0.02em] text-[#8D8B88]">
            <span className="h-px flex-1 bg-[#D9D6D1]" />
            Or
            <span className="h-px flex-1 bg-[#D9D6D1]" />
          </div>
          <div className="space-y-3">
            <AuthButton
              label="Continue with Apple"
              icon={<Apple size={22} fill="currentColor" />}
              loading={loadingProvider === "apple"}
              dark
              onClick={() => onSocial("apple")}
            />
            <AuthButton
              label="Continue with Google"
              icon={<GoogleGlyph />}
              loading={loadingProvider === "google"}
              onClick={() => onSocial("google")}
            />
            <AuthButton
              label="Continue with Facebook"
              icon={<FacebookGlyph />}
              loading={loadingProvider === "facebook"}
              onClick={() => onSocial("facebook")}
            />
          </div>
          <div className="mt-auto pt-6">
            {footer ?? (
              <p className="text-center text-[12px] leading-5 text-[#77736F]">
                By using That Time you agree to our Terms and Privacy Policy.
              </p>
            )}
          </div>
        </section>
      </div>
    </MobileFrame>
  );
}

function DiscoveryCard({
  title,
  address,
}: {
  title: string;
  address: string;
}) {
  return (
    <article className="w-[225px] shrink-0 overflow-hidden rounded-lg bg-white">
      <Image
        src="/figma/barber-card.png"
        alt=""
        width={225}
        height={127}
        className="h-[127px] w-full object-cover"
      />
      <div className="p-2">
        <h3 className="truncate text-[20px] font-bold leading-7 text-black">{title}</h3>
        <div className="mt-0.5 flex items-center gap-1 text-[12px] font-medium leading-4 text-black">
          <span>5.0</span>
          <Star size={12} />
          <span>(765)</span>
        </div>
        <p className="mt-1 truncate text-[14px] leading-5 text-[#6B7280]">{address}</p>
      </div>
    </article>
  );
}

function MapPreview({ label }: { label: string }) {
  return (
    <div className="relative h-52 overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      <div className="absolute inset-0 bg-[#EEF2F6]" />
      <div className="absolute left-[-30px] top-10 h-7 w-[480px] rotate-[-18deg] rounded-full bg-white/90" />
      <div className="absolute left-[-80px] top-32 h-6 w-[520px] rotate-[12deg] rounded-full bg-white/85" />
      <div className="absolute left-36 top-[-40px] h-[330px] w-7 rotate-[28deg] rounded-full bg-white/80" />
      <div className="absolute left-8 top-7 h-16 w-24 rounded-2xl bg-[#DDE7EF]" />
      <div className="absolute right-8 top-10 h-20 w-28 rounded-2xl bg-[#D8E4DC]" />
      <div className="absolute bottom-6 left-10 h-16 w-28 rounded-2xl bg-[#E8E1D7]" />
      <div className="absolute bottom-8 right-10 h-14 w-24 rounded-2xl bg-[#DDE7EF]" />
      <motion.div
        className="absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-card">
          <MapPin size={23} fill="currentColor" />
        </div>
        <div className="mt-3 max-w-[230px] rounded-full bg-white px-4 py-2 text-center text-[13px] font-semibold text-navy shadow-card ring-1 ring-border">
          {label}
        </div>
      </motion.div>
    </div>
  );
}

function ChecklistOption({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex w-full items-start gap-4 rounded-2xl border bg-white p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2",
        selected ? "border-navy bg-[#F8FAFC]" : "border-border hover:border-navy/25",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-navy text-white" : "bg-canvas text-navy",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold leading-5 text-navy">
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-secondary">
          {description}
        </span>
      </span>
      <span
        className={[
          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-navy bg-navy text-white" : "border-border text-transparent",
        ].join(" ")}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </motion.button>
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-3">
        <div className="flex flex-col items-center text-center">
          <div className="h-28 w-36">
            <WelcomeIllustration />
          </div>
          <div className="mt-6 text-[36px] font-semibold leading-none text-navy">That Time</div>
          <p className="mt-3 max-w-[280px] text-[16px] leading-6 text-secondary">
            Build your setup first. Save it when it is worth keeping.
          </p>
        </div>
        <div className="mt-12 flex-1 space-y-3 overflow-y-auto">
          <PrimaryCTA
            onClick={() => {
              reset();
              router.push("/onboarding/business-role");
            }}
          >
            Get started
          </PrimaryCTA>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-navy bg-white text-[16px] font-semibold text-navy transition hover:bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-navy"
          >
            I already have an account
          </button>
        </div>
        <div className="space-y-3 pt-4 text-center">
          <p className="mx-auto max-w-[300px] text-[12px] leading-5 text-muted">
            No account needed until there is something to save.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BusinessRoleScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((state) => state.setField);
  const [selected, setSelected] = useState<"owner" | "staff" | "client">("owner");

  function continueNext() {
    if (selected === "staff") {
      setField("mode", "business");
      setField("accountType", "staff");
      setField("audience", "staff");
    } else if (selected === "client") {
      setField("mode", "client");
      setField("accountType", null);
      setField("audience", "client");
    } else {
      setField("mode", "business");
      setField("accountType", "owner");
      setField("audience", "owner");
    }
    router.push("/onboarding/user-type-benefits");
  }

  return (
    <OnboardingScreen
      title="What are you using That Time for?"
      subhead="We will keep the setup matched to what you need today."
      progress={3}
      backHref="/onboarding/welcome"
      cta={<PrimaryCTA onClick={continueNext}>Continue</PrimaryCTA>}
    >
      <div className="space-y-4">
        <ChecklistOption
          selected={selected === "owner"}
          icon={<BriefcaseBusiness size={26} />}
          title="Run or manage a business"
          description="Build your shop first, then save it when it feels right."
          onClick={() => setSelected("owner")}
        />
        <ChecklistOption
          selected={selected === "client"}
          icon={<CalendarDays size={26} />}
          title="I want to book somewhere"
          description="Browse real availability first, sign up only when you book."
          onClick={() => setSelected("client")}
        />
        <ChecklistOption
          selected={selected === "staff"}
          icon={<UserPlus size={26} />}
          title="I'm joining a team"
          description="Claim your spot and get straight to your calendar."
          onClick={() => setSelected("staff")}
        />
      </div>
    </OnboardingScreen>
  );
}

function PhaseSplash({
  eyebrow,
  title,
  subhead,
  visual,
  items,
  ctaLabel,
  onContinue,
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  subhead: ReactNode;
  visual: ReactNode;
  items?: Array<{ icon: ReactNode; label: string }>;
  ctaLabel: string;
  onContinue: () => void;
  tone?: "light" | "navy";
}) {
  const dark = tone === "navy";

  return (
    <div className={["flex h-full flex-col", dark ? "bg-navy text-white" : "bg-[#FFFCF7] text-navy"].join(" ")}>
      <StatusBar tone={dark ? "light" : "dark"} />
      <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-8 text-center">
        {eyebrow ? (
          <div className={["text-[12px] font-semibold uppercase tracking-[0.18em]", dark ? "text-white/55" : "text-muted"].join(" ")}>
            {eyebrow}
          </div>
        ) : null}
        <motion.div
          className="mx-auto mt-6 flex h-36 w-36 items-center justify-center"
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {visual}
        </motion.div>
        <h1 className={["mt-8 text-[34px] font-semibold leading-[1.05]", dark ? "text-white" : "text-navy"].join(" ")}>
          {title}
        </h1>
        <p className={["mt-4 text-[16px] leading-6", dark ? "text-white/72" : "text-secondary"].join(" ")}>
          {subhead}
        </p>
        {items ? (
          <div className="mt-7 grid grid-cols-3 gap-2">
            {items.map((item) => (
              <div
                key={item.label}
                className={["rounded-2xl px-2 py-3 text-center text-[12px] font-semibold leading-4", dark ? "bg-white/10 text-white" : "bg-white text-navy ring-1 ring-border"].join(" ")}
              >
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-navy">
                  {item.icon}
                </div>
                {item.label}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-auto pt-6">
          <PrimaryCTA tone={dark ? "white" : "navy"} onClick={onContinue}>
            {ctaLabel}
          </PrimaryCTA>
        </div>
      </section>
    </div>
  );
}

export function UserTypeBenefitScreen() {
  const router = useRouter();
  const state = useOnboardingStore();

  if (state.audience === "staff") {
    return (
      <PhaseSplash
        eyebrow="Team access"
        title="See your day, then claim it."
        subhead="Your calendar, breaks, and client messages stay focused on what you need at work."
        visual={<KeyRound size={78} strokeWidth={1.7} />}
        items={[
          { icon: <CalendarDays size={16} />, label: "Your day" },
          { icon: <Clock3 size={16} />, label: "Breaks" },
          { icon: <MessageCircle size={16} />, label: "Messages" },
        ]}
        ctaLabel="Enter invite code"
        onContinue={() => router.push("/onboarding/staff/code")}
      />
    );
  }

  if (state.audience === "client") {
    return (
      <PhaseSplash
        eyebrow="Client booking"
        title="Find what you want, then book it."
        subhead="Browse real services first. We will only ask you to sign up when you choose a time."
        visual={<CalendarDays size={82} strokeWidth={1.7} />}
        items={[
          { icon: <Search size={16} />, label: "Browse" },
          { icon: <Sparkles size={16} />, label: "Compare" },
          { icon: <Check size={16} />, label: "Book" },
        ]}
        ctaLabel="Browse services"
        onContinue={() => router.push("/client/browse")}
      />
    );
  }

  return (
    <PhaseSplash
      eyebrow="Business setup"
      title="Build your shop, then save it."
      subhead="We will create a working preview first, then you can decide if you want to keep it."
      visual={<ShopIllustration />}
      items={[
        { icon: <Store size={16} />, label: "Your shop" },
        { icon: <Clock3 size={16} />, label: "Savings" },
        { icon: <KeyRound size={16} />, label: "Save last" },
      ]}
      ctaLabel="See how it works"
      onContinue={() => router.push("/onboarding/business/intro")}
    />
  );
}

export function OwnerIntroScreen() {
  const router = useRouter();

  return (
    <PhaseSplash
      eyebrow="About 1 minute"
      title="Let's set up your business."
      subhead="We will keep this short. You can finish the rest once you are inside."
      visual={<ShopIllustration />}
      items={[
        { icon: <Store size={16} />, label: "Name it" },
        { icon: <Scissors size={16} />, label: "Pick a type" },
        { icon: <MapPin size={16} />, label: "Place it" },
      ]}
      ctaLabel="Let's go"
      onContinue={() => router.push("/onboarding/business/name")}
    />
  );
}

export function OwnerContextIntroScreen() {
  const router = useRouter();
  const name = firstNameFallback(useOnboardingStore((state) => state.firstName));

  return (
    <PhaseSplash
      eyebrow="About 30 seconds"
      title={`A few quick questions, ${name}.`}
      subhead="These help tailor your dashboard and work out what you would save on That Time."
      visual={<ClockIllustration />}
      items={[
        { icon: <BriefcaseBusiness size={16} />, label: "Platform" },
        { icon: <CalendarDays size={16} />, label: "Bookings" },
        { icon: <CreditCard size={16} />, label: "Plan" },
      ]}
      ctaLabel="Continue"
      onContinue={() => router.push("/onboarding/business/coming-from")}
    />
  );
}

export function SaveSetupIntroScreen() {
  const router = useRouter();

  return (
    <PhaseSplash
      eyebrow="Last step"
      title="Save it all to your account."
      subhead="So your business setup, numbers, and trial do not disappear when you leave."
      visual={<KeyRound size={82} strokeWidth={1.7} />}
      items={[
        { icon: <Apple size={16} />, label: "Apple" },
        { icon: <span className="text-[14px] font-bold">G</span>, label: "Google" },
        { icon: <MessageCircle size={16} />, label: "Phone" },
      ]}
      ctaLabel="Save my setup"
      onContinue={() => router.push("/onboarding/auth")}
    />
  );
}

export function AuthChoiceScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const [email, setEmail] = useState(state.email);
  const [loadingProvider, setLoadingProvider] = useState<AuthLoadingProvider>(null);

  const isStaff = state.accountType === "staff";
  const title = isStaff ? "create your staff account" : "save your setup";
  const subhead = isStaff
    ? "Sign up with email or continue with your favourite account to claim your place."
    : "Sign up with email or continue with your favourite account to keep building your business.";
  const backHref = isStaff ? "/onboarding/staff/confirm" : "/onboarding/business/save";

  async function handleSocial(provider: SocialProvider) {
    setLoadingProvider(provider);
    const result = await mockSocialAuth(provider);
    state.setField("authMethod", provider);
    state.setField("email", result.email);
    setLoadingProvider(null);
    router.push("/onboarding/phone");
  }

  async function handleEmailContinue() {
    setLoadingProvider("email");
    window.setTimeout(() => {
      state.setField("authMethod", "email");
      state.setField("email", normalizeEmail(email, "alex@example.com"));
      setLoadingProvider(null);
      router.push("/onboarding/phone");
    }, 350);
  }

  return (
    <AccountAccessLayout
      title={title}
      subhead={subhead}
      email={email}
      setEmail={setEmail}
      loadingProvider={loadingProvider}
      onEmailContinue={handleEmailContinue}
      onSocial={handleSocial}
      backHref={backHref}
    />
  );
}

export function StaffCodeScreen() {
  const router = useRouter();
  const joinCode = useOnboardingStore((state) => state.joinCode);
  const setField = useOnboardingStore((state) => state.setField);
  const [code, setCode] = useState(joinCode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verifyCode() {
    if (!code.trim()) {
      setError("Pop in the code your manager sent.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await mockJoinByCode(code);
    setLoading(false);
    if (!result.success) {
      setError("That code didn't work. Double-check with your manager.");
      return;
    }
    setField("joinCode", code.trim().toUpperCase());
    setField("joinedBusinessName", result.businessName);
    setField("joinedManagerName", result.managerName);
    router.push("/onboarding/staff/confirm");
  }

  return (
    <OnboardingScreen
      title="Got your team code?"
      subhead="Your manager invited you with a 6-character code. Pop it in below."
      progress={10}
      backHref="/onboarding/business-role"
      cta={
        <PrimaryCTA loading={loading} onClick={verifyCode}>
          Verify code
        </PrimaryCTA>
      }
    >
      <Input
        label="Team code"
        value={code}
        onChange={(event) => {
          setError(null);
          setCode(event.target.value.toUpperCase());
        }}
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoFocus
        placeholder="TT-NOVA"
        error={error || undefined}
      />
      <div className="mt-5 rounded-2xl bg-white p-4 text-[14px] leading-5 text-secondary ring-1 ring-border">
        Don&apos;t have a code? Ask whoever runs the business — they can send one from their setup checklist.
      </div>
    </OnboardingScreen>
  );
}

export function StaffConfirmScreen() {
  const router = useRouter();
  const joinedBusinessName = useOnboardingStore((state) => state.joinedBusinessName);
  const joinedManagerName = useOnboardingStore((state) => state.joinedManagerName);
  const businessName = joinedBusinessName || "your team";
  const managerName = joinedManagerName || "Your manager";

  return (
    <div className="flex h-full flex-col bg-[#FFFCF7]">
      <StatusBar />
      <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-8 text-center">
        <motion.div
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#ECFDF5] text-success"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Check size={48} strokeWidth={2.6} />
        </motion.div>
        <h1 className="mt-8 text-[32px] font-semibold leading-[1.08] text-navy">
          You&apos;re joining {businessName}.
        </h1>
        <p className="mt-4 text-[16px] leading-6 text-secondary">
          {managerName} added you as a team member. Let&apos;s set up your account so you can sign in.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-4 text-left ring-1 ring-border">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-muted">Joining</div>
          <div className="mt-1 text-[16px] font-semibold text-navy">{businessName}</div>
          <div className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Invited by
          </div>
          <div className="mt-1 text-[16px] font-semibold text-navy">{managerName}</div>
        </div>
        <div className="mt-auto pt-5">
          <PrimaryCTA onClick={() => router.push("/onboarding/auth")}>Continue</PrimaryCTA>
        </div>
      </section>
    </div>
  );
}

export function EmailScreen() {
  const router = useRouter();
  const email = useOnboardingStore((state) => state.email);
  const setField = useOnboardingStore((state) => state.setField);
  const { register, handleSubmit, watch } = useForm<{ email: string }>({
    mode: "onChange",
    defaultValues: { email },
  });
  const currentEmail = watch("email");
  const isValid = EMAIL_RE.test(currentEmail || "");

  return (
    <OnboardingScreen
      title="What's your email?"
      subhead="We'll use this for important updates about your account."
      progress={9}
      backHref="/onboarding/auth"
      cta={
        <PrimaryCTA
          onClick={handleSubmit((data) => {
            setField("authMethod", "email");
            const emailValue = data.email?.trim() || "";
            setField("email", EMAIL_RE.test(emailValue) ? emailValue : "alex@example.com");
            router.push("/onboarding/password");
          })}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <Input
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoFocus
        error={currentEmail && !isValid ? "Pop in a valid email address." : undefined}
        {...register("email")}
      />
    </OnboardingScreen>
  );
}

export function PasswordScreen() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, watch } = useForm<{ password: string }>({
    mode: "onChange",
    defaultValues: { password: "" },
  });
  const password = watch("password");

  return (
    <OnboardingScreen
      title="Create a password"
      subhead="At least 8 characters. Make it memorable."
      progress={15}
      backHref="/onboarding/email"
      cta={
        <PrimaryCTA
          onClick={handleSubmit(() => router.push("/onboarding/verify-email"))}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <Input
        label="Password"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        autoFocus
        rightElement={
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...register("password")}
      />
      <PasswordStrength password={password || ""} />
    </OnboardingScreen>
  );
}

export function VerifyEmailScreen() {
  const router = useRouter();
  const email = useOnboardingStore((state) => state.email);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useResendTimer();

  async function verify() {
    setLoading(true);
    const result = await mockVerifyCode(code.padEnd(6, "0").slice(0, 6));
    setLoading(false);
    if (result.success) router.push("/onboarding/phone");
  }

  return (
    <OnboardingScreen
      title="Check your email"
      subhead={`We sent a 6-digit code to ${email || "alex@example.com"}.`}
      progress={22}
      backHref="/onboarding/password"
      cta={
        <PrimaryCTA loading={loading} onClick={verify}>
          Verify
        </PrimaryCTA>
      }
    >
      <div className="space-y-5">
        <CodeInput label="Email code" value={code} onChange={setCode} />
        <ResendButton seconds={timer.seconds} onResend={timer.reset} />
      </div>
    </OnboardingScreen>
  );
}

function ResendButton({
  seconds,
  onResend,
}: {
  seconds: number;
  onResend: () => void;
}) {
  return (
    <button
      type="button"
      disabled={seconds > 0}
      onClick={onResend}
      className="text-[15px] font-semibold text-navy underline-offset-4 hover:underline disabled:text-muted disabled:no-underline focus:outline-none focus:ring-2 focus:ring-navy"
    >
      {seconds > 0 ? `Resend in ${seconds}s` : "Didn't get it? Resend"}
    </button>
  );
}

export function PhoneScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const { register, handleSubmit } = useForm<{ country: string; phone: string }>({
    mode: "onChange",
    defaultValues: { country: "+44", phone: state.phone.replace("+44 ", "") },
  });
  const [loading, setLoading] = useState(false);

  async function send(data: { country: string; phone: string }) {
    setLoading(true);
    const country = data.country || "+44";
    const phone = data.phone?.trim() || "7123 456789";
    const formatted = `${country} ${phone}`;
    await mockSendSMS(formatted);
    state.setField("phone", formatted);
    setLoading(false);
    router.push("/onboarding/verify-phone");
  }

  return (
    <OnboardingScreen
      title="What's your number?"
      subhead="We'll text you a code to confirm it's you. We never share this."
      progress={29}
      backHref={state.authMethod === "email" ? "/onboarding/verify-email" : "/onboarding/auth"}
      cta={
        <PrimaryCTA loading={loading} onClick={handleSubmit(send)}>
          Send code
        </PrimaryCTA>
      }
    >
      <div className="grid grid-cols-[92px_1fr] gap-3">
        <label className="block">
          <span className="mb-2 block text-[14px] text-secondary">Code</span>
          <select
            className="h-14 w-full rounded-xl border border-border bg-white px-3 text-[16px] text-navy outline-none focus:border-navy"
            aria-label="Country code"
            {...register("country")}
          >
            <option value="+44">+44</option>
            <option value="+353">+353</option>
            <option value="+1">+1</option>
          </select>
        </label>
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus
          placeholder="7123 456789"
          {...register("phone")}
        />
      </div>
    </OnboardingScreen>
  );
}

export function VerifyPhoneScreen() {
  const router = useRouter();
  const phone = useOnboardingStore((state) => state.phone);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useResendTimer();

  async function verify() {
    setLoading(true);
    const result = await mockVerifyCode(code.padEnd(6, "0").slice(0, 6));
    setLoading(false);
    if (!result.success) return;
    setSuccess(true);
    window.setTimeout(() => {
      router.push(
        useOnboardingStore.getState().accountType === "owner"
          ? "/onboarding/business/terms"
          : "/onboarding/name",
      );
    }, 800);
  }

  return (
    <OnboardingScreen
      title="Enter your code"
      subhead={`We sent a code to ${phone || "+44 7XXX XXX XXX"}.`}
      progress={36}
      backHref="/onboarding/phone"
      cta={
        <PrimaryCTA loading={loading} disabled={success} onClick={verify}>
          Verify
        </PrimaryCTA>
      }
    >
      <div className="space-y-5">
        {success ? (
          <motion.div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5] text-success"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <motion.path
                d="M11 22.5 18 29l14-17"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
            </motion.svg>
          </motion.div>
        ) : (
          <>
            <CodeInput label="SMS code" value={code} onChange={setCode} />
            <ResendButton seconds={timer.seconds} onResend={timer.reset} />
          </>
        )}
      </div>
    </OnboardingScreen>
  );
}

export function NameScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((state) => state.firstName);
  const setField = useOnboardingStore((state) => state.setField);
  const { register, handleSubmit } = useForm<{ firstName: string }>({
    mode: "onChange",
    defaultValues: { firstName },
  });

  return (
    <OnboardingScreen
      title="What shall we call you?"
      subhead="First name is plenty for now."
      progress={43}
      backHref="/onboarding/verify-phone"
      cta={
        <PrimaryCTA
          onClick={handleSubmit((data) => {
            setField("firstName", data.firstName?.trim() || "Alex");
            router.push("/onboarding/photo");
          })}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <Input
        label="First name"
        autoComplete="given-name"
        autoFocus
        {...register("firstName")}
      />
    </OnboardingScreen>
  );
}

export function PhotoScreen() {
  const router = useRouter();
  const name = firstNameFallback(useOnboardingStore((state) => state.firstName));
  const photoAdded = useOnboardingStore((state) => state.photoAdded);
  const accountType = useOnboardingStore((state) => state.accountType);
  const setField = useOnboardingStore((state) => state.setField);
  const [loading, setLoading] = useState(false);

  const nextHref = accountType === "staff" ? "/staff/home" : "/onboarding/business/name";

  function addPhoto() {
    setLoading(true);
    window.setTimeout(() => {
      setField("photoAdded", true);
      setLoading(false);
    }, 600);
  }

  return (
    <OnboardingScreen
      title="Add a profile photo?"
      subhead="Clients like knowing who they are booking with."
      progress={50}
      backHref="/onboarding/name"
      skipHref={nextHref}
      cta={
        <div className="space-y-3">
          <PrimaryCTA onClick={() => router.push(nextHref)}>Continue</PrimaryCTA>
          <button
            type="button"
            onClick={() => router.push(nextHref)}
            className="h-11 w-full text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
          >
            Skip for now
          </button>
        </div>
      }
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addPhoto}
          className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full bg-white text-secondary ring-1 ring-border transition-colors hover:bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-navy"
          aria-label="Add profile photo"
        >
          {loading ? (
            <span
              className="h-6 w-6 rounded-full border-2 border-navy border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : photoAdded ? (
            <div className="flex h-full w-full items-center justify-center bg-[#ECFDF5] text-[38px] font-semibold text-success">
              {name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Camera size={30} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </OnboardingScreen>
  );
}


export function BusinessNameScreen() {
  const router = useRouter();
  const businessName = useOnboardingStore((state) => state.businessName);
  const setField = useOnboardingStore((state) => state.setField);
  const { register, handleSubmit } = useForm<{ businessName: string }>({
    mode: "onChange",
    defaultValues: { businessName },
  });

  return (
    <OnboardingScreen
      title="What is your business called?"
      subhead="Let us put the name above the door first."
      progress={16}
      backHref="/onboarding/business/intro"
      cta={
        <PrimaryCTA
          onClick={handleSubmit((data) => {
            setField("businessName", data.businessName?.trim() || "That Time Studio");
            router.push("/onboarding/business/types");
          })}
        >
          Save and continue
        </PrimaryCTA>
      }
    >
      <Input
        label="Business name"
        autoComplete="organization"
        autoFocus
        placeholder="Studio Nova"
        {...register("businessName")}
      />
    </OnboardingScreen>
  );
}

export function BusinessTypesScreen() {
  const router = useRouter();
  const state = useOnboardingStore();

  function continueNext() {
    if (state.businessTypes.length === 0) {
      state.setPrimaryBusinessType("Hair Salon");
    }
    router.push("/onboarding/business/work-model");
  }

  return (
    <OnboardingScreen
      title="What kind of business do you run?"
      subhead="Choose your main type first, then tap anything else you also offer."
      progress={28}
      backHref="/onboarding/business/name"
      cta={<PrimaryCTA onClick={continueNext}>Continue</PrimaryCTA>}
    >
      <div className="grid grid-cols-2 gap-3">
        {verticalOptions.map((option) => {
          const selected = state.businessTypes.includes(option.value);
          const primary = state.primaryBusinessType === option.value;

          return (
            <Chip
              key={option.value}
              selected={selected}
              onClick={() => {
                if (!selected || primary) {
                  state.toggleBusinessType(option.value);
                  return;
                }

                state.setPrimaryBusinessType(option.value);
              }}
              icon={option.icon}
            >
              <span className="flex flex-col items-start leading-tight">
                <span>{option.value}</span>
                {selected ? (
                  <span
                    className={[
                      "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                      primary ? "text-white/70" : "text-white/55",
                    ].join(" ")}
                  >
                    {primary ? "Primary" : "Secondary"}
                  </span>
                ) : null}
              </span>
            </Chip>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}

export function VerticalScreen() {
  return <BusinessTypesScreen />;
}


export function LocationModelScreen() {
  return <WorkModelScreen />;
}

export function AddressScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const selectedModels = state.workModels.length > 0 ? state.workModels : ["shop"];
  const isMobile = selectedModels.includes("mobile");
  const isHome = selectedModels.includes("home");
  const isVirtualOnly = selectedModels.includes("virtual") && selectedModels.length === 1;
  const shouldOfferPrivacy = isMobile || isHome;
  const mapLabel = state.publicArea.trim() || getMapPreviewLocation(state);
  const addressTitle = isMobile
    ? "Where do you travel from?"
    : isVirtualOnly
      ? "What address should we keep on file?"
      : "Where should we put you on the map?";
  const addressSubhead = isMobile
    ? "We’ll use this privately to set your default travel area and fees."
    : isVirtualOnly
      ? "This helps with account setup. It won’t be shown on virtual bookings."
      : "One base address is enough for now; you choose what clients see before booking.";

  async function useLocation() {
    setLoading(true);
    const result = await mockGetLocation();
    const next = `${result.city}, ${result.postcode}`;
    state.setField("baseAddress", next);
    state.setField("primaryLocation", next);
    state.setField("location", next);
    state.setField("publicArea", result.city);
    setLoading(false);
  }

  return (
    <OnboardingScreen
      title={addressTitle}
      subhead={addressSubhead}
      progress={42}
      backHref="/onboarding/business/work-model"
      cta={
        <PrimaryCTA
          onClick={() => {
            const fallback = state.baseAddress.trim() || "35 Luke Street, Shoreditch";
            const publicFallback = state.publicArea.trim() || "Shoreditch";
            state.setField("baseAddress", fallback);
            state.setField("primaryLocation", fallback);
            state.setField("location", fallback);
            state.setField("publicArea", publicFallback);
            if (isMobile) {
              state.setField("travelRadius", state.travelRadius.trim() || "8");
              state.setField("travelFee", state.travelFee.trim() || "5");
            }
            router.push("/onboarding/business/team-size");
          }}
        >
          Save and continue
        </PrimaryCTA>
      }
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={useLocation}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-navy bg-white text-[16px] font-semibold text-navy transition-colors hover:bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-70"
        >
          {loading ? (
            <span
              className="h-5 w-5 rounded-full border-2 border-navy border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : (
            <>
              <MapPin size={18} />
              Use my location
            </>
          )}
        </button>
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span className="h-px flex-1 bg-border" />
          Or type it in
          <span className="h-px flex-1 bg-border" />
        </div>
        <Input
          label="Base address or postcode"
          value={state.baseAddress}
          onChange={(event) => state.setField("baseAddress", event.target.value)}
          autoComplete="postal-code"
          placeholder="35 Luke Street, Shoreditch"
        />
        {!isVirtualOnly ? (
          <div className="space-y-2">
            <Input
              label="Public area before booking"
              value={state.publicArea}
              onChange={(event) => state.setField("publicArea", event.target.value)}
              autoComplete="address-level2"
              placeholder="Shoreditch"
            />
            <p className="text-[13px] leading-5 text-muted">
              Clients see this broader area first. The exact address can stay private until booking is confirmed.
            </p>
          </div>
        ) : null}
        {shouldOfferPrivacy ? (
          <ToggleRow
            checked={state.hideFullAddressUntilBooking}
            onChange={(checked) => state.setField("hideFullAddressUntilBooking", checked)}
            title="Hide my full address until booking"
            description={`Show ${state.publicArea || "your area"} publicly, then reveal the address after a confirmed booking.`}
          />
        ) : null}
        {isMobile ? (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-navy">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-navy">Default travel settings</p>
                <p className="mt-1 text-[13px] leading-5 text-secondary">
                  We’ll use these for mobile services first, then you can fine tune by service later.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Input
                label="Travel radius"
                value={state.travelRadius}
                onChange={(event) => state.setField("travelRadius", event.target.value)}
                inputMode="numeric"
                placeholder="8 miles"
              />
              <Input
                label="Travel fee"
                value={state.travelFee}
                onChange={(event) => state.setField("travelFee", event.target.value)}
                inputMode="decimal"
                placeholder="£5"
              />
            </div>
          </div>
        ) : null}
        <MapPreview label={mapLabel} />
      </div>
    </OnboardingScreen>
  );
}

export function BusinessLocationScreen() {
  return <AddressScreen />;
}

export function WorkModelScreen() {
  const router = useRouter();
  const state = useOnboardingStore();

  function continueNext() {
    if (state.workModels.length === 0) {
      state.setPrimaryWorkModel("shop");
    }
    router.push("/onboarding/business/address");
  }

  return (
    <OnboardingScreen
      title="How do clients usually book you?"
      subhead="Pick anything that fits; we’ll set the location defaults once."
      progress={73}
      backHref="/onboarding/business/types"
      cta={<PrimaryCTA onClick={continueNext}>Continue</PrimaryCTA>}
    >
      <div className="space-y-3">
        {workModelOptions.map((option) => {
          const selected = state.workModels.includes(option.value);

          return (
            <ChecklistOption
              key={option.value}
              selected={selected}
              icon={option.icon}
              title={option.title}
              description={option.description}
              onClick={() => {
                state.toggleWorkModel(option.value);
              }}
            />
          );
        })}
      </div>
      {state.workModels.includes("multiple") ||
      state.workModels.includes("home") ||
      state.workModels.includes("mobile") ? (
        <div className="mt-5 rounded-2xl bg-white p-4 text-[14px] leading-5 text-secondary ring-1 ring-border">
          {state.workModels.includes("multiple")
            ? "We will add extra locations once you are inside."
            : state.workModels.includes("mobile")
              ? "Next we’ll set your default travel radius and fee."
              : "Next you can choose whether clients see the exact address before booking."}
        </div>
      ) : null}
    </OnboardingScreen>
  );
}

export function TeamSizeScreen() {
  const router = useRouter();
  const teamSize = useOnboardingStore((state) => state.teamSize);
  const setField = useOnboardingStore((state) => state.setField);

  return (
    <OnboardingScreen
      title="How big is your team?"
      subhead="We'll size your plan to fit. You can change this anytime."
      progress={56}
      backHref="/onboarding/business/address"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!teamSize) setField("teamSize", "solo");
            router.push("/onboarding/business/you");
          }}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {teamSizeOptions.map((option) => (
          <Chip
            key={option.value}
            full
            selected={teamSize === option.value}
            onClick={() => setField("teamSize", option.value)}
          >
            <span className="flex flex-col items-start leading-tight">
              <span>{option.label}</span>
              <span
                className={[
                  "mt-1 text-[12px] font-medium",
                  teamSize === option.value ? "text-white/75" : "text-secondary",
                ].join(" ")}
              >
                {option.helper}
              </span>
            </span>
          </Chip>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-[14px] leading-5 text-secondary ring-1 ring-border">
        Inviting your team comes later — this just helps us right-size your plan.
      </div>
    </OnboardingScreen>
  );
}

export function BusinessYouScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((state) => state.firstName);
  const setField = useOnboardingStore((state) => state.setField);
  const { register, handleSubmit } = useForm<{ firstName: string }>({
    mode: "onChange",
    defaultValues: { firstName },
  });

  return (
    <OnboardingScreen
      title="And who is setting this up?"
      subhead="Just a first name, so the preview feels like yours."
      progress={68}
      backHref="/onboarding/business/team-size"
      cta={
        <PrimaryCTA
          onClick={handleSubmit((data) => {
            setField("firstName", data.firstName?.trim() || "Alex");
            router.push("/onboarding/business/context-intro");
          })}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <Input
        label="First name"
        autoComplete="given-name"
        autoFocus
        placeholder="Alex"
        {...register("firstName")}
      />
    </OnboardingScreen>
  );
}

export function TeamAccessScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const isSolo = state.teamSize === "" || state.teamSize === "solo";

  return (
    <OnboardingScreen
      title="Will your team use this too?"
      subhead={
        isSolo
          ? "If it is just you today, we will keep team setup out of the way."
          : "This helps us decide whether staff invites belong in your first checklist."
      }
      progress={81}
      backHref="/onboarding/business/team-size"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!state.staffSetupIntent) {
              state.setField("staffSetupIntent", isSolo ? "not_yet" : "invite_later");
            }
            router.push("/onboarding/business/volume");
          }}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {staffSetupOptions.map((option) => (
          <Chip
            key={option.value}
            full
            selected={state.staffSetupIntent === option.value}
            onClick={() => state.setField("staffSetupIntent", option.value)}
          >
            <span className="flex flex-col items-start leading-tight">
              <span>{option.label}</span>
              <span
                className={[
                  "mt-1 text-[12px] font-medium",
                  state.staffSetupIntent === option.value ? "text-white/75" : "text-secondary",
                ].join(" ")}
              >
                {option.helper}
              </span>
            </span>
          </Chip>
        ))}
      </div>
    </OnboardingScreen>
  );
}

export function ComingFromScreen() {
  const router = useRouter();
  const state = useOnboardingStore();

  return (
    <OnboardingScreen
      title="Are you moving over from somewhere?"
      subhead="If you are, we can make the move feel lighter later."
      progress={76}
      backHref="/onboarding/business/context-intro"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!state.comingFrom) state.setField("comingFrom", "Fresha");
            router.push("/onboarding/business/volume");
          }}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {platformOptions.map((option) => (
          <Chip
            key={option}
            selected={state.comingFrom === option}
            onClick={() => state.setField("comingFrom", option)}
          >
            {option}
          </Chip>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-[14px] leading-5 text-secondary ring-1 ring-border">
        1,000+ businesses have moved from Fresha to That Time, and plenty started from pen and paper too.
      </div>
    </OnboardingScreen>
  );
}

export function GoalsScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const theme = getVerticalTheme(state.primaryBusinessType);

  return (
    <OnboardingScreen
      title="What would you like to make easier?"
      subhead={`Pick the bits you want off your plate in the ${theme.place}.`}
      progress={92}
      backHref="/onboarding/business/coming-from"
      cta={
        <div className="space-y-2">
          <div className="text-center text-[13px] text-secondary">
            {state.goals.length} selected
          </div>
          <PrimaryCTA
            onClick={() => {
              if (state.goals.length === 0) state.toggleGoal("Save time on admin");
              router.push("/onboarding/business/value");
            }}
          >
            Continue
          </PrimaryCTA>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {goalOptions.map((goal) => (
          <Chip
            key={goal}
            full
            selected={state.goals.includes(goal)}
            onClick={() => state.toggleGoal(goal)}
          >
            {goal}
          </Chip>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-[14px] leading-5 text-secondary ring-1 ring-border">
        Most owners pick two or three. Admin and no-shows are the big ones.
      </div>
    </OnboardingScreen>
  );
}

export function VolumeScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const theme = getVerticalTheme(state.primaryBusinessType);
  const isTeam = state.teamSize !== "" && state.teamSize !== "solo";
  const title = isTeam ? "How busy is your team?" : "How busy are you right now?";

  return (
    <OnboardingScreen
      title={title}
      subhead="A rough week helps us size the shopfloor and the numbers."
      progress={84}
      backHref="/onboarding/business/coming-from"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!state.bookingVolume) state.setField("bookingVolume", "11-30");
            router.push("/onboarding/business/value");
          }}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {volumeOptions.map((option) => (
          <Chip
            key={option.value}
            full
            selected={state.bookingVolume === option.value}
            onClick={() => state.setField("bookingVolume", option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      <div
        className="mt-5 rounded-2xl px-4 py-3 text-[14px] leading-5"
        style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
      >
        {theme.place === "shop"
          ? "This helps us understand how full the chairs are."
          : "This helps us keep the setup useful from day one."}
      </div>
    </OnboardingScreen>
  );
}

function workModelSummary(state: ReturnType<typeof useOnboardingStore.getState>) {
  const labels: Record<WorkModel, string> = {
    shop: "At your shop",
    mobile: "Travelling to clients",
    home: "From home",
    virtual: "Virtual appointments",
    multiple: "Multiple locations",
  };
  if (state.workModels.length === 0) {
    return state.primaryWorkModel ? labels[state.primaryWorkModel as WorkModel] : "At your shop";
  }
  if (state.workModels.length === 1) return labels[state.workModels[0]];
  const primary = (state.primaryWorkModel as WorkModel) || state.workModels[0];
  const extras = state.workModels.length - 1;
  return `${labels[primary]} + ${extras} more`;
}

function teamSizeSummary(teamSize: TeamSize) {
  switch (teamSize) {
    case "2-5":
      return "A team of 2 to 5";
    case "6-10":
      return "A team of 6 to 10";
    case "11+":
      return "A team of 11 or more";
    case "solo":
    case "":
    default:
      return "Just you";
  }
}

function staffSetupSummary(intent: StaffSetupIntent, teamSize: TeamSize) {
  if (teamSize === "" || teamSize === "solo") return "Team setup can wait";
  switch (intent) {
    case "invite_now":
      return "Invite staff first";
    case "invite_later":
      return "Invite staff later";
    case "not_yet":
      return "No staff invites yet";
    case "unsure":
      return "Keep team setup flexible";
    case "":
    default:
      return "Invite staff later";
  }
}

function volumeSummary(volume: BookingVolume) {
  const opt = volumeOptions.find((option) => option.value === volume);
  return opt ? opt.label : "Just starting out (0)";
}

function businessTypesSummary(state: ReturnType<typeof useOnboardingStore.getState>) {
  const primary = state.primaryBusinessType || (state.businessTypes[0] ?? "Hair Salon");
  const extras = state.businessTypes.filter((type) => type !== primary);
  if (extras.length === 0) return primary;
  if (extras.length === 1) return `${primary} · also ${extras[0]}`;
  return `${primary} · +${extras.length} more`;
}

export function StoreSplashScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);
  const businessName = businessNameFallback(state.businessName);
  const location = getMapPreviewLocation(state);

  const rows: Array<{ label: string; value: string; href: string; icon: ReactNode }> = [
    {
      label: "What you do",
      value: businessTypesSummary(state),
      href: "/onboarding/business/types",
      icon: <Sparkles size={18} />,
    },
    {
      label: "Where",
      value: location,
      href: "/onboarding/business/address",
      icon: <MapPin size={18} />,
    },
    {
      label: "How clients book",
      value: workModelSummary(state),
      href: "/onboarding/business/work-model",
      icon: <CalendarDays size={18} />,
    },
    {
      label: "Team",
      value: teamSizeSummary(state.teamSize),
      href: "/onboarding/business/team-size",
      icon: <Users size={18} />,
    },
    {
      label: "Staff access",
      value: staffSetupSummary(state.staffSetupIntent, state.teamSize),
      href: "/onboarding/business/team-access",
      icon: <UserPlus size={18} />,
    },
    {
      label: "Weekly bookings",
      value: volumeSummary(state.bookingVolume),
      href: "/onboarding/business/volume",
      icon: <Clock3 size={18} />,
    },
  ];

  return (
    <div className="flex h-full flex-col bg-[#FAF7F2]">
      <StatusBar />
      <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-6">
        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-secondary">
          Almost there, {name}
        </div>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] text-navy">
          Take a look at your business.
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-secondary">
          Everything live and editable. Tap any row to tweak it before we finish setup.
        </p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-border"
          >
            <header className="px-6 pb-5 pt-6">
              <h2 className="text-[24px] font-semibold leading-[1.15] text-navy">
                {businessName}
              </h2>
              <p className="mt-1 text-[13px] text-secondary">{location}</p>
            </header>
            <div className="border-t border-border">
              {rows.map((row, index) => (
                <button
                  key={row.label}
                  type="button"
                  onClick={() => router.push(row.href)}
                  className={[
                    "flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-canvas focus:outline-none focus:bg-canvas",
                    index === 0 ? "" : "border-t border-border",
                  ].join(" ")}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">
                    {row.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium text-secondary">
                      {row.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[15px] font-semibold text-navy">
                      {row.value}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </motion.article>
          <p className="mt-5 text-center text-[13px] leading-5 text-secondary">
            You can change any of this later from your settings.
          </p>
        </div>

        <div className="pt-5">
          <PrimaryCTA onClick={() => router.push("/onboarding/business/coming-from")}>
            Looks right, continue
          </PrimaryCTA>
        </div>
      </section>
    </div>
  );
}

export function LocationScreen() {
  const router = useRouter();
  const location = useOnboardingStore((state) => state.location);
  const setField = useOnboardingStore((state) => state.setField);
  const [loading, setLoading] = useState(false);

  async function useLocation() {
    setLoading(true);
    const result = await mockGetLocation();
    setField("location", `${result.city}, ${result.postcode}`);
    setLoading(false);
  }

  return (
    <OnboardingScreen
      title="Where are you based?"
      subhead="Clients near you will find you here."
      progress={90}
      backHref="/onboarding/business/volume"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!location.trim()) setField("location", "London, SW1A 1AA");
            router.push("/onboarding/business/terms");
          }}
        >
          Continue
        </PrimaryCTA>
      }
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={useLocation}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-navy bg-white text-[16px] font-semibold text-navy transition-colors hover:bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-70"
        >
          {loading ? (
            <span
              className="h-5 w-5 rounded-full border-2 border-navy border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : (
            <>
              <MapPin size={18} />
              Use my location
            </>
          )}
        </button>
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span className="h-px flex-1 bg-border" />
          Or enter postcode
          <span className="h-px flex-1 bg-border" />
        </div>
        <Input
          label="Postcode or town"
          value={location}
          onChange={(event) => setField("location", event.target.value)}
          autoComplete="postal-code"
          placeholder="SW1A 1AA"
        />
      </div>
    </OnboardingScreen>
  );
}

export function TermsScreen() {
  const router = useRouter();
  const state = useOnboardingStore();

  return (
    <OnboardingScreen
      title="Last bit, then you're in."
      subhead="Agree to the basics and your trial can start."
      progress={97}
      backHref="/onboarding/verify-phone"
      cta={
        <PrimaryCTA
          onClick={() => {
            if (!state.termsAccepted) state.setField("termsAccepted", true);
            router.push("/onboarding/business/trial");
          }}
        >
          Agree and continue
        </PrimaryCTA>
      }
    >
      <div className="space-y-3">
        <ToggleRow
          checked={state.termsAccepted}
          onChange={(checked) => state.setField("termsAccepted", checked)}
          title="Terms & Privacy"
          description={
            <>
              I&apos;m 18+ and agree to the{" "}
              <span className="underline">Terms of Service</span> and{" "}
              <span className="underline">Privacy Policy</span>.
            </>
          }
        />
        <ToggleRow
          checked={state.marketingOptIn}
          onChange={(checked) => state.setField("marketingOptIn", checked)}
          title="Tips and updates"
          description="Send me useful ways to get more from That Time."
        />
      </div>
    </OnboardingScreen>
  );
}

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    `${prefix}${Math.round(latest).toLocaleString("en-GB")}${suffix}`,
  );
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  useMotionValueEvent(rounded, "change", (latest) => setDisplay(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [count, value]);

  return <>{display}</>;
}

export function ValueRevealScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);
  const savings = useMemo(() => calculateSavings(state), [state]);
  const theme = getVerticalTheme(state.primaryBusinessType);
  const tier = getPricingTier(state.teamSize);
  const [annual, setAnnual] = useState(false);
  const monthlyPrice = tier.price ?? 0;
  const annualPrice = Math.round(monthlyPrice * 12 * 0.8);
  const displayPrice = annual ? annualPrice : monthlyPrice;
  const planName = `${theme.label.charAt(0).toUpperCase()}${theme.label.slice(1)} Plan`;
  const volumeLabel =
    volumeOptions.find((option) => option.value === state.bookingVolume)?.label ||
    "11-30 a week";
  const commissionCopy =
    savings.monthlyCommission > 0
      ? `You said ${volumeLabel} on ${state.comingFrom || "your current platform"}. At ${savings.commissionLabel}, that is roughly £${savings.monthlyCommission.toLocaleString("en-GB")} a month going to them.`
      : `You are not paying marketplace commission today, which is good. This keeps it that way as ${theme.place === "shop" ? "the chairs fill up" : "you grow"}.`;

  return (
    <div className="flex h-full flex-col bg-[#FFFCF7]">
      <StatusBar />
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-3">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h1 className="text-[30px] font-semibold leading-[1.1] text-navy">
            Here&apos;s what you&apos;d save on That Time, {name}.
          </h1>
          <div className="mt-5 rounded-3xl bg-navy p-5 text-white">
            <div className="text-[13px] font-semibold text-white/60">Estimated saving</div>
            <div className="mt-2 text-[42px] font-semibold leading-none">
              <AnimatedCounter value={savings.moneySaved} prefix="£" />
              <span className="text-[18px] text-white/65">/month</span>
            </div>
            <div className="mt-2 text-[16px] font-semibold text-white/85">
              About £{savings.yearlySaved.toLocaleString("en-GB")} a year
            </div>
            <p className="mt-4 text-[14px] leading-5 text-white/70">{commissionCopy}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
              <div className="text-[24px] font-semibold text-navy">
                <AnimatedCounter value={savings.hoursSaved} />
              </div>
              <div className="mt-1 text-[13px] leading-5 text-secondary">
                hours a week back from reminders, payments, and forms
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
              <div className="text-[24px] font-semibold text-navy">
                <AnimatedCounter value={savings.slotsFilled} />
              </div>
              <div className="mt-1 text-[13px] leading-5 text-secondary">
                empty slots That Time can help you fill
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-white p-5 shadow-card ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-secondary">Recommended plan</div>
                <div className="mt-1 text-[21px] font-semibold text-navy">{planName}</div>
              </div>
              <div
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
              >
                No commission
              </div>
            </div>
            <div className="mt-4 flex items-end gap-1 text-navy">
              {tier.isCustom ? (
                <div className="text-[32px] font-semibold leading-none">Let&apos;s talk</div>
              ) : (
                <>
                  <div className="text-[38px] font-semibold leading-none">£{displayPrice}</div>
                  <div className="pb-1 text-[14px] text-secondary">
                    /{annual ? "year" : "month"}
                  </div>
                </>
              )}
            </div>
            <p className="mt-3 text-[14px] leading-5 text-secondary">
              {tier.isCustom
                ? "Bigger team, same flat-fee principle. No commission, ever."
                : `You would save about £${savings.moneySaved.toLocaleString("en-GB")}/month vs ${savings.competitor}.`}
            </p>
            {!tier.isCustom ? (
              <div className="mt-4 grid grid-cols-2 rounded-2xl bg-canvas p-1">
                {[
                  { label: "Monthly", value: false },
                  { label: "Annual -20%", value: true },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setAnnual(option.value)}
                    className={[
                      "rounded-xl py-2 text-[13px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-navy",
                      annual === option.value ? "bg-white text-navy shadow-sm" : "text-secondary",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 text-[12px] text-muted">
              First 30 days free. No card needed today.
            </div>
          </div>
        </div>
        <div className="mt-auto pt-5">
          <PrimaryCTA onClick={() => router.push("/onboarding/business/save")}>
            Start my 30-day free trial
          </PrimaryCTA>
        </div>
      </div>
    </div>
  );
}

export function PricingScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const savings = useMemo(() => calculateSavings(state), [state]);
  const theme = getVerticalTheme(state.primaryBusinessType);
  const businessName = businessNameFallback(state.businessName);
  const tier = getPricingTier(state.teamSize);

  const subhead = tier.isCustom
    ? `${businessName} is bigger than our standard plans — let's tailor one together.`
    : `${businessName} starts with a 30-day free trial, then one flat monthly fee.`;

  const checklistItems = tier.isCustom
    ? [
        "Bespoke pricing for larger teams",
        "Dedicated onboarding support",
        "No commission on bookings",
        "All standard features included",
      ]
    : [
        "30-day free trial",
        "No card needed today",
        "No commission on bookings",
        "Cancel whenever it stops making sense",
      ];

  return (
    <OnboardingScreen
      title="Your plan is ready."
      subhead={subhead}
      progress={96}
      backHref="/onboarding/business/value"
      cta={
        <PrimaryCTA onClick={() => router.push("/onboarding/business/trial")}>
          {tier.isCustom ? "Talk to us" : "Start free trial"}
        </PrimaryCTA>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-secondary">
                That Time {tier.label}
              </div>
              {tier.isCustom ? (
                <div className="mt-1 text-[28px] font-semibold leading-none text-navy">
                  Let&apos;s talk
                </div>
              ) : (
                <div className="mt-1 text-[34px] font-semibold leading-none text-navy">
                  £{tier.price}
                  <span className="text-[16px] text-secondary">/month</span>
                </div>
              )}
              <div className="mt-1 text-[12px] text-secondary">{tier.blurb}</div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-canvas p-4">
            <div className="text-[13px] font-semibold text-secondary">Estimated upside</div>
            <div className="mt-1 text-[22px] font-semibold text-navy">
              Around £{savings.moneySaved}/month saved
            </div>
            <p className="mt-2 text-[13px] leading-5 text-secondary">
              That is the difference between a flat fee and giving away a cut of bookings.
            </p>
          </div>
        </div>
        {checklistItems.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECFDF5] text-success">
              <Check size={16} />
            </div>
            <div className="text-[15px] font-semibold text-navy">{item}</div>
          </div>
        ))}
      </div>
    </OnboardingScreen>
  );
}

function Confetti() {
  const particles = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    left: `${10 + ((index * 29) % 82)}%`,
    delay: (index % 8) * 0.05,
    x: ((index % 5) - 2) * 18,
    color: ["#FFFFFF", "#10B981", "#F59E0B"][index % 3],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute top-[-12px] h-2 w-2 rounded-full"
          style={{ left: particle.left, backgroundColor: particle.color }}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: 380, x: particle.x, opacity: [0, 1, 1, 0], rotate: 220 }}
          transition={{ duration: 1.5, delay: particle.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function TrialScreen() {
  const router = useRouter();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-navy text-white">
      <Confetti />
      <StatusBar tone="light" />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="h-36 w-36">
          <UnlockIllustration />
        </div>
        <h1 className="mt-8 text-[36px] font-semibold leading-none">You&apos;re in.</h1>
        <p className="mt-5 max-w-[290px] text-[17px] leading-7 text-white/78">
          Your 30-day free trial has started. No card needed today.
        </p>
        <div className="mt-6 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-semibold">
          One flat fee. No commission, ever.
        </div>
        <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[13px] font-semibold leading-5 text-white/82">
          You&apos;ve earned: Founding member badge · 7 extra trial days
        </div>
      </div>
      <footer className="safe-bottom px-6 pt-4">
        <PrimaryCTA tone="white" onClick={() => router.push("/onboarding/business/setup-services")}>
          Take me to my That Time
        </PrimaryCTA>
      </footer>
    </div>
  );
}

function OptionalSetupScreen({
  title,
  subhead,
  icon,
  primaryLabel,
  onPrimary,
  onSkip,
}: {
  title: string;
  subhead: string;
  icon: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-10 text-center">
        <motion.div
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white text-navy ring-1 ring-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {icon}
        </motion.div>
        <h1 className="mt-8 text-[34px] font-semibold leading-[1.08] text-navy">
          {title}
        </h1>
        <p className="mt-4 text-[16px] leading-6 text-secondary">{subhead}</p>
        <div className="mt-6 rounded-2xl bg-white px-4 py-3 text-[13px] leading-5 text-secondary ring-1 ring-border">
          If you skip this, we will put it on your Home checklist.
        </div>
        <div className="mt-auto space-y-3 pt-6">
          <PrimaryCTA onClick={onPrimary}>{primaryLabel}</PrimaryCTA>
          <button
            type="button"
            onClick={onSkip}
            className="h-11 w-full text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
          >
            No, maybe later
          </button>
        </div>
      </section>
    </div>
  );
}

function routeAfterServices(state: ReturnType<typeof useOnboardingStore.getState>) {
  if (state.teamSize !== "" && state.teamSize !== "solo") {
    return "/onboarding/business/setup-team";
  }
  if (isRecognisedPlatform(state.comingFrom)) {
    return "/onboarding/business/setup-clients";
  }
  return "/home";
}

function routeAfterTeam(state: ReturnType<typeof useOnboardingStore.getState>) {
  return isRecognisedPlatform(state.comingFrom)
    ? "/onboarding/business/setup-clients"
    : "/home";
}

export function ServicesSetupInviteScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const theme = getVerticalTheme(state.primaryBusinessType);
  const next = routeAfterServices(state);

  return (
    <OptionalSetupScreen
      title="Add your services?"
      subhead={`We can drop in a ${theme.label} starter pack so your profile feels useful straight away.`}
      icon={<Clock3 size={46} strokeWidth={1.8} />}
      primaryLabel="Add starter services"
      onPrimary={() => router.push(next)}
      onSkip={() => router.push(next)}
    />
  );
}

export function TeamSetupInviteScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const next = routeAfterTeam(state);

  return (
    <OptionalSetupScreen
      title="Invite your team?"
      subhead="Send each person a code so they can claim their calendar without touching billing or setup."
      icon={<UserPlus size={46} strokeWidth={1.8} />}
      primaryLabel="Prepare invites"
      onPrimary={() => router.push(next)}
      onSkip={() => router.push(next)}
    />
  );
}

export function ClientsSetupInviteScreen() {
  const router = useRouter();
  const platform = useOnboardingStore((state) => state.comingFrom);

  return (
    <OptionalSetupScreen
      title="Bring your clients across?"
      subhead={`We can help import from ${platform || "your current setup"} so you are not starting from scratch.`}
      icon={<Users size={46} strokeWidth={1.8} />}
      primaryLabel="Set up import"
      onPrimary={() => router.push("/home")}
      onSkip={() => router.push("/home")}
    />
  );
}

export function NextStepScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const theme = getVerticalTheme(state.primaryBusinessType);
  const showImport = isRecognisedPlatform(state.comingFrom);
  const showTeamInvite =
    state.staffSetupIntent === "invite_now" ||
    (state.staffSetupIntent === "invite_later" &&
      state.teamSize !== "" &&
      state.teamSize !== "solo");

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <header className="flex h-14 shrink-0 items-center justify-between px-6">
        <div className="text-[17px] font-semibold text-navy">That Time</div>
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
        >
          Skip
        </button>
      </header>
      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
        <h1 className="text-[32px] font-semibold leading-[1.08] text-navy">
          What would you like to do first?
        </h1>
        <p className="mt-4 text-[16px] leading-6 text-secondary">
          The basics are in place, and the rest can happen in any order.
        </p>
        <div className="mt-8 space-y-4">
          {showTeamInvite ? (
            <SelectionCard
              icon={<UserPlus size={26} />}
              title="Invite your team"
              meta="1 min"
              description="Send each teammate a code so they can sign in to your business."
              onClick={() => router.push("/setup/team")}
            />
          ) : null}
          <SelectionCard
            icon={<Clock3 size={26} />}
            title="Set up your services"
            meta="2 mins"
            description={`Start with a ${theme.label} starter pack you can edit.`}
            onClick={() => router.push("/setup/services")}
          />
          {showImport ? (
            <SelectionCard
              icon={<Users size={26} />}
              title="Bring your existing clients"
              meta="1 min"
              description={`Import from ${state.comingFrom}. We'll do the heavy lifting.`}
              onClick={() => router.push("/setup/clients")}
            />
          ) : null}
          <SelectionCard
            icon={<Sparkles size={26} />}
            title="Take a look around first"
            meta="now"
            description="Get a feel for the app, set things up later."
            onClick={() => router.push("/home")}
          />
        </div>
      </section>
    </div>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);
  const businessName = businessNameFallback(state.businessName);
  const initial = name.charAt(0).toUpperCase();
  const savings = calculateSavings(state);
  const profileLocation =
    state.baseAddress.trim() || state.primaryLocation.trim() || "Sunningdale, Ascot";
  const items = [
    ["Add your services", "2 min", "/setup/services"],
    ["Set your hours", "1 min", "/setup/hours"],
    ["Add a logo", "30 sec", "/setup/logo"],
  ];

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#F9F3ED] text-[#1C1814]">
        <StatusBar />
        <header className="flex h-14 shrink-0 items-center justify-end px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <Bell size={18} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FB2C36]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1814] text-[13px] font-bold text-white">
              {initial}
            </div>
          </div>
        </header>
        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
          <p className="text-[12px] font-bold leading-4 text-[#A4A3A1]">
            {profileLocation}
          </p>
          <h1 className="mt-3 text-[24px] font-bold leading-8 tracking-[-0.01em] text-[#1C1814]">
            Good afternoon, {name}
          </h1>
          <div className="mt-7 rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(28,24,20,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-bold leading-7 text-[#1C1814]">
                  {businessName}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
                  Your shop is live in draft. Finish the pieces clients need next.
                </p>
              </div>
              <div className="rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-bold text-success">
                2/8
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEE9E3]">
              <div className="h-full w-1/4 rounded-full bg-[#1C1814]" />
            </div>
            <div className="mt-4 divide-y divide-[#EFEAE4]">
              {items.map(([label, time, href]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => router.push(href)}
                  className="flex w-full items-center gap-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EFEA] text-[#1C1814]">
                    <Check size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-bold text-[#1C1814]">{label}</div>
                    <div className="mt-0.5 text-[13px] text-[#6B7280]">{time}</div>
                  </div>
                  <ChevronRight size={17} className="text-[#A4A3A1]" />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-[24px] font-bold leading-8 text-[#1C1814]">Today</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-4">
                <div className="text-[12px] font-bold uppercase tracking-wide text-[#A4A3A1]">
                  Saved
                </div>
                <div className="mt-2 text-[24px] font-bold text-[#1C1814]">
                  £{savings.moneySaved}
                </div>
                <p className="mt-1 text-[12px] leading-4 text-[#6B7280]">
                  vs {savings.competitor} this month
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <div className="text-[12px] font-bold uppercase tracking-wide text-[#A4A3A1]">
                  Time back
                </div>
                <div className="mt-2 text-[24px] font-bold text-[#1C1814]">
                  {savings.hoursSaved}h
                </div>
                <p className="mt-1 text-[12px] leading-4 text-[#6B7280]">
                  from reminders and forms
                </p>
              </div>
            </div>
          </div>
        </section>
        <nav className="grid h-20 shrink-0 grid-cols-4 border-t border-black/5 bg-white px-2 pt-2 shadow-[0_-4px_20px_rgba(28,24,20,0.05)]">
          {[
            ["Home", Home],
            ["Schedule", CalendarDays],
            ["Message", MessageCircle],
            ["Menu", Users],
          ].map(([label, Icon]) => {
            const ActiveIcon = Icon as typeof Home;
            const active = label === "Home";
            return (
              <button
                key={label as string}
                type="button"
                className={[
                  "flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold",
                  active ? "text-black" : "text-black/55",
                ].join(" ")}
              >
                <ActiveIcon size={20} />
                {label as string}
              </button>
            );
          })}
        </nav>
      </div>
    </MobileFrame>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((state) => state.setField);
  const [loadingProvider, setLoadingProvider] = useState<AuthLoadingProvider>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  function routeFor(role: "owner" | "staff" | "client") {
    if (role === "staff") return "/staff/home";
    if (role === "client") return "/client/home";
    return "/home";
  }

  async function handleSocial(provider: SocialProvider) {
    setLoadingProvider(provider);
    setError(null);
    const result = await mockSignIn(provider);
    setField("authMethod", provider);
    setField("email", result.email);
    setField("firstName", result.firstName);
    setField("mode", result.role === "client" ? "client" : "business");
    setField("accountType", result.role === "client" ? null : result.role);
    setField(
      "audience",
      result.role === "client" ? "client" : result.role === "staff" ? "staff" : "owner",
    );
    if (result.role === "staff") setField("joinedBusinessName", result.businessName);
    else if (result.role === "owner") setField("businessName", result.businessName);
    setLoadingProvider(null);
    router.push(routeFor(result.role));
  }

  async function handleEmail() {
    setLoadingProvider("email");
    setError(null);
    const result = await mockSignIn("email", normalizeEmail(email, "owner@example.com"));
    setField("authMethod", "email");
    setField("email", result.email);
    setField("firstName", result.firstName);
    setField("mode", result.role === "client" ? "client" : "business");
    setField("accountType", result.role === "client" ? null : result.role);
    setField(
      "audience",
      result.role === "client" ? "client" : result.role === "staff" ? "staff" : "owner",
    );
    if (result.role === "staff") setField("joinedBusinessName", result.businessName);
    else if (result.role === "owner") setField("businessName", result.businessName);
    setLoadingProvider(null);
    router.push(routeFor(result.role));
  }

  return (
    <AccountAccessLayout
      title="log in or sign up"
      subhead="Create an account or log in to book and manage your appointments."
      email={email}
      setEmail={(value) => {
        setError(null);
        setEmail(value);
      }}
      loadingProvider={loadingProvider}
      onEmailContinue={handleEmail}
      onSocial={handleSocial}
      backHref="/onboarding/welcome"
      footer={
        <div className="space-y-5">
          {error ? (
            <div className="rounded-xl bg-[#FEF2F2] px-4 py-3 text-[14px] font-semibold text-[#B91C1C]">
              {error}
            </div>
          ) : null}
          <div className="text-center text-[14px] leading-5 text-[#77736F]">
            New to That Time?{" "}
            <button
              type="button"
              onClick={() => router.push("/onboarding/business-role")}
              className="font-bold text-[#6C5CE7] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
            >
              Get started
            </button>
          </div>
          <p className="text-center text-[12px] leading-5 text-[#77736F]">
            Add “staff” or “client” to the email to demo those homes.
          </p>
        </div>
      }
    />
  );
}

export function StaffHomeScreen() {
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);
  const businessName = state.joinedBusinessName || "Studio Nova";
  const initial = name.charAt(0).toUpperCase();

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-canvas">
        <StatusBar />
        <header className="flex h-16 shrink-0 items-center justify-between px-6">
          <div>
            <div className="text-[13px] text-secondary">Wednesday 4 March</div>
            <div className="mt-0.5 text-[15px] font-semibold text-navy">{businessName}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy ring-1 ring-border"
            >
              <Bell size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-[15px] font-semibold text-white">
              {initial}
            </div>
          </div>
        </header>
        <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
          <h1 className="text-[30px] font-semibold leading-tight text-navy">
            Good morning, {name}
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-secondary ring-1 ring-border">
            <KeyRound size={14} className="text-navy" />
            Staff at {businessName}
          </div>
          <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-border">
            <div className="text-[13px] font-semibold text-secondary">Today</div>
            <div className="mt-2 text-[18px] font-semibold text-navy">3 appointments</div>
            <p className="mt-1 text-[13px] leading-5 text-secondary">
              First booking at 10:30. Your manager will keep your schedule up to date.
            </p>
            <div className="mt-4 flex items-end gap-3">
              {[44, 70, 56, 96, 78].map((height, index) => (
                <div
                  key={index}
                  className="w-10 rounded-t-xl bg-navy"
                  style={{ height }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-border">
            <h2 className="text-[16px] font-semibold text-navy">Your next steps</h2>
            <ul className="mt-3 space-y-3 text-[14px] text-secondary">
              <li className="flex items-start gap-3">
                <Check size={16} className="mt-0.5 text-success" />
                Account created and joined to {businessName}.
              </li>
              <li className="flex items-start gap-3">
                <Clock3 size={16} className="mt-0.5 text-secondary" />
                Wait for your manager to assign your first shifts.
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle size={16} className="mt-0.5 text-secondary" />
                Message {state.joinedManagerName || "your manager"} if anything looks off.
              </li>
            </ul>
          </div>
        </section>
        <nav className="grid h-[78px] shrink-0 grid-cols-4 border-t border-border bg-white px-2 pt-2">
          {[
            ["Home", Home],
            ["Schedule", CalendarDays],
            ["Clients", Users],
            ["Message", MessageCircle],
          ].map(([label, Icon]) => {
            const ActiveIcon = Icon as typeof Home;
            const active = label === "Home";
            return (
              <button
                key={label as string}
                type="button"
                className={[
                  "flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold",
                  active ? "text-navy" : "text-muted",
                ].join(" ")}
              >
                <ActiveIcon size={20} />
                {label as string}
              </button>
            );
          })}
        </nav>
      </div>
    </MobileFrame>
  );
}

const clientCategories = ["Hair", "Nails", "Brows", "Massage"];

const clientServices = [
  {
    business: "Studio Nova",
    service: "Cut and finish",
    meta: "4.9 · 0.4 miles · Today 3:30",
    price: "from £45",
  },
  {
    business: "Bloom Nails",
    service: "Gel manicure",
    meta: "4.8 · 0.7 miles · Tomorrow 10:00",
    price: "from £32",
  },
  {
    business: "Calm Room",
    service: "Deep tissue massage",
    meta: "4.9 · 1.1 miles · Friday 12:15",
    price: "from £60",
  },
];

export function ClientBrowseScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((state) => state.setField);

  function startBooking(service: string) {
    setField("mode", "client");
    setField("audience", "client");
    setField("accountType", null);
    setField("pendingClientBooking", service);
    router.push("/client/signup");
  }

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-canvas">
        <StatusBar />
        <header className="flex h-14 shrink-0 items-center justify-between px-6">
          <div className="text-[17px] font-semibold text-navy">That Time</div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
          >
            Log in
          </button>
        </header>
        <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
          <h1 className="text-[32px] font-semibold leading-[1.08] text-navy">
            Find a time near you.
          </h1>
          <p className="mt-4 text-[16px] leading-6 text-secondary">
            Browse first. We will only ask you to sign up when you book.
          </p>
          <div className="mt-6 flex h-14 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-secondary ring-1 ring-border">
            <Search size={18} />
            <span className="text-[15px]">Search hair, nails, massage...</span>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {clientCategories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-navy",
                  index === 0 ? "bg-navy text-white ring-navy" : "bg-white text-navy",
                ].join(" ")}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {clientServices.map((item) => (
              <article key={item.business} className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-border">
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F6EFE7] text-navy">
                    <Scissors size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[17px] font-semibold text-navy">{item.business}</div>
                    <div className="mt-1 text-[14px] font-medium text-secondary">{item.service}</div>
                    <div className="mt-2 text-[12px] text-muted">{item.meta}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-navy">{item.price}</div>
                  <button
                    type="button"
                    onClick={() => startBooking(`${item.business} · ${item.service}`)}
                    className="rounded-full bg-navy px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
                  >
                    Book
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MobileFrame>
  );
}

export function ClientSignupScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const [loadingProvider, setLoadingProvider] = useState<AuthLoadingProvider>(null);
  const [email, setEmail] = useState(state.email);

  async function continueWith(provider: SocialProvider | "email") {
    setLoadingProvider(provider);
    const result =
      provider === "email"
        ? { email: normalizeEmail(email, "mia@example.com") }
        : await mockSocialAuth(provider);
    state.setField("mode", "client");
    state.setField("audience", "client");
    state.setField("accountType", null);
    state.setField("authMethod", provider);
    state.setField("email", result.email);
    if (!state.firstName.trim()) state.setField("firstName", "Mia");
    setLoadingProvider(null);
    router.push("/client/booking-confirm");
  }

  return (
    <AccountAccessLayout
      title="confirm your booking"
      subhead="Create an account or log in so we can hold the appointment for you."
      email={email}
      setEmail={setEmail}
      loadingProvider={loadingProvider}
      onEmailContinue={() => continueWith("email")}
      onSocial={continueWith}
      backHref="/client/browse"
      footer={
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="h-11 w-full text-[15px] font-semibold text-[#081316] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
        >
          Already have an account? Log in
        </button>
      }
    >
      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#D9D6D1]">
        <div className="text-[12px] font-bold uppercase tracking-wide text-[#8D8B88]">
          Booking
        </div>
        <div className="mt-1 text-[16px] font-bold text-[#1C1814]">
          {state.pendingClientBooking || "Studio Nova · Cut and finish"}
        </div>
      </div>
    </AccountAccessLayout>
  );
}

export function ClientBookingConfirmScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#FFFCF7]">
        <StatusBar />
        <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-8 text-center">
          <motion.div
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#ECFDF5] text-success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Check size={48} strokeWidth={2.6} />
          </motion.div>
          <h1 className="mt-8 text-[34px] font-semibold leading-[1.08] text-navy">
            You&apos;re booked, {name}.
          </h1>
          <p className="mt-4 text-[16px] leading-6 text-secondary">
            We saved your spot and will send the details to {state.email || "your email"}.
          </p>
          <div className="mt-6 rounded-3xl bg-white p-5 text-left shadow-card ring-1 ring-border">
            <div className="text-[13px] font-semibold text-secondary">Appointment</div>
            <div className="mt-1 text-[18px] font-semibold text-navy">
              {state.pendingClientBooking || "Studio Nova · Cut and finish"}
            </div>
            <div className="mt-4 text-[13px] text-secondary">Today at 3:30 · London</div>
          </div>
          <div className="mt-auto pt-6">
            <PrimaryCTA onClick={() => router.push("/client/home")}>
              View my bookings
            </PrimaryCTA>
          </div>
        </section>
      </div>
    </MobileFrame>
  );
}

export function ClientHomeScreen() {
  const state = useOnboardingStore();
  const name = firstNameFallback(state.firstName);
  const location = state.location || "Sunningdale, Ascot";

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#F9F3ED] text-[#1C1814]">
        <StatusBar />
        <header className="flex h-14 shrink-0 items-center justify-end px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <Bell size={18} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FB2C36]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1814] text-[13px] font-bold text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <section className="min-h-0 flex-1 overflow-y-auto pb-6 pt-3">
          <div className="px-4">
            <p className="text-[12px] font-bold leading-4 text-[#A4A3A1]">
              {location}
            </p>
            <h1 className="mt-3 text-[24px] font-bold leading-8 tracking-[-0.01em] text-[#1C1814]">
              Good afternoon, {name}
            </h1>
          </div>
          <div className="mt-8">
            <h2 className="px-4 text-[24px] font-bold leading-8 text-[#1C1814]">
              Near you
            </h2>
            <div className="mt-6 flex gap-4 overflow-x-auto px-4 pb-2">
              <DiscoveryCard
                title="Village barbers"
                address="92, Sunningdale high street"
              />
              <DiscoveryCard
                title="The Nail Room"
                address="18, Ascot village lane"
              />
            </div>
          </div>
          <div className="mt-6">
            <h2 className="px-4 text-[24px] font-bold leading-8 text-[#1C1814]">
              Recommendations
            </h2>
            <div className="mt-6 flex gap-4 overflow-x-auto px-4 pb-2">
              <DiscoveryCard
                title="Village barbers"
                address="92, Sunningdale high street"
              />
              <DiscoveryCard
                title="Studio Nova"
                address="7, High street"
              />
            </div>
          </div>
          {state.pendingClientBooking ? (
            <div className="mx-4 mt-6 rounded-lg bg-white p-4">
              <div className="text-[12px] font-bold uppercase tracking-wide text-[#A4A3A1]">
                Next booking
              </div>
              <div className="mt-1 text-[16px] font-bold text-[#1C1814]">
                {state.pendingClientBooking}
              </div>
              <p className="mt-1 text-[14px] leading-5 text-[#6B7280]">
                Today at 3:30. We will remind you before it starts.
              </p>
            </div>
          ) : null}
        </section>
        <nav className="grid h-20 shrink-0 grid-cols-4 border-t border-black/5 bg-white px-2 pt-2 shadow-[0_-4px_20px_rgba(28,24,20,0.05)]">
          {[
            ["Home", Home],
            ["Find", Search],
            ["Message", MessageCircle],
            ["Schedule", CalendarDays],
          ].map(([label, Icon]) => {
            const ActiveIcon = Icon as typeof Home;
            const active = label === "Home";
            return (
              <button
                key={label as string}
                type="button"
                className={[
                  "flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold",
                  active ? "text-black" : "text-black/65",
                ].join(" ")}
              >
                <ActiveIcon size={20} />
                {label as string}
              </button>
            );
          })}
        </nav>
      </div>
    </MobileFrame>
  );
}

export function PlaceholderScreen({ title }: { title: string }) {
  const router = useRouter();

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-canvas">
        <StatusBar />
        <div className="flex flex-1 flex-col px-6 pb-6 pt-8">
          <div className="h-32 w-full">
            <ShopIllustration />
          </div>
          <h1 className="mt-8 text-[32px] font-semibold leading-[1.08] text-navy">
            {title}
          </h1>
          <p className="mt-4 text-[16px] leading-6 text-secondary">
            This part is ready for the next prototype pass. For now, your onboarding flow keeps moving.
          </p>
          <div className="mt-auto">
            <PrimaryCTA onClick={() => router.push("/home")}>Back to home</PrimaryCTA>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

export function ClientPlaceholderScreen() {
  return <ClientBrowseScreen />;
}
