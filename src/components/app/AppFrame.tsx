import type { ReactNode } from "react";

// Phone shell for the product (post-onboarding) surfaces. Shares the canonical
// onboarding frame geometry (378×756, rounded-phone) minus the onboarding-only
// reset control, so onboarding → app feels like one device.
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-gradient-to-b from-canvas to-[#EBEBED] sm:items-center sm:px-4 sm:py-8">
      <section className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-canvas text-navy sm:h-[756px] sm:w-[378px] sm:rounded-phone sm:border sm:border-white/70 sm:shadow-phone">
        {children}
      </section>
    </main>
  );
}
