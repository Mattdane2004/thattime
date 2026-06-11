"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Apple,
  BadgePoundSterling,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  Dumbbell,
  Eye,
  Flower2,
  Home,
  Laptop,
  Lock,
  MapPin,
  Navigation,
  Paintbrush,
  Scissors,
  Search,
  Settings2,
  Sparkles,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "./StatusBar";
import { CodeInput } from "./CodeInput";
import { useOnboardingStore, type WorkModel } from "@/lib/store";

type Step =
  | "welcome"
  | "role"
  | "login"
  | "password"
  | "intro"
  | "phone"
  | "socialReview"
  | "code"
  | "createPassword"
  | "professional"
  | "accountReady"
  | "businessName"
  | "businessType"
  | "team"
  | "workFrom"
  | "address"
  | "travelSettings"
  | "confirmAddress"
  | "platform"
  | "volume"
  | "cost"
  | "loading"
  | "chairs"
  | "revenue"
  | "commission"
  | "coffee"
  | "saved"
  | "trial"
  | "kickstart";

type Role = "client" | "business";

const businessTypes = [
  { label: "Hair Salon", icon: Scissors },
  { label: "Nails", icon: Paintbrush },
  { label: "Beauty", icon: Sparkles },
  { label: "Spa", icon: Flower2 },
  { label: "Wellness", icon: Sparkles },
  { label: "Brows and lashes", icon: Eye },
  { label: "Fitness", icon: Dumbbell },
  { label: "Aesthetics", icon: CreditCard },
  { label: "Home DIY", icon: Home },
];

const platformOptions = [
  "Fresha",
  "Booksy",
  "Square",
  "GlossGenius",
  "Treatwell",
  "Instagram DMs",
  "Pen & paper",
  "Just starting out",
];

const workOptions: Array<{
  id: WorkModel;
  title: string;
  body: string;
  icon: ReactNode;
}> = [
  {
    id: "shop",
    title: "Clients come to me",
    body: "I work from a shop, salon, studio or fixed space.",
    icon: <Store size={21} />,
  },
  {
    id: "mobile",
    title: "I go to clients",
    body: "I visit clients at their home, workplace or event.",
    icon: <Truck size={21} />,
  },
  {
    id: "virtual",
    title: "I offer virtual appointments",
    body: "I run sessions online — no address needed.",
    icon: <Laptop size={21} />,
  },
];

function ThatTimeLogo({ large = false }: { large?: boolean }) {
  return (
    <div
      className={[
        "font-black tracking-[-0.06em] text-[#1C1814]",
        large ? "text-[46px] leading-none" : "text-[15px] leading-none",
      ].join(" ")}
    >
      that<span className="mx-1 inline-block h-[0.78em] w-[0.24em] translate-y-[0.08em] rounded-[2px] bg-[#FF6641]" />
      time
    </div>
  );
}

function Header({
  canBack,
  onBack,
  showLogo = true,
  tone = "light",
}: {
  canBack: boolean;
  onBack: () => void;
  showLogo?: boolean;
  tone?: "light" | "cream" | "canvas";
}) {
  const headerBg =
    tone === "cream" ? "bg-[#F5F3EF]" : tone === "canvas" ? "bg-[#F5F5F7]" : "bg-white";

  return (
    <>
      <StatusBar />
      <div
        className={[
          "flex h-11 shrink-0 items-center gap-3 px-[19px]",
          headerBg,
        ].join(" ")}
      >
        <div className="flex flex-1 justify-start">
          {canBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#0F1A2E] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <ChevronLeft size={23} />
            </button>
          ) : null}
        </div>
        {showLogo ? <ThatTimeLogo /> : <div />}
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            className="text-[14px] text-[#AAA] focus:outline-none focus:ring-2 focus:ring-[#111]"
          >
            Help
          </button>
        </div>
      </div>
    </>
  );
}

