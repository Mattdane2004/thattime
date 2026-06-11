import type { ReactNode } from "react";
import { AppFrame } from "@/components/app/AppFrame";

// The service-creation wizard is a full-screen flow — phone frame, no tab bar.
export default function NewLayout({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
