"use client";

import { useRouter } from "next/navigation";
import { Screen, Title, TermsFootnote } from "@/components/onboarding2/Shell";
import {
  PrimaryButton,
  SocialButtons,
  OrDivider,
  PhoneInput,
  Field,
} from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function SignupPage() {
  const router = useRouter();
  const phone = useOnboarding2((s) => s.phone);
  const setField = useOnboarding2((s) => s.set);
  const valid = phone.replace(/\D/g, "").length >= 10;

  return (
    <Screen>
      <Title sub="Choose the quickest way to get started.">First, create your account</Title>
      <div className="px-6 pt-6">
        <Field label="Phone number">
          <PhoneInput value={phone} onChange={(v) => setField("phone", v)} />
        </Field>
        <div className="pt-6">
          <PrimaryButton
            disabled={!valid}
            onClick={() => {
              setField("authMethod", "phone");
              router.push("/onboarding/verify");
            }}
          >
            Continue
          </PrimaryButton>
        </div>
        <OrDivider />
        <SocialButtons
          onPick={(p) => {
            setField("authMethod", p);
            router.push("/onboarding/review");
          }}
        />
        <TermsFootnote />
      </div>
    </Screen>
  );
}
