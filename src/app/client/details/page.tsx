"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import {
  PrimaryButton,
  PasswordField,
  PhoneInput,
  Field,
  CheckRow,
  inputClass,
} from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function ClientDetailsPage() {
  const router = useRouter();
  const { clientName, phone, set } = useOnboarding2();
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const valid =
    clientName.first.trim() && clientName.last.trim() && password.length >= 8 && agreed;

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!valid} onClick={() => router.push("/client/verify")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="Just a few details so we can set up your account.">Tell them about yourself</Title>
      <div className="flex flex-col gap-5 px-6 pt-5">
        <Field label="Full name">
          <div className="flex gap-3">
            <input
              value={clientName.first}
              onChange={(e) => set("clientName", { ...clientName, first: e.target.value })}
              className={inputClass}
              placeholder="First name"
            />
            <input
              value={clientName.last}
              onChange={(e) => set("clientName", { ...clientName, last: e.target.value })}
              className={inputClass}
              placeholder="Last name"
            />
          </div>
        </Field>
        <Field label="Password">
          <PasswordField value={password} onChange={setPassword} withMeter={false} hint="At least 8 characters." />
        </Field>
        <Field label="Birthday">
          <div className="grid grid-cols-3 gap-3">
            <input className={inputClass} placeholder="00" inputMode="numeric" maxLength={2} />
            <input className={inputClass} placeholder="July" />
            <input className={inputClass} placeholder="2000" inputMode="numeric" maxLength={4} />
          </div>
        </Field>
        <Field label="Phone number">
          <PhoneInput value={phone} onChange={(v) => set("phone", v)} />
        </Field>
        <CheckRow
          checked={agreed}
          onToggle={() => setAgreed((a) => !a)}
          title="I agree to terms and conditions and privacy policy."
        />
        <div className="h-2" />
      </div>
    </Screen>
  );
}
