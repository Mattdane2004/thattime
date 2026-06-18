"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useRoleStore } from "@/lib/store/roleStore";
import { weekPerformance } from "@/lib/data/dashboard";
import {
  Scissors, Package, Users, MapPin, Wallet, BarChart3, Box, FileText,
  Building2, Settings2, Plug, Megaphone, ClipboardCheck, Database,
  CircleUser, CreditCard, Share2, Bell, Sliders, HelpCircle, FileCheck,
  ArrowLeftRight, ChevronRight, TrendingUp,
} from "lucide-react";

// Hub "Menu" — Figma node 11988:90748. Business tab: This-week stats, the
// Operations card grid, Marketing & performance, Setup. Profile tab: profile
// card, Wallet, Account list, Log out, Switch to B2C.

interface MenuItem {
  key: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
  href?: string;
}

const operations: MenuItem[] = [
  { key: "offerings", label: "Offerings", desc: "Services, classes, bundles and subscriptions", icon: Scissors, href: "/app/services" },
  { key: "products", label: "Products", desc: "Internal & retail library", icon: Package },
  { key: "forms", label: "Forms", desc: "Templates & builder", icon: FileText },
  { key: "resources", label: "Resources", desc: "Rooms & equipment library", icon: Box },
  { key: "team", label: "Team", desc: "Staff, roles, hours", icon: Users, href: "/app/team" },
  { key: "locations", label: "Locations", desc: "Multi-site management", icon: MapPin },
  { key: "payments", label: "Payments", desc: "Transactions, refunds, tax", icon: Wallet },
  { key: "analytics", label: "Analytics", desc: "Performance & opportunities", icon: BarChart3 },
];

const marketingItems: MenuItem[] = [
  { key: "marketing", label: "Marketing", desc: "Campaigns, automations, rewards", icon: Megaphone, href: "/app/marketing" },
  { key: "analytics", label: "Analytics", desc: "Performance & opportunities", icon: BarChart3 },
];

const setupItems: MenuItem[] = [
  { key: "business-profile", label: "Business profile", icon: Building2 },
  { key: "setup-guide", label: "Set up guide", icon: ClipboardCheck, href: "/app/setup" },
  { key: "import-data", label: "Data import", icon: Database, href: "/app/setup/import" },
  { key: "business-settings", label: "Business settings", icon: Settings2 },
  { key: "integrations", label: "Integrations", icon: Plug },
];

const accountItems: MenuItem[] = [
  { key: "my-profile", label: "My profile", icon: CircleUser },
  { key: "billing", label: "Plans & billing", icon: CreditCard },
  { key: "referrals", label: "Referrals", icon: Share2 },
  { key: "notifications", label: "Notifications", icon: Bell, href: "/app/notifications" },
  { key: "preferences", label: "Preferences", icon: Sliders },
  { key: "help", label: "Help & FAQ", icon: HelpCircle },
  { key: "legal", label: "Legal", icon: FileCheck },
];

function ListCard({ title, items }: { title?: string; items: MenuItem[] }) {
  return (
    <div>
      {title && <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</div>}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map(({ key, label, desc, icon: Icon, href }, i) => {
          const cls = `flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${i > 0 ? "border-t border-border" : ""}`;
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas">
                <Icon size={17} className="text-navy" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">{label}</span>
                {desc && <span className="block truncate text-[12px] text-secondary">{desc}</span>}
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

function GridCard({ item }: { item: MenuItem }) {
  const { icon: Icon, label, desc, href } = item;
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas">
        <Icon size={18} className="text-navy" strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-navy">{label}</span>
        <span className="mt-1 block text-[12px] leading-snug text-secondary">{desc}</span>
      </span>
    </>
  );
  const cls = "flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-navy/20";
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button className={cls}>{inner}</button>;
}

function ThisWeekCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-muted">
        <BarChart3 size={15} strokeWidth={1.75} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">This week</span>
      </div>
      <div className="mt-4 flex">
        <div className="flex-1">
          <div className="text-[12px] text-secondary">Revenue</div>
          <div className="mt-1 text-[20px] font-bold tracking-tight text-navy">{weekPerformance.revenue}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-success">
            <TrendingUp size={12} />{weekPerformance.revenueDelta}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[12px] text-secondary">Bookings</div>
          <div className="mt-1 text-[20px] font-bold tracking-tight text-navy">{weekPerformance.bookings}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-success">
            <TrendingUp size={12} />{weekPerformance.bookingsDelta}
          </div>
        </div>
      </div>
      <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-navy text-[13px] font-semibold text-white hover:bg-navy/90">
        <BarChart3 size={15} strokeWidth={1.75} />View analytics
      </button>
    </div>
  );
}

export default function HubPage() {
  const router = useRouter();
  const role = useRoleStore((s) => s.role);
  const [tab, setTab] = useState<"business" | "profile">("business");

  // Staff can't reach business settings/setup — bounce them home.
  useEffect(() => {
    if (role === "staff") router.replace("/app");
  }, [role, router]);
  if (role === "staff") return null;

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="shrink-0 bg-surface">
        <div className="flex h-[72px] items-center justify-between px-4">
          <button type="button" onClick={() => router.back()} aria-label="Back" className="min-w-0 text-left">
            <div className="text-[15px] font-bold text-navy">Menu</div>
            <div className="text-[12px] text-muted">Wednesday 4 March</div>
          </button>
          <div className="flex items-center gap-2">
            <Link href="/app/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
              <Bell size={19} strokeWidth={1.75} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </Link>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-navy">MD</span>
          </div>
        </div>
        <div className="px-4 pb-2">
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

      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {tab === "business" ? (
          <div className="space-y-6">
            <ThisWeekCard />
            <div>
              <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Operations</div>
              <div className="grid grid-cols-2 gap-3">
                {operations.map((item) => (
                  <GridCard key={item.key} item={item} />
                ))}
              </div>
            </div>
            <ListCard title="Marketing and performance" items={marketingItems} />
            <ListCard title="Setup" items={setupItems} />
          </div>
        ) : (
          <div className="space-y-6">
            <button className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left hover:border-navy/20">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-[16px] font-semibold text-white">MD</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold text-navy">Mathew Dane</span>
                <span className="block text-[13px] text-secondary">Admin · Pro plan</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>

            <button className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left hover:border-navy/20">
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold text-navy">Wallet</span>
                <span className="block text-[13px] text-secondary">£0.00</span>
              </span>
              <Wallet size={26} strokeWidth={1.5} className="shrink-0 text-navy" />
            </button>

            <ListCard title="Account" items={accountItems} />

            <button className="h-12 w-full rounded-2xl border border-border bg-surface text-[14px] font-medium text-danger transition-colors hover:bg-canvas">
              Log out
            </button>

            <div className="flex justify-center pb-2">
              <Link href="/c/home" className="flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-[13px] font-semibold text-white hover:bg-navy/90">
                <ArrowLeftRight size={15} />Switch to B2C
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
