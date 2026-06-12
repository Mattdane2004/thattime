"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, PasswordField, Field, CheckRow } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function StaffPasswordPage() {
  const router = useRouter();
  const staffEmail = useOnboarding2((s) => s.staffEmail);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={password.length < 8 || !agreed}
          onClick={() => router.push("/onboarding/staff/profile")}
        >
          Continue
        </PrimaryButton>
      }
    >
      <Title sub={`Use 8 or more characters. You'll use this with ${staffEmail} to log in.`}>
        Set a password
      </Title>
      <div className="flex flex-col gap-6 px-6 pt-6">
        <Field label="Password">
          <PasswordField value={password} onChange={setPassword} />
        </Field>
        <CheckRow
          checked={agreed}
          onToggle={() => setAgreed((a) => !a)}
          title="I agree to terms and conditions and privacy policy."
        />
      </div>
    </Screen>
  );
}
