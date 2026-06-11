"use client";

import { OnboardingData } from "../OnboardingFlow";
import { Field, PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 h-12 rounded-2xl border border-border bg-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-black/[0.03] transition"
      aria-label={`Continue with ${label}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function Screen2SignUp({ data, update, onNext }: Props) {
  const handleSocial = (provider: "google" | "apple" | "facebook") => {
    update({ authProvider: provider });
    onNext();
  };

  const canContinue = /\S+@\S+\.\S+/.test(data.email);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="📱"
        title="Let’s get you started"
        subtitle="Sign up with email or continue with your favourite account to start finding services."
      />

      <div className="flex gap-3 mb-5">
        <SocialButton
          label="Google"
          onClick={() => handleSocial("google")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.22-4.74 3.22-8.32z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
            </svg>
          }
        />
        <SocialButton
          label="Apple"
          onClick={() => handleSocial("apple")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 1c.1 1.2-.4 2.4-1.1 3.2-.8.9-2 1.6-3.2 1.5-.1-1.2.5-2.4 1.2-3.2.8-.9 2.1-1.5 3.1-1.5zM20 17.3c-.5 1.2-.8 1.7-1.5 2.8-1 1.5-2.4 3.3-4.1 3.3-1.5 0-1.9-1-4-1-2 0-2.5 1-4 1-1.7 0-3-1.7-4-3.1-2.8-4-3.1-8.7-1.4-11.2 1.2-1.8 3.1-2.9 4.9-2.9 1.8 0 3 1 4.5 1 1.5 0 2.4-1 4.5-1 1.6 0 3.3.9 4.5 2.4-4 2.2-3.3 7.9.6 8.7z" />
            </svg>
          }
        />
        <SocialButton
          label="Facebook"
          onClick={() => handleSocial("facebook")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.96h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z" />
            </svg>
          }
        />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-4 flex-1">
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value, authProvider: "email" })}
        />
      </div>

      <PrimaryButton onClick={onNext} disabled={!canContinue}>
        Continue
      </PrimaryButton>
      <p className="mt-3 text-center text-[11px] text-muted leading-relaxed">
        By continuing you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
}
