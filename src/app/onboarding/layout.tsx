import type { ReactNode } from "react";
import { MobileFrame } from "@/components/onboarding/MobileFrame";
import { RouteTransition } from "@/components/onboarding/RouteTransition";
import { OnboardingChrome, ChromeBackground } from "@/components/onboarding2/chrome";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <MobileFrame>
      <ChromeBackground />
      <div className="relative z-10 flex h-full min-h-0 flex-col font-body text-navy">
        <OnboardingChrome />
        <RouteTransition>{children}</RouteTransition>
      </div>
    </MobileFrame>
  );
}
