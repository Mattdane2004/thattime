import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { createElement } from 'react';
import {
  ChevronLeft,
  Clock,
  MapPin,
  Users as UsersIcon,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  Video,
  Car,
  Package,
  CalendarDays,
} from 'lucide-react';
import { staff as fallbackStaff } from '../data/staff';
import { businessLocations } from '../data/business';
import { businessDefaults } from '../data/businessDefaults';
import { formatDuration } from '../components/DurationPicker';
import { demoServices } from '../data/demoServices';
import { billingPeriodLabel, offerTypeMeta } from '../data/offerTypes';
import { offerBasePath } from './routeBase';

const cancellationLabels = {
  flexible: 'Flexible — cancel anytime',
  moderate: 'Moderate — cancel 24h before',
  strict: 'Strict — cancel 48h before',
  custom: 'Custom policy',
};

function effectiveCancellation(draft) {
  const override = draft.settings?.cancellation;
  return override || businessDefaults.cancellation;
}

function effectivePaymentMethods(draft) {
  return draft.settings?.paymentMethods || businessDefaults.paymentMethods;
}

function Section({ title, children }) {
  return (
    <div className="px-5 pb-6">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ServicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, teamMembers = fallbackStaff } = useOutletContext();
  const meta = offerTypeMeta(draft.type);
  const returnPath = offerBasePath(draft, location);

  const assignedStaff = (draft.staff || [])
    .map((id) => teamMembers.find((s) => s.id === id))
    .filter(Boolean);

  const inSalon = draft.locations?.inSalon;
  const assignedLocations = inSalon?.enabled
    ? (inSalon.locationIds.length > 0
        ? businessLocations.filter((l) => inSalon.locationIds.includes(l.id))
        : businessLocations)
    : [];

  const mobileOn = draft.locations?.mobile?.enabled;
  const remoteOn = draft.locations?.remote?.enabled;

  const cancel = effectiveCancellation(draft);
  const pay = effectivePaymentMethods(draft);
  const showDeposit =
    draft.depositEnabled && draft.depositAmount
      ? `£${draft.depositAmount} deposit at booking`
      : null;

  const priceText = draft.price ? `£${draft.price}` : 'Free';
  const durationText = formatDuration(draft.durationMin || 0);

  const hasVariants = (draft.variants || []).length > 0;
  const hasProducts = (draft.products || []).length > 0;
  const hasRelated = (draft.related || []).length > 0;

  return (
    <>
      {/* Custom header — this is client-view so hide the usual admin ScreenHeader */}
      <div className="shrink-0 flex items-center justify-between px-5 h-14 bg-white">
        <button
          onClick={() => navigate(returnPath)}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Client preview
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {/* Hero image */}
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <ImageIcon size={32} className="text-gray-300" strokeWidth={1.5} />
        </div>

        {/* Title block */}
        <div className="px-5 pt-5 pb-4">
          {draft.category && (
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
              {draft.category}
            </div>
          )}
          <div className="text-[24px] font-semibold tracking-tight text-gray-900 leading-tight">
            {draft.name || meta.dashboardTitleFallback}
          </div>
          <div className="flex items-center gap-3 mt-3">
            {draft.type !== 'subscription' && (
              <>
                <div className="flex items-center gap-1.5 text-[14px] text-gray-700">
                  <Clock size={14} className="text-gray-400" strokeWidth={2} />
                  {durationText}
                </div>
                <div className="text-gray-300">·</div>
              </>
            )}
            <div className="text-[16px] font-semibold text-gray-900">
              {draft.type === 'subscription'
                ? `${priceText} / ${billingPeriodLabel(draft.subscriptionDetails?.billingPeriod)}`
                : priceText}
            </div>
          </div>
        </div>

        {/* Description */}
        {draft.description && (
          <div className="px-5 pb-6">
            <div className="text-[14px] text-gray-700 leading-relaxed">{draft.description}</div>
          </div>
        )}

        <div className="h-px bg-gray-100 mx-5" />

        {draft.type === 'class' && (
          <>
            <div className="pt-6" />
            <Section title="Class details">
              <InfoTile icon={CalendarDays} title="Schedule" text={classScheduleText(draft)} />
              <div className="h-2" />
              <InfoTile icon={UsersIcon} title="Capacity" text={classCapacityText(draft)} />
            </Section>
          </>
        )}

        {draft.type === 'bundle' && (
          <>
            <div className="pt-6" />
            <Section title={bundleSectionTitle(draft)}>
              <div className="space-y-2">
                {bundleItems(draft).map((item) => (
                  <InfoTile
                    key={item.id}
                    icon={Package}
                    title={item.name}
                    text={bundleItemText(draft, item)}
                  />
                ))}
              </div>
            </Section>
          </>
        )}

        {draft.type === 'subscription' && (
          <>
            <div className="pt-6" />
            <Section title="Membership">
              <InfoTile icon={Sparkles} title="Benefit" text={subscriptionBenefitText(draft)} />
              <div className="h-2" />
              <InfoTile icon={CalendarDays} title="Billing" text={subscriptionBillingText(draft)} />
            </Section>
          </>
        )}

        {/* Staff */}
        {draft.type !== 'bundle' && draft.type !== 'subscription' && assignedStaff.length > 0 && (
          <>
            <div className="pt-6" />
            <Section title="With">
              <div className="space-y-1">
                {assignedStaff.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <UsersIcon size={14} className="text-gray-600" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-gray-900">{s.name}</div>
                      <div className="text-[12px] text-gray-500">{s.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Location options */}
        {draft.type !== 'bundle' && draft.type !== 'subscription' && (assignedLocations.length > 0 || mobileOn || remoteOn) && (
          <Section title="Where">
            <div className="space-y-2">
              {assignedLocations.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <MapPin size={16} className="text-gray-600 shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-gray-900">{l.name}</div>
                    <div className="text-[12px] text-gray-500 truncate">{l.address}</div>
                  </div>
                </div>
              ))}
              {mobileOn && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                  <Car size={16} className="text-gray-600 shrink-0" strokeWidth={1.75} />
                  <div className="text-[14px] text-gray-900">We come to you</div>
                </div>
              )}
              {remoteOn && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                  <Video size={16} className="text-gray-600 shrink-0" strokeWidth={1.75} />
                  <div className="text-[14px] text-gray-900">Online (video call)</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Variants preview — just naming them so the client sees the options */}
        {hasVariants && (
          <Section title="Options">
            <div className="space-y-2">
              {draft.variants.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <div className="text-[14px] text-gray-900">{v.name || v.type || 'Variant'}</div>
                  {v.priceAdjustment && (
                    <div className="text-[13px] text-gray-500">+£{v.priceAdjustment}</div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Related service suggestions */}
        {hasRelated && (
          <Section title="Pairs well with">
            <div className="space-y-2">
              {draft.related.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <Sparkles size={16} className="text-gray-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-gray-900">{g.name}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">
                      {(g.serviceIds || []).length} services
                      {g.discountMode === 'percent' && g.discountAmount ? ` · ${g.discountAmount}% off` : ''}
                      {g.discountMode === 'flat' && g.discountAmount ? ` · £${g.discountAmount} off` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Product add-ons at booking */}
        {hasProducts && (
          <Section title="At booking">
            <div className="space-y-2">
              {draft.products.map((p) => (
                <div key={p.id} className="bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="text-[13px] text-gray-900">{p.question || 'Choose an option'}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {p.selectionType === 'multi' ? 'Pick one or more' : 'Pick one'}
                    {p.required ? '' : ' · Optional'}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Policies */}
        <Section title="Good to know">
          <div className="space-y-2">
            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <ShieldCheck size={16} className="text-gray-600 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-gray-900">Cancellation</div>
                <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                  {cancel.type === 'custom' && cancel.customText
                    ? cancel.customText
                    : cancellationLabels[cancel.type] || cancellationLabels.moderate}
                </div>
              </div>
            </div>
            {showDeposit && (
              <div className="bg-gray-50 rounded-2xl px-4 py-3">
                <div className="text-[13px] text-gray-900">Deposit</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{showDeposit}</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <div className="text-[13px] text-gray-900">Payment</div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                Accepts{' '}
                {Object.entries(pay)
                  .filter(([, on]) => on)
                  .map(([k]) =>
                    ({ card: 'card', cash: 'cash', transfer: 'bank transfer', bnpl: 'BNPL' }[k] || k)
                  )
                  .join(', ')}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Sticky book-now CTA (fake — this is a preview) */}
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            From
          </div>
          <div className="text-[18px] font-semibold text-gray-900">
            {draft.type === 'subscription'
              ? `${priceText} / ${billingPeriodLabel(draft.subscriptionDetails?.billingPeriod)}`
              : priceText}
          </div>
        </div>
        <button
          disabled
          className="flex-1 h-12 rounded-full bg-gray-900 text-white text-[15px] font-medium opacity-90 cursor-not-allowed"
        >
          {draft.type === 'subscription' ? 'Join now' : 'Book now'}
        </button>
      </div>
    </>
  );
}

function InfoTile({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3">
      {createElement(Icon, { size: 16, className: 'text-gray-600 shrink-0 mt-0.5', strokeWidth: 1.75 })}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{text}</div>
      </div>
    </div>
  );
}

function classCapacityText(draft) {
  const details = draft.classDetails || {};
  const parts = [];
  if (details.capacity || draft.capacity) parts.push(`${details.capacity || draft.capacity} spots`);
  if (details.minParticipants) parts.push(`${details.minParticipants} minimum`);
  if (details.waitlistEnabled) parts.push('waitlist available');
  return parts.join(' · ') || 'Capacity set by the business';
}

function classScheduleText(draft) {
  const schedule = draft.classDetails?.schedule || {};
  if (schedule.mode === 'recurring') {
    const days = schedule.days?.length ? schedule.days.join(', ') : 'selected days';
    return `${days} at ${schedule.time || 'time set by the business'}`;
  }
  if (schedule.date) return `${schedule.date} at ${schedule.time || 'time set by the business'}`;
  return 'Schedule set by the business';
}

function bundleItems(draft) {
  const ids = draft.bundleDetails?.includedServiceIds || draft.includedServiceIds || [];
  return ids
    .map((id) => demoServices.find((item) => item.id === id))
    .filter(Boolean);
}

function bundleItemText(draft, item) {
  const details = draft.bundleDetails || {};
  if (details.bundleKind === 'package') {
    return `${formatDuration(item.durationMin || 0)} · eligible choice · ${item.price ? `£${item.price}` : 'Free'}`;
  }
  if (details.bundleKind === 'pack') {
    const quantity = Math.max(1, Number(details.quantity) || 1);
    return `${quantity} sessions · ${formatDuration(item.durationMin || 0)} each · ${item.price ? `£${item.price} each` : 'Free'}`;
  }
  return `${formatDuration(item.durationMin || 0)} · ${item.price ? `£${item.price}` : 'Free'}`;
}

function bundleSectionTitle(draft) {
  const kind = draft.bundleDetails?.bundleKind;
  if (kind === 'package') return 'Eligible services';
  if (kind === 'pack') return 'Session pack';
  return 'Included';
}

function subscriptionBenefitText(draft) {
  const details = draft.subscriptionDetails || {};
  if (details.benefitType === 'discount') {
    return details.memberDiscountPercent ? `${details.memberDiscountPercent}% off selected offers` : 'Member discount';
  }
  if (details.benefitType === 'access') return 'Subscriber-only access';
  const count = details.includedSessions || draft.includedPerPeriod || 1;
  return `${count} session${Number(count) === 1 ? '' : 's'} per ${billingPeriodLabel(details.billingPeriod)}`;
}

function subscriptionBillingText(draft) {
  const details = draft.subscriptionDetails || {};
  const parts = [`£${draft.price || 0} every ${billingPeriodLabel(details.billingPeriod)}`];
  if (details.trialDays) parts.push(`${details.trialDays} day trial`);
  if (details.minimumTermMonths) parts.push(`${details.minimumTermMonths} month minimum`);
  return parts.join(' · ');
}
