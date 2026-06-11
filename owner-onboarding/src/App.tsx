import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  MapPinned,
  Navigation,
  PartyPopper,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Users,
  Wand2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Screen =
  | "welcome"
  | "signup"
  | "password"
  | "fork"
  | "intro"
  | "businessName"
  | "businessType"
  | "workMode"
  | "location"
  | "team"
  | "comingFrom"
  | "volume"
  | "activation"
  | "phone"
  | "verify"
  | "yourName"
  | "whatNow"
  | "home"
  | "b2cPlaceholder"
  | "staffPlaceholder"
  | "setupPlaceholder";

type Billing = "monthly" | "yearly";
type SetupFlow = "services" | "clients";

type OnboardingState = {
  authMethod: "email" | "apple" | "google" | "facebook" | "";
  email: string;
  marketing: boolean;
  password: string;
  businessName: string;
  businessType: string;
  locationMode: string;
  location: string;
  teamSize: string;
  comingFrom: string;
  bookingVolume: string;
  billing: Billing;
  phone: string;
  code: string;
  firstName: string;
  completedServices: boolean;
  completedClients: boolean;
};

const businessTypes = [
  "Hair Salon",
  "Barbershop",
  "Nails",
  "Beauty",
  "Spa",
  "Wellness",
  "Fitness",
  "Something else"
];

const workModes = [
  {
    title: "From one place",
    sub: "A fixed shop, salon, or studio."
  },
  {
    title: "From a few places",
    sub: "More than one location."
  },
  {
    title: "I travel to clients",
    sub: "Mobile, at-home, or freelance."
  }
];

const teamSizes = ["Just me", "2-5 of us", "6-10", "11+"];

const bookingTools = [
  "Fresha",
  "Booksy",
  "Square",
  "GlossGenius",
  "Treatwell",
  "Pen & paper",
  "Instagram DMs",
  "Just starting out",
  "Something else"
];

const volumes = ["Just starting out", "1-10 a week", "11-30 a week", "31+ a week"];
const switchers = ["Fresha", "Booksy", "Square", "GlossGenius", "Treatwell"];

const stepScreens: Partial<Record<Screen, number>> = {
  businessName: 1,
  businessType: 2,
  workMode: 3,
  location: 4,
  team: 5,
  comingFrom: 6,
  volume: 7,
  activation: 8,
  phone: 9,
  verify: 10,
  yourName: 11
};

const starterState: OnboardingState = {
  authMethod: "",
  email: "",
  marketing: true,
  password: "",
  businessName: "",
  businessType: "",
  locationMode: "",
  location: "",
  teamSize: "",
  comingFrom: "",
  bookingVolume: "",
  billing: "monthly",
  phone: "",
  code: "",
  firstName: "",
  completedServices: false,
  completedClients: false
};

