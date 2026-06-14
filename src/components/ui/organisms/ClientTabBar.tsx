"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, CalendarDays, MessageCircle, UserRound } from "lucide-react";

// Bottom navigation for the consumer surface. Focused flows (story viewer,
// booking, checkout, post creation, chat thread) hide it — their own header
// is the only way out, matching the B2B checkout pattern.
const TABS = [
  { key: "home", label: "Home", icon: House, href: "/c/home" },
  { key: "explore", label: "Explore", icon: Search, href: "/c/explore" },
  { key: "bookings", label: "Bookings", icon: CalendarDays, href: "/c/bookings" },
  { key: "inbox", label: "Inbox", icon: MessageCircle, href: "/c/inbox" },
  { key: "profile", label: "Profile", icon: UserRound, href: "/c/profile" },
] as const;

const HIDDEN = [/^\/c\/story\//, /\/book(\/|$)/, /^\/c\/checkout/, /^\/c\/confirmed/, /^\/c\/create/, /^\/c\/inbox\/.+/];

export function ClientTabBar() {
  const pathname = usePathname();
  if (HIDDEN.some((re) => re.test(pathname))) return null;

  return (
    <nav className="z-50 grid shrink-0 grid-cols-5 border-t border-border bg-surface px-2 pb-3 pt-2">
      {TABS.map(({ key, label, icon: Icon, href }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={key} href={href} className="flex flex-col items-center gap-1 py-1">
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} className={active ? "text-navy" : "text-muted"} />
            <span className={`text-[11px] ${active ? "font-semibold text-navy" : "font-medium text-muted"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
