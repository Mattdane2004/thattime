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
import { statusLabel } from "@/lib/data/offers";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";

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

  const Icon = TYPE_ICON[offer.type];
  const color = defaultCategories.find((c) => c.name === offer.category)?.color ?? "#9CA3AF";
  const isClass = offer.type === "class";

  const advanced: ModuleRow[] = isClass
    ? [
        { key: "requirements", label: "Requirements & prerequisites", desc: "Age, eligibility, qualifications and what to bring", icon: GraduationCap },
        { key: "forms", label: "Forms & waivers", desc: "Consent forms, waivers, health checks", icon: FileText, href: `/app/services/${offer.id}/forms` },
        { key: "agenda", label: "Agenda & syllabus", desc: "Modules, breaks, day-by-day timetable", icon: ClipboardList },
        { key: "materials", label: "Materials", desc: "PDFs, pre-reads and after-class resources", icon: BookOpen },
        { key: "certificates", label: "Completion & certificates", desc: "Pass/fail rules and certificate templates", icon: Award },
        { key: "resources", label: "Resources, rooms & equipment", desc: "Rooms, setup needs and internal notes", icon: Box, href: `/app/services/${offer.id}/resources` },
        { key: "products", label: "Products & kits", desc: "Student kits and optional add-ons", icon: Package, href: `/app/services/${offer.id}/products` },
        { key: "notifications", label: "Notifications", desc: "Class reminders and student updates", icon: Bell },
        { key: "settings", label: "Policies, payments & rules", desc: "Lead time, cancellation, deposits", icon: Settings2, href: `/app/services/${offer.id}/settings` },
      ]
    : [
        { key: "variants", label: "Variants", desc: "Add pricing variants", icon: Layers, href: `/app/services/${offer.id}/variants` },
        { key: "preferences", label: "Product preferences", desc: "Add add-ons", icon: PlusCircle, href: `/app/services/${offer.id}/products` },
        { key: "upsells", label: "Upsells and suggestions", desc: "Upsell or suggest a service to include in the booking", icon: ArrowUpRight, href: `/app/services/${offer.id}/related` },
        { key: "resources", label: "Resources", desc: "Add resources", icon: Box, href: `/app/services/${offer.id}/resources` },
        { key: "forms", label: "Forms", desc: "Add forms", icon: FileText, href: `/app/services/${offer.id}/forms` },
        { key: "notifications", label: "Notifications", desc: "Set notification preferences", icon: Bell },
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

        <div className="overflow-hidden rounded-2xl bg-canvas">
          <button className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-border/30">
            <span className="text-[20px] font-bold text-navy">
              {offer.price === "0" ? "Free" : `£${offer.price}`}
              <span className="ml-1.5 text-[13px] font-normal text-muted">
                {isClass ? "per attendee" : offer.durationMin ? `for ${offer.durationMin >= 60 ? `${offer.durationMin / 60}h${offer.durationMin % 60 ? ` ${offer.durationMin % 60}m` : ""}` : `${offer.durationMin}m`}` : ""}
              </span>
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          {isClass && (
            <button className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3.5 text-left hover:bg-border/30">
              <CalendarDays size={16} className="shrink-0 text-secondary" strokeWidth={1.75} />
              <span className="flex-1">
                <span className="block text-[14px] font-medium text-navy">Schedule</span>
                <span className="block text-[12px] text-muted">Sessions & repeats</span>
              </span>
              <ChevronRight size={16} className="text-muted" />
            </button>
          )}
          <button className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3.5 text-left hover:bg-border/30">
            <MapPin size={16} className="shrink-0 text-secondary" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-medium text-navy">In-salon · Mobile</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <button className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3.5 text-left hover:bg-border/30">
            <Users size={16} className="shrink-0 text-secondary" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-medium text-navy">{isClass ? "Instructors" : "Staff members"}</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <div className="flex border-t border-border/60">
            <div className="flex-1 px-4 py-3">
              <div className="text-[11px] text-muted">Deposit</div>
              <div className="mt-0.5 text-[14px] font-semibold text-navy">£20</div>
            </div>
            <div className="flex-1 border-l border-border/60 px-4 py-3">
              <div className="text-[11px] text-muted">Cancellation</div>
              <div className="mt-0.5 text-[14px] font-semibold text-navy">24h</div>
            </div>
          </div>
        </div>

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