function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [history, setHistory] = useState<Screen[]>([]);
  const [state, setState] = useState<OnboardingState>(starterState);
  const [socialLoading, setSocialLoading] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [trialCelebrated, setTrialCelebrated] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [setupFlow, setSetupFlow] = useState<SetupFlow>("services");

  const businessName = state.businessName.trim() || "Salon Soho";
  const businessNoun = getBusinessNoun(state.businessType);
  const isSwitcher = switchers.includes(state.comingFrom);
  const ownerName = state.firstName.trim() || "Maya";
  const step = stepScreens[screen];

  function update(patch: Partial<OnboardingState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function go(next: Screen) {
    setHistory((current) => [...current, screen]);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replace(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setScreen(previous);
  }

  function socialSignIn(method: "apple" | "google" | "facebook") {
    setSocialLoading(method);
    update({ authMethod: method });
    window.setTimeout(() => {
      setSocialLoading("");
      go("fork");
    }, 650);
  }

  function startTrial() {
    setTrialCelebrated(true);
    window.setTimeout(() => go("phone"), 1600);
  }

  function verifyPhone() {
    setVerifySuccess(true);
    window.setTimeout(() => {
      setVerifySuccess(false);
      go("yourName");
    }, 650);
  }

  function beginSetupFlow(flow: SetupFlow) {
    setSetupFlow(flow);
    go("setupPlaceholder");
  }

  const shellClass = screen === "home" ? "app-shell app-shell-home" : "app-shell";

  return (
    <main className="page">
      {trialCelebrated && screen === "activation" ? <ConfettiBurst /> : null}
      <section className={shellClass}>
        {step ? <StepHeader step={step} onBack={back} /> : null}
        {!step && history.length > 0 && screen !== "welcome" && screen !== "home" ? (
          <button className="back-button floating-back" onClick={back} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        ) : null}

        {screen === "welcome" && <WelcomeScreen onGetStarted={() => go("signup")} />}
        {screen === "signup" && (
          <SignupScreen
            state={state}
            socialLoading={socialLoading}
            onSocial={socialSignIn}
            update={update}
            onContinue={() => {
              update({ authMethod: "email" });
              go("password");
            }}
          />
        )}
        {screen === "password" && (
          <PasswordScreen state={state} update={update} onContinue={() => go("fork")} />
        )}
        {screen === "fork" && (
          <ForkScreen
            onBook={() => go("b2cPlaceholder")}
            onWork={() => go("intro")}
            onInvite={() => go("staffPlaceholder")}
          />
        )}
        {screen === "intro" && <IntroScreen onContinue={() => go("businessName")} />}
        {screen === "businessName" && (
          <BusinessNameScreen state={state} update={update} onContinue={() => go("businessType")} />
        )}
        {screen === "businessType" && (
          <BusinessTypeScreen
            state={state}
            businessName={businessName}
            update={update}
            onContinue={() => go("workMode")}
          />
        )}
        {screen === "workMode" && (
          <WorkModeScreen state={state} update={update} onContinue={() => go("location")} />
        )}
        {screen === "location" && (
          <LocationScreen
            state={state}
            businessName={businessName}
            locationLoading={locationLoading}
            update={update}
            onUseLocation={() => {
              setLocationLoading(true);
              window.setTimeout(() => {
                setLocationLoading(false);
                update({ location: "London, SW1A 1AA" });
              }, 1200);
            }}
            onContinue={() => go("team")}
          />
        )}
        {screen === "team" && (
          <TeamScreen state={state} update={update} onContinue={() => go("comingFrom")} />
        )}
        {screen === "comingFrom" && (
          <ComingFromScreen state={state} update={update} onContinue={() => go("volume")} />
        )}
        {screen === "volume" && (
          <VolumeScreen state={state} update={update} onContinue={() => go("activation")} />
        )}
        {screen === "activation" && (
          <ActivationScreen
            state={state}
            isSwitcher={isSwitcher}
            trialCelebrated={trialCelebrated}
            update={update}
            onStartTrial={startTrial}
            onContinue={() => go("phone")}
          />
        )}
        {screen === "phone" && (
          <PhoneScreen state={state} update={update} onContinue={() => go("verify")} />
        )}
        {screen === "verify" && (
          <VerifyScreen
            state={state}
            update={update}
            verifySuccess={verifySuccess}
            onContinue={verifyPhone}
          />
        )}
        {screen === "yourName" && (
          <YourNameScreen state={state} update={update} onContinue={() => go("whatNow")} />
        )}
        {screen === "whatNow" && (
          <WhatNowScreen
            state={state}
            ownerName={ownerName}
            businessName={businessName}
            businessNoun={businessNoun}
            isSwitcher={isSwitcher}
            onServices={() => beginSetupFlow("services")}
            onClients={() => beginSetupFlow("clients")}
            onHome={() => go("home")}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            state={state}
            ownerName={ownerName}
            businessName={businessName}
            businessNoun={businessNoun}
            isSwitcher={isSwitcher}
            onChecklistServices={() => beginSetupFlow("services")}
            onChecklistClients={() => beginSetupFlow("clients")}
          />
        )}
        {screen === "b2cPlaceholder" && (
          <PlaceholderScreen
            icon={<Search size={36} />}
            title="Booking flow lives next door."
            body="The customer booking path is a separate spec. For this owner prototype, this route stays lightweight."
            action="Back to the fork"
            onAction={() => replace("fork")}
          />
        )}
        {screen === "staffPlaceholder" && (
          <PlaceholderScreen
            icon={<Users size={36} />}
            title="Staff invites get their own flow."
            body="This would open the invite-code or magic-link path for team members."
            action="Back to the fork"
            onAction={() => replace("fork")}
          />
        )}
        {screen === "setupPlaceholder" && (
          <SetupPlaceholderScreen
            flow={setupFlow}
            businessName={businessName}
            fromTool={state.comingFrom}
            onComplete={() => {
              if (setupFlow === "services") update({ completedServices: true });
              if (setupFlow === "clients") update({ completedClients: true });
              go("home");
            }}
            onSkip={() => go("home")}
          />
        )}
      </section>
    </main>
  );
}

function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="step-header">
      <button className="back-button" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <p>Step {step} of 11</p>
    </header>
  );
}

