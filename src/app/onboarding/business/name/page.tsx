"use client";

import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function BusinessNamePage() {
  const router = useRouter();
  const { businessName, set } = useOnboarding2();

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={!businessName.trim()}
          onClick={() => router.push("/onboarding/business/type")}
        >
          Save and continue
        </PrimaryButton>
      }
    >
      <Title sub="Use the name your clients know you by. You can change it later.">
        What&rsquo;s your business called?
      </Title>
      <div className="px-6 pt-6">
        <Field label="Business name">
          <input
            value={businessName}
            onChange={(e) => set("businessName", e.target.value)}
            className={inputClass}
            placeholder="e.g. Salon Soho"
            autoFocus
          />
        </Field>
      </div>
    </Screen>
  );
}
