"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import {
  PrimaryButton,
  PhoneInput,
  Field,
  CheckRow,
  inputClass,
} from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function ReviewPage() {
  const router = useRouter();
  const { phone, firstName, lastName, marketingOptIn, authMethod, set } = useOnboarding2();

  // Prototype: pretend the social provider returned a profile.
  useEffect(() => {
    if (!firstName) set("firstName", "Mathew");
    if (!lastName) set("lastName", "Dane");
  }, [firstName, lastName, set]);

  const provider =
    authMethod === "apple" ? "Apple" : authMethod === "facebook" ? "Facebook" : "Google";
  const valid = phone.replace(/\D/g, "").length >= 10;

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!valid} onClick={() => router.push("/onboarding/verify")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub={`we've imported this data from ${provider} check its correct`}>
        Review and confirm
      </Title>
      <div className="flex flex-col gap-6 px-6 pt-6">
        <Field label="Name">
          <div className="flex gap-3">
            <input
              value={firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputClass}
              placeholder="First name"
            />
            <input
              value={lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputClass}
              placeholder="Last name"
            />
          </div>
        </Field>
        <Field label="Phone number">
          <PhoneInput value={phone} onChange={(v) => set("phone", v)} />
        </Field>
        <CheckRow
          checked={marketingOptIn}
          onToggle={() => set("marketingOptIn", !marketingOptIn)}
          title="Send me tips and updates from That Time."
          sub="You can change this anytime in Settings"
        />
      </div>
    </Screen>
  );
}
