import type { ReactNode } from "react";
import { MobileFrame } from "@/components/onboarding/MobileFrame";
import { RouteTransition } from "@/components/onboarding/RouteTransition";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <MobileFrame>
      <RouteTransition>{children}</RouteTransition>
    </MobileFrame>
  );
}
