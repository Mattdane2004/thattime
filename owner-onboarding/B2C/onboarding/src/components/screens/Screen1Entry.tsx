"use client";

import { PrimaryButton, ScreenHeader } from "../ui";

export default function Screen1Entry({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
        <div className="relative w-44 h-44 mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-soft animate-pulse-ring" />
          <div className="absolute inset-3 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className="text-6xl" aria-hidden>👋</span>
          </div>
          <span className="absolute -top-2 -right-1 text-3xl animate-pop" aria-hidden>✨</span>
          <span className="absolute bottom-0 -left-2 text-2xl animate-pop" aria-hidden>💇</span>
        </div>
        <ScreenHeader
          title="Let’s create your account"
          subtitle="Enter your details to start discovering and booking services."
        />
      </div>
      <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      <p className="mt-4 text-center text-xs text-muted">
        Already have an account? <span className="text-brand font-medium">Sign in</span>
      </p>
    </div>
  );
}
