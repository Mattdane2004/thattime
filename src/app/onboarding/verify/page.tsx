"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, OtpInput, BottomSheet } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function VerifyPage() {
  const router = useRouter();
  const phone = useOnboarding2((s) => s.phone);
  const authMethod = useOnboarding2((s) => s.authMethod);
  const [complete, setComplete] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Phone signups continue to password creation; social signups already
  // reviewed their details, so they go straight to profile preparation.
  const nextRoute = authMethod === "phone" ? "/onboarding/password" : "/onboarding/preparing";

  const verify = () => {
    setVerifying(true);
    setTimeout(() => router.push(nextRoute), 800);
  };

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!complete} loading={verifying} onClick={verify}>
          Verify
        </PrimaryButton>
      }
    >
      <Title sub={`We sent it to +44 ${phone || "7123 456789"}..`}>Enter your code</Title>
      <div className="px-6 pt-6">
        <p className="mb-2 text-[13px] text-secondary">SMS code</p>
        <OtpInput
          onComplete={() => {
            setComplete(true);
          }}
        />
        <p className="mt-5 text-[14px] text-secondary">
          Didn&rsquo;t get it? <button type="button" className="text-secondary">Resend</button>
        </p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-1 text-[14px] font-semibold text-navy underline"
        >
          Try Another way
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-navy">Send code another way</h2>
            <p className="mt-1 text-[14px] text-secondary">
              Choose how you&rsquo;d like to receive your code.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="p-1 text-navy">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <PrimaryButton onClick={() => setSheetOpen(false)}>SMS</PrimaryButton>
          <PrimaryButton onClick={() => setSheetOpen(false)}>Whatsapp</PrimaryButton>
        </div>
      </BottomSheet>
    </Screen>
  );
}
