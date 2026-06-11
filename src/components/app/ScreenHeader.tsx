"use client";

import type { ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";

// Full-screen flow header (wizard / sub-screens). Ported from the legacy
// that-time-app src/components/ScreenHeader.jsx.
export function ScreenHeader({
  title,
  onBack,
  onClose,
  rightAction,
  border = false,
}: {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`flex h-16 shrink-0 items-center justify-between px-5 ${border ? "border-b border-border" : ""}`}>
      <div className="flex w-10 items-center">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </button>
        )}
        {onClose && !onBack && (
          <button onClick={onClose} aria-label="Close" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <X size={20} />
          </button>
        )}
      </div>
      <div className="truncate text-[15px] font-semibold text-navy">{title}</div>
      <div className="flex w-10 items-center justify-end text-sm text-secondary">{rightAction}</div>
    </div>
  );
}