function ScreenTitle({
  kicker,
  title,
  subtitle
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="screen-title">
      {kicker ? <span className="kicker">{kicker}</span> : null}
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="screen welcome-screen">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Clock3 size={42} />
          <Sparkles className="brand-spark" size={22} />
        </div>
        <div>
          <p className="wordmark">That Time</p>
          <p className="tagline">
            Run your business. Book your favourite places. Built around the time you've got.
          </p>
        </div>
      </div>
      <div className="welcome-illo" aria-hidden="true">
        <span className="awning" />
        <span className="door" />
        <span className="bubble bubble-one" />
        <span className="bubble bubble-two" />
      </div>
      <div className="bottom-actions">
        <button className="primary-button" onClick={onGetStarted}>
          Get started
        </button>
        <button className="text-button">I already have an account</button>
      </div>
      <p className="legal">By using That Time you agree to our Terms and Privacy Policy.</p>
    </div>
  );
}

function SignupScreen({
  state,
  socialLoading,
  onSocial,
  update,
  onContinue
}: {
  state: OnboardingState;
  socialLoading: string;
  onSocial: (method: "apple" | "google" | "facebook") => void;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  return (
    <div className="screen">
      <ScreenTitle title="Sign up" subtitle="Pick the easiest way for you." />
      <div className="stack">
        <SocialButton
          label="Continue with Apple"
          mark="Apple"
          loading={socialLoading === "apple"}
          onClick={() => onSocial("apple")}
        />
        <SocialButton
          label="Continue with Google"
          mark="G"
          loading={socialLoading === "google"}
          onClick={() => onSocial("google")}
        />
        <SocialButton
          label="Continue with Facebook"
          mark="f"
          loading={socialLoading === "facebook"}
          onClick={() => onSocial("facebook")}
        />
      </div>
      <div className="divider">
        <span />
        <p>or use email</p>
        <span />
      </div>
      <label className="field">
        <span>Email</span>
        <input
          value={state.email}
          onChange={(event) => update({ email: event.target.value })}
          placeholder="you@yourshop.com"
          type="email"
        />
      </label>
      <button className="primary-button" disabled={!emailValid} onClick={onContinue}>
        Continue
      </button>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={state.marketing}
          onChange={(event) => update({ marketing: event.target.checked })}
        />
        <span>
          Send me tips and updates from That Time.
          <small>You can change this anytime in Settings.</small>
        </span>
      </label>
      <p className="legal legal-inline">By continuing you agree to our Terms and Privacy Policy.</p>
    </div>
  );
}

function SocialButton({
  label,
  mark,
  loading,
  onClick
}: {
  label: string;
  mark: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button className="social-button" onClick={onClick}>
      {loading ? <Loader2 className="spin" size={18} /> : <span className="social-mark">{mark}</span>}
      <span>{loading ? "Connecting..." : label}</span>
    </button>
  );
}

function PasswordScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  const [show, setShow] = useState(false);
  const strength = getPasswordStrength(state.password);
  return (
    <div className="screen sparse">
      <ScreenTitle title="Create a password" subtitle="At least 8 characters. Make it memorable." />
      <label className="field password-field">
        <span>Password</span>
        <div className="input-with-button">
          <input
            value={state.password}
            onChange={(event) => update({ password: event.target.value })}
            placeholder="Make it yours"
            type={show ? "text" : "password"}
          />
          <button type="button" onClick={() => setShow((current) => !current)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <div className="strength" data-strength={strength.label.toLowerCase()}>
        <span className={strength.score >= 1 ? "active" : ""} />
        <span className={strength.score >= 2 ? "active" : ""} />
        <span className={strength.score >= 3 ? "active" : ""} />
      </div>
      <p className="strength-label">{strength.label}</p>
      <button className="primary-button bottom-pinned" disabled={state.password.length < 8} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function ForkScreen({
  onBook,
  onWork,
  onInvite
}: {
  onBook: () => void;
  onWork: () => void;
  onInvite: () => void;
}) {
  return (
    <div className="screen fork-screen">
      <ScreenTitle
        title="What brings you to That Time?"
        subtitle="Pick the one that fits - you can do both later."
      />
      <div className="route-cards">
        <button className="choice-card large-choice peach" onClick={onBook}>
          <span className="choice-icon">
            <CalendarCheck size={28} />
          </span>
          <span>
            <strong>I want to book somewhere</strong>
            <small>Find brilliant local businesses and book in seconds.</small>
          </span>
          <ChevronRight size={20} />
        </button>
        <button className="choice-card large-choice teal" onClick={onWork}>
          <span className="choice-icon">
            <BriefcaseBusiness size={28} />
          </span>
          <span>
            <strong>I run a business</strong>
            <small>Take bookings, manage clients, get your time back.</small>
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
      <button className="text-button centered" onClick={onInvite}>
        Got an invite from your boss?
      </button>
    </div>
  );
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  const rows = [
    ["1", "Name your shop", Store],
    ["2", "Pick what you do", Wand2],
    ["3", "Where you work from", MapPinned],
    ["4", "You and your team", Users],
    ["5", "How you work today", CreditCard]
  ] as const;
  return (
    <div className="screen intro-screen">
      <div className="shop-hero" aria-hidden="true">
        <span className="shop-roof" />
        <span className="shop-window left" />
        <span className="shop-window right" />
        <span className="shop-door" />
      </div>
      <ScreenTitle
        title="Let's set up shop."
        subtitle="The basics first. About a minute, then we'll show you what you'd save."
      />
      <div className="step-list">
        {rows.map(([number, text, Icon]) => (
          <div className="step-row" key={text}>
            <span>{number}</span>
            <Icon size={18} />
            <strong>{text}</strong>
          </div>
        ))}
      </div>
      <button className="primary-button bottom-pinned" onClick={onContinue}>
        Let's go
      </button>
    </div>
  );
}

function BusinessNameScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen sparse">
      <ScreenTitle
        title="What's the name above the door?"
        subtitle="Your shop's name - it'll show on your client-facing booking page. You can change it later."
      />
      <label className="field">
        <input
          autoFocus
          value={state.businessName}
          onChange={(event) => update({ businessName: event.target.value })}
          placeholder="e.g. Salon Soho"
        />
      </label>
      <button
        className="primary-button bottom-pinned"
        disabled={!state.businessName.trim()}
        onClick={onContinue}
      >
        Looks great
      </button>
    </div>
  );
}

function BusinessTypeScreen({
  state,
  businessName,
  update,
  onContinue
}: {
  state: OnboardingState;
  businessName: string;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen">
      <ScreenTitle
        title={`What kind of place is ${businessName}?`}
        subtitle={`We'll set up a starter menu and dashboard built around how ${getBusinessNoun(
          state.businessType
        )} actually work.`}
      />
      <ChipGrid
        items={businessTypes}
        selected={state.businessType}
        onSelect={(businessType) => update({ businessType })}
      />
      <button
        className="primary-button bottom-pinned"
        disabled={!state.businessType}
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  );
}

function WorkModeScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen">
      <ScreenTitle
        title="Where will you be working from?"
        subtitle="This shapes how clients find you and how your calendar's set up."
      />
      <div className="option-stack">
        {workModes.map((option) => (
          <button
            className={`choice-card radio-card ${state.locationMode === option.title ? "selected" : ""}`}
            key={option.title}
            onClick={() => update({ locationMode: option.title })}
          >
            <Circle size={19} />
            <span>
              <strong>{option.title}</strong>
              <small>{option.sub}</small>
            </span>
          </button>
        ))}
      </div>
      <button
        className="primary-button bottom-pinned"
        disabled={!state.locationMode}
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  );
}

