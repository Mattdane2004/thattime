"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// BackHeader — the standard sub-page header: a back chevron, a bold title, and
// an optional subtitle / right-hand action. Defaults to history-back; pass
// `onBack` to override. White surface to sit above a scrolling body.
export interface BackHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  onBack?: () => void;
}

export function BackHeader({ title, sub, action, onBack }: BackHeaderProps) {
  const router = useRouter();
  return (
    <div className="bg-white px-4 pb-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack ?? (() => router.back())}
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        {action}
      </div>
      <h1 className="pt-1 text-[24px] font-bold text-navy">{title}</h1>
      {sub && <p className="pt-0.5 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}
