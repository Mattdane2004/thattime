"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, GraduationCap, Package, Scissors, Search, TicketPercent, LockKeyhole } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { Sheet, WizardFooter, WizardTitle, TOTAL_STEPS, FieldLabel, Toggle } from "@/components/ui";
import type { MembershipScope, MembershipTier } from "@/lib/store/wizardStore";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useOffersStore } from "@/lib/store/offersStore";
import { offerMeta, type DemoOffer } from "@/lib/data/offers";
import { productsCatalog } from "@/lib/data/products";
import {
  normalizeMembershipTiers,
  parentTierFor,
  tierBenefitCount,
  tierInheritanceLabel,
  tierInheritedSectionLabels,
  tierPlanSentence,
} from "@/lib/data/subscriptions";

type EditorSection = "inheritance" | "services" | "classes" | "discounts" | "access";
type EditorState = { tierId: string; section: EditorSection } | null;

export default function SubscriptionBenefitsPage() {
  const router = useRouter();
  const sub = useWizardStore((s) => s.draft.subscription);
  const updateSubscription = useWizardStore((s) => s.updateSubscription);
  const allOffers = useOffersStore((s) => s.offers);
  const [editor, setEditor] = useState<EditorState>(null);
  const tiers = normalizeMembershipTiers(sub);
  const services = allOffers.filter((o) => o.type === "service" && o.status === "published");
  const classes = allOffers.filter((o) => o.type === "class" && o.status === "published");
  const editingTier = editor ? tiers.find((tier) => tier.id === editor.tierId) : undefined;

  const saveTiers = (next: MembershipTier[]) => updateSubscription({ tiers: next });
  const patchTier = (id: string, patch: Partial<MembershipTier>) =>
    saveTiers(tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)));
  const toggleId = (tier: MembershipTier, key: keyof MembershipTier, id: string) => {
    const current = (tier[key] as string[]) ?? [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    patchTier(tier.id, { [key]: next } as Partial<MembershipTier>);
  };
  const setIds = (tier: MembershipTier, key: keyof MembershipTier, ids: string[]) => {
    patchTier(tier.id, { [key]: ids } as Partial<MembershipTier>);
  };

  const canContinue = tiers.some((tier) => tierBenefitCount(tier, tiers) > 0);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/subscription-type")} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="What members get" subtitle="Keep the plan simple here. Tap a section to edit it in detail." />

        <div className="space-y-4 pb-6">
          {tiers.map((tier, index) => {
            const inherited = tierInheritedSectionLabels(tier, tiers);
            return (
              <div key={tier.id} className="rounded-2xl border border-border bg-canvas p-4">
                <div className="flex items-start justify-between gap-3 pb-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Tier {index + 1}</div>
                    <div className="mt-0.5 text-[17px] font-semibold text-navy">{tier.name}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{tier.price ? `£${tier.price}/${tier.billingPeriod}` : "Price not set"}</div>
                  </div>
                  <div className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-secondary">
                    {tierBenefitCount(tier, tiers)} active
                  </div>
                </div>

                {index > 0 && (
                  <SectionRow
                    icon={<ChevronRight size={15} />}
                    title="Inherited benefits"
                    status={tierInheritanceLabel(tier, tiers)}
                    inherited={inherited.length > 0}
                    onClick={() => setEditor({ tierId: tier.id, section: "inheritance" })}
                  />
                )}

                <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
                  <SectionRow
                    icon={<Scissors size={15} />}
                    title="Service bookings"
                    status={serviceStatus(tier, tiers)}
                    inherited={inherited.includes("service bookings")}
                    onClick={() => setEditor({ tierId: tier.id, section: "services" })}
                  />
                  <SectionRow
                    icon={<GraduationCap size={15} />}
                    title="Class bookings"
                    status={classStatus(tier, tiers)}
                    inherited={inherited.includes("class bookings")}
                    onClick={() => setEditor({ tierId: tier.id, section: "classes" })}
                    border
                  />
                  <SectionRow
                    icon={<TicketPercent size={15} />}
                    title="Discounts"
                    status={discountStatus(tier, tiers)}
                    inherited={inherited.includes("discounts")}
                    onClick={() => setEditor({ tierId: tier.id, section: "discounts" })}
                    border
                  />
                  <SectionRow
                    icon={<LockKeyhole size={15} />}
                    title="Member-only access"
                    status={accessStatus(tier, tiers)}
                    inherited={inherited.includes("member-only access")}
                    onClick={() => setEditor({ tierId: tier.id, section: "access" })}
                    border
                  />
                </div>

                <div className="mt-3 rounded-xl bg-surface px-3 py-2.5 text-[12px] font-medium leading-snug text-secondary">
                  {tierPlanSentence(tier, allOffers, productName, tiers)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <WizardFooter
        step={3}
        total={TOTAL_STEPS.subscription}
        onBack={() => router.push("/new/subscription-type")}
        onNext={() => canContinue && router.push("/new/subscription-billing")}
        disabled={!canContinue}
      />

      <Sheet
        open={Boolean(editingTier && editor)}
        onClose={() => setEditor(null)}
        title={sheetTitle(editor?.section)}
        sub={editingTier?.name}
        full={editor?.section === "discounts" || editor?.section === "access"}
        footer={
          <button
            type="button"
            onClick={() => setEditor(null)}
            className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white"
          >
            Done
          </button>
        }
      >
        {editingTier && editor?.section === "inheritance" && (
          <InheritanceEditor tier={editingTier} tiers={tiers} patchTier={patchTier} />
        )}

        {editingTier && editor?.section === "services" && (
          <ServiceBookingEditor tier={editingTier} services={services} patchTier={patchTier} toggleId={toggleId} setIds={setIds} />
        )}

        {editingTier && editor?.section === "classes" && (
          <ClassBookingEditor tier={editingTier} classes={classes} patchTier={patchTier} toggleId={toggleId} setIds={setIds} />
        )}

        {editingTier && editor?.section === "discounts" && (
          <DiscountsEditor tier={editingTier} services={services} classes={classes} patchTier={patchTier} toggleId={toggleId} setIds={setIds} />
        )}

        {editingTier && editor?.section === "access" && (
          <AccessEditor tier={editingTier} services={services} classes={classes} patchTier={patchTier} toggleId={toggleId} setIds={setIds} />
        )}
      </Sheet>
    </>
  );
}

function productName(id: string) {
  return productsCatalog.find((product) => product.id === id)?.name ?? "";
}

function sheetTitle(section?: EditorSection) {
  switch (section) {
    case "inheritance": return "Inherited benefits";
    case "services": return "Service bookings";
    case "classes": return "Class bookings";
    case "discounts": return "Discounts";
    case "access": return "Member-only access";
    default: return "Edit benefits";
  }
}

function serviceStatus(tier: MembershipTier, tiers: MembershipTier[]) {
  if (tier.serviceBookingsEnabled) {
    if (tier.serviceBookingsUnlimited) {
      return `Unlimited · ${tier.serviceBookingScope === "all" ? "All services" : `${tier.serviceBookingIds.length} selected`}`;
    }
    return `${tier.serviceBookingAllowance} / ${tier.billingPeriod} · ${tier.serviceBookingScope === "all" ? "All services" : `${tier.serviceBookingIds.length} selected`}`;
  }
  return tierInheritedSectionLabels(tier, tiers).includes("service bookings") ? "Inherited" : "Off";
}

function classStatus(tier: MembershipTier, tiers: MembershipTier[]) {
  if (tier.classBookingsEnabled) {
    if (tier.classBookingsUnlimited) {
      return `Unlimited · ${tier.classBookingScope === "all" ? "All classes" : `${tier.classBookingIds.length} selected`}`;
    }
    return `${tier.classBookingAllowance} / ${tier.billingPeriod} · ${tier.classBookingScope === "all" ? "All classes" : `${tier.classBookingIds.length} selected`}`;
  }
  return tierInheritedSectionLabels(tier, tiers).includes("class bookings") ? "Inherited" : "Off";
}

function discountStatus(tier: MembershipTier, tiers: MembershipTier[]) {
  const own = [
    tier.serviceDiscountEnabled && "Services",
    tier.classDiscountEnabled && "Classes",
    tier.productDiscountEnabled && "Products",
  ].filter(Boolean) as string[];
  if (own.length) return own.join(", ");
  return tierInheritedSectionLabels(tier, tiers).includes("discounts") ? "Inherited" : "Off";
}

function accessStatus(tier: MembershipTier, tiers: MembershipTier[]) {
  const count = tier.accessServiceIds.length + tier.accessClassIds.length;
  if (tier.accessEnabled) return count ? `${count} selected` : "Select services or classes";
  return tierInheritedSectionLabels(tier, tiers).includes("member-only access") ? "Inherited" : "Off";
}

function SectionRow({
  icon,
  title,
  status,
  inherited,
  onClick,
  border,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  inherited?: boolean;
  onClick: () => void;
  border?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-canvas ${border ? "border-t border-border" : ""}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${status === "Off" ? "bg-canvas text-muted" : "bg-navy text-white"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-navy">{title}</span>
        <span className="block truncate text-[12px] text-muted">{status}</span>
      </span>
      {inherited ? <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-secondary">Inherited</span> : null}
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </button>
  );
}

function InheritanceEditor({
  tier,
  tiers,
  patchTier,
}: {
  tier: MembershipTier;
  tiers: MembershipTier[];
  patchTier: (id: string, patch: Partial<MembershipTier>) => void;
}) {
  const parent = parentTierFor(tier, tiers);
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Inherit from</FieldLabel>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => patchTier(tier.id, {
              inheritsFromTierId: "",
              inheritServiceBookings: false,
              inheritClassBookings: false,
              inheritDiscounts: false,
              inheritAccess: false,
            })}
            className={`flex h-11 w-full items-center rounded-xl border px-3 text-[13px] font-semibold ${!tier.inheritsFromTierId ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary"}`}
          >
            Nothing
          </button>
          {tiers.filter((candidate) => candidate.id !== tier.id).map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => patchTier(tier.id, { inheritsFromTierId: candidate.id })}
              className={`flex h-11 w-full items-center rounded-xl border px-3 text-[13px] font-semibold ${tier.inheritsFromTierId === candidate.id ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary"}`}
            >
              {candidate.name || "Unnamed tier"}
            </button>
          ))}
        </div>
      </div>

      {parent && (
        <div className="space-y-2">
          <FieldLabel>What should carry over?</FieldLabel>
          <ToggleLine label="Service bookings" on={tier.inheritServiceBookings} onClick={() => patchTier(tier.id, { inheritServiceBookings: !tier.inheritServiceBookings })} />
          <ToggleLine label="Class bookings" on={tier.inheritClassBookings} onClick={() => patchTier(tier.id, { inheritClassBookings: !tier.inheritClassBookings })} />
          <ToggleLine label="Discounts" on={tier.inheritDiscounts} onClick={() => patchTier(tier.id, { inheritDiscounts: !tier.inheritDiscounts })} />
          <ToggleLine label="Member-only access" on={tier.inheritAccess} onClick={() => patchTier(tier.id, { inheritAccess: !tier.inheritAccess })} />
        </div>
      )}
    </div>
  );
}

function ServiceBookingEditor({
  tier,
  services,
  patchTier,
  toggleId,
  setIds,
}: {
  tier: MembershipTier;
  services: DemoOffer[];
  patchTier: (id: string, patch: Partial<MembershipTier>) => void;
  toggleId: (tier: MembershipTier, key: keyof MembershipTier, id: string) => void;
  setIds: (tier: MembershipTier, key: keyof MembershipTier, ids: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <ToggleLine label="Include service bookings" on={tier.serviceBookingsEnabled} onClick={() => patchTier(tier.id, { serviceBookingsEnabled: !tier.serviceBookingsEnabled })} />
      {tier.serviceBookingsEnabled && (
        <>
          <ToggleLine label="Unlimited service bookings" on={tier.serviceBookingsUnlimited} onClick={() => patchTier(tier.id, { serviceBookingsUnlimited: !tier.serviceBookingsUnlimited })} />
          {!tier.serviceBookingsUnlimited && (
            <AllowanceInput label={`Bookings per ${tier.billingPeriod}`} value={tier.serviceBookingAllowance} onChange={(value) => patchTier(tier.id, { serviceBookingAllowance: value })} />
          )}
          <ScopeButtons label="Services included" scope={tier.serviceBookingScope} allLabel="All services" selectedLabel="Selected services" onChange={(scope) => patchTier(tier.id, { serviceBookingScope: scope })} />
          {tier.serviceBookingScope === "selected" && (
            <OfferPicker
              offers={services}
              selectedIds={tier.serviceBookingIds}
              onToggle={(id) => toggleId(tier, "serviceBookingIds", id)}
              onChange={(ids) => setIds(tier, "serviceBookingIds", ids)}
              itemLabel="services"
            />
          )}
        </>
      )}
    </div>
  );
}

function ClassBookingEditor({
  tier,
  classes,
  patchTier,
  toggleId,
  setIds,
}: {
  tier: MembershipTier;
  classes: DemoOffer[];
  patchTier: (id: string, patch: Partial<MembershipTier>) => void;
  toggleId: (tier: MembershipTier, key: keyof MembershipTier, id: string) => void;
  setIds: (tier: MembershipTier, key: keyof MembershipTier, ids: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <ToggleLine label="Include class bookings" on={tier.classBookingsEnabled} onClick={() => patchTier(tier.id, { classBookingsEnabled: !tier.classBookingsEnabled })} />
      {tier.classBookingsEnabled && (
        <>
          <ToggleLine label="Unlimited class bookings" on={tier.classBookingsUnlimited} onClick={() => patchTier(tier.id, { classBookingsUnlimited: !tier.classBookingsUnlimited })} />
          {!tier.classBookingsUnlimited && (
            <AllowanceInput label={`Bookings per ${tier.billingPeriod}`} value={tier.classBookingAllowance} onChange={(value) => patchTier(tier.id, { classBookingAllowance: value })} />
          )}
          <ScopeButtons label="Classes included" scope={tier.classBookingScope} allLabel="All classes" selectedLabel="Selected classes" onChange={(scope) => patchTier(tier.id, { classBookingScope: scope })} />
          {tier.classBookingScope === "selected" && (
            <OfferPicker
              offers={classes}
              selectedIds={tier.classBookingIds}
              onToggle={(id) => toggleId(tier, "classBookingIds", id)}
              onChange={(ids) => setIds(tier, "classBookingIds", ids)}
              itemLabel="classes"
            />
          )}
        </>
      )}
    </div>
  );
}

function DiscountsEditor({
  tier,
  services,
  classes,
  patchTier,
  toggleId,
  setIds,
}: {
  tier: MembershipTier;
  services: DemoOffer[];
  classes: DemoOffer[];
  patchTier: (id: string, patch: Partial<MembershipTier>) => void;
  toggleId: (tier: MembershipTier, key: keyof MembershipTier, id: string) => void;
  setIds: (tier: MembershipTier, key: keyof MembershipTier, ids: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <DiscountGroup label="Services" enabled={tier.serviceDiscountEnabled} percent={tier.serviceDiscountPercent} scope={tier.serviceDiscountScope}
        onToggle={() => patchTier(tier.id, { serviceDiscountEnabled: !tier.serviceDiscountEnabled })}
        onPercent={(value) => patchTier(tier.id, { serviceDiscountPercent: value })}
        onScope={(scope) => patchTier(tier.id, { serviceDiscountScope: scope })}>
        {tier.serviceDiscountScope === "selected" && (
          <OfferPicker
            offers={services}
            selectedIds={tier.serviceDiscountIds}
            onToggle={(id) => toggleId(tier, "serviceDiscountIds", id)}
            onChange={(ids) => setIds(tier, "serviceDiscountIds", ids)}
            itemLabel="services"
          />
        )}
      </DiscountGroup>
      <DiscountGroup label="Classes" enabled={tier.classDiscountEnabled} percent={tier.classDiscountPercent} scope={tier.classDiscountScope}
        onToggle={() => patchTier(tier.id, { classDiscountEnabled: !tier.classDiscountEnabled })}
        onPercent={(value) => patchTier(tier.id, { classDiscountPercent: value })}
        onScope={(scope) => patchTier(tier.id, { classDiscountScope: scope })}>
        {tier.classDiscountScope === "selected" && (
          <OfferPicker
            offers={classes}
            selectedIds={tier.classDiscountIds}
            onToggle={(id) => toggleId(tier, "classDiscountIds", id)}
            onChange={(ids) => setIds(tier, "classDiscountIds", ids)}
            itemLabel="classes"
          />
        )}
      </DiscountGroup>
      <DiscountGroup label="Products" enabled={tier.productDiscountEnabled} percent={tier.productDiscountPercent} scope={tier.productDiscountScope}
        onToggle={() => patchTier(tier.id, { productDiscountEnabled: !tier.productDiscountEnabled })}
        onPercent={(value) => patchTier(tier.id, { productDiscountPercent: value })}
        onScope={(scope) => patchTier(tier.id, { productDiscountScope: scope })}>
        {tier.productDiscountScope === "selected" && (
          <ProductPicker
            selectedIds={tier.productDiscountIds}
            onToggle={(id) => toggleId(tier, "productDiscountIds", id)}
            onChange={(ids) => setIds(tier, "productDiscountIds", ids)}
          />
        )}
      </DiscountGroup>
    </div>
  );
}

function AccessEditor({
  tier,
  services,
  classes,
  patchTier,
  toggleId,
  setIds,
}: {
  tier: MembershipTier;
  services: DemoOffer[];
  classes: DemoOffer[];
  patchTier: (id: string, patch: Partial<MembershipTier>) => void;
  toggleId: (tier: MembershipTier, key: keyof MembershipTier, id: string) => void;
  setIds: (tier: MembershipTier, key: keyof MembershipTier, ids: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <ToggleLine label="Unlock member-only services and classes" on={tier.accessEnabled} onClick={() => patchTier(tier.id, { accessEnabled: !tier.accessEnabled })} />
      {tier.accessEnabled && (
        <>
          <div>
            <FieldLabel>Member-only services</FieldLabel>
            <OfferPicker
              offers={services}
              selectedIds={tier.accessServiceIds}
              onToggle={(id) => toggleId(tier, "accessServiceIds", id)}
              onChange={(ids) => setIds(tier, "accessServiceIds", ids)}
              itemLabel="services"
            />
          </div>
          <div>
            <FieldLabel>Member-only classes</FieldLabel>
            <OfferPicker
              offers={classes}
              selectedIds={tier.accessClassIds}
              onToggle={(id) => toggleId(tier, "accessClassIds", id)}
              onChange={(ids) => setIds(tier, "accessClassIds", ids)}
              itemLabel="classes"
            />
          </div>
        </>
      )}
    </div>
  );
}

function ToggleLine({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas px-4 py-3 text-left">
      <span className="text-[14px] font-semibold text-navy">{label}</span>
      <Toggle on={on} />
    </button>
  );
}

function AllowanceInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy"
      />
    </label>
  );
}

function ScopeButtons({
  label,
  scope,
  allLabel,
  selectedLabel,
  onChange,
}: {
  label: string;
  scope: MembershipScope;
  allLabel: string;
  selectedLabel: string;
  onChange: (scope: MembershipScope) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {([
          ["all", allLabel],
          ["selected", selectedLabel],
        ] as [MembershipScope, string][]).map(([value, text]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-xl border py-2.5 text-[13px] font-semibold transition-colors ${scope === value ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary hover:bg-border/40"}`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function DiscountGroup({
  label,
  enabled,
  percent,
  scope,
  onToggle,
  onPercent,
  onScope,
  children,
}: {
  label: string;
  enabled: boolean;
  percent: string;
  scope: MembershipScope;
  onToggle: () => void;
  onPercent: (value: string) => void;
  onScope: (scope: MembershipScope) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-canvas p-3">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="text-[14px] font-semibold text-navy">{label}</span>
        <Toggle on={enabled} />
      </button>
      {enabled && (
        <div className="mt-3 space-y-3">
          <label className="block">
            <FieldLabel>{label} discount (%)</FieldLabel>
            <input
              type="number"
              inputMode="numeric"
              value={percent}
              onChange={(e) => onPercent(e.target.value)}
              placeholder="15"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>
          <ScopeButtons label={`${label} discount applies to`} scope={scope} allLabel={`All ${label.toLowerCase()}`} selectedLabel={`Selected ${label.toLowerCase()}`} onChange={onScope} />
          {children}
        </div>
      )}
    </div>
  );
}

function uniqueCategories(items: { category: string }[]) {
  return Array.from(new Set(items.map((item) => item.category))).sort();
}

function mergeIds(selectedIds: string[], ids: string[]) {
  return Array.from(new Set([...selectedIds, ...ids]));
}

function removeIds(selectedIds: string[], ids: string[]) {
  return selectedIds.filter((id) => !ids.includes(id));
}

function PickerControls({
  query,
  onQuery,
  category,
  onCategory,
  categories,
  itemLabel,
  visibleIds,
  selectedIds,
  onChange,
}: {
  query: string;
  onQuery: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  categories: string[];
  itemLabel: string;
  visibleIds: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const hasVisible = visibleIds.length > 0;
  const selectedVisible = visibleIds.some((id) => selectedIds.includes(id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={`Search ${itemLabel}`}
          className="h-11 w-full rounded-xl border border-border bg-canvas pl-9 pr-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", ...categories].map((option) => {
          const active = category === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onCategory(option)}
              className={`h-9 shrink-0 rounded-full border px-3 text-[12px] font-semibold transition-colors ${active ? "border-navy bg-navy text-white" : "border-border bg-canvas text-secondary hover:bg-border/40"}`}
            >
              {option === "all" ? "All categories" : option}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!hasVisible}
          onClick={() => onChange(mergeIds(selectedIds, visibleIds))}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-[12px] font-semibold text-secondary disabled:opacity-40"
        >
          Add all visible
        </button>
        <button
          type="button"
          disabled={!selectedVisible}
          onClick={() => onChange(removeIds(selectedIds, visibleIds))}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-[12px] font-semibold text-secondary disabled:opacity-40"
        >
          Clear visible
        </button>
      </div>
    </div>
  );
}

function CategoryHeader({
  category,
  count,
  ids,
  selectedIds,
  onChange,
}: {
  category: string;
  count: number;
  ids: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
      <div className="min-w-0">
        <div className="truncate text-[12px] font-semibold uppercase tracking-wider text-muted">{category}</div>
        <div className="text-[11px] text-muted">{count} visible</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(allSelected ? removeIds(selectedIds, ids) : mergeIds(selectedIds, ids))}
        className="shrink-0 rounded-full border border-border bg-canvas px-3 py-1.5 text-[11px] font-semibold text-secondary"
      >
        {allSelected ? "Clear category" : "Add category"}
      </button>
    </div>
  );
}

function OfferPicker({
  offers,
  selectedIds,
  onToggle,
  onChange,
  itemLabel,
}: {
  offers: DemoOffer[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onChange: (ids: string[]) => void;
  itemLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = uniqueCategories(offers);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOffers = offers.filter((offer) => {
    const inCategory = category === "all" || offer.category === category;
    const matchesQuery = !normalizedQuery || `${offer.name} ${offer.category}`.toLowerCase().includes(normalizedQuery);
    return inCategory && matchesQuery;
  });
  const visibleIds = visibleOffers.map((offer) => offer.id);
  const groupedOffers = categories
    .filter((offerCategory) => category === "all" || offerCategory === category)
    .map((offerCategory) => ({
      category: offerCategory,
      offers: visibleOffers.filter((offer) => offer.category === offerCategory),
    }))
    .filter((group) => group.offers.length > 0);

  if (!offers.length) return <div className="rounded-xl border border-dashed border-border px-3 py-3 text-[12px] text-muted">No published items yet.</div>;

  return (
    <div className="space-y-4">
      <PickerControls
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        categories={categories}
        itemLabel={itemLabel}
        visibleIds={visibleIds}
        selectedIds={selectedIds}
        onChange={onChange}
      />

      {groupedOffers.length ? (
        <div className="space-y-3">
          {groupedOffers.map((group) => {
            const ids = group.offers.map((offer) => offer.id);
            return (
              <div key={group.category} className="space-y-2">
                <CategoryHeader category={group.category} count={group.offers.length} ids={ids} selectedIds={selectedIds} onChange={onChange} />
                {group.offers.map((offer) => {
                  const selected = selectedIds.includes(offer.id);
                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => onToggle(offer.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${selected ? "border-navy bg-surface" : "border-border bg-canvas hover:bg-border/40"}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-navy">{offer.name}</span>
                        <span className="block text-[11px] text-muted">{offerMeta(offer)}</span>
                      </span>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${selected ? "border-navy bg-navy" : "border-border bg-surface"}`}>
                        {selected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-3 py-3 text-[12px] text-muted">No matching {itemLabel}.</div>
      )}
    </div>
  );
}

function ProductPicker({ selectedIds, onToggle, onChange }: { selectedIds: string[]; onToggle: (id: string) => void; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = uniqueCategories(productsCatalog);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = productsCatalog.filter((product) => {
    const inCategory = category === "all" || product.category === category;
    const matchesQuery = !normalizedQuery || `${product.name} ${product.category}`.toLowerCase().includes(normalizedQuery);
    return inCategory && matchesQuery;
  });
  const visibleIds = visibleProducts.map((product) => product.id);
  const groupedProducts = categories
    .filter((productCategory) => category === "all" || productCategory === category)
    .map((productCategory) => ({
      category: productCategory,
      products: visibleProducts.filter((product) => product.category === productCategory),
    }))
    .filter((group) => group.products.length > 0);

  return (
    <div className="space-y-4">
      <PickerControls
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        categories={categories}
        itemLabel="products"
        visibleIds={visibleIds}
        selectedIds={selectedIds}
        onChange={onChange}
      />

      {groupedProducts.length ? (
        <div className="space-y-3">
          {groupedProducts.map((group) => {
            const ids = group.products.map((product) => product.id);
            return (
              <div key={group.category} className="space-y-2">
                <CategoryHeader category={group.category} count={group.products.length} ids={ids} selectedIds={selectedIds} onChange={onChange} />
                {group.products.map((product) => {
                  const selected = selectedIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => onToggle(product.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${selected ? "border-navy bg-surface" : "border-border bg-canvas hover:bg-border/40"}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                        <Package size={15} className="text-secondary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-navy">{product.name}</span>
                        <span className="block text-[11px] text-muted">£{product.basePrice} · {product.category}</span>
                      </span>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${selected ? "border-navy bg-navy" : "border-border bg-surface"}`}>
                        {selected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-3 py-3 text-[12px] text-muted">No matching products.</div>
      )}
    </div>
  );
}
