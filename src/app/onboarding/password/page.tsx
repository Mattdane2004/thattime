"use client";

import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, PasswordField, Field, CheckRow } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function PasswordPage() {
  const router = useRouter();
  const { password, marketingOptIn, set } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={password.length < 8}
          onClick={() => router.push("/onboarding/profile")}
        >
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="This will be used on your That Time account.">
        Create your professional account
      </Title>
      <div className="flex flex-col gap-6 px-6 pt-6">
        <Field label="Password">
          <PasswordField value={password} onChange={(v) => set("password", v)} />
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
