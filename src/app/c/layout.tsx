import type { ReactNode } from "react";
import { AppFrame } from "@/components/app/AppFrame";
import { ClientTabBar } from "@/components/client/ClientTabBar";

// Consumer app shell: same device frame as the B2B product surface, with the
// social-first client tab bar. Focused flows hide the bar via ClientTabBar.
export default function ConsumerLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <div className="flex min-h-0 flex-1 flex-col font-body text-navy">{children}</div>
      <ClientTabBar />
    </AppFrame>
  );
}
