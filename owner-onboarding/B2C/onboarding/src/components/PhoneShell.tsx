"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
};

export default function PhoneShell({ children, step, totalSteps, onBack }: Props) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] border border-border overflow-hidden">
      {/* Top bar / progress */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-3">
        {onBack ? (
          <button
            aria-label="Back"
            onClick={onBack}
            className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}
        <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-6 pb-8 pt-2 min-h-[560px] flex flex-col" key={step}>
        <div className="flex-1 animate-fade-up">{children}</div>
      </div>
    </div>
  );
}
