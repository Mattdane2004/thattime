"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, PasswordField, Field } from "@/components/ui";

export default function LoginPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={password.length < 8}
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => router.push("/app"), 900);
          }}
        >
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="This will be used on your That Time account.">Enter your password</Title>
      <div className="px-6 pt-6">
        <Field label="Password">
          <PasswordField
            value={password}
            onChange={setPassword}
            withMeter={false}
            hint="At least 8 characters."
          />
        </Field>
      </div>
    </Screen>
  );
}
