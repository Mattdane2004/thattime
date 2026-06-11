"use client";

import { useState } from "react";
import { OnboardingData } from "../OnboardingFlow";
import { Field, PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function Screen3Details({ data, update, onNext }: Props) {
  const [showPwd, setShowPwd] = useState(false);

  const valid =
    data.fullName.trim().length >= 2 &&
    data.password.length >= 8 &&
    /^\+?[0-9\s\-()]{7,}$/.test(data.phone);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🙌"
        title="Who are you?"
        subtitle="Just a few details so we can set up your account."
      />

      <div className="space-y-4 flex-1">
        <Field
          label="Full name"
          placeholder="Alex Morgan"
          autoComplete="name"
          value={data.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          hint="The name your provider will see on bookings."
        />
        <div className="relative">
          <Field
            label="Password"
            type={showPwd ? "text" : "password"}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => update({ password: e.target.value })}
            hint="Mix letters and numbers for a stronger password."
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-4 top-[42px] text-xs text-brand font-medium"
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
        <Field
          label="Phone number"
          type="tel"
          placeholder="+44 7700 900123"
          autoComplete="tel"
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          hint="We’ll text you a verification code."
        />
      </div>

      <PrimaryButton onClick={onNext} disabled={!valid}>
        Next
      </PrimaryButton>
    </div>
  );
}
