"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { House, Calendar, Users, MessageSquare, Plus, X } from "lucide-react";
import { useAppStore } from "@/lib/store/appStore";
import "@/components/onboarding2/motion-test-hook";

// Bottom navigation for the product surfaces. The fifth tab opens the Quick
// Actions sheet (icon morphs + → ✕ while open) rather than navigating.
const TABS = [
  { key: "home", label: "Home", icon: House, href: "/app" },
  { key: "schedule", label: "Schedule", icon: Calendar, href: "/app/schedule" },
  { key: "clients", label: "Clients", icon: Users, href: "/app/clients" },
  { key: "messages", label: "Message", icon: MessageSquare, href: "/app/messages" },
] as const;

export function AppTabBar() {
  const pathname = usePathname();
  const { quickAction, setQuickAction } = useAppStore();
  const menuOpen = quickAction !== null;

  // Checkout is a focused flow — the back arrow in its header is the only
  // way out, so the tab bar stays hidden.
  if (pathname.startsWith("/app/checkout")) return null;

  return (
    <nav className="z-50 grid shrink-0 grid-cols-5 border-t border-border bg-surface px-2 pb-3 pt-2">
      {TABS.map(({ key, label, icon: Icon, href }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link key={key} href={href} className="flex flex-col items-center gap-1 py-1" onClick={() => setQuickAction(null)}>
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} className={active ? "text-navy" : "text-muted"} />
            <span className={`text-[11px] ${active ? "font-semibold text-navy" : "font-medium text-muted"}`}>
              {label}
            </span>
          </Link>
        );
      })}
      <button
        type="button"
        aria-label={menuOpen ? "Close quick actions" : "Open quick actions"}
        onClick={() => setQuickAction(menuOpen ? null : "menu")}
        className="flex flex-col items-center gap-1 py-1"
      >
        <motion.span
          animate={{ rotate: menuOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="flex"
        >
          {menuOpen ? (
            <X size={20} strokeWidth={2.25} className="text-navy" />
          ) : (
            <Plus size={20} strokeWidth={1.75} className="text-muted" />
          )}
        </motion.span>
        <span className={`text-[11px] ${menuOpen ? "font-semibold text-navy" : "font-medium text-muted"}`}>
          {menuOpen ? "Actions" : "Add"}
        </span>
      </button>
    </nav>
  );
}