function LocationScreen({
  state,
  businessName,
  locationLoading,
  update,
  onUseLocation,
  onContinue
}: {
  state: OnboardingState;
  businessName: string;
  locationLoading: boolean;
  update: (patch: Partial<OnboardingState>) => void;
  onUseLocation: () => void;
  onContinue: () => void;
}) {
  const copy = getLocationCopy(state.locationMode, businessName);
  return (
    <div className="screen">
      <ScreenTitle title={copy.title} subtitle={copy.subtitle} />
      <button className="secondary-button icon-button" onClick={onUseLocation}>
        {locationLoading ? <Loader2 className="spin" size={20} /> : <MapPin size={20} />}
        {locationLoading ? "Finding you..." : "Use my location"}
      </button>
      <div className="divider">
        <span />
        <p>or enter your postcode</p>
        <span />
      </div>
      <label className="field">
        <input
          value={state.location}
          onChange={(event) => update({ location: event.target.value })}
          placeholder="e.g. SW1A"
        />
      </label>
      <button className="primary-button bottom-pinned" disabled={!state.location.trim()} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function TeamScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen">
      <ScreenTitle
        title="Are you flying solo, or is there a team?"
        subtitle="This decides how we set up your calendar - solo gets a simpler view, teams get staff scheduling and assignments."
      />
      <ChipGrid
        variant="grid2"
        items={teamSizes}
        selected={state.teamSize}
        onSelect={(teamSize) => update({ teamSize })}
      />
      <button className="primary-button bottom-pinned" disabled={!state.teamSize} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function ComingFromScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen">
      <ScreenTitle
        title="How are you taking bookings right now?"
        subtitle="If you're moving across, we'll bring your clients, services, and history with you - no manual rebuild."
      />
      <ChipGrid
        items={bookingTools}
        selected={state.comingFrom}
        onSelect={(comingFrom) => update({ comingFrom })}
      />
      <button className="primary-button bottom-pinned" disabled={!state.comingFrom} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function VolumeScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen">
      <ScreenTitle
        title="And roughly how busy are you?"
        subtitle="A rough estimate's fine - we'll use it to recommend the right plan and show you what you'd save."
      />
      <ChipGrid
        items={volumes}
        selected={state.bookingVolume}
        onSelect={(bookingVolume) => update({ bookingVolume })}
      />
      <button className="primary-button bottom-pinned" disabled={!state.bookingVolume} onClick={onContinue}>
        See what I'd save
      </button>
    </div>
  );
}

