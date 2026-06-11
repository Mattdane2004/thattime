"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, OtpInput, BottomSheet } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function ClientVerifyPage() {
  const router = useRouter();
  const phone = useOnboarding2((s) => s.phone);
  const [complete, setComplete] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={!complete}
          loading={verifying}
          onClick={() => {
            setVerifying(true);
            setTimeout(() => router.push("/client/home"), 800);
          }}
        >
          Verify
        </PrimaryButton>
      }
    >
      <Title sub={`We sent it to +44 ${phone || "7123 456789"}..`}>Enter your code</Title>
      <div className="px-6 pt-6">
        <p className="mb-2 text-[13px] text-secondary">SMS code</p>
        <OtpInput onComplete={() => setComplete(true)} />
        <p className="mt-5 text-[14px] text-secondary">Didn&rsquo;t get it? Resend</p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-1 text-[14px] font-semibold text-navy underline"
        >
          Try Another way
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <h2 className="text-[17px] font-bold text-navy">Send code another way</h2>
        <p className="mt-1 text-[14px] text-secondary">Choose how you&rsquo;d like to receive your code.</p>
        <div className="mt-6 flex flex-col gap-3">
          <PrimaryButton onClick={() => setSheetOpen(false)}>SMS</PrimaryButton>
          <PrimaryButton onClick={() => setSheetOpen(false)}>Whatsapp</PrimaryButton>
        </div>
      </BottomSheet>
    </Screen>
  );
}
