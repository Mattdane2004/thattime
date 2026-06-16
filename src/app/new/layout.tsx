import type { ReactNode } from "react";
import { AppFrame } from "@/components/app/AppFrame";

// The service-creation wizard is a full-screen flow — phone frame, no tab bar.
// Render on a white (surface) background so the canvas-filled inputs and cards
// read as distinct fields instead of blending into the frame's canvas tone.
export default function NewLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <div className="flex min-h-0 flex-1 flex-col bg-surface">{children}</div>
    </AppFrame>
  );
}
