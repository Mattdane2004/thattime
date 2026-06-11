"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Calendar, Users, MessageSquare, Plus } from "lucide-react";

// Bottom navigation for the product surfaces. Home is wired; the remaining
// destinations are part of the screen-port backlog (see PORTING.md) and render
// inert for now rather than 404.
const TABS = [
  { key: "home", label: "Home", icon: House, href: "/app" },
  { key: "schedule", label: "Schedule", icon: Calendar, href: null },
  { key: "clients", label: "Clients", icon: Users, href: "/app/clients" },
  { key: "messages", label: "Message", icon: MessageSquare, href: "/app/messages" },
] as const;

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav className="z-20 grid shrink-0 grid-cols-5 border-t border-border bg-surface px-2 pb-3 pt-2">
      {TABS.map(({ key, label, icon: Icon, href }) => {
        const active = href === "/app" ? pathname === "/app" : href ? pathname.startsWith(href) : false;
        const cls = active ? "text-navy" : "text-muted";
        const inner = (
          <>
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} className={cls} />
            <span className={`text-[11px] ${active ? "font-semibold text-navy" : "font-medium text-muted"}`}>
              {label}
            </span>
          </>
        );
        return href ? (
          <Link key={key} href={href} className="flex flex-col items-center gap-1 py-1">
            {inner}
          </Link>
        ) : (
          <span key={key} className="flex cursor-default flex-col items-center gap-1 py-1 opacity-60">
            {inner}
          </span>
        );
      })}
      <span className="flex cursor-default flex-col items-center gap-1 py-1 opacity-60">
        <Plus size={20} strokeWidth={1.75} className="text-muted" />
        <span className="text-[11px] font-medium text-muted">Add</span>
      </span>
    </nav>
  );
}
