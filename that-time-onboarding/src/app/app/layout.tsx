import type { ReactNode } from "react";
import { AppFrame } from "@/components/app/AppFrame";
import { AppTabBar } from "@/components/app/AppTabBar";

// Shell for the product (post-onboarding) routes under /app.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <div className="flex-1 overflow-y-auto">{children}</div>
      <AppTabBar />
    </AppFrame>
  );
}
