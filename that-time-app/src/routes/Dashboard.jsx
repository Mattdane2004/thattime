import { createElement, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ImageIcon,
  Camera,
  Plus,
  MoreHorizontal,
  MapPin,
  Users,
  CalendarDays,
  ChevronRight,
  Layers,
  Package,
  Sparkles,
  Box,
  FileText,
  Settings2,
  Bell,
  ListChecks,
  Eye,
  Video,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { formatDuration } from '../components/DurationPicker';
import { staff as fallbackStaff } from '../data/staff';
import { businessLocations } from '../data/business';
import { businessDefaults } from '../data/businessDefaults';
import { demoServices } from '../data/demoServices';
import { billingPeriodLabel, offerTypeMeta } from '../data/offerTypes';
import NameSheet from './sheets/NameSheet';
import PriceSheet from './sheets/PriceSheet';
import DepositSheet from './sheets/DepositSheet';

export default function Dashboard() {
  const navigate = useNavigate();
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const [sheet, setSheet] = useState(null);
  const meta = offerTypeMeta(draft.type);
  const summaries = summaryRows(draft, teamMembers);

  const modules = modulesFor(draft);

  const [publishError, setPublishError] = useState(false);

  if (draft.type === 'class') return <Navigate to="/class" replace />;
  if (draft.type === 'bundle') return <Navigate to="/bundle" replace />;
  if (draft.type === 'subscription') return <Navigate to="/subscription" replace />;

  const togglePublish = () => {
    const goingLive = draft.status !== 'published';
    setPublishError(false);
    updateDraft({ status: goingLive ? 'published' : 'draft' });
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate('/services')}
        rightAction={
          <button
            className="-mr-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="More"
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-5 pt-2 pb-5">
          <div className="flex items-center gap-4">
            <button
              aria-label="Change icon"
              className="w-[52px] h-[52px] rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0"
            >
              <ImageIcon size={20} className="text-gray-500" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setSheet('name')}
              className="flex-1 min-w-0 text-left"
            >
              <div className="text-[22px] leading-tight font-semibold tracking-tight truncate">
                {draft.name || meta.dashboardTitleFallback}
              </div>
              <div className="text-[13px] text-gray-400 mt-0.5 truncate">
                {draft.category || 'No category'} · {meta.label}
              </div>
            </button>
            <button
              onClick={togglePublish}
              className={
                'px-3 py-1 rounded-full text-[12px] font-medium shrink-0 transition-colors ' +
                (draft.status === 'published'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              {capitalise(draft.status)}
            </button>
          </div>
        </div>

        {/* Summary card */}
        <div className="px-5 pb-5">
          <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden">

            {/* Price headline */}
            <button
              onClick={() => setSheet('price')}
              className="w-full px-6 pt-6 pb-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <div
                  className={
                    'text-[32px] font-semibold tracking-tight leading-none ' +
                    (draft.price ? 'text-gray-900' : 'text-gray-300')
                  }
                >
                  {priceHeadline(draft)}
                </div>
                {priceSubline(draft) ? (
                  <div className="text-[15px] text-gray-500">
                    {priceSubline(draft)}
                  </div>
                ) : null}
              </div>
            </button>

            <div className="mx-6 h-px bg-gray-100" />

            {summaries.map((row, index) => (
              <div key={row.key}>
                <button
                  onClick={() => navigate(row.path)}
                  className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <row.Icon size={15} className="text-gray-500 shrink-0" strokeWidth={1.75} />
                  <div
                    className={
                      'flex-1 text-[15px] truncate ' +
                      (row.ready ? 'text-gray-900' : 'text-gray-400')
                    }
                  >
                    {row.text}
                  </div>
                  <ChevronRight size={15} className="text-gray-300 shrink-0" strokeWidth={2} />
                </button>
                {index < summaries.length - 1 && <div className="mx-6 h-px bg-gray-100" />}
              </div>
            ))}

            <div className="mx-6 h-px bg-gray-100" />

            {/* Deposit + Cancellation (both derived from settings) */}
            <div className="flex">
              <button
                onClick={() => setSheet('deposit')}
                className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="text-[12px] text-gray-500 mb-0.5">Deposit</div>
                <div className="text-[14px] text-gray-900">{depositValue(draft)}</div>
              </button>
              <div className="w-px bg-gray-100 my-3" />
              <button
                onClick={() => navigate('/service/settings')}
                className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="text-[12px] text-gray-500 mb-0.5">Cancellation</div>
                <div className="text-[14px] text-gray-900">{cancellationValue(draft)}</div>
              </button>
            </div>

          </div>
        </div>

        {/* Photo thumbnail strip */}
        <PhotoStrip
          photos={draft.photos}
          onOpen={() => navigate('/service/photos')}
        />

        {/* Advanced — for classes this is split into grouped sections */}
        {Array.isArray(modules) ? (
          <div className="pt-2">
            <div className="px-5 pb-3 text-[15px] font-semibold text-gray-900">Advanced</div>
            <div className="px-2">
              {modules.map(({ key, label, Icon, path, meta }) => (
                <ModuleRow
                  key={key}
                  label={label}
                  Icon={Icon}
                  meta={meta}
                  onClick={() => navigate(path)}
                />
              ))}
            </div>
          </div>
        ) : (
          modules.groups.map((group) => (
            <div key={group.title} className="pt-2">
              <div className="px-5 pb-3 flex items-baseline justify-between">
                <div className="text-[15px] font-semibold text-gray-900">{group.title}</div>
                {group.hint && (
                  <div className="text-[12px] text-gray-400">{group.hint}</div>
                )}
              </div>
              <div className="px-2">
                {group.items.map(({ key, label, Icon, path, meta }) => (
                  <ModuleRow
                    key={key}
                    label={label}
                    Icon={Icon}
                    meta={meta}
                    onClick={() => navigate(path)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="h-6" />
      </div>

      {/* Inline publish error — class missing lead instructor */}
      {publishError && (
        <div className="mx-5 mb-2 px-4 py-3 rounded-xl bg-rose-50 text-[13px] text-rose-700 shrink-0">
          A lead instructor is required to publish this class.
        </div>
      )}

      {/* Sticky footer */}
      <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service/preview')}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={togglePublish}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          {draft.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <NameSheet open={sheet === 'name'} onClose={() => setSheet(null)} />
      <PriceSheet open={sheet === 'price'} onClose={() => setSheet(null)} />
      <DepositSheet open={sheet === 'deposit'} onClose={() => setSheet(null)} />
    </>
  );
}

function ModuleRow({ label, Icon, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-3 py-4 rounded-xl text-left hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        {createElement(Icon, { size: 18, className: 'text-gray-700', strokeWidth: 1.75 })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-gray-900">{label}</div>
        <div className={'text-[13px] truncate mt-0.5 ' + (meta.empty ? 'text-gray-400' : 'text-gray-500')}>
          {meta.text}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

function PhotoStrip({ photos, onOpen }) {
  const empty = !photos || photos.length === 0;

  return (
    <div className="pb-5">
      {/* Section header */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <div className="text-[15px] font-semibold text-gray-900">Photos</div>
        <button
          onClick={onOpen}
          className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          {empty ? 'Add' : 'Manage'}
        </button>
      </div>

      {empty ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[88px] h-[88px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
            />
          ))}
          <button
            onClick={onOpen}
            className="shrink-0 w-[88px] h-[88px] rounded-2xl bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5 text-gray-400 transition-colors"
          >
            <Camera size={18} strokeWidth={1.75} />
            <span className="text-[11px] font-medium">Add</span>
          </button>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {photos.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={onOpen}
              className={
                'shrink-0 w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-[11px] text-gray-600 hover:opacity-90 transition-opacity ' +
                p.shade
              }
            >
              {p.label}
            </button>
          ))}
          {photos.length > 4 && (
            <button
              onClick={onOpen}
              className="shrink-0 w-[88px] h-[88px] rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[13px] font-medium text-gray-700"
            >
              +{photos.length - 4}
            </button>
          )}
          <button
            onClick={onOpen}
            aria-label="Add photo"
            className="shrink-0 w-[88px] h-[88px] rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function capitalise(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

function hasAnyLocation(d) {
  return Object.values(d.locations).some((l) => l.enabled);
}

function priceHeadline(d) {
  if (!d.price) return d.type === 'subscription' ? 'Add billing' : 'Add price';
  if (d.type === 'subscription') {
    return `£${d.price}`;
  }
  return `£${d.price}`;
}

function priceSubline(d) {
  if (d.type === 'subscription') {
    return `/ ${billingPeriodLabel(d.subscriptionDetails?.billingPeriod)}`;
  }
  if (d.type === 'bundle') {
    const count = d.bundleDetails?.includedServiceIds?.length || 0;
    return count ? `package of ${count} service${count === 1 ? '' : 's'}` : 'package';
  }
  if (d.durationMin) return `for ${formatDuration(d.durationMin)}`;
  return null;
}

function summaryRows(d, teamMembers = fallbackStaff) {
  if (d.type === 'bundle') {
    const included = d.bundleDetails?.includedServiceIds || [];
    return [
      {
        key: 'included',
        Icon: Package,
        path: '/service/bundle-included',
        ready: included.length > 0,
        text: included.length > 0 ? bundleIncludedValue(included) : 'Add included services',
      },
      {
        key: 'duration',
        Icon: CalendarDays,
        path: '/service/bundle-pricing',
        ready: Boolean(d.durationMin),
        text: d.durationMin ? formatDuration(d.durationMin) : 'Set bundle duration',
      },
    ];
  }

  if (d.type === 'subscription') {
    return [
      {
        key: 'benefits',
        Icon: Sparkles,
        path: '/service/subscription-benefits',
        ready: true,
        text: subscriptionBenefitValue(d),
      },
      {
        key: 'billing',
        Icon: CalendarDays,
        path: '/service/subscription-rules',
        ready: Boolean(d.price),
        text: d.price ? `Bills every ${billingPeriodLabel(d.subscriptionDetails?.billingPeriod)}` : 'Add billing',
      },
    ];
  }

  const rows = [
    {
      key: 'locations',
      Icon: MapPin,
      path: '/service/locations',
      ready: hasAnyLocation(d),
      text: hasAnyLocation(d) ? locationsValue(d) : 'Add locations',
    },
    {
      key: 'staff',
      Icon: Users,
      path: '/service/staff',
      // Class: ready depends on format — group needs a lead, private needs
      // at least one selected instructor. Other types: any team member.
      ready:
        d.type === 'class'
          ? d.classDetails?.format === 'private'
            ? (d.staff || []).length > 0
            : Boolean(d.leadInstructor)
          : d.staff.length > 0,
        text: d.type === 'class'
        ? staffValue(d, teamMembers)
        : (d.staff.length > 0 ? staffValue(d, teamMembers) : 'Add staff members'),
    },
  ];

  if (d.type === 'class') {
    const details = d.classDetails || {};
    const isPrivate = details.format === 'private';
    rows.push({
      key: 'schedule',
      Icon: CalendarDays,
      path: '/service/class-schedule',
      ready: isPrivate
        ? (details.availabilityWindows || []).length > 0
        : (details.scheduleBlocks || []).length > 0,
      text: scheduleValue(d),
    });
  }

  return rows;
}

function scheduleValue(d) {
  const details = d.classDetails || {};
  const isPrivate = details.format === 'private';

  if (isPrivate) {
    const windows = details.availabilityWindows || [];
    if (windows.length === 0) return 'Add availability windows';
    if (windows.length === 1) {
      const w = windows[0];
      return `${w.day} ${w.from}–${w.to}`;
    }
    return `${windows.length} availability windows`;
  }

  const blocks = details.scheduleBlocks || [];
  if (blocks.length === 0) {
    // Fall back to legacy schedule for back-compat with anything pre-rebuild
    return classDetailsValue(d);
  }
  if (blocks.length === 1) {
    const b = blocks[0];
    const days = (b.days || []).join(', ');
    return `${days} · ${b.time}`;
  }
  return `${blocks.length} schedule blocks`;
}

function locationsValue(d) {
  const parts = [];
  const inSalon = d.locations.inSalon;
  const isClass = d.type === 'class';

  // Class hybrid (in-person + livestream) shows as one combined chip.
  if (isClass && inSalon.enabled && d.locations.remote.enabled) {
    parts.push('Hybrid · in-person + stream');
    if (d.locations.mobile.enabled) parts.push('Mobile');
    return parts.join(' · ');
  }

  if (inSalon.enabled) {
    const ids = inSalon.locationIds || [];
    if (ids.length === 0) parts.push(isClass ? 'In-person' : 'In-salon');
    else if (ids.length === businessLocations.length) parts.push('All salons');
    else if (ids.length === 1) {
      parts.push(businessLocations.find((l) => l.id === ids[0])?.name || 'In-salon');
    } else {
      parts.push(`${ids.length} salons`);
    }
  }
  if (d.locations.mobile.enabled) parts.push('Mobile');
  if (d.locations.remote.enabled) parts.push(isClass ? 'Livestream' : 'Remote');
  return parts.join(' · ');
}

function staffValue(d, teamMembers = fallbackStaff) {
  if (d.type === 'class') {
    const isPrivate = d.classDetails?.format === 'private';
    if (isPrivate) {
      const ids = d.staff || [];
      if (ids.length === 0) return 'Pick instructors';
      if (ids.length === 1) {
        return teamMembers.find((s) => s.id === ids[0])?.name || '1 instructor';
      }
      return `${ids.length} instructors · customer picks`;
    }
    if (!d.leadInstructor) return 'Add a lead instructor';
    const lead = teamMembers.find((s) => s.id === d.leadInstructor);
    const supportCount = (d.advancedOptions?.additionalStaff || []).length;
    const leadName = lead?.name || 'Lead instructor';
    if (supportCount === 0) return leadName;
    return `${leadName} · +${supportCount} supporting`;
  }
  if (d.staff.length === 1) {
    return teamMembers.find((s) => s.id === d.staff[0])?.name || '1 person';
  }
  return `${d.staff.length} staff members`;
}

function classDetailsValue(d) {
  const details = d.classDetails || {};
  const capacityValue = details.capacity || d.capacity;
  const capacity = capacityValue ? `${capacityValue} spots` : 'Add capacity';
  const schedule = details.schedule || {};
  const r = schedule.recurrence || 'never';
  if (r === 'never') {
    return schedule.date ? `${capacity} · ${schedule.date} at ${schedule.time || ''}` : capacity;
  }
  if (r === 'weekly' || r === 'biweekly') {
    const days = schedule.days?.length ? schedule.days.join(', ') : '';
    const prefix = r === 'biweekly' ? 'Every 2 weeks' : 'Weekly';
    return `${capacity} · ${prefix}${days ? ' · ' + days : ''} at ${schedule.time || ''}`;
  }
  if (r === 'monthly') return `${capacity} · Monthly at ${schedule.time || ''}`;
  if (r === 'daily')   return `${capacity} · Daily at ${schedule.time || ''}`;
  if (r === 'yearly')  return `${capacity} · Yearly at ${schedule.time || ''}`;
  if (r === 'custom')  return `${capacity} · Every ${schedule.customInterval} ${schedule.customUnit}s`;
  return capacity;
}

function bundleIncludedValue(ids) {
  if (ids.length === 1) {
    return demoServices.find((item) => item.id === ids[0])?.name || '1 service';
  }
  return `${ids.length} included services`;
}

function subscriptionBenefitValue(d) {
  const details = d.subscriptionDetails || {};
  if (details.benefitType === 'discount') {
    return details.memberDiscountPercent ? `${details.memberDiscountPercent}% member discount` : 'Member discount';
  }
  if (details.benefitType === 'access') return 'Access pass';
  const count = details.includedSessions || d.includedPerPeriod || 1;
  return `${count} included session${Number(count) === 1 ? '' : 's'} per ${billingPeriodLabel(details.billingPeriod)}`;
}

function bundlePricingMeta(d) {
  const details = d.bundleDetails || {};
  if (details.priceMode === 'discount' && details.discountPercent) return `${details.discountPercent}% off included services`;
  if (d.price) return `Fixed price £${d.price}`;
  return 'Set package price or discount';
}

function subscriptionTermsMeta(d) {
  const details = d.subscriptionDetails || {};
  const parts = [];
  if (details.trialDays) parts.push(`${details.trialDays} day trial`);
  if (details.minimumTermMonths) parts.push(`${details.minimumTermMonths} month minimum`);
  parts.push(details.cancellationRule === 'after_term' ? 'Cancel after term' : 'Cancel anytime');
  return parts.join(' · ');
}

function modulesFor(d) {
  const variants = { key: 'variants', label: 'Variants', Icon: Layers, path: '/service/variants', meta: variantsMeta(d) };
  const shared = [
    { key: 'resources', label: 'Resources', Icon: Box, path: '/service/resources', meta: resourcesMeta(d) },
    { key: 'forms', label: d.type === 'class' ? 'Forms & waivers' : 'Forms', Icon: FileText, path: '/service/forms', meta: formsMeta(d) },
    { key: 'notifications', label: 'Notifications', Icon: Bell, path: '/service/notifications', meta: notificationsMeta(d) },
    { key: 'service-settings', label: `${offerTypeMeta(d.type).label} settings`, Icon: Settings2, path: '/service/settings', meta: serviceSettingsMeta(d) },
  ];

  if (d.type === 'class') {
    const showOnline = Boolean(d.locations?.remote?.enabled);
    const isPrivate = d.classDetails?.format === 'private';

    // Grouped layout: Offerings (the powerful stuff) and Settings (rules &
    // guardrails). Schedule + Staff already live on the top summary card.
    const offerings = [
      { key: 'packages', label: 'Packages', Icon: Layers, path: '/service/session-packs', meta: packagesMeta(d) },
      { key: 'pricing-tiers', label: 'Pricing tiers', Icon: Sparkles, path: '/service/pricing-tiers', meta: pricingTiersMeta(d) },
      { key: 'forms',     label: 'Forms & waivers', Icon: FileText, path: '/service/forms',     meta: formsMeta(d) },
      { key: 'resources', label: 'Resources',       Icon: Box,      path: '/service/resources', meta: resourcesMeta(d) },
    ];

    const settings = [
      // Capacity / waitlist only matter for public group classes — private
      // bookings use party size instead, set during the wizard.
      ...(!isPrivate ? [
        { key: 'class-schedule', label: 'Capacity & waitlist', Icon: Users, path: '/service/class-schedule', meta: capacityMeta(d) },
      ] : []),
      { key: 'requirements',  label: 'Requirements',  Icon: ListChecks, path: '/service/requirements',  meta: requirementsMeta(d) },
      { key: 'booking-rules', label: 'Booking rules', Icon: CalendarDays, path: '/service/booking-rules', meta: bookingRulesMeta(d) },
      { key: 'visibility',    label: 'Visibility',    Icon: Eye,        path: '/service/visibility',    meta: visibilityMeta(d) },
      { key: 'notifications', label: 'Notifications', Icon: Bell,       path: '/service/notifications', meta: notificationsMeta(d) },
      ...(showOnline ? [
        { key: 'online-link', label: 'Online class link', Icon: Video, path: '/service/online-link', meta: onlineLinkMeta(d) },
      ] : []),
      { key: 'service-settings', label: 'Class settings', Icon: Settings2, path: '/service/settings', meta: classSettingsMeta(d) },
    ];

    return {
      groups: [
        { title: 'Offerings', hint: 'Pricing & extras', items: offerings },
        { title: 'Settings',  hint: 'Rules & guardrails', items: settings },
      ],
    };
  }

  if (d.type === 'bundle') {
    return [
      variants,
      { key: 'included-services', label: 'Included services', Icon: Package, path: '/service/bundle-included', meta: { text: bundleIncludedValue(d.bundleDetails?.includedServiceIds || []), empty: !(d.bundleDetails?.includedServiceIds?.length) } },
      { key: 'bundle-pricing', label: 'Discount & order', Icon: Sparkles, path: '/service/bundle-pricing', meta: { text: bundlePricingMeta(d), empty: false } },
      ...shared,
    ];
  }

  if (d.type === 'subscription') {
    return [
      variants,
      { key: 'member-benefits', label: 'Member benefits', Icon: Sparkles, path: '/service/subscription-benefits', meta: { text: subscriptionBenefitValue(d), empty: false } },
      { key: 'subscription-rules', label: 'Terms & renewals', Icon: CalendarDays, path: '/service/subscription-rules', meta: { text: subscriptionTermsMeta(d), empty: false } },
      { key: 'forms', label: 'Terms & forms', Icon: FileText, path: '/service/forms', meta: formsMeta(d) },
      { key: 'notifications', label: 'Member notifications', Icon: Bell, path: '/service/notifications', meta: notificationsMeta(d) },
      { key: 'service-settings', label: 'Subscription settings', Icon: Settings2, path: '/service/settings', meta: serviceSettingsMeta(d) },
    ];
  }

  return [
    variants,
    { key: 'products', label: 'Products', Icon: Package, path: '/service/products', meta: productsMeta(d) },
    { key: 'related', label: 'Related services', Icon: Sparkles, path: '/service/related', meta: relatedMeta(d) },
    ...shared,
  ];
}

function depositValue(d) {
  if (!d.depositEnabled) return 'None';
  const amount = d.depositAmount || '—';
  return d.depositType === 'percent' ? `${amount}%` : `£${amount}`;
}

function cancellationValue(d) {
  const override = d.settings?.cancellation;
  const effective = override || businessDefaults.cancellation;
  const label = cancellationLabels[effective.type] || effective.type;
  return override ? label : `${label} (default)`;
}

const cancellationLabels = {
  flexible: 'Flexible',
  moderate: 'Moderate · 24h',
  strict: 'Strict · 48h',
  custom: 'Custom',
};

// Class pricing — unified row that subsumes ticket types, session packs and
// pricing variants. Reads the count of active tiers from advancedOptions.
function pricingTiersMeta(d) {
  const t = d.advancedOptions?.pricingTiers || {};
  const count =
    (t.earlyBird?.enabled ? 1 : 0) +
    (t.member?.enabled ? 1 : 0) +
    (t.course?.enabled ? 1 : 0);
  if (count === 0) return { text: 'Early bird, member, course — set tiered pricing', empty: true };
  return { text: `${count} tier${count === 1 ? '' : 's'} active`, empty: false };
}

// ── Per-section meta helpers for the class Advanced list ─────────────────
// Each returns { text, empty } so the dashboard row can show a short
// description in the empty state and a status string once configured.

// bookingRulesMeta + visibilityMeta now live inside Class settings and are
// surfaced as sub-rows there. They're kept here so Class settings can read a
// single source of truth for their chip text.

function bookingRulesMeta(d) {
  const r = d.advancedOptions?.bookingRules || {};
  const overrides =
    (r.open?.override   ? 1 : 0) +
    (r.close?.override  ? 1 : 0) +
    (r.cancel?.override ? 1 : 0);
  if (overrides === 0) return { text: 'Inherits from your business defaults', empty: true };
  return { text: `${overrides} rule${overrides === 1 ? '' : 's'} overridden`, empty: false };
}

function requirementsMeta(d) {
  const r = d.advancedOptions?.requirements || {};
  let count = 0;
  if (r.difficulty && r.difficulty !== 'none') count++;
  if (r.age?.enabled) count++;
  if (r.prerequisites?.enabled && r.prerequisites?.classIds?.length) count++;
  if (r.bring?.enabled && r.bring?.items?.length) count++;
  if (count === 0) return { text: 'Difficulty, age, prerequisites, what to bring', empty: true };
  return { text: `${count} attribute${count === 1 ? '' : 's'} set`, empty: false };
}

function visibilityMeta(d) {
  const v = d.advancedOptions?.visibility || 'public';
  if (v === 'private') return { text: 'Private — invite link only', empty: false };
  return { text: 'Public — listed on your booking page', empty: true };
}

function onlineLinkMeta(d) {
  const url = d.advancedOptions?.onlineLink?.url;
  if (!url) return { text: 'Paste your Zoom, Meet or Teams URL', empty: true };
  return { text: 'Link added', empty: false };
}

function packagesMeta(d) {
  const p = d.sessionPacks || [];
  if (p.length === 0) return { text: '5-pack, 10-pack — bulk-buy at a discount', empty: true };
  return { text: `${p.length} pack${p.length === 1 ? '' : 's'}`, empty: false };
}

function capacityMeta(d) {
  const details = d.classDetails || {};
  const cap = details.capacity || d.capacity;
  const min = details.minParticipants;
  const wait = details.waitlistEnabled ? 'waitlist on' : 'no waitlist';
  if (!cap) return { text: 'Set capacity, min, waitlist', empty: true };
  return {
    text: `${cap} spots${min ? ` · min ${min}` : ''} · ${wait}`,
    empty: false,
  };
}

function variantsMeta(d) {
  const v = d.variants || [];
  if (v.length === 0) return { text: 'Add variants', empty: true };
  const types = new Set(v.map((x) => x.type)).size;
  if (v.length >= 20) return { text: `${v.length} variants across ${types} types`, empty: false };
  return { text: `${v.length} variant${v.length === 1 ? '' : 's'}`, empty: false };
}

function productsMeta(d) {
  const p = d.products || [];
  if (p.length === 0) return { text: 'Link products clients choose at booking', empty: true };
  return { text: `${p.length} product group${p.length === 1 ? '' : 's'}`, empty: false };
}

function relatedMeta(d) {
  const r = d.related || [];
  if (r.length === 0) return { text: 'Bundle services that pair well', empty: true };
  return { text: `${r.length} group${r.length === 1 ? '' : 's'}`, empty: false };
}

function resourcesMeta(d) {
  const r = d.resources || [];
  if (r.length === 0) return { text: 'Pick spaces and equipment', empty: true };
  return { text: `${r.length} attached`, empty: false };
}

function formsMeta(d) {
  const f = d.forms || [];
  if (f.length === 0) return { text: 'Attach intake forms', empty: true };
  return { text: `${f.length} attached`, empty: false };
}

function notificationsMeta(d) {
  const count = d.notifications?.length || 0;
  if (count === 0) return { text: 'Using client notification defaults', empty: true };
  return { text: `${count} service rule${count === 1 ? '' : 's'}`, empty: false };
}

function serviceSettingsMeta(d) {
  const s = d.settings || {};
  const inheritedKeys = ['leadTime', 'maxAdvance', 'buffer', 'cancellation', 'paymentMethods', 'deposit'];
  const overrides = inheritedKeys.filter((key) => s[key] != null).length;
  if (overrides === 0) return { text: 'Using business defaults', empty: true };
  return { text: `${overrides} override${overrides === 1 ? '' : 's'}`, empty: false };
}

// Class settings houses cancellation policy and booking rules — a bucket
// of "set once, inherit from business defaults" operational overrides.
function classSettingsMeta(d) {
  const s = d.settings || {};
  const r = d.advancedOptions?.bookingRules || {};
  const settingsOverrides = ['leadTime', 'maxAdvance', 'buffer', 'cancellation', 'paymentMethods', 'deposit']
    .filter((key) => s[key] != null).length;
  const ruleOverrides =
    (r.open?.override   ? 1 : 0) +
    (r.close?.override  ? 1 : 0) +
    (r.cancel?.override ? 1 : 0);

  const total = settingsOverrides + ruleOverrides;
  if (total === 0) return { text: 'Cancellation, booking rules', empty: true };
  return { text: `${total} override${total === 1 ? '' : 's'}`, empty: false };
}
