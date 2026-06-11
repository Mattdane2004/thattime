"use client";

import { useState } from "react";
import Screen1Entry from "./screens/Screen1Entry";
import Screen2SignUp from "./screens/Screen2SignUp";
import Screen3Details from "./screens/Screen3Details";
import Screen4Verify from "./screens/Screen4Verify";
import Screen5Birthday from "./screens/Screen5Birthday";
import Screen6Gender from "./screens/Screen6Gender";
import Screen7Location from "./screens/Screen7Location";
import Screen8Notifications from "./screens/Screen8Notifications";
import Screen9Preferences from "./screens/Screen9Preferences";
import Screen10Home from "./screens/Screen10Home";
import PhoneShell from "./PhoneShell";

export type OnboardingData = {
  email: string;
  authProvider: "email" | "google" | "apple" | "facebook" | null;
  fullName: string;
  password: string;
  phone: string;
  verified: boolean;
  birthday: string;
  gender: string;
  postcode: string;
  locationGranted: boolean;
  notificationsAllowed: boolean | null;
  preferences: string[];
};

const initial: OnboardingData = {
  email: "",
  authProvider: null,
  fullName: "",
  password: "",
  phone: "",
  verified: false,
  birthday: "",
  gender: "",
  postcode: "",
  locationGranted: false,
  notificationsAllowed: null,
  preferences: [],
};

const TOTAL_STEPS = 10;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initial);

  const update = (patch: Partial<OnboardingData>) =>
    setData((d) => ({ ...d, ...patch }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const reset = () => {
    setStep(1);
    setData(initial);
  };

  const screens = [
    <Screen1Entry key="1" onNext={next} />,
    <Screen2SignUp key="2" data={data} update={update} onNext={next} />,
    <Screen3Details key="3" data={data} update={update} onNext={next} />,
    <Screen4Verify key="4" data={data} update={update} onNext={next} />,
    <Screen5Birthday key="5" data={data} update={update} onNext={next} />,
    <Screen6Gender key="6" data={data} update={update} onNext={next} />,
    <Screen7Location key="7" data={data} update={update} onNext={next} />,
    <Screen8Notifications key="8" data={data} update={update} onNext={next} />,
    <Screen9Preferences key="9" data={data} update={update} onNext={next} />,
    <Screen10Home key="10" data={data} onRestart={reset} />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-[#fff5f0] via-[#fffaf5] to-[#f3f0ff]">
      <header className="w-full max-w-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white font-bold">T</div>
          <span className="font-semibold tracking-tight">That Time</span>
        </div>
        <span className="text-xs text-muted">
          Step {step} of {TOTAL_STEPS}
        </span>
      </header>

      <PhoneShell
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={step > 1 && step < TOTAL_STEPS ? back : undefined}
      >
        {screens[step - 1]}
      </PhoneShell>

      <footer className="mt-6 text-xs text-muted">
        A friendlier way to book the services you love.
      </footer>
    </div>
  );
}
