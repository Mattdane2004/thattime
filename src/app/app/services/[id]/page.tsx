"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, MoreVertical, Scissors, Users, Package, Repeat,
  MapPin, Camera, Layers, PlusCircle, ArrowUpRight, Box, FileText, Bell,
  Settings2, CheckCircle2, CalendarDays, GraduationCap, ClipboardList, BookOpen, Award,
} from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { statusLabel, type DemoOffer } from "@/lib/data/offers";
import { iconFor } from "@/lib/data/serviceIcons";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import { SummaryRow } from "@/components/ui";

// Offer dashboard — "Edit Service" (Figma 12135:44528) and the class variant
// (12135:47527). Summary card, photos strip, Advanced module list, and a
// Preview / Publish footer. Publish flips the catalogue status.

export default function OfferDashboardPage({ params }: { params: { id: string } }) {
  return <OfferDashboard id={params.id} />;
}

const TYPE_ICON = { service: Scissors, class: Users, bundle: Package, subscription: Repeat } as const;

interface ModuleRow {
  key: string;
  label: string;
  desc: string;
  icon: typeof Scissors;
  href?: string;
}

function OfferDashboard({ id }: { id: string }) {
  const router = useRouter();
  const offers = useOffersStore((s) => s.offers);
  const setStatus = useOffersStore((s) => s.setStatus);
  const search = useSearchParams();
  const justCreated = search.get("created") === "1";

  const offer = useMemo(() => offers.find((o) => o.id === id), [offers, id]);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 items-center px-5">
          <button type="button" onClick={() => router.back()} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        </div>
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const Icon = offer.icon ? iconFor(offer.icon) : TYPE_ICON[offer.type];
  const color = defaultCategories.find((c) => c.name === offer.category)?.color ?? "#9CA3AF";
  const isClass = offer.type === "class";

  const advanced: ModuleRow[] = isClass
    ? [
        { key: "requirements", label: "Requirements & prerequisites", desc: "Age, eligibility, qualifications and what to bring", icon: GraduationCap, href: `/app/services/${offer.id}/requirements` },
        { key: "forms", label: "Forms & waivers", desc: "Consent forms, waivers, health checks", icon: FileText, href: `/app/services/${offer.id}/forms` },
        { key: "agenda", label: "Agenda & syllabus", desc: "Modules, breaks, day-by-day timetable", icon: ClipboardList, href: `/app/services/${offer.id}/agenda` },
        { key: "materials", label: "Materials", desc: "PDFs, pre-reads and after-class resources", icon: BookOpen, href: `/app/services/${offer.id}/materials` },
        { key: "certificates", label: "Completion & certificates", desc: "Pass/fail rules and certificate templates", icon: Award, href: `/app/services/${offer.id}/certificates` },
        { key: "resources", label: "Resources, rooms & equipment", desc: "Rooms, setup needs and internal notes", icon: Box, href: `/app/services/${offer.id}/resources` },
        { key: "products", label: "Products & kits", desc: "Student kits and optional add-ons", icon: Package, href: `/app/services/${offer.id}/products` },
        { key: "notifications", label: "Notifications", desc: "Class reminders and student updates", icon: Bell, href: `/app/services/${offer.id}/notifications` },
        { key: "settings", label: "Policies, payments & rules", desc: "Lead time, cancellation, deposits", icon: Settings2, href: `/app/services/${offer.id}/settings` },
      ]
    : [
        { key: "variants", label: "Variants", desc: "Add pricing variants", icon: Layers, href: `/app/services/${offer.id}/variants` },
        { key: "preferences", label: "Product preferences", desc: "Add add-ons", icon: PlusCircle, href: `/app/services/${offer.id}/products` },
        { key: "upsells", label: "Upsells and suggestions", desc: "Upsell or suggest a service to include in the booking", icon: ArrowUpRight, href: `/app/services/${offer.id}/related` },
        { key: "resources", label: "Resources", desc: "Add resources", icon: Box, href: `/app/services/${offer.id}/resources` },
        { key: "forms", label: "Forms", desc: "Add forms", icon: FileText, href: `/app/services/${offer.id}/forms` },
        { key: "notifications", label: "Notifications", desc: "Set notification preferences", icon: Bell, href: `/app/services/${offer.id}/notifications` },
        { key: "settings", label: "Settings", desc: "Using defaults", icon: Settings2, href: `/app/services/${offer.id}/settings` },
      ];

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between px-5">
        <button type="button" onClick={() => router.back()} aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        <span className="text-[15px] font-semibold capitalize text-navy">{`Edit ${offer.type}`}</span>
        <button aria-label="More" className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><MoreVertical size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {justCreated && (
          <div className="mb-3 flex items-center gap-2.5 rounded-2xl bg-success/10 px-4 py-3">
            <CheckCircle2 size={17} className="shrink-0 text-success" />
            <span className="text-[13px] font-medium text-navy">
              {offer.name} created as a draft — publish it when you&apos;re ready.
            </span>
          </div>
        )}

        <div className="flex items-center gap-3.5 pb-4 pt-1">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: tintFromHex(color, 0.14) }}>
            <Icon size={22} style={{ color }} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[20px] font-bold tracking-tight text-navy">{offer.name}</span>
            <span className="block text-[12px] capitalize text-muted">{offer.category} • {offer.type}</span>
          </span>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            offer.status === "published" ? "bg-success/10 text-success" : "bg-canvas text-secondary"
          }`}>
            {statusLabel(offer.status)}
          </span>
        </div>

        <SummaryCard offer={offer} allOffers={offers} />

        <div className="flex items-center justify-between pb-2 pt-5">
          <span className="text-[15px] font-semibold text-navy">Photos</span>
          <Link href={`/app/services/${offer.id}/photos`} className="flex items-center gap-1 text-[13px] font-medium text-secondary">
            Add <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          <Link href={`/app/services/${offer.id}/photos`} className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-canvas text-muted">
            <Camera size={16} /><span className="text-[10px] font-medium">Add</span>
          </Link>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-20 w-20 shrink-0 rounded-xl border-2 border-dashed border-border" />
          ))}
        </div>

        <div className="pb-2 pt-5 text-[15px] font-semibold text-navy">{isClass ? "Advanced options" : "Advanced"}</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {advanced.map((m, i) => {
            const RowIcon = m.icon;
            const cls = `flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${i > 0 ? "border-t border-border" : ""}`;
            const inner = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas">
                  <RowIcon size={15} className="text-secondary" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{m.label}</span>
                  <span className="block truncate text-[12px] text-muted">{m.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </>
            );
            return m.href ? (
              <Link key={m.key} href={m.href} className={cls}>{inner}</Link>
            ) : (
              <button key={m.key} className={cls}>{inner}</button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
        <Link
          href={`/app/services/${offer.id}/preview`}
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas"
        >
          Preview
        </Link>
        <button
          onClick={() => setStatus(offer.id, offer.status === "published" ? "draft" : "published")}
          className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90"
        >
          {offer.status === "published" ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

// ── Summary card ────────────────────────────────────────────────────────────
// One shared card shell; the body rows are type-specific compositions on
// SummaryRow (screen-local, not barrel). Every value derives from the persisted
// offer (Stage 1 data seam); seed offers without the optional fields fall back.

function durationLabel(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

function priceSuffix(offer: DemoOffer): string {
  switch (offer.type) {
    case "class": return "per attendee";
    case "subscription": return offer.subscription ? `/ ${offer.subscription.billingPeriod}` : "";
    case "bundle": return offer.bundle?.serviceIds.length ? `${offer.bundle.serviceIds.length} services` : "";
    default: return offer.durationMin ? `for ${durationLabel(offer.durationMin)}` : "";
  }
}

function DepositTiles({ offer }: { offer: DemoOffer }) {
  const deposit = offer.deposit?.enabled ? `£${offer.deposit.amount}` : "—";
  return (
    <div className="flex border-t border-border/60">
      <div className="flex-1 px-4 py-3">
        <div className="text-[11px] text-muted">Deposit</div>
        <div className="mt-0.5 text-[14px] font-semibold text-navy">{deposit}</div>
      </div>
      <div className="flex-1 border-l border-border/60 px-4 py-3">
        <div className="text-[11px] text-muted">Cancellation</div>
        <div className="mt-0.5 text-[14px] font-semibold text-navy">—</div>
      </div>
    </div>
  );
}

function locationLabel(offer: DemoOffer): string {
  const m = offer.locationModes;
  if (!m) return "Location not set";
  const parts = [m.inSalon && "In-salon", m.mobile && "Mobile", m.remote && "Remote"].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Location not set";
}

function SummaryCard({ offer, allOffers }: { offer: DemoOffer; allOffers: DemoOffer[] }) {
  const suffix = priceSuffix(offer);
  return (
    <div className="overflow-hidden rounded-2xl bg-canvas">
      <button className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-border/30">
        <span className="text-[20px] font-bold text-navy">
          {offer.price === "0" ? "Free" : `£${offer.price}`}
          {suffix && <span className="ml-1.5 text-[13px] font-normal text-muted">{suffix}</span>}
        </span>
        <ChevronRight size={16} className="text-muted" />
      </button>
      {offer.type === "class" && <ClassSummary offer={offer} />}
      {offer.type === "bundle" && <BundleSummary offer={offer} allOffers={allOffers} />}
      {offer.type === "subscription" && <SubscriptionSummary offer={offer} />}
      {(offer.type === "service" || offer.type === undefined) && <ServiceSummary offer={offer} />}
    </div>
  );
}

function ServiceSummary({ offer }: { offer: DemoOffer }) {
  const byLoc = offer.staffByLocation ? new Set(Object.values(offer.staffByLocation).flat()).size : 0;
  const count = Math.max(offer.staffIds?.length ?? 0, byLoc);
  const staff = count > 0 ? `${count} staff member${count > 1 ? "s" : ""}` : "Staff members";
  return (
    <>
      <SummaryRow className="border-t border-border/60" icon={<MapPin size={16} strokeWidth={1.75} />} label={locationLabel(offer)} />
      <SummaryRow className="border-t border-border/60" icon={<Users size={16} strokeWidth={1.75} />} label={staff} />
      <DepositTiles offer={offer} />
    </>
  );
}

function ClassSummary({ offer }: { offer: DemoOffer }) {
  const cd = offer.classDetails;
  const count = offer.staffIds?.length ?? 0;
  const instructors = count > 0 ? `${count} instructor${count > 1 ? "s" : ""}` : "Instructors";

  const schedule = (() => {
    if (!cd) return "Schedule not set";
    const sessions = cd.dates.length || (cd.scheduleMode === "single" ? 1 : 0);
    const head = sessions ? `${sessions} session${sessions > 1 ? "s" : ""}` : "Schedule not set";
    const time = cd.startTime && cd.endTime ? ` · ${cd.startTime}–${cd.endTime}` : "";
    const repeat = cd.repeat === "weekly" ? ` · weekly ×${cd.repeatWeeks}` : "";
    return `${head}${time}${repeat}`;
  })();

  const attendees = (() => {
    if (!cd) return "Attendees not set";
    if (cd.bookingStructure === "private_group") return "Private booking";
    return `${cd.capacity} seats · min ${cd.minParticipants}`;
  })();

  return (
    <>
      <SummaryRow className="border-t border-border/60" icon={<CalendarDays size={16} strokeWidth={1.75} />} label={schedule} />
      <SummaryRow className="border-t border-border/60" icon={<Users size={16} strokeWidth={1.75} />} label={attendees} />
      <SummaryRow className="border-t border-border/60" icon={<GraduationCap size={16} strokeWidth={1.75} />} label={instructors} />
      <SummaryRow className="border-t border-border/60" icon={<MapPin size={16} strokeWidth={1.75} />} label={locationLabel(offer)} />
      <DepositTiles offer={offer} />
    </>
  );
}

function BundleSummary({ offer, allOffers }: { offer: DemoOffer; allOffers: DemoOffer[] }) {
  const b = offer.bundle;
  const names = (b?.serviceIds ?? [])
    .map((id) => allOffers.find((o) => o.id === id)?.name)
    .filter(Boolean) as string[];
  const included = names.length ? names.join(", ") : "No services yet";
  const pricing = !b
    ? "Pricing not set"
    : b.priceMode === "discount"
    ? `${b.discountPercent || "0"}% package discount`
    : "Fixed price";
  const includedValue = names.length
    ? b?.kind === "flexible" ? `choose ${b.chooseCount} of ${names.length}` : `${names.length}`
    : undefined;
  return (
    <>
      <SummaryRow
        className="border-t border-border/60"
        icon={<Package size={16} strokeWidth={1.75} />}
        label={included}
        value={includedValue}
      />
      <SummaryRow className="border-t border-border/60" icon={<Layers size={16} strokeWidth={1.75} />} label={pricing} />
    </>
  );
}

function SubscriptionSummary({ offer }: { offer: DemoOffer }) {
  const s = offer.subscription;
  const benefit = (() => {
    if (!s) return "Benefit not set";
    switch (s.benefitType) {
      case "sessions": return s.unlimitedUsage ? "Unlimited sessions" : `${s.includedSessions} session${s.includedSessions > 1 ? "s" : ""} / period`;
      case "credit": return s.storeCreditAmount ? `£${s.storeCreditAmount} store credit` : "Store credit";
      case "discount": return s.memberDiscountPercent ? `${s.memberDiscountPercent}% member discount` : "Member discount";
      case "access": return "Access pass";
      default: return "Benefit not set";
    }
  })();
  const billing = s ? `Billed per ${s.billingPeriod}` : "Billing not set";
  const extras = (() => {
    if (!s) return null;
    const bits = [
      s.joiningFee ? `£${s.joiningFee} joining fee` : null,
      s.minimumTermMonths ? `${s.minimumTermMonths}-month term` : null,
    ].filter(Boolean) as string[];
    return bits.length ? bits.join(" · ") : null;
  })();
  return (
    <>
      <SummaryRow className="border-t border-border/60" icon={<Award size={16} strokeWidth={1.75} />} label={benefit} />
      <SummaryRow className="border-t border-border/60" icon={<Repeat size={16} strokeWidth={1.75} />} label={billing} />
      {extras && <SummaryRow className="border-t border-border/60" icon={<Settings2 size={16} strokeWidth={1.75} />} label={extras} />}
    </>
  );
}