function ActivationScreen({
  state,
  isSwitcher,
  trialCelebrated,
  update,
  onStartTrial,
  onContinue
}: {
  state: OnboardingState;
  isSwitcher: boolean;
  trialCelebrated: boolean;
  update: (patch: Partial<OnboardingState>) => void;
  onStartTrial: () => void;
  onContinue: () => void;
}) {
  return (
    <div className={`screen activation-screen ${trialCelebrated ? "celebrated" : ""}`}>
      <ScreenTitle
        kicker={trialCelebrated ? "Trial active" : undefined}
        title={trialCelebrated ? "You're in." : isSwitcher ? "Here's what you'd save." : "Welcome to your new chapter."}
        subtitle={
          trialCelebrated
            ? "Your free trial starts now. Let's secure your account."
            : isSwitcher
              ? "Based on what you've told us - your numbers, not ours."
              : "Setting up's the hardest bit. We've got you while you find your feet."
        }
      />
      <div className="activation-cards">
        {isSwitcher ? (
          <>
            <MetricCard
              value="£391"
              label="saved every month"
              detail={`That's the 20% commission you'd be paying ${state.comingFrom || "your old platform"} - gone.`}
              celebrated={trialCelebrated}
            />
            <MetricCard
              value="~6 hours"
              label="back every week"
              detail="From automated reminders, payments, and forms."
              celebrated={trialCelebrated}
            />
          </>
        ) : (
          <>
            <MetricCard
              value="60 days free"
              label=""
              detail="Twice as long as everyone else, on us."
              celebrated={trialCelebrated}
            />
            <MetricCard
              value="50% off"
              label="for your first 6 months"
              detail="When you're ready to commit - £14.50/month instead of £29."
              celebrated={trialCelebrated}
            />
          </>
        )}
      </div>
      <div className="plan-card">
        {trialCelebrated ? (
          <span className="success-badge">
            <Check size={18} /> Active
          </span>
        ) : null}
        <div>
          <strong>Salon Plan</strong>
          <p>
            {isSwitcher
              ? "£29/month - one flat fee. No commission, ever."
              : "£14.50/month for 6 months, then £29/month - one flat fee. No commission, ever."}
          </p>
          <small>
            {isSwitcher
              ? "Your first 30 days are on us. No card needed today."
              : "Discount applies automatically once your trial ends."}
          </small>
        </div>
        <div className="segmented" role="group" aria-label="Billing">
          <button
            className={state.billing === "monthly" ? "selected" : ""}
            onClick={() => update({ billing: "monthly" })}
          >
            Pay monthly
          </button>
          <button
            className={state.billing === "yearly" ? "selected" : ""}
            onClick={() => update({ billing: "yearly" })}
          >
            {isSwitcher ? "£278/yr" : "Yearly"}
          </button>
        </div>
        <p className="yearly-note">
          {isSwitcher ? "Yearly saves £70." : "Yearly: £174 for 6 months, then £278/yr."}
        </p>
      </div>
      <button className="primary-button" onClick={trialCelebrated ? onContinue : onStartTrial}>
        {trialCelebrated ? "Continue" : isSwitcher ? "Start my 30-day free trial" : "Start my 60-day free trial"}
      </button>
      <p className="tiny">
        {isSwitcher
          ? "No card needed today. We'll remind you 3 days before your trial ends."
          : "No card needed today. Discount applies automatically once your trial ends."}
      </p>
    </div>
  );
}

