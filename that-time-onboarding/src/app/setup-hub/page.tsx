"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleUser,
  ClipboardCheck,
  CreditCard,
  Database,
  FileCheck,
  FileText,
  HelpCircle,
  MapPin,
  Megaphone,
  Package,
  Plug,
  Scissors,
  Settings2,
  Share2,
  Sliders,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { MobileFrame } from "@/components/onboarding/MobileFrame";
import { useOnboardingStore } from "@/lib/store";

const operationsItems = [
  { label: "Services", desc: "Services, classes, bundles", icon: Scissors, to: "/setup/services" },
  { label: "Products", desc: "Internal & retail library", icon: Package, to: "/setup/products" },
  { label: "Team", desc: "Staff, roles, hours", icon: Users, to: "/setup/team" },
  { label: "Locations", desc: "Multi-site management", icon: MapPin, to: "/setup/locations" },
  { label: "Payments", desc: "Transactions, refunds, tax", icon: Wallet, to: "/setup/payments" },
  { label: "Analytics", desc: "Performance & opportunities", icon: BarChart3, to: "/setup/analytics" },
  { label: "Notifications", desc: "Client messages & reminders", icon: Bell, to: "/setup/notifications" },
  { label: "Resources", desc: "Rooms & equipment library", icon: Box, to: "/setup/resources" },
  { label: "Forms", desc: "Templates & builder", icon: FileText, to: "/setup/forms" },
];

const setupItems = [
  { label: "Setup guide", desc: "Guided setup & learning", icon: ClipboardCheck, to: "/setup/guide" },
  { label: "Business profile", desc: "Public identity clients see", icon: Building2, to: "/setup/profile" },
  { label: "Business settings", desc: "Booking rules & policies", icon: Settings2, to: "/setup/settings" },
  { label: "Import data", desc: "Clients & bookings from CSV", icon: Database, to: "/setup/import" },
  { label: "Integrations", desc: "Stripe, Calendar, payments", icon: Plug, to: "/setup/integrations" },
];

const accountItems = [
  { label: "My profile", desc: "Personal details, avatar", icon: CircleUser, to: "/setup/my-profile" },
  { label: "Plans & billing", desc: "Tier, payment, invoices", icon: CreditCard, to: "/setup/billing" },
  { label: "Referrals", desc: "Refer other businesses", icon: Share2, to: "/setup/referrals" },
  { label: "Notification preferences", desc: "Personal alerts", icon: Bell, to: "/setup/notification-preferences" },
  { label: "Preferences", desc: "Theme, language, units", icon: Sliders, to: "/setup/preferences" },
  { label: "Help & FAQ", desc: "Support & knowledge base", icon: HelpCircle, to: "/setup/help" },
  { label: "Legal", desc: "Terms, privacy, data", icon: FileCheck, to: "/setup/legal" },
];

const setupPreviewSteps = [
  { title: "Add your first services", meta: "Founder - 8 min", status: "current" },
  { title: "Set booking rules", meta: "Founder - 5 min", status: "todo" },
  { title: "Get your first booking", meta: "Founder - 3 min", status: "todo" },
];

