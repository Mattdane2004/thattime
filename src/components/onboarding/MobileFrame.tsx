"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useOnboardingStore } from "@/lib/store";

export function MobileFrame({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-gradient-to-b from-canvas to-[#EBEBED] sm:items-center sm:px-4 sm:py-8">
      <section className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-canvas text-navy sm:h-[756px] sm:w-[378px] sm:rounded-[28px] sm:border sm:border-white/70 sm:shadow-phone">
        <button
          type="button"
          aria-label="Reset flow"
          title="Reset flow"
          onClick={() => {
            reset();
            router.push("/onboarding/welcome");
          }}
          className="absolute left-1/2 top-2 z-50 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white/70 text-muted opacity-70 ring-1 ring-border/70 backdrop-blur transition hover:opacity-100 hover:text-navy focus:outline-none focus:ring-2 focus:ring-navy sm:left-auto sm:-right-10 sm:top-4 sm:h-7 sm:w-7 sm:translate-x-0"
        >
          <RotateCcw size={13} />
        </button>
        {children}
      </section>
    </main>
  );
}