function ScreenShell({
  children,
  cta,
  ctaDisabled,
  onCta,
  secondary,
  canBack,
  onBack,
  showHeader = true,
  showLogo = true,
  tone = "white",
}: {
  children: ReactNode;
  cta?: string;
  ctaDisabled?: boolean;
  onCta?: () => void;
  secondary?: ReactNode;
  canBack: boolean;
  onBack: () => void;
  showHeader?: boolean;
  showLogo?: boolean;
  tone?: "white" | "canvas" | "cream";
}) {
  const bg = tone === "cream" ? "bg-[#F5F3EF]" : tone === "canvas" ? "bg-[#F5F5F7]" : "bg-white";
  return (
    <div className={`flex h-full flex-col ${bg} text-[#0F1A2E]`}>
      {showHeader ? <Header canBack={canBack} onBack={onBack} showLogo={showLogo} tone={tone === "cream" ? "cream" : tone === "canvas" ? "canvas" : "light"} /> : <StatusBar />}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6">
        {children}
      </div>
      {cta ? (
        <div className={`shrink-0 px-6 pb-6 pt-4 ${bg}`}>
          {secondary}
          <button
            type="button"
            disabled={ctaDisabled}
            onClick={onCta}
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-[#1C1814] text-[15px] font-semibold text-white transition hover:bg-black active:scale-[0.99] disabled:bg-[#B5B5B5]"
          >
            {cta}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Heading({ title, subhead, center = false }: { title: string; subhead?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <h1 className="text-[32px] font-semibold leading-[34px] tracking-[0.01em] text-[#0F1A2E]">
        {title}
      </h1>
      {subhead ? (
        <p className="mt-2 text-[16px] leading-6 tracking-[-0.02em] text-[#6B7280]">
          {subhead}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] text-[#6B7280]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4] focus:border-[#111]"
      />
    </label>
  );
}

function SelectCard({
  selected,
  icon,
  title,
  body,
  onClick,
}: {
  selected?: boolean;
  icon: ReactNode;
  title: string;
  body?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99]",
        selected
          ? "border-[#FF6641] bg-[#FFF7F2] shadow-[0_10px_24px_rgba(255,102,65,0.12)]"
          : "border-[#D8D8D8] bg-white hover:border-[#AAA]",
      ].join(" ")}
    >
      {selected ? (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6641] text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : null}
      <span className={selected ? "text-[#FF6641]" : "text-[#111]"}>{icon}</span>
      <span>
        <span className="block text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[#0F1A2E]">
          {title}
        </span>
        {body ? (
          <span className="mt-0.5 block text-[15px] leading-5 tracking-[-0.02em] text-[#6A717F]">
            {body}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function InviteCodeSheet({
  open,
  code,
  onCodeChange,
  onClose,
  onJoin,
}: {
  open: boolean;
  code: string;
  onCodeChange: (value: string) => void;
  onClose: () => void;
  onJoin: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-[80] flex items-end bg-black/30 px-3 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close team code sheet"
            className="absolute inset-0 cursor-default"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-code-title"
            className="relative w-full rounded-[28px] bg-white p-5 shadow-[0_-18px_50px_rgba(15,26,46,0.18)]"
            initial={{ y: 36 }}
            animate={{ y: 0 }}
            exit={{ y: 36 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <X size={16} />
            </button>
            <h2 id="team-code-title" className="pr-10 text-[24px] font-semibold leading-7 text-[#0F1A2E]">
              Join your team
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-[#6B7280]">
              Enter the invite code your manager sent you. They&apos;ll have set up your profile already.
            </p>
            <div className="mt-5">
              <TextInput
                label="Invite code"
                value={code}
                onChange={onCodeChange}
                placeholder="e.g. SOHO-247"
              />
            </div>
            <button
              type="button"
              onClick={onJoin}
              className="mt-5 flex h-[50px] w-full items-center justify-center rounded-full bg-[#1C1814] text-[15px] font-semibold text-white transition active:scale-[0.99]"
            >
              Join team
            </button>
            <p className="mt-3 text-center text-[12px] leading-4 text-[#9CA3AF]">
              Any non-empty code works in this prototype.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ValueIllustration({ kind }: { kind: "chair" | "coins" | "coffee" | "calendar" }) {
  if (kind === "chair") {
    return (
      <div className="relative mx-auto h-[210px] w-[210px]">
        <div className="absolute bottom-10 left-12 h-24 w-28 rounded-[22px] border-4 border-[#111] bg-[#F2E9E2]" />
        <div className="absolute bottom-28 left-20 h-20 w-20 rounded-[22px] border-4 border-[#111] bg-white" />
        <div className="absolute bottom-0 left-[96px] h-12 w-4 rounded-full bg-[#111]" />
        <div className="absolute bottom-0 left-[62px] h-4 w-24 rounded-full bg-[#111]" />
        <div className="absolute right-7 top-8 h-8 w-8 rounded-full bg-[#FF6641]" />
      </div>
    );
  }
  if (kind === "coffee") {
    return (
      <div className="mx-auto flex h-[210px] w-[210px] items-center justify-center">
        <div className="relative h-32 w-28 rounded-b-[34px] rounded-t-xl bg-[#111] shadow-[inset_0_10px_0_rgba(255,255,255,0.2)]">
          <div className="absolute -right-8 top-8 h-12 w-10 rounded-r-full border-[10px] border-l-0 border-[#111]" />
          <div className="absolute -bottom-5 left-4 h-4 w-20 rounded-full bg-[#FF6641]" />
        </div>
      </div>
    );
  }
  if (kind === "calendar") {
    return (
      <div className="mx-auto grid h-[210px] w-[210px] grid-cols-3 gap-3 rounded-[28px] border-4 border-[#111] bg-white p-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className={["rounded-lg", index % 3 === 0 ? "bg-[#FF6641]" : "bg-[#F5F3EF]"].join(" ")} />
        ))}
      </div>
    );
  }
  return (
    <div className="relative mx-auto h-[210px] w-[210px]">
      {[0, 1, 2, 3].map((column) => (
        <div
          key={column}
          className="absolute bottom-2 flex flex-col-reverse gap-2"
          style={{ left: 30 + column * 38 }}
        >
          {Array.from({ length: 4 + column }).map((_, index) => (
            <div key={index} className="h-4 w-28 rounded-full border-2 border-[#111] bg-[#FFDD63]" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FigmaB2BFlow() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [step, setStep] = useState<Step>("welcome");
  const [history, setHistory] = useState<Step[]>([]);
  const [role, setRole] = useState<Role>("business");
  const [phone, setPhone] = useState("7123 456789");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [authPath, setAuthPath] = useState<"manual" | "social">("manual");
  const [firstName, setFirstName] = useState("Emma");
  const [lastName, setLastName] = useState("Dane");
  const [email, setEmail] = useState("emma@salonsoho.com");
  const [businessName, setBusinessName] = useState("Salon Soho");
  const [selectedTypes, setSelectedTypes] = useState(["Hair Salon", "Nails"]);
  const [teamSize, setTeamSize] = useState("6 - 9");
  const [workModels, setWorkModels] = useState<WorkModel[]>(["shop"]);
  const [address, setAddress] = useState("35 Luke Street, Shoreditch");
  const [hideFullAddress, setHideFullAddress] = useState(false);
  const [travelRadius, setTravelRadius] = useState("8");
  const [travelFee, setTravelFee] = useState("5");
  const [travelFeeUnit, setTravelFeeUnit] = useState<"fixed" | "percent" | "per_mile" | "custom">("fixed");
  const [platform, setPlatform] = useState("Fresha");
  const [bookingsPerWeek, setBookingsPerWeek] = useState(60);
  const [bookingCost, setBookingCost] = useState(13);
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [staffInviteCode, setStaffInviteCode] = useState("SOHO-247");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  const monthlyBookings = Math.round(bookingsPerWeek * 4.3);
  const monthlyRevenue = Math.round(monthlyBookings * bookingCost);
  const monthlySaved = Math.max(250, Math.round(monthlyRevenue * 0.2 - 49.99));

  function go(next: Step) {
    setHistory((current) => [...current, step]);
    setStep(next);
  }

  function back() {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setStep(previous);
  }

  function persistAndHome() {
    const primaryType = selectedTypes[0] || "Hair Salon";

    store.setField("firstName", firstName);
    store.setField("businessName", businessName);
    store.setField("phone", `+44 ${phone}`);
    store.setField("email", email);
    store.setField("businessTypes", selectedTypes as never);
    store.setField("primaryBusinessType", primaryType as never);
    store.setField("vertical", primaryType as never);
    store.setField("teamSize", teamSize === "Just me" ? "solo" : teamSize === "2 - 5" ? "2-5" : teamSize === "6 - 9" ? "6-10" : "11+");
    store.setField("workModels", workModels);
    store.setField("primaryWorkModel", workModels[0] || "shop");
    store.setField("baseAddress", address.trim() || "London 35 Luke street EC2A 4LH England United kingdom");
    store.setField("hideFullAddressUntilBooking", hideFullAddress);
    store.setField("travelRadius", travelRadius.trim() || "8");
    store.setField("travelFee", travelFee.trim() || "5");
    store.setField("comingFrom", platform as never);
    store.setField("bookingVolume", bookingsPerWeek < 11 ? "1-10" : bookingsPerWeek < 31 ? "11-30" : "31+");
    router.push("/home");
  }

  function joinTeamFromSheet() {
    const codeToSave = staffInviteCode.trim() || "SOHO-247";
    store.setField("audience", "staff");
    store.setField("accountType", "staff");
    store.setField("joinCode", codeToSave);
    store.setField("joinedBusinessName", businessName.trim() || "Salon Soho");
    store.setField("joinedManagerName", firstName.trim() || "Emma");
    // Owner-prefilled staff profile — in the real product these come from the manager's
    // staff-management screen. Seeded here so the staff splash looks credible in the prototype.
    if (!store.joinedStaffRole) store.setField("joinedStaffRole", "Senior Stylist");
    if (!store.joinedStaffStartDate) store.setField("joinedStaffStartDate", new Date().toISOString().slice(0, 10));
    if (store.joinedStaffWorkingDays.length === 0) {
      store.setField("joinedStaffWorkingDays", ["Tue", "Wed", "Thu", "Fri", "Sat"]);
    }
    setInviteSheetOpen(false);
    router.push("/onboarding/staff/confirm");
  }

  const content = (() => {
    switch (step) {
      case "welcome":
        return (
          <ScreenShell canBack={false} onBack={back} showHeader={false} tone="canvas" cta="Get started" onCta={() => go("role")}
            secondary={
              <button onClick={() => go("login")} className="mb-5 w-full text-center text-[16px] font-semibold text-[#0F1A2E]">
                Log in
              </button>
            }
          >
            <div className="flex min-h-full flex-col items-center justify-center pb-10 text-center">
              <p className="text-[16px] font-semibold text-[#0F1A2E]">Welcome to</p>
              <div className="mt-2"><ThatTimeLogo large /></div>
              <p className="mt-8 text-[15px] leading-5 text-[#6A717F]">
                Book something brilliant, run your business, or join your team. It all starts here.
              </p>
              <p className="mt-auto pt-10 text-[10px] leading-4 text-[#6B7280]">
                By using That Time you agree to our <u>Terms and Privacy Policy</u>.
              </p>
            </div>
          </ScreenShell>
        );
      case "role":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => role === "business" ? go("intro") : router.push("/client-placeholder")} secondary={
            <button onClick={() => go("login")} className="mt-5 w-full text-center text-[16px] font-semibold text-[#0F1A2E]">
              I Already have an account
            </button>
          }>
            <Heading title="What brings you to That Time?" />
            <div className="mt-10 space-y-2">
              <SelectCard selected={role === "client"} icon={<CalendarDays size={24} />} title="I'm here to book a service" body="Find services near you and book in seconds." onClick={() => setRole("client")} />
              <SelectCard selected={role === "business"} icon={<Store size={24} />} title="I run a business" body="Take bookings, manage your team and keep more of what you earn." onClick={() => setRole("business")} />
              <button
                type="button"
                onClick={() => setInviteSheetOpen(true)}
                className="w-full py-4 text-[15px] text-[#0F1A2E] transition hover:text-[#FF6641] focus:outline-none focus:ring-2 focus:ring-[#111]"
              >
                Joining a team? <span className="font-semibold underline">Enter your code</span>
              </button>
            </div>
          </ScreenShell>
        );
      case "login":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("password")}>
            <Heading title="Log in" subhead="Choose the quickest way to get started." />
            <div className="mt-8">
              <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@yourshop.com" type="email" />
              <div className="mt-3 flex gap-2">
                {["@gmail.com", "@hotmail.com", "@hotmail.co.uk"].map((domain) => (
                  <button key={domain} onClick={() => setEmail(`emma${domain}`)} className="rounded-full border border-[#E5E5E8] px-3 py-2 text-[11px] text-[#6B7280]">
                    {domain}
                  </button>
                ))}
              </div>
              <div className="mt-8 space-y-3">
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111] text-[14px] font-semibold text-white"><Apple size={17} fill="currentColor" />Continue with Apple</button>
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E5E5E8] bg-white text-[14px] font-semibold">G Continue with Google</button>
              </div>
            </div>
          </ScreenShell>
        );
      case "password":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("accountReady")}>
            <Heading title="Enter your password" subhead="This will be used on your That Time account." />
            <div className="mt-10">
              <TextInput label="Password" value={password} onChange={setPassword} placeholder="Password" type="password" />
              <p className="mt-2 text-[13px] text-[#6B7280]">At least 8 characters.</p>
            </div>
          </ScreenShell>
        );
      case "intro":
        return (
          <ScreenShell canBack onBack={back} tone="canvas" cta="Get started" onCta={() => go("phone")}>
            <div className="flex min-h-full flex-col">
              <div className="-mx-5 mt-6 flex h-[254px] items-center justify-center gap-5 overflow-hidden">
                <div className="h-40 w-32 shrink-0 rounded-[34px] bg-[#D4D4D4]" />
                <div className="flex h-56 w-56 shrink-0 items-center justify-center rounded-[40px] bg-[#C5C5C5] text-[#0F1A2E]">
                  <Store size={58} strokeWidth={1.75} />
                </div>
                <div className="h-40 w-32 shrink-0 rounded-[34px] bg-[#D4D4D4]" />
              </div>
              <div className="mt-14">
                <Heading
                  title="Let’s get your business set up"
                  subhead="Get ready to take bookings, manage your day and keep more of what you earn."
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ["Bookings", "online"],
                  ["Clearpay", "ready"],
                  ["Fees", "0% cut"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white px-3 py-3 text-center ring-1 ring-[#E5E5E8]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">
                      {label}
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-[#0F1A2E]">{value}</div>
                  </div>
                ))}
              </div>
              <p className="mt-auto text-center text-[10px] leading-4 text-[#6B7280]">
                By using That Time you agree to our <u>Terms and Privacy Policy</u>.
              </p>
            </div>
          </ScreenShell>
        );
      case "phone":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => {
            setAuthPath("manual");
            go("code");
          }}>
            <Heading title="First, create your account" subhead="Choose the quickest way to get started." />
            <div className="mt-9">
              <p className="mb-2 text-[14px] text-[#6B7280]">Phone number</p>
              <div className="grid grid-cols-[92px_1fr] gap-3">
                <button
                  type="button"
                  className="flex h-[56px] items-center justify-center rounded-xl border border-[#E5E5E8] bg-white text-[16px] font-medium text-[#0F1A2E] focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  +44
                </button>
                <input
                  aria-label="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel-national"
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4] focus:border-[#111]"
                />
              </div>
            </div>
            <div className="mt-7 flex items-center gap-3 text-[13px] text-[#9CA3AF]">
              <span className="h-px flex-1 bg-[#E5E5E8]" /> Or <span className="h-px flex-1 bg-[#E5E5E8]" />
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthPath("social");
                setEmail("emma@icloud.com");
                go("socialReview");
              }}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111] text-[14px] font-semibold text-white transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <Apple size={17} fill="currentColor" />
              Continue with Apple
            </button>
          </ScreenShell>
        );
      case "socialReview":
        return (
          <ScreenShell canBack onBack={back} cta="Send code" onCta={() => go("code")}>
            <Heading
              title="Review your account"
              subhead="Apple filled in the basics. Check your details, then we’ll text a code to confirm it’s you."
            />
            <div className="mt-8">
              <p className="mb-2 text-[14px] text-[#6B7280]">Name</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
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
              <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@yourshop.com" type="email" />
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[14px] text-[#6B7280]">Phone number</p>
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
            <div className="mt-6 rounded-2xl bg-[#F5F5F7] p-4 text-[13px] leading-5 text-[#6B7280]">
              No password needed with Apple. You can add one later from the Hub.
            </div>
          </ScreenShell>
        );
      case "code":
        return (
          <ScreenShell canBack onBack={back} cta="Verify" onCta={() => go(authPath === "social" ? "accountReady" : "createPassword")}>
            <Heading title="Enter your code" subhead={`We sent it to +44 ${phone}..`} />
            <div className="mt-10">
              <CodeInput value={code} onChange={setCode} label="SMS code" />
              <div className="mt-5 text-[15px] leading-6 text-[#0F1A2E]">
                <button>Didn&apos;t get it? Resend</button>
                <br />
                <button>Try Another way</button>
              </div>
            </div>
          </ScreenShell>
        );
      case "createPassword":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("professional")}>
            <Heading title="Create a password" subhead="This keeps your business account secure when you log in later." />
            <div className="mt-10">
              <TextInput label="Password" value={password} onChange={setPassword} placeholder="At least 8 characters" type="password" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((item) => {
                  const active = password.length >= [1, 8, 12][item];
                  return (
                    <span
                      key={item}
                      className={["h-1.5 rounded-full", active ? "bg-[#111]" : "bg-[#E5E5E8]"].join(" ")}
                    />
                  );
                })}
              </div>
              <p className="mt-3 text-[13px] leading-5 text-[#6B7280]">
                Use 8 or more characters. For the prototype, Continue stays available.
              </p>
            </div>
          </ScreenShell>
        );
      case "professional":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("accountReady")}>
            <Heading title="Create your professional account" subhead="This will be used on your That Time account." />
            <div className="mt-8">
              <p className="mb-2 text-[14px] text-[#6B7280]">Name</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  placeholder="First name"
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4] focus:border-[#111]"
                />
                <input
                  aria-label="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  placeholder="Last name"
                  className="h-[56px] w-full rounded-xl border border-[#E5E5E8] bg-white px-4 text-[16px] text-[#0F1A2E] outline-none placeholder:text-[#B9BCC4] focus:border-[#111]"
                />
              </div>
            </div>
            <div className="mt-5">
              <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@yourshop.com" />
            </div>
          </ScreenShell>
        );
      case "accountReady":
        return (
          <ScreenShell canBack onBack={back} tone="canvas" cta={undefined}>
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-[#D0D0D0] text-[#0F1A2E]">
                <Store size={40} strokeWidth={1.8} />
              </div>
              <div className="mt-9">
                <Heading title="Your account is ready" subhead="We’re getting your business space ready to take bookings." center />
              </div>
              <div className="mt-8 w-full space-y-2 text-left">
                {[
                  ["Clients can book and pay online.", "Apple Pay, Clearpay and Klarna can help more people say yes."],
                  ["Your calendar is ready to fill.", "Reminders and deposits help protect the gaps in your day."],
                  ["Your bookings stay yours.", "That Time takes 0% commission, even as you grow."],
                ].map(([title, body], index) => (
                  <motion.div
                    key={title}
                    className="rounded-2xl bg-white p-4 ring-1 ring-[#E5E5E8]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.18, duration: 0.28 }}
                  >
                    <div className="text-[14px] font-semibold text-[#0F1A2E]">{title}</div>
                    <div className="mt-1 text-[12px] leading-4 text-[#6B7280]">{body}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#E5E5E8]">
                <motion.div
                  className="h-full rounded-full bg-[#111]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeOut" }}
                  onAnimationComplete={() => go("businessName")}
                />
              </div>
              <p className="mt-3 text-[12px] text-[#9CA3AF]">Setting up your business profile ...</p>
            </div>
          </ScreenShell>
        );
      case "businessName":
        return (
          <ScreenShell canBack onBack={back} cta="Save and continue" onCta={() => go("businessType")}>
            <Heading title="What’s your business called?" subhead="Use the name your clients know you by. You can change it later." />
            <div className="mt-10">
              <TextInput label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Salon Soho" />
            </div>
          </ScreenShell>
        );
      case "businessType":
        return (
          <ScreenShell
            canBack
            onBack={back}
            cta="Continue"
            ctaDisabled={selectedTypes.length === 0}
            onCta={() => go("team")}
          >
            <Heading title="What kind of business do you run?" subhead="Choose one or more so we can personalise your setup." />
            <div className="mt-7 flex gap-2">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#F0F0F0] px-3 text-[13px] text-[#BBB]">
                <Search size={14} /> Search services
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F0F0F0]"><Settings2 size={17} /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {businessTypes.map(({ label, icon: Icon }) => {
                const selected = selectedTypes.includes(label);
                const primary = selectedTypes[0] === label;
                const secondaryIndex = selectedTypes.indexOf(label);
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setSelectedTypes((current) => {
                        if (current.includes(label)) {
                          return current.length === 1 ? current : current.filter((item) => item !== label);
                        }
                        return [...current, label];
                      });
                    }}
                    className={[
                      "relative flex h-[92px] flex-col justify-between rounded-xl border p-4 text-left transition active:scale-[0.99]",
                      selected
                        ? "border-[#FF6641] bg-[#FFF7F2] shadow-[0_10px_24px_rgba(255,102,65,0.10)]"
                        : "border-[#E5E5E8] bg-white hover:border-[#AAA]",
                    ].join(" ")}
                  >
                    <Icon size={21} className={selected ? "text-[#FF6641]" : "text-[#0F1A2E]"} />
                    <span className={["text-[14px]", selected ? "font-semibold text-[#0F1A2E]" : "text-[#6B7280]"].join(" ")}>
                      {label}
                    </span>
                    {selected ? (
                      <>
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6641] text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#FF6641] ring-1 ring-[#FFD1C2]">
                          {primary ? "Primary" : secondaryIndex}
                        </span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </ScreenShell>
        );
      case "team":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("workFrom")}>
            <Heading title="How big is your team?" subhead="Just you, a small crew, or a full house? We’ll set up your calendar to match." />
            <div className="mt-8 space-y-3">
              {["Just me", "2 - 5", "6 - 9", "10 or more"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTeamSize(item)}
                  className={[
                    "flex h-12 w-full items-center justify-between rounded-xl border px-4 text-[14px] transition active:scale-[0.99]",
                    teamSize === item
                      ? "border-[#FF6641] bg-[#FFF7F2] font-semibold text-[#0F1A2E]"
                      : "border-[#E5E5E8] bg-white text-[#0F1A2E] hover:border-[#AAA]",
                  ].join(" ")}
                >
                  {item}
                  <span className={["flex h-5 w-5 items-center justify-center rounded-full border", teamSize === item ? "border-[#FF6641] bg-[#FF6641]" : "border-[#D1D5DB]"].join(" ")}>
                    {teamSize === item ? <Check size={12} strokeWidth={3} className="text-white" /> : null}
                  </span>
                </button>
              ))}
            </div>
          </ScreenShell>
        );
      case "workFrom": {
        const onlyVirtual = workModels.length === 1 && workModels[0] === "virtual";
        return (
          <ScreenShell canBack onBack={back} cta="Continue" ctaDisabled={workModels.length === 0} onCta={() => go(onlyVirtual ? "confirmAddress" : "address")}>
            <Heading title="How do clients usually book you?" subhead="Pick what fits today. We’ll set the defaults once, then you can fine tune per service later." />
            <div className="mt-8 space-y-2">
              {workOptions.map((option) => {
                const selected = workModels.includes(option.id);
                return (
                  <SelectCard
                    key={option.id}
                    selected={selected}
                    icon={option.icon}
                    title={option.title}
                    body={option.body}
                    onClick={() => setWorkModels((current) => selected ? current.filter((item) => item !== option.id) : [...current, option.id])}
                  />
                );
              })}
            </div>
            <div className="mt-5 rounded-2xl bg-[#F5F5F7] p-4 text-[13px] leading-5 text-[#6B7280]">
              Travel radius, address privacy, and extra locations can all change later from the Hub.
            </div>
          </ScreenShell>
        );
      }
      case "address": {
        const isShop = workModels.includes("shop");
        const isMobile = workModels.includes("mobile");
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go(isMobile ? "travelSettings" : "confirmAddress")}>
            <Heading
              title={isShop ? `Where is ${businessName} based?` : "Where do you travel from?"}
              subhead={isShop ? "Use your current location, or enter a base address or postcode." : "We use this privately as the centre of your travel area. It won’t be shown to clients."}
            />
            <button className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#111] text-[14px] font-semibold">
              <MapPin size={17} /> Use my location
            </button>
            <div className="my-5 text-center text-[13px] text-[#9CA3AF]">Or type it in</div>
            <TextInput label="Base address or postcode" value={address} onChange={setAddress} placeholder="35 Luke Street, Shoreditch" />
            {isShop ? (
              <button
                type="button"
                onClick={() => setHideFullAddress((current) => !current)}
                className="mt-5 flex w-full items-start gap-3 rounded-2xl border border-[#E5E5E8] bg-white p-4 text-left transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111]"
              >
                <span className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  hideFullAddress ? "border-[#111] bg-[#111] text-white" : "border-[#D1D5DB] bg-white",
                ].join(" ")}>
                  {hideFullAddress ? <Check size={13} strokeWidth={3} /> : null}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-[#0F1A2E]">
                    Hide my full address until booking is confirmed
                  </span>
                  <span className="mt-1 block text-[12px] leading-4 text-[#6B7280]">
                    Clients see your general area first. The exact address is revealed once a booking is confirmed.
                  </span>
                </span>
              </button>
            ) : null}
          </ScreenShell>
        );
      }
      case "travelSettings": {
        const travelFeeUnitLabel: Record<typeof travelFeeUnit, string> = {
          fixed: "£ fixed",
          percent: "% of service",
          per_mile: "£ per mile",
          custom: "Custom",
        };
        const radiusNumber = Math.max(1, Math.min(50, Number(travelRadius) || 8));
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("confirmAddress")}>
            <Heading
              title="What’s your travel area?"
              subhead="Drag to set how far you'll travel, and choose how you'd like to charge."
            />
            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-[#0F1A2E]">Travel radius</span>
              <span className="text-[14px] font-semibold text-[#0F1A2E]">{radiusNumber} mi</span>
            </div>
            <div className="mt-3 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-[#E5E5E8] bg-[#F0F4F8]">
              <div className="relative flex h-full w-full items-center justify-center">
                <span
                  className="aspect-square rounded-full border-2 border-[#FF6641] bg-[#FF6641]/15 transition-[height] duration-200 ease-out"
                  style={{ height: `${Math.min(95, 30 + radiusNumber * 1.4)}%` }}
                />
                <MapPin className="absolute text-[#111]" size={28} fill="currentColor" />
              </div>
            </div>
            <p className="mt-2 text-center text-[12px] text-[#6B7280]">From {address || "your base address"}</p>
            <input
              aria-label="Travel radius"
              type="range"
              min={1}
              max={50}
              value={radiusNumber}
              onChange={(event) => setTravelRadius(event.target.value)}
              className="mt-4 w-full accent-[#111]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-[#9CA3AF]">
              <span>1 mi</span>
              <span>50 mi</span>
            </div>
            <div className="mt-7">
              <span className="block text-[14px] font-semibold text-[#0F1A2E]">Travel fee</span>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {(["fixed", "percent", "per_mile", "custom"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTravelFeeUnit(unit)}
                    className={[
                      "h-10 rounded-full border text-[12px] font-medium transition",
                      travelFeeUnit === unit ? "border-[#111] bg-[#111] text-white" : "border-[#E5E5E8] bg-white text-[#0F1A2E]",
                    ].join(" ")}
                  >
                    {travelFeeUnitLabel[unit]}
                  </button>
                ))}
              </div>
              {travelFeeUnit !== "custom" ? (
                <div className="mt-3 flex h-[50px] items-center rounded-xl border border-[#E5E5E8] bg-white px-3">
                  {travelFeeUnit === "fixed" || travelFeeUnit === "per_mile" ? (
                    <span className="mr-1 text-[15px] text-[#6B7280]">£</span>
                  ) : null}
                  <input
                    aria-label="Travel fee amount"
                    value={travelFee}
                    onChange={(event) => setTravelFee(event.target.value)}
                    inputMode="decimal"
                    className="min-w-0 flex-1 bg-transparent text-[16px] font-semibold outline-none"
                  />
                  <span className="text-[13px] text-[#6B7280]">
                    {travelFeeUnit === "fixed" ? "per booking" : travelFeeUnit === "percent" ? "% of service" : "per mile"}
                  </span>
                </div>
              ) : (
                <input
                  aria-label="Custom travel fee"
                  value={travelFee}
                  onChange={(event) => setTravelFee(event.target.value)}
                  placeholder="e.g. £5 + £1 per mile after 5 mi"
                  className="mt-3 h-[50px] w-full rounded-xl border border-[#E5E5E8] bg-white px-3 text-[14px] outline-none"
                />
              )}
            </div>
          </ScreenShell>
        );
      }
      case "confirmAddress": {
        const confirmIsShop = workModels.includes("shop");
        const confirmIsMobile = workModels.includes("mobile");
        const confirmIsVirtualOnly = workModels.length === 1 && workModels[0] === "virtual";
        const feeSummary =
          travelFeeUnit === "fixed" ? `£${travelFee || "5"} per booking`
          : travelFeeUnit === "percent" ? `${travelFee || "5"}% of service`
          : travelFeeUnit === "per_mile" ? `£${travelFee || "5"} per mile`
          : travelFee || "Custom fee";
        return (
          <ScreenShell canBack onBack={back} cta="Confirm" onCta={() => go("platform")}>
            <Heading title="Check your location settings" subhead="This is what we’ll use as your default before services get more detailed." />
            <div className="mt-7 space-y-3">
              {!confirmIsVirtualOnly ? (
                <div className="rounded-xl border border-[#E5E5E8] bg-white p-4 text-[13px] text-[#6B7280]">
                  <div className="flex items-start gap-3">
                    <MapPin size={17} className="mt-0.5 text-[#0F1A2E]" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">Base address</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#0F1A2E]">{address || "35 Luke Street, Shoreditch"}</div>
                    </div>
                    <button type="button" onClick={() => go("address")} className="font-semibold text-[#111]">Edit</button>
                  </div>
                </div>
              ) : null}
              {confirmIsShop ? (
                <div className="rounded-xl border border-[#E5E5E8] bg-white p-4 text-[13px] text-[#6B7280]">
                  <div className="flex items-start gap-3">
                    <Lock size={17} className="mt-0.5 text-[#0F1A2E]" />
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">Address privacy</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#0F1A2E]">
                        {hideFullAddress ? "Hidden until booking is confirmed" : "Visible to clients before booking"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {confirmIsMobile ? (
                <div className="rounded-xl border border-[#E5E5E8] bg-white p-4 text-[13px] text-[#6B7280]">
                  <div className="flex items-start gap-3">
                    <Navigation size={17} className="mt-0.5 text-[#0F1A2E]" />
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">Travel defaults</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#0F1A2E]">
                        {travelRadius || "8"} mile radius · {feeSummary}
                      </div>
                      <div className="mt-1 text-[12px] leading-4 text-[#6B7280]">
                        These become the default for travel services and can be overridden later.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {confirmIsVirtualOnly ? (
                <div className="rounded-xl border border-[#E5E5E8] bg-white p-4 text-[13px] text-[#6B7280]">
                  <div className="flex items-start gap-3">
                    <Laptop size={17} className="mt-0.5 text-[#0F1A2E]" />
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#9CA3AF]">Virtual only</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#0F1A2E]">No address required</div>
                      <div className="mt-1 text-[12px] leading-4 text-[#6B7280]">You can add one later if you start offering in-person sessions.</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </ScreenShell>
        );
      }
      case "platform":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("volume")}>
            <Heading title="How are you taking bookings right now?" subhead="Choose the option closest to your current setup." />
            <div className="mt-8 grid grid-cols-2 gap-3">
              {platformOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => setPlatform(item)}
                  className={[
                    "relative flex h-16 items-center justify-center rounded-xl border px-3 text-[13px] transition active:scale-[0.99]",
                    platform === item
                      ? "border-[#FF6641] bg-[#FFF7F2] font-semibold text-[#0F1A2E] shadow-[0_8px_18px_rgba(255,102,65,0.10)]"
                      : "border-[#E5E5E8] bg-white text-[#0F1A2E] hover:border-[#AAA]",
                  ].join(" ")}
                >
                  {item}
                  {platform === item ? (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6641] text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </ScreenShell>
        );
      case "volume":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("cost")}>
            <Heading title="How many bookings do you take in a typical week?" subhead="A rough guess is fine. We’ll use this to estimate your monthly booking volume." />
            <div className="mt-24 text-center">
              <div className="text-[72px] font-semibold leading-none text-[#111]">{bookingsPerWeek}</div>
              <div className="mt-2 text-[15px] text-[#6B7280]">per week</div>
              <input className="mt-10 w-full accent-[#111]" type="range" min={1} max={80} value={bookingsPerWeek} onChange={(event) => setBookingsPerWeek(Number(event.target.value))} />
            </div>
          </ScreenShell>
        );
      case "cost":
        return (
          <ScreenShell canBack onBack={back} cta="Continue" onCta={() => go("loading")}>
            <Heading title="what does a booking usually cost?" subhead="No need to dig through receipts. Your best guess is enough." />
            <div className="mt-28 flex items-center justify-center gap-3">
              <span className="text-[50px] text-[#9CA3AF]">£</span>
              <input value={bookingCost} onChange={(event) => setBookingCost(Number(event.target.value) || 1)} className="w-32 border-b border-[#E5E5E8] bg-transparent text-center text-[72px] font-semibold outline-none" />
            </div>
          </ScreenShell>
        );
      case "loading":
        return (
          <ScreenShell canBack onBack={back} showLogo cta={undefined}>
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <Heading title="Right, let’s talk bookings." subhead={`Here’s what 0% commission could mean for ${businessName}.`} center />
              <div className="mt-20 h-2 w-56 overflow-hidden rounded-full bg-[#E5E5E8]">
                <motion.div className="h-full rounded-full bg-[#111]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2 }} onAnimationComplete={() => go("chairs")} />
              </div>
              <p className="mt-5 text-[13px] text-[#9CA3AF]">Checking your booking volume ...</p>
            </div>
          </ScreenShell>
        );
      case "chairs":
        return <ValueScreen onBack={back} onNext={() => go("revenue")} title="Your Chairs are filling up" value={`${monthlyBookings}`} body="bookings a month" progress="1 of 4" illustration="chair" />;
      case "revenue":
        return <ValueScreen onBack={back} onNext={() => go("commission")} title="Those bookings add up" value={`£${monthlyRevenue.toLocaleString()}`} body="a month, before platform fees." progress="2 of 4" illustration="coins" />;
      case "commission":
        return (
          <ScreenShell canBack onBack={back} tone="cream" cta="Continue" onCta={() => go("coffee")}>
            <Heading title="Their cut goes up. Ours doesn’t." center />
            <div className="mt-12 rounded-2xl bg-white p-5">
              <p className="text-center text-[12px] text-[#6B7280]">Estimated commission cost</p>
              {[
                ["Fresha", "£340/mo", 84],
                ["Treatwell", "£330/mo", 78],
                ["Booksy", "£300/mo", 72],
                ["That Time", "£0/mo", 0],
              ].map(([name, price, width]) => (
                <div key={name as string} className="mt-4">
                  <div className="flex justify-between text-[12px]"><span>{name}</span><span>{price}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-[#F1EDE7]"><div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${width}%` }} /></div>
                </div>
              ))}
            </div>
          </ScreenShell>
        );
      case "coffee":
        return <ValueScreen onBack={back} onNext={() => go("saved")} title="That’s money with better places to be" value="£250" body="Like those essential coffees that keep you going." progress="4 of 4" illustration="coffee" />;
      case "saved":
        return <ValueScreen onBack={back} onNext={() => go("trial")} title="Your bookings stay yours" value={`£${monthlySaved}`} body="saved a month with 0% commission on That Time." progress="5 of 5" illustration="calendar" />;
      case "trial":
        return (
          <ScreenShell canBack onBack={back} tone="cream" cta="Start 30 days free trial" onCta={() => go("kickstart")} secondary={
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#FF6641]/30 bg-white px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7F2] text-[#FF6641]">
                <Lock size={16} />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-[14px] font-semibold text-[#0F1A2E]">No card needed today</div>
                <div className="text-[12px] leading-4 text-[#6B7280]">We’ll remind you 3 days before your trial ends.</div>
              </div>
            </div>
          }>
            <Heading title="Your free trial is ready" subhead={<>Start your free trial today and <span className="text-[#FF6641]">save £250</span> with 0% commission</>} center />
            <div className="mt-8 space-y-4 px-4">
              {[
                [BadgePoundSterling, "0% commission on all bookings"],
                [CalendarDays, "Manage services, staff, and locations in one place"],
                [Users, "Invite your team and stay organised"],
                [BarChart3, "Access powerful business insights"],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof CalendarDays;
                return (
                  <div key={text as string} className="flex items-center gap-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black/5"><ItemIcon size={19} /></span>
                    <span className="text-[13px] font-medium text-[#0F1A2E]">{text as string}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-7">
              <p className="text-[13px] font-medium">Team Size</p>
              <div className="relative mt-2">
                <button
                  type="button"
                  aria-expanded={teamDropdownOpen}
                  onClick={() => setTeamDropdownOpen((open) => !open)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-[#E0E0E0] bg-white px-4 text-[14px] transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  <Users size={20} />
                  <span className="mr-auto ml-6">{teamSize}</span>
                  <ChevronDown className={teamDropdownOpen ? "rotate-180 transition" : "transition"} size={18} />
                </button>
                <AnimatePresence>
                  {teamDropdownOpen ? (
                    <motion.div
                      className="absolute left-0 right-0 top-[54px] z-20 overflow-hidden rounded-2xl border border-[#E5E5E8] bg-white shadow-[0_14px_32px_rgba(15,26,46,0.14)]"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                    >
                      {["Just me", "2 - 5", "6 - 9", "10 or more"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setTeamSize(item);
                            setTeamDropdownOpen(false);
                          }}
                          className="flex h-11 w-full items-center justify-between px-4 text-left text-[14px] transition hover:bg-[#FFF7F2]"
                        >
                          {item}
                          {teamSize === item ? <Check size={15} className="text-[#FF6641]" /> : null}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={[
                    "relative rounded-2xl border bg-white p-4 text-left transition active:scale-[0.99]",
                    billing === "yearly" ? "border-2 border-[#FF6641] bg-[#FFF7F2]" : "border-[#E5E5E8]",
                  ].join(" ")}
                >
                  <span className="font-extrabold">Yearly</span>
                  <span className="absolute right-3 top-3 rounded-full bg-[#FF6641] px-2 py-1 text-[12px] text-white">-16%</span>
                  <span className="mt-2 block text-[14px] text-[#464749]">£ 510/yr</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={[
                    "rounded-2xl border bg-white p-4 text-left transition active:scale-[0.99]",
                    billing === "monthly" ? "border-2 border-[#FF6641] bg-[#FFF7F2]" : "border-[#E5E5E8]",
                  ].join(" ")}
                >
                  <span className="font-extrabold">Monthly</span>
                  <span className="mt-2 block text-[14px] text-[#464749]">£49.99/ mo</span>
                </button>
              </div>
            </div>
          </ScreenShell>
        );
      case "kickstart": {
        const options: Array<{ icon: typeof CalendarDays; title: string; body: string }> = [
          { icon: Sparkles, title: "Set up your services", body: "Add what you offer, your prices and how long each takes." },
          { icon: Settings2, title: "Import from another platform", body: "Bring your bookings and clients over from Fresha or similar." },
          { icon: Users, title: "Invite your team", body: "Send your staff a code so they can join and see their calendar." },
        ];
        return (
          <ScreenShell canBack onBack={back} cta="Take me to my dashboard" onCta={persistAndHome}>
            <Heading title="What would you like to do first?" subhead="Pick a starting point — you can always come back to the others from the Hub." />
            <div className="mt-7 space-y-3">
              {options.map(({ icon: ItemIcon, title, body }) => (
                <button
                  key={title}
                  type="button"
                  onClick={persistAndHome}
                  className="flex w-full items-start gap-4 rounded-2xl border border-[#E5E5E8] bg-white p-4 text-left transition active:scale-[0.99] hover:border-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF7F2] text-[#FF6641]">
                    <ItemIcon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[#0F1A2E]">{title}</span>
                    <span className="mt-1 block text-[13px] leading-5 text-[#6B7280]">{body}</span>
                  </span>
                  <ChevronLeft size={18} className="mt-2 rotate-180 text-[#9CA3AF]" />
                </button>
              ))}
            </div>
          </ScreenShell>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="h-full"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      <InviteCodeSheet
        open={inviteSheetOpen}
        code={staffInviteCode}
        onCodeChange={setStaffInviteCode}
        onClose={() => setInviteSheetOpen(false)}
        onJoin={joinTeamFromSheet}
      />
    </div>
  );
}

function ValueScreen({
  onBack,
  onNext,
  title,
  value,
  body,
  progress,
  illustration,
}: {
  onBack: () => void;
  onNext: () => void;
  title: string;
  value: string;
  body: string;
  progress: string;
  illustration: "chair" | "coins" | "coffee" | "calendar";
}) {
  return (
    <ScreenShell canBack onBack={onBack} tone="cream" cta="Continue" onCta={onNext}>
      <Heading title={title} center />
      <div className="mt-8">
        <ValueIllustration kind={illustration} />
      </div>
      <div className="mt-5 text-center">
        <div className="text-[34px] font-semibold text-[#FF6641]">{value}</div>
        <p className="mt-1 text-[13px] text-[#6B7280]">{body}</p>
        <p className="mt-10 text-[12px] text-[#9CA3AF]">{progress}</p>
      </div>
    </ScreenShell>
  );
}
