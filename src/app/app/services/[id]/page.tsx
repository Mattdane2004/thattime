"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, MoreVertical, Scissors, Users, Package, Repeat,
  MapPin, Camera, Layers, PlusCircle, ArrowUpRight, Box, FileText, Bell,
  Settings2, CheckCircle2, CalendarDays, GraduationCap, ClipboardList, BookOpen, Award, Megaphone,
  Wallet, CreditCard, TicketPercent, LockKeyhole,
} from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { statusLabel, type DemoOffer } from "@/lib/data/offers";
import { iconFor } from "@/lib/data/serviceIcons";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import { SummaryRow, Toggle } from "@/components/ui";
import { syncBundleLinks } from "@/lib/store/wizardStore";
import {
  bundlePriceSummary, includedServicesSummary, bundleReadyToPublish, inheritedFromServices,
} from "@/lib/data/bundles";
import { BundleTimeline, LinkSheet } from "@/components/offer/BundleOrderEditor";
import { backToBack, type BundleLink, type BundleLinkKind } from "@/lib/store/wizardStore";
import { PriceDurationSheet, DepositSheet, CancellationSheet } from "./editSheets";
import {
  subscriptionBenefitLabel, subscriptionBillingLabel, subscriptionTermsLabel,
  subscriptionReadyToPublish, subscriptionReadinessIssues,
  membershipPlanSentences, normalizeMembershipTiers,
} from "@/lib/data/subscriptions";
import { productsCatalog } from "@/lib/data/products";

type EditSection = "price" | "deposit" | "cancellation";

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
  status?: string;
}

interface ModuleGroup {
  title: string;
  count: string;
  rows: ModuleRow[];
}