function HubHeader({ activeTab, setActiveTab }: { activeTab: "business" | "profile"; setActiveTab: (tab: "business" | "profile") => void }) {
  const router = useRouter();

  return (
    <div className="shrink-0 bg-[#F9FAFB]">
      <div className="flex h-14 items-center px-4">
        <button
          type="button"
          onClick={() => router.push("/home")}
          aria-label="Back"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[#111827] transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#111]"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="ml-1 flex-1 text-[17px] font-semibold text-gray-900">Hub</div>
      </div>
      <div className="px-4 pb-3">
        <div className="flex rounded-full border border-gray-100 bg-white p-1">
          {[
            { key: "business", label: "Business" },
            { key: "profile", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as "business" | "profile")}
              className={[
                "flex-1 rounded-full py-2 text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#111]",
                activeTab === tab.key ? "bg-gray-900 text-white" : "text-gray-600",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "done") {
    return <CheckCircle2 size={17} className="text-emerald-600" strokeWidth={2} />;
  }

  return <Circle size={17} className={status === "current" ? "text-gray-900" : "text-gray-300"} strokeWidth={2} />;
}

function SetupGuideCard() {
  const router = useRouter();

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left">
      <button type="button" onClick={() => router.push("/setup/guide")} className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#111]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <ClipboardCheck size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Setup guide
              </div>
              <div className="shrink-0 text-[12px] font-semibold text-gray-900">1/16</div>
            </div>
            <div className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-gray-900">
              Pick up setup anytime
            </div>
            <div className="mt-1 text-[13px] leading-snug text-gray-500">
              Start with the basics, then keep improving when you are ready.
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[8%] rounded-full bg-gray-900" />
        </div>

        <div className="mt-4 space-y-3">
          {setupPreviewSteps.map((step) => (
            <div key={step.title} className="flex items-start gap-3">
              <div className="mt-0.5">
                <StatusIcon status={step.status} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-gray-900">{step.title}</div>
                <div className="mt-0.5 truncate text-[12px] text-gray-500">{step.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </button>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => router.push("/setup/guide")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-gray-50 px-4 text-[13px] font-medium text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#111]"
        >
          Continue setup
          <ChevronRight size={15} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => router.push("/setup/import")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-4 text-[13px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#111]"
        >
          <Upload size={15} strokeWidth={2} />
          Import data
        </button>
      </div>
    </div>
  );
}

function OperationCard({ item, full = false }: { item: (typeof operationsItems)[number]; full?: boolean }) {
  const router = useRouter();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => router.push(item.to)}
      className={[
        "rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#111]",
        full ? "col-span-2" : "",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
        <Icon size={18} className="text-gray-800" strokeWidth={1.75} />
      </div>
      <div className="mt-3 text-[15px] font-semibold text-gray-900">{item.label}</div>
      <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-gray-500">{item.desc}</div>
    </button>
  );
}

function FeatureCard() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/setup/marketing")}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#111]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
        <Megaphone size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold text-gray-900">Marketing</div>
        <div className="mt-0.5 truncate text-[13px] text-gray-500">Campaigns, automations, rewards</div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-gray-300" strokeWidth={2} />
    </button>
  );
}

function ListCard({ title, items }: { title: string; items: typeof setupItems }) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white divide-y divide-gray-100">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.to)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <Icon size={18} className="text-gray-800" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] text-gray-900">{item.label}</div>
                <div className="mt-0.5 truncate text-[12px] text-gray-500">{item.desc}</div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-gray-300" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SwitchClientCard() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/client/browse")}
      className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3.5 text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#111]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <ArrowLeftRight size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-[15px] font-semibold">Switch to client view</div>
        <div className="mt-0.5 text-[12px] text-white/60">See the B2C app clients use to book</div>
      </div>
      <div className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest">
        B2C
      </div>
    </button>
  );
}

function BusinessTab() {
  return (
    <div className="space-y-6">
      <SetupGuideCard />

      <div>
        <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Operations
        </div>
        <div className="grid grid-cols-2 gap-3">
          {operationsItems.map((item, index) => (
            <OperationCard key={item.label} item={item} full={operationsItems.length % 2 === 1 && index === operationsItems.length - 1} />
          ))}
        </div>
      </div>

      <FeatureCard />
      <ListCard title="Business setup" items={setupItems} />
    </div>
  );
}

function ProfileTab() {
  const router = useRouter();
  const firstName = useOnboardingStore((state) => state.firstName.trim() || "Emma");
  const email = useOnboardingStore((state) => state.email.trim() || "emma@salonsoho.com");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-[20px] font-semibold text-white">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[17px] font-semibold text-gray-900">{firstName}</div>
            <div className="truncate text-[13px] text-gray-500">{email}</div>
          </div>
        </div>
      </div>
      <ListCard title="Account" items={accountItems} />
      <button
        type="button"
        onClick={() => router.push("/onboarding/welcome")}
        className="h-12 w-full rounded-full border border-gray-100 bg-white text-[14px] font-medium text-red-500 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#111]"
      >
        Log out
      </button>
    </div>
  );
}

export default function SetupHubPage() {
  const [activeTab, setActiveTab] = useState<"business" | "profile">("business");

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#F9FAFB] text-gray-900">
        <HubHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F9FAFB] px-4 pb-8 pt-2">
          <SwitchClientCard />
          {activeTab === "business" ? <BusinessTab /> : <ProfileTab />}
        </div>
      </div>
    </MobileFrame>
  );
}