function MetricCard({
  value,
  label,
  detail,
  celebrated
}: {
  value: string;
  label: string;
  detail: string;
  celebrated: boolean;
}) {
  return (
    <div className={`metric-card ${celebrated ? "soft-fade" : ""}`}>
      <AnimatedValue value={value} />
      {label ? <strong>{label}</strong> : null}
      <small>{detail}</small>
    </div>
  );
}

function AnimatedValue({ value }: { value: string }) {
  const [shown, setShown] = useState("0");
  useEffect(() => {
    const timeout = window.setTimeout(() => setShown(value), 160);
    return () => window.clearTimeout(timeout);
  }, [value]);
  return <span className="animated-value">{shown}</span>;
}

function PhoneScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  const phoneValid = state.phone.replace(/\D/g, "").length >= 9;
  return (
    <div className="screen sparse">
      <ScreenTitle
        title="Last bit - let's secure your account."
        subtitle="We'll text a code to confirm - and use this to keep your clients in the loop with reminders later."
      />
      <div className="phone-row">
        <button className="country-picker">+44</button>
        <label className="field phone-field">
          <input
            value={state.phone}
            onChange={(event) => update({ phone: event.target.value })}
            placeholder="7XXX XXX XXX"
            inputMode="tel"
          />
        </label>
      </div>
      <button className="primary-button bottom-pinned" disabled={!phoneValid} onClick={onContinue}>
        Send code
      </button>
    </div>
  );
}

function VerifyScreen({
  state,
  update,
  verifySuccess,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  verifySuccess: boolean;
  onContinue: () => void;
}) {
  const digits = state.code.padEnd(6, " ").slice(0, 6).split("");
  return (
    <div className="screen sparse">
      <ScreenTitle
        title="Enter your code."
        subtitle={`We sent it to +44 ${state.phone || "7XXX XXX XXX"}.`}
      />
      <button className="text-button wrong-number">Wrong number?</button>
      <label className="hidden-label" htmlFor="code-input">
        Verification code
      </label>
      <input
        id="code-input"
        className="code-hidden-input"
        value={state.code}
        onChange={(event) => update({ code: event.target.value.replace(/\D/g, "").slice(0, 6) })}
        inputMode="numeric"
        autoFocus
      />
      <div className="code-boxes" onClick={() => document.getElementById("code-input")?.focus()}>
        {digits.map((digit, index) => (
          <span key={`${index}-${digit}`}>{digit.trim()}</span>
        ))}
      </div>
      <p className="resend">Didn't get it? <span>Resend in 30s</span></p>
      {verifySuccess ? (
        <div className="verify-check">
          <CheckCircle2 size={42} />
        </div>
      ) : null}
      <button className="primary-button bottom-pinned" disabled={state.code.length !== 6} onClick={onContinue}>
        Verify
      </button>
    </div>
  );
}

function YourNameScreen({
  state,
  update,
  onContinue
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen sparse">
      <ScreenTitle
        title="Almost there - what shall we call you?"
        subtitle="We'll use this on your dashboard, your booking page, and any messages your clients see."
      />
      <label className="field">
        <span>First name</span>
        <input
          autoFocus
          value={state.firstName}
          onChange={(event) => update({ firstName: event.target.value })}
          placeholder="Your first name"
        />
      </label>
      <button className="primary-button bottom-pinned" disabled={!state.firstName.trim()} onClick={onContinue}>
        Nice to meet you
      </button>
    </div>
  );
}

function WhatNowScreen({
  state,
  ownerName,
  businessName,
  businessNoun,
  isSwitcher,
  onServices,
  onClients,
  onHome
}: {
  state: OnboardingState;
  ownerName: string;
  businessName: string;
  businessNoun: string;
  isSwitcher: boolean;
  onServices: () => void;
  onClients: () => void;
  onHome: () => void;
}) {
  return (
    <div className="screen what-now-screen">
      <ScreenTitle
        title={`What now, ${ownerName}?`}
        subtitle="Pick something to set up next, or take a look around. You can always come back to this."
      />
      <div className="next-actions">
        <NextActionCard
          icon={<Wand2 size={22} />}
          title="Add your services"
          body={`We've got a starter menu ready for ${businessName} - five ${businessNoun} services with sensible prices. Tweak what you don't offer.`}
          time="1 min"
          onClick={onServices}
        />
        {isSwitcher ? (
          <NextActionCard
            icon={<Navigation size={22} />}
            title={`Bring your clients across from ${state.comingFrom}`}
            body="Pull your client list, contact details, and booking history. We'll do the heavy lifting."
            time="30 sec to start"
            onClick={onClients}
          />
        ) : null}
        <NextActionCard
          icon={<Sparkles size={22} />}
          title="Take a look around first"
          body="Get a feel for the app. Set things up at your own pace."
          time="No time at all"
          onClick={onHome}
        />
      </div>
    </div>
  );
}

