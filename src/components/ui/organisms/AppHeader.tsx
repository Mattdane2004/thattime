"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

// AppHeader — tab-page header: bold title + date, bell (→ notifications),
// avatar (→ hub). Product-app chrome organism.
//
// Optional `center` renders a centered slot (e.g. the home role switcher).
// `avatarHref` overrides the avatar destination; pass `null` to render a
// non-interactive avatar (staff, who can't reach the business hub).
export function AppHeader({
  title,
  center,
  avatarHref = "/app/hub",
}: {
  title: string;
  center?: ReactNode;
  avatarHref?: string | null;
}) {
  const avatarClass = "flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-secondary";
  return (
    <div className="relative flex items-center justify-between px-4 pb-3 pt-4">
      <div>
        <h1 className="text-[20px] font-bold leading-tight text-navy">{title}</h1>
        <p className="text-[12px] text-muted">Wednesday 4 March</p>
      </div>
      {center && <div className="absolute left-1/2 -translate-x-1/2">{center}</div>}
      <div className="flex items-center gap-3">
        <Link href="/app/notifications" aria-label="Notifications" className="relative p-1 text-navy">
          <Bell size={20} strokeWidth={1.75} />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-danger" />
        </Link>
        {avatarHref ? (
          <Link href={avatarHref} aria-label="Business hub" className={avatarClass}>
            SJ
          </Link>
        ) : (
          <span className={avatarClass}>SJ</span>
        )}
      </div>
    </div>
  );
}

// SectionLabel — section heading row (bold title + optional count + right slot).
export function SectionLabel({
  children,
  count,
  right,
}: {
  children: ReactNode;
  count?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[16px] font-bold text-navy">{children}</span>
        {count !== undefined && <span className="text-[15px] font-semibold text-muted">{count}</span>}
      </div>
      {right}
    </div>
  );
}
