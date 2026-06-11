"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Scissors, Package, Users, MapPin, Wallet, BarChart3, Box, FileText,
  Building2, Settings2, Plug, Megaphone, ClipboardCheck, Database,
  CircleUser, CreditCard, Share2, Bell, Sliders, HelpCircle, FileCheck,
  ArrowLeftRight, ChevronRight, ChevronLeft,
} from "lucide-react";

// Hub landing — the home of the product app after onboarding. Ported from the
// legacy that-time-app /hub. Destinations are inert pending their screen ports
// (see PORTING.md); this establishes the shell + navigation surface.

interface MenuItem {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  href?: string;
}

const operations: MenuItem[] = [
  { key: "services", label: "Services", desc: "Services, classes, bundles", icon: Scissors, href: "/app/services" },
  { key: "products", label: "Products", desc: "Internal & retail library", icon: Package },
  { key: "team", label: "Team", desc: "Staff, roles, hours", icon: Users, href: "/app/team" },
  { key: "locations", label: "Locations", desc: "Multi-site management", icon: MapPin },
  { key: "payments", label: "Payments", desc: "Transactions, refunds, tax", icon: Wallet },
  { key: "analytics", label: "Analytics", desc: "Performance & opportunities", icon: BarChart3 },
  { key: "notifications", label: "Notifications", desc: "Client messages & reminders", icon: Bell },
  { key: "resources", label: "Resources", desc: "Rooms & equipment library", icon: Box },
  { key: "forms", label: "Forms", desc: "Templates & builder", icon: FileText },
];

const setupItems: MenuItem[] = [
  { key: "setup-guide", label: "Setup guide", desc: "Guided setup & learning", icon: ClipboardCheck, href: "/app/setup" },
  { key: "business-profile", label: "Business profile", desc: "Public identity clients see", icon: Building2 },
  { key: "business-settings", label: "Business settings", desc: "Booking rules & policies", icon: Settings2 },
  { key: "import-data", label: "Import data", desc: "Clients & bookings from CSV", icon: Database },
  { key: "integrations", label: "Integrations", desc: "Stripe, Calendar, payments", icon: Plug },
];

const accountItems: MenuItem[] = [
  { key: "my-profile", label: "My profile", desc: "Personal details, avatar", icon: CircleUser },
  { key: "wallet", label: "Wallet", desc: "Payouts, bank account, payslips", icon: Wallet },
  { key: "billing", label: "Plans & billing", desc: "Tier, payment, invoices", icon: CreditCard },
  { key: "referrals", label: "Referrals", desc: "Refer other businesses", icon: Share2 },
  { key: "preferences", label: "Preferences", desc: "Theme, language, units", icon: Sliders },
  { key: "help", label: "Help & FAQ", desc: "Support & knowledge base", icon: HelpCircle },
  { key: "legal", label: "Legal", desc: "Terms, privacy, data", icon: FileCheck },
];

function GridCard({ item }: { item: MenuItem }) {
  const { icon: Icon, label, desc, href } = item;
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas">
        <Icon size={18} className="text-navy" />
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-navy">{label}</span>
        <span className="mt-0.5 block text-[12px] text-secondary">{desc}</span>
      </span>
    </>
  );
  const cls = "flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-navy/20";
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button className={cls}>{inner}</button>;
}

function ListCard({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div>
      <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map(({ key, label, desc, icon: Icon, href }, i) => {
          const cls = `flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${i > 0 ? "border-t border-border" : ""}`;
          const inner = (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas">
                <Icon size={16} className="text-navy" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">{label}</span>
                <span className="block truncate text-[12px] text-secondary">{desc}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </>
          );
          return href ? <Link key={key} href={href} className={cls}>{inner}</Link> : <button key={key} className={cls}>{inner}</button>;
        })}
      </div>
    </div>
  );
}

export default function HubPage() {
  const [tab, setTab] = useState<"business" | "profile">("business");

  return (
    <>
      <header className="shrink-0 bg-canvas">
        <div className="flex h-14 items-center px-4">
          <Link href="/app" aria-label="Back to home" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
            <ChevronLeft size={22} />
          </Link>
          <h1 className="ml-1 text-[17px] font-semibold text-navy">Hub</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="flex rounded-full border border-border bg-surface p-1">
            {(["business", "profile"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full py-2 text-[14px] font-medium capitalize transition-colors ${
                  tab === t ? "bg-navy text-white" : "text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 pb-8 pt-2">
        <Link href="/app/b2c" className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-navy px-4 py-3.5 text-white transition-colors hover:bg-navy/90">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <ArrowLeftRight size={18} />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[15px] font-semibold">Switch to client view</span>
            <span className="mt-0.5 block text-[12px] text-white/60">See the B2C app clients use to book</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest">
            B2C
          </span>
        </Link>

        {tab === "business" ? (
          <div className="space-y-6">
            <div>
              <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Operations</div>
              <div className="grid grid-cols-2 gap-3">
                {operations.map((item) => (
                  <GridCard key={item.key} item={item} />
                ))}
              </div>
            </div>
            <Link href="/app/marketing" className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left hover:border-navy/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas">
                <Megaphone size={18} className="text-navy" />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-navy">Marketing</span>
                <span className="mt-0.5 block text-[12px] text-secondary">Campaigns, automations, rewards</span>
              </span>
              <ChevronRight size={16} className="text-muted" />
            </Link>
            <ListCard title="Business setup" items={setupItems} />
          </div>
        ) : (
          <div className="space-y-6">
            <ListCard title="Account" items={accountItems} />
            <button className="h-12 w-full rounded-full border border-border bg-surface text-[14px] font-medium text-danger transition-colors hover:bg-canvas">
              Log out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