function OfferDashboard({ id }: { id: string }) {
  const router = useRouter();
  const offers = useOffersStore((s) => s.offers);
  const setStatus = useOffersStore((s) => s.setStatus);
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const search = useSearchParams();
  const justCreated = search.get("created") === "1";
  const [editing, setEditing] = useState<EditSection | null>(null);

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
  const isBundle = offer.type === "bundle";
  const isSubscription = offer.type === "subscription";

  const classAdvancedGroups: ModuleGroup[] = isClass
    ? [
        {
          title: "Student preparation",
          count: "5 options",
          rows: [
            {
              key: "requirements",
              label: "Requirements & prerequisites",
              desc: "Age limits, eligibility, qualifications, insurance and what to bring",
              icon: GraduationCap,
              href: `/app/services/${offer.id}/requirements`,
              status: classRequirementsStatus(offer),
            },
            {
              key: "forms",
              label: "Forms & waivers",
              desc: "Consultation forms, waivers, health checks and pre-course questions",
              icon: FileText,
              href: `/app/services/${offer.id}/forms`,
              status: offer.forms?.length ? `${offer.forms.length} form${offer.forms.length === 1 ? "" : "s"}` : "Not set",
            },
            {
              key: "agenda",
              label: "Agenda & syllabus",
              desc: "Modules, breaks, learning outcomes and day-by-day timetable",
              icon: ClipboardList,
              href: `/app/services/${offer.id}/agenda`,
              status: offer.agenda?.length ? `${offer.agenda.length} section${offer.agenda.length === 1 ? "" : "s"}` : "Not set",
            },
            {
              key: "materials",
              label: "Materials",
              desc: "PDFs, pre-reads, prep guides and after-class resources",
              icon: BookOpen,
              href: `/app/services/${offer.id}/materials`,
              status: offer.materials?.length ? `${offer.materials.length} file${offer.materials.length === 1 ? "" : "s"}` : "Not set",
            },
            {
              key: "certificates",
              label: "Completion & certificates",
              desc: "Pass/fail rules, completion evidence and certificate templates",
              icon: Award,
              href: `/app/services/${offer.id}/certificates`,
              status: offer.certificate?.enabled ? "Enabled" : "Off",
            },
          ],
        },
        {
          title: "Delivery controls",
          count: "5 options",
          rows: [
            {
              key: "models",
              label: "Models & demonstrators",
              desc: "Discounted demo clients, model requests, consent and matching",
              icon: Megaphone,
              href: `/app/services/${offer.id}/models`,
              status: offer.models?.enabled ? "Enabled" : "Off",
            },
            {
              key: "resources",
              label: "Resources, rooms & equipment",
              desc: "Rooms, equipment, setup needs and internal resource notes",
              icon: Box,
              href: `/app/services/${offer.id}/resources`,
              status: offer.resources?.length ? `${offer.resources.length} attached` : "Not set",
            },
            {
              key: "products",
              label: "Products & kits",
              desc: "Student kits, required products and optional add-ons",
              icon: Package,
              href: `/app/services/${offer.id}/products`,
              status: offer.kitItems?.length ? `${offer.kitItems.length} item${offer.kitItems.length === 1 ? "" : "s"}` : "Not set",
            },
            {
              key: "notifications",
              label: "Notifications",
              desc: "Class reminders, cancellation messages and student updates",
              icon: Bell,
              href: `/app/services/${offer.id}/notifications`,
              status: offer.notifications?.length ? "Custom" : "Using defaults",
            },
            {
              key: "settings",
              label: "Policies, payments & rules",
              desc: "Lead time, cancellation, rescheduling, deposits and payment methods",
              icon: Settings2,
              href: `/app/services/${offer.id}/settings`,
              status: offer.settings ? "Custom" : "Using defaults",
            },
          ],
        },
      ]
    : [];

  const advanced: ModuleRow[] = isClass
    ? []
    : [
        { key: "variants", label: "Variants", desc: "Add pricing variants", icon: Layers, href: `/app/services/${offer.id}/variants` },
        { key: "bundles", label: "Bundles", desc: "Sell packs of this service with a discount", icon: Package, href: `/app/services/${offer.id}/bundles` },
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

        {isSubscription ? (
          <SubscriptionBody offer={offer} offers={offers} />
        ) : isBundle ? (
          <BundleBody offer={offer} offers={offers} onEditPrice={() => setEditing("price")} />
        ) : (
          <>
            {isClass && (
              <ClassVisibilityCard
                privateListing={Boolean(offer.privateListing)}
                onToggle={() => updateOffer(offer.id, { privateListing: !offer.privateListing })}
              />
            )}
            <SummaryCard offer={offer} allOffers={offers} onEdit={setEditing} />

            <div className="flex items-center justify-between pb-2 pt-5">
              <span className="text-[15px] font-semibold text-navy">{isClass ? "Photos & videos" : "Photos"}</span>
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
            {isClass ? (
              <div className="space-y-4">
                {classAdvancedGroups.map((group) => (
                  <section key={group.title}>
                    <div className="flex items-center justify-between px-1 pb-2">
                      <span className="text-[13px] font-semibold text-navy">{group.title}</span>
                      <span className="text-[11px] font-medium text-muted">{group.count}</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                      {group.rows.map((m, i) => <OfferAdvancedRow key={m.key} row={m} divider={i > 0} />)}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {advanced.map((m, i) => <OfferAdvancedRow key={m.key} row={m} divider={i > 0} />)}
              </div>
            )}
          </>
        )}
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

      <PriceDurationSheet offer={offer} open={editing === "price"} onClose={() => setEditing(null)} />
      <DepositSheet offer={offer} open={editing === "deposit"} onClose={() => setEditing(null)} />
      <CancellationSheet offer={offer} open={editing === "cancellation"} onClose={() => setEditing(null)} />
    </div>
  );
}

function OfferAdvancedRow({ row, divider }: { row: ModuleRow; divider: boolean }) {
  const RowIcon = row.icon;
  const cls = `flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas ${divider ? "border-t border-border" : ""}`;
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas">
        <RowIcon size={15} className="text-secondary" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-navy">{row.label}</span>
        <span className="block truncate text-[12px] text-muted">{row.desc}</span>
      </span>
      {row.status && (
        <span className="max-w-[86px] shrink-0 truncate rounded-full bg-canvas px-2 py-1 text-[11px] font-medium text-secondary">
          {row.status}
        </span>
      )}
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </>
  );
  return row.href ? (
    <Link href={row.href} className={cls}>{inner}</Link>
  ) : (
    <button type="button" className={cls}>{inner}</button>
  );
}

function classRequirementsStatus(offer: DemoOffer) {
  const req = offer.requirements;
  if (!req) return "Not set";
  const hasRequirement = req.courseLevel !== "na"
    || req.ageLimits
    || req.qualificationRequired
    || req.insuranceProof
    || req.studentDeclarations
    || req.preparationInstructions
    || req.eligibilityNotes;
  return hasRequirement ? "Set" : "Not set";
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

const CANCEL_LABEL: Record<string, string> = { none: "—", "24h": "24h", "48h": "48h", "1week": "1 wk" };

function DepositTiles({ offer, onEdit }: { offer: DemoOffer; onEdit: (s: EditSection) => void }) {
  const deposit = offer.deposit?.enabled
    ? offer.deposit.type === "percent" ? `${offer.deposit.amount}%` : `£${offer.deposit.amount}`
    : "—";
  const cancellation = offer.cancellation ? CANCEL_LABEL[offer.cancellation] ?? offer.cancellation : "—";
  return (
    <div className="flex border-t border-border/60">
      <button type="button" onClick={() => onEdit("deposit")} className="flex-1 px-4 py-3 text-left hover:bg-border/30">
        <div className="text-[11px] text-muted">Deposit</div>
        <div className="mt-0.5 text-[14px] font-semibold text-navy">{deposit}</div>
      </button>
      <button type="button" onClick={() => onEdit("cancellation")} className="flex-1 border-l border-border/60 px-4 py-3 text-left hover:bg-border/30">
        <div className="text-[11px] text-muted">Cancellation</div>
        <div className="mt-0.5 text-[14px] font-semibold text-navy">{cancellation}</div>
      </button>
    </div>
  );
}

function locationLabel(offer: DemoOffer): string {
  const m = offer.locationModes;
  if (!m) return "Location not set";
  const parts = [m.inSalon && "In-salon", m.mobile && "Mobile", m.remote && "Remote"].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Location not set";
}

function SummaryCard({ offer, allOffers, onEdit }: { offer: DemoOffer; allOffers: DemoOffer[]; onEdit: (s: EditSection) => void }) {
  const suffix = priceSuffix(offer);
  return (
    <div className="overflow-hidden rounded-2xl bg-canvas">
      <button onClick={() => onEdit("price")} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-border/30">
        <span className="text-[20px] font-bold text-navy">
          {offer.price === "0" ? "Free" : `£${offer.price}`}
          {suffix && <span className="ml-1.5 text-[13px] font-normal text-muted">{suffix}</span>}
        </span>
        <ChevronRight size={16} className="text-muted" />
      </button>
      {offer.type === "class" && <ClassSummary offer={offer} onEdit={onEdit} />}
      {offer.type === "bundle" && <BundleSummary offer={offer} allOffers={allOffers} />}
      {offer.type === "subscription" && <SubscriptionSummary offer={offer} />}
      {(offer.type === "service" || offer.type === undefined) && <ServiceSummary offer={offer} onEdit={onEdit} />}
    </div>
  );
}

function ServiceSummary({ offer, onEdit }: { offer: DemoOffer; onEdit: (s: EditSection) => void }) {
  const router = useRouter();
  const byLoc = offer.staffByLocation ? new Set(Object.values(offer.staffByLocation).flat()).size : 0;
  const count = Math.max(offer.staffIds?.length ?? 0, byLoc);
  const staff = count > 0 ? `${count} staff member${count > 1 ? "s" : ""}` : "Staff members";
  return (
    <>
      <SummaryRow className="border-t border-border/60" icon={<MapPin size={16} strokeWidth={1.75} />} label={locationLabel(offer)} onClick={() => router.push(`/app/services/${offer.id}/location`)} />
      <SummaryRow className="border-t border-border/60" icon={<Users size={16} strokeWidth={1.75} />} label={staff} onClick={() => router.push(`/app/services/${offer.id}/staff`)} />
      <DepositTiles offer={offer} onEdit={onEdit} />
    </>
  );
}

function ClassVisibilityCard({ privateListing, onToggle }: { privateListing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3.5 text-left"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface">
          <LockKeyhole size={15} className="text-secondary" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold text-navy">Private listing</span>
          <span className="block truncate text-[12px] text-muted">{privateListing ? "Hidden from the marketplace" : "Visible on the marketplace"}</span>
        </span>
      </span>
      <Toggle on={privateListing} />
    </button>
  );
}

function ClassSummary({ offer, onEdit }: { offer: DemoOffer; onEdit: (s: EditSection) => void }) {
  const cd = offer.classDetails;
  const perLocationCount = offer.staffByLocation ? new Set(Object.values(offer.staffByLocation).flat()).size : 0;
  const count = Math.max(offer.staffIds?.length ?? 0, perLocationCount);
  const instructors = count > 0 ? `${count} instructor${count > 1 ? "s" : ""}` : "Instructors";
  const instructorLabel = offer.staffByLocation && Object.keys(offer.staffByLocation).length ? "Instructor per location" : instructors;

  const schedule = (() => {
    if (!cd) return "Schedule not set";
    const sessions = cd.dates.length || (cd.scheduleMode === "single" ? 1 : 0);
    const head = sessions ? `${sessions} session${sessions > 1 ? "s" : ""}` : "Schedule not set";
    const hasOverrides = Object.keys(cd.dateTimes ?? {}).length > 0;
    const time = cd.startTime && cd.endTime ? ` · ${cd.startTime}–${cd.endTime}${hasOverrides ? " + custom times" : ""}` : "";
    const repeat = cd.repeat === "weekly" ? " · repeats weekly" : "";
    return `${head}${time}${repeat}`;
  })();

  const attendees = (() => {
    if (!cd) return "Attendees not set";
    const seatRange = `${cd.minParticipants}-${cd.capacity} seats`;
    if (cd.bookingStructure === "private_group") return `Private booking · ${seatRange}`;
    return seatRange;
  })();

  return (
    <>
      <SummaryRow className="border-t border-border/60" icon={<CalendarDays size={16} strokeWidth={1.75} />} label={schedule} value="Schedule" />
      <SummaryRow className="border-t border-border/60" icon={<MapPin size={16} strokeWidth={1.75} />} label={locationLabel(offer)} value="Delivery" />
      <SummaryRow className="border-t border-border/60" icon={<GraduationCap size={16} strokeWidth={1.75} />} label={instructorLabel} value="Instructors" />
      <SummaryRow className="border-t border-border/60" icon={<Users size={16} strokeWidth={1.75} />} label={attendees} value="Attendees" />
      <DepositTiles offer={offer} onEdit={onEdit} />
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

// ── Bundle dashboard (Figma 12231-53053 Overview / 53287 Advanced) ───────────
// Tabbed layout unique to bundles: Overview surfaces readiness, price, included
// services and the read-only Order & gaps timeline; Advanced links to inherited
// forms/resources and bundle settings.

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function BundleBody({ offer, offers, onEditPrice }: { offer: DemoOffer; offers: DemoOffer[]; onEditPrice: () => void }) {
  const router = useRouter();
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [tab, setTab] = useState<"overview" | "advanced">("overview");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Tolerate a bundle offer without its snapshot (older seed rows).
  const b = offer.bundle ?? { kind: "fixed" as const, serviceIds: [], chooseCount: 0, priceMode: "fixed" as const, discountPercent: "" };
  const bundleOffer = { ...offer, bundle: b };
  const links = syncBundleLinks(b.serviceIds, b.links ?? []);
  const ready = bundleReadyToPublish(bundleOffer);
  const inh = inheritedFromServices(bundleOffer, offers);
  const orderHref = `/app/services/${offer.id}/order`;

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= b.serviceIds.length) return;
    const ids = arrayMove(b.serviceIds, from, to);
    const lks = arrayMove(links, from, to);
    updateOffer(offer.id, { bundle: { ...b, serviceIds: ids, links: syncBundleLinks(ids, lks) } });
    setEditIndex(to);
  };

  const setLinkKind = (i: number, kind: BundleLinkKind) => {
    const link: BundleLink = { kind };
    if (kind === "gap") link.gapMin = links[i]?.gapMin ?? 30;
    if (kind === "separate") link.gapDays = links[i]?.gapDays ?? 1;
    const next = links.map((l, idx) => (idx === i ? link : l));
    updateOffer(offer.id, { bundle: { ...b, links: syncBundleLinks(b.serviceIds, next) } });
  };

  const patchLink = (i: number, patch: Partial<BundleLink>) => {
    const next = links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    updateOffer(offer.id, { bundle: { ...b, links: next } });
  };

  return (
    <>
      <div className="mb-4 mt-3 flex rounded-full bg-canvas p-1">
        {(["overview", "advanced"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold capitalize transition-colors ${tab === t ? "bg-surface text-navy shadow-card" : "text-secondary"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ready ? "bg-navy text-white" : "bg-canvas text-muted"}`}>
              <CheckCircle2 size={18} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-navy">{ready ? "Ready to publish" : "Finish setup"}</span>
              <span className="block text-[12px] text-muted">{ready ? "Bundle setup is complete." : "Add services and a price to publish."}</span>
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <button onClick={onEditPrice} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-canvas">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Wallet size={15} className="text-secondary" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">Price</span>
                <span className="block truncate text-[12px] text-muted">{bundlePriceSummary(bundleOffer, offers)}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
            <button onClick={() => router.push(`/app/services/${offer.id}/services`)} className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left hover:bg-canvas">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Scissors size={15} className="text-secondary" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">Included services</span>
                <span className="block truncate text-[12px] text-muted">{includedServicesSummary(bundleOffer, offers)}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-navy">Order &amp; gaps</span>
              <button onClick={() => router.push(orderHref)} className="flex items-center gap-1 text-[13px] font-medium text-secondary">Edit <ChevronRight size={14} /></button>
            </div>
            <p className="pb-3 pt-0.5 text-[12px] text-muted">Drag services into order and tap a service to add a gap, overlap, or separate visit.</p>
            {b.serviceIds.length >= 2 ? (
              <BundleTimeline serviceIds={b.serviceIds} links={links} offers={offers} onEdit={setEditIndex} />
            ) : (
              <p className="rounded-2xl bg-canvas px-4 py-5 text-center text-[13px] text-muted">No services yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-1 overflow-hidden rounded-2xl border border-border bg-surface">
          <AdvancedRow icon={FileText} label="Forms inherited from services"
            desc={inh.forms ? `Review forms inherited from ${inh.forms} service${inh.forms > 1 ? "s" : ""}` : "Add forms or inherit from services"}
            onClick={() => router.push(`/app/services/${offer.id}/forms`)} />
          <AdvancedRow icon={Box} label="Resources inherited from services"
            desc={inh.resources ? `Review resources inherited from ${inh.resources} service${inh.resources > 1 ? "s" : ""}` : "Add resources or inherit from services"}
            onClick={() => router.push(`/app/services/${offer.id}/resources`)} border />
          <AdvancedRow icon={Settings2} label="Bundle settings" desc="Booking rules, payments, policies"
            onClick={() => router.push(`/app/services/${offer.id}/settings`)} border />
        </div>
      )}

      {editIndex !== null && b.serviceIds[editIndex] && (
        <LinkSheet
          index={editIndex}
          isFirst={editIndex === 0}
          isLast={editIndex === b.serviceIds.length - 1}
          total={b.serviceIds.length}
          name={offers.find((o) => o.id === b.serviceIds[editIndex])?.name ?? "Service"}
          nextName={offers.find((o) => o.id === b.serviceIds[editIndex + 1])?.name}
          link={links[editIndex] ?? backToBack()}
          onClose={() => setEditIndex(null)}
          onMove={(dir) => move(editIndex, dir)}
          onKind={(k) => setLinkKind(editIndex, k)}
          onPatch={(p) => patchLink(editIndex, p)}
        />
      )}
    </>
  );
}

function AdvancedRow({ icon: Icon, label, desc, onClick, border }: { icon: typeof FileText; label: string; desc: string; onClick: () => void; border?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-canvas ${border ? "border-t border-border" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Icon size={15} className="text-secondary" strokeWidth={1.75} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-navy">{label}</span>
        <span className="block truncate text-[12px] text-muted">{desc}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </button>
  );
}

// ── Subscription dashboard ───────────────────────────────────────────────────
// Tabbed layout mirroring BundleBody. Overview surfaces readiness + key values;
// Advanced links to the four module pages.

function SubscriptionBody({ offer, offers }: { offer: DemoOffer; offers: DemoOffer[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "advanced">("overview");
  const sub = offer.subscription;
  const ready = subscriptionReadyToPublish(offer);
  const readinessIssues = subscriptionReadinessIssues(offer);
  const tiers = sub ? normalizeMembershipTiers(sub) : [];
  const tierReadbacks = sub ? membershipPlanSentences(sub, offers, (id) => productsCatalog.find((p) => p.id === id)?.name ?? "") : [];

  const BENEFIT_ICON = {
    sessions: Scissors,
    credit: CreditCard,
    discount: TicketPercent,
    access: LockKeyhole,
  } as const;
  const BenefitIcon = sub ? BENEFIT_ICON[sub.benefitType] : Repeat;

  return (
    <>
      <div className="mb-4 mt-3 flex rounded-full bg-canvas p-1">
        {(["overview", "advanced"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold capitalize transition-colors ${tab === t ? "bg-surface text-navy shadow-card" : "text-secondary"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ready ? "bg-navy text-white" : "bg-canvas text-muted"}`}>
              <CheckCircle2 size={18} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-navy">{ready ? "Ready to publish" : "Finish setup"}</span>
              <span className="block text-[12px] text-muted">{ready ? "Membership setup is complete." : readinessIssues.join(", ")}</span>
            </span>
          </div>

          {sub && (
            <div className="rounded-2xl border border-border bg-canvas px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">How clients will understand this</div>
              <div className="mt-3 space-y-2">
                {tierReadbacks.map((line, index) => (
                  <p key={index} className="rounded-xl bg-surface px-3 py-2.5 text-[13px] font-medium leading-snug text-navy">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tiers.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <span className="block text-[14px] font-semibold text-navy">Tiers</span>
                <span className="block text-[12px] text-muted">Price levels and benefits in this membership</span>
              </div>
              {tiers.map((tier, index) => (
                <div key={tier.id} className={`px-4 py-3 ${index > 0 ? "border-t border-border" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-navy">{tier.name}</span>
                      {tier.description ? <span className="block truncate text-[12px] text-muted">{tier.description}</span> : null}
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold text-navy">
                      {tier.price ? `£${tier.price}/${tier.billingPeriod}` : "No price"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <button onClick={() => router.push(`/app/services/${offer.id}/sub-billing`)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-canvas">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><Wallet size={15} className="text-secondary" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">Billing &amp; terms</span>
                <span className="block truncate text-[12px] text-muted">
                  {sub ? `${subscriptionBillingLabel(offer.price, sub)} · ${subscriptionTermsLabel(sub)}` : "Not set"}
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>

            <button onClick={() => router.push(`/app/services/${offer.id}/sub-benefits`)}
              className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left hover:bg-canvas">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas"><BenefitIcon size={15} className="text-secondary" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">Tiers &amp; benefits</span>
                <span className="block truncate text-[12px] text-muted">
                  {sub ? subscriptionBenefitLabel(sub) : "Not set"}
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1 overflow-hidden rounded-2xl border border-border bg-surface">
          <AdvancedRow icon={BenefitIcon} label="Tiers & benefits"
            desc="Included bookings, discounts and member-only access by tier"
            onClick={() => router.push(`/app/services/${offer.id}/sub-benefits`)} />
          <AdvancedRow icon={Wallet} label="Billing &amp; terms"
            desc="Joining fee, minimum term and cancellation"
            onClick={() => router.push(`/app/services/${offer.id}/sub-billing`)} border />
          <AdvancedRow icon={Settings2} label="Booking rules"
            desc="Cooldown, rollover, pause settings"
            onClick={() => router.push(`/app/services/${offer.id}/sub-rules`)} border />
          <AdvancedRow icon={Bell} label="Notifications"
            desc="Renewal reminders and member updates"
            onClick={() => router.push(`/app/services/${offer.id}/notifications`)} border />
          <AdvancedRow icon={Settings2} label="Settings"
            desc="Policies, payments and rules"
            onClick={() => router.push(`/app/services/${offer.id}/settings`)} border />
        </div>
      )}
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