function NextActionCard({
  icon,
  title,
  body,
  time,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  time: string;
  onClick: () => void;
}) {
  return (
    <button className="next-card" onClick={onClick}>
      <span className="choice-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
        <em>{time}</em>
      </span>
      <ChevronRight size={18} />
    </button>
  );
}

function HomeScreen({
  state,
  ownerName,
  businessName,
  businessNoun,
  isSwitcher,
  onChecklistServices,
  onChecklistClients
}: {
  state: OnboardingState;
  ownerName: string;
  businessName: string;
  businessNoun: string;
  isSwitcher: boolean;
  onChecklistServices: () => void;
  onChecklistClients: () => void;
}) {
  const items = useMemo(
    () => getChecklistItems(state, isSwitcher, businessName, businessNoun),
    [state, isSwitcher, businessName, businessNoun]
  );
  const done = items.filter((item) => item.done).length;
  const progress = Math.round((done / items.length) * 100);
  return (
    <div className="home-screen">
      <header className="home-header">
        <div>
          <small>Thu, 7 May</small>
          <h1>Good morning, {ownerName}</h1>
        </div>
        <div className="home-actions">
          <button aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button aria-label="Profile" className="avatar">
            {ownerName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>
      <section className="checklist-card">
        <div className="checklist-head">
          <div>
            <span className="kicker">Setup checklist</span>
            <h2>Finish setting up - {done} of {items.length} done</h2>
          </div>
          <PartyPopper size={24} />
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="checklist-items">
          {items.map((item) => (
            <button
              className={`checklist-row ${item.done ? "done" : ""}`}
              key={item.title}
              onClick={() => {
                if (item.key === "services") onChecklistServices();
                if (item.key === "clients") onChecklistClients();
              }}
            >
              <span>{item.done ? <Check size={15} /> : item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.time}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="today-panel">
        <div>
          <span className="kicker">Today</span>
          <h2>No appointments yet</h2>
          <p>Your calendar will wake up once your services and hours are ready.</p>
        </div>
        <CalendarDays size={48} />
      </section>
      <nav className="tabbar" aria-label="Main navigation">
        <button className="active"><Home size={20} /><span>Home</span></button>
        <button><CalendarDays size={20} /><span>Diary</span></button>
        <button><Users size={20} /><span>Clients</span></button>
        <button><CreditCard size={20} /><span>Money</span></button>
        <button><Settings size={20} /><span>More</span></button>
      </nav>
    </div>
  );
}

function PlaceholderScreen({
  icon,
  title,
  body,
  action,
  onAction
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="screen placeholder-screen">
      <div className="placeholder-icon">{icon}</div>
      <ScreenTitle title={title} subtitle={body} />
      <button className="primary-button bottom-pinned" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function SetupPlaceholderScreen({
  flow,
  businessName,
  fromTool,
  onComplete,
  onSkip
}: {
  flow: SetupFlow;
  businessName: string;
  fromTool: string;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const isServices = flow === "services";
  return (
    <div className="screen placeholder-screen">
      <div className="placeholder-icon">{isServices ? <Wand2 size={36} /> : <Navigation size={36} />}</div>
      <ScreenTitle
        title={isServices ? "Starter services are ready." : `Client import from ${fromTool || "your old platform"}.`}
        subtitle={
          isServices
            ? `A lightweight placeholder for editing the starter menu for ${businessName}.`
            : "A lightweight placeholder for connecting the old platform and starting an import."
        }
      />
      <div className="mini-preview">
        {isServices ? (
          <>
            <span>Cut & finish <strong>£45</strong></span>
            <span>Colour consultation <strong>£20</strong></span>
            <span>Blow dry <strong>£32</strong></span>
          </>
        ) : (
          <>
            <span>Clients <strong>Ready</strong></span>
            <span>Booking history <strong>Queued</strong></span>
            <span>Contacts <strong>Matched</strong></span>
          </>
        )}
      </div>
      <div className="bottom-actions">
        <button className="primary-button" onClick={onComplete}>
          Mark done and go Home
        </button>
        <button className="text-button" onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

function ChipGrid({
  items,
  selected,
  onSelect,
  variant
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  variant?: "grid2";
}) {
  return (
    <div className={`chip-grid ${variant === "grid2" ? "grid2" : ""}`}>
      {items.map((item) => (
        <button
          className={`chip ${selected === item ? "selected" : ""}`}
          key={item}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ConfettiBurst() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 38 }).map((_, index) => {
        const style = {
          "--hue": `${index % 7 === 0 ? 350 : 0}`,
          "--lightness": `${index % 7 === 0 ? 58 : 18 + (index % 5) * 13}%`,
          "--drift-start": `${(index - 18) * 4}px`,
          "--drift-end": `${(index - 18) * 10}px`,
          "--spin": `${500 + index * 9}deg`,
          left: `${8 + ((index * 23) % 84)}%`,
          animationDelay: `${(index % 8) * 34}ms`
        } as React.CSSProperties;
        return <i key={index} style={style} />;
      })}
    </div>
  );
}

function getPasswordStrength(password: string) {
  if (password.length >= 12 && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    return { score: 3, label: "Strong" };
  }
  if (password.length >= 8 && (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password))) {
    return { score: 2, label: "Medium" };
  }
  return { score: password.length > 0 ? 1 : 0, label: "Weak" };
}

function getBusinessNoun(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("barber")) return "barbers";
  if (lower.includes("nail")) return "nail studios";
  if (lower.includes("beauty")) return "beauty rooms";
  if (lower.includes("spa")) return "spas";
  if (lower.includes("wellness")) return "wellness studios";
  if (lower.includes("fitness")) return "fitness studios";
  if (lower.includes("something")) return "local businesses";
  return "hair salons";
}

function getLocationCopy(mode: string, businessName: string) {
  if (mode === "From a few places") {
    return {
      title: "Let's start with your first location.",
      subtitle:
        "You can add the rest from your home screen - we'll keep your bookings, team, and hours separate for each."
    };
  }
  if (mode === "I travel to clients") {
    return {
      title: "What area do you cover?",
      subtitle:
        "Clients near here will be able to find and book you. You can fine-tune your travel radius once you're in."
    };
  }
  return {
    title: `Where's ${businessName} based?`,
    subtitle: "Just an area is fine for now - clients near here will find you. Full address can come later."
  };
}

function getChecklistItems(
  state: OnboardingState,
  isSwitcher: boolean,
  businessName: string,
  businessNoun: string
) {
  const team = state.teamSize !== "Just me";
  const items = [
    {
      key: "services",
      title: state.completedServices ? `Services live for ${businessName}` : "Add your services",
      time: state.completedServices ? "Done" : "1 min",
      done: state.completedServices,
      icon: <Wand2 size={15} />,
      detail: businessNoun
    },
    {
      key: "hours",
      title: "Tweak your opening hours",
      time: "45 sec",
      done: false,
      icon: <Clock3 size={15} />
    },
    {
      key: "logo",
      title: "Add your logo",
      time: "30 sec",
      done: false,
      icon: <Store size={15} />
    },
    {
      key: "payments",
      title: "Connect payments",
      time: "2 min",
      done: false,
      icon: <CreditCard size={15} />
    }
  ];

  if (team) {
    items.push({
      key: "team",
      title: "Invite your team",
      time: "1 min",
      done: false,
      icon: <Users size={15} />
    });
  }
  if (state.locationMode === "From a few places") {
    items.push({
      key: "locations",
      title: "Add your other locations",
      time: "1 min",
      done: false,
      icon: <MapPinned size={15} />
    });
  }
  if (state.locationMode === "I travel to clients") {
    items.push({
      key: "radius",
      title: "Set your travel radius",
      time: "45 sec",
      done: false,
      icon: <Navigation size={15} />
    });
  }
  if (isSwitcher) {
    items.push({
      key: "clients",
      title: state.completedClients ? `Clients queued from ${state.comingFrom}` : "Bring your clients",
      time: state.completedClients ? "Done" : "30 sec",
      done: state.completedClients,
      icon: <Users size={15} />
    });
  }
  if (!["apple", "google", "facebook"].includes(state.authMethod)) {
    items.push({
      key: "photo",
      title: "Add a profile photo",
      time: "30 sec",
      done: false,
      icon: <User size={15} />
    });
  }
  return items;
}

export default App;
