import { createElement, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  ImageIcon,
  LockKeyhole,
  MoreHorizontal,
  Pause,
  Repeat,
  Settings2,
  Sparkles,
  TicketPercent,
  Users,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { demoServices } from '../data/demoServices';
import { billingPeriodLabel, emptySubscriptionDetails, offerTypeMeta } from '../data/offerTypes';
import NameSheet from './sheets/NameSheet';
import PriceSheet from './sheets/PriceSheet';
import FrequencyDashboard from './FrequencyDashboard';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'members', label: 'Members' },
  { key: 'billing', label: 'Billing' },
  { key: 'settings', label: 'Settings' },
];

const TYPE_LABELS = {
  frequency: 'Service frequency',
  credit: 'Store credit',
  membership: 'Membership benefits',
};

const availableOffers = demoServices.filter((item) => item.type === 'service' || item.type === 'class');

export default function SubscriptionDashboard() {
  const { draft } = useOutletContext();
  const subType = draft.subscriptionDetails?.subscriptionType || 'frequency';
  if (subType === 'frequency') return <FrequencyDashboard />;
  return <LegacySubscriptionDashboard />;
}

function LegacySubscriptionDashboard() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [sheet, setSheet] = useState(null);
  const meta = offerTypeMeta('subscription');
  const details = mergedSubscriptionDetails(draft);
  const readiness = subscriptionReadiness(draft, details);
  const includedOffers = availableOffers.filter((item) => details.includedItemIds.includes(item.id));

  const togglePublish = () => {
    const goingLive = draft.status !== 'published';
    if (goingLive && !readiness.canPublish) return;
    updateDraft({ status: goingLive ? 'published' : 'draft' });
  };

  const rows = useMemo(() => ({
    benefits: [
      {
        key: 'benefit',
        label: 'Benefit type',
        Icon: Sparkles,
        path: '/subscription/benefits',
        meta: benefitMeta(details),
        empty: !benefitReady(details),
      },
      {
        key: 'included',
        label: 'Included services / products',
        Icon: LockKeyhole,
        path: '/subscription/benefits',
        meta: includedOffers.length
          ? `${includedOffers.length} included offer${includedOffers.length === 1 ? '' : 's'}`
          : details.subscriptionType === 'credit'
            ? 'Credit can apply to services and products'
            : 'Choose what this membership unlocks',
        empty: includedOffers.length === 0 && details.subscriptionType !== 'credit',
      },
      {
        key: 'redemptions',
        label: 'Redemption limits',
        Icon: Repeat,
        path: '/subscription/rules',
        meta: redemptionMeta(details),
        empty: false,
      },
    ],
    billing: [
      {
        key: 'billing',
        label: 'Billing price & period',
        Icon: CreditCard,
        path: '/subscription/rules',
        meta: draft.price ? `£${draft.price} / ${billingPeriodLabel(details.billingPeriod)}` : 'Set billing price',
        empty: !draft.price,
      },
      {
        key: 'cooldown',
        label: 'Cooldown period',
        Icon: CalendarDays,
        path: '/subscription/rules',
        meta: details.cooldown?.enabled && details.cooldown?.value
          ? `${details.cooldown.value} days between redemptions`
          : 'No cooldown',
        empty: !details.cooldown?.enabled,
      },
      {
        key: 'pause',
        label: 'Pause rules',
        Icon: Pause,
        path: '/subscription/rules',
        meta: details.pauseRule?.enabled ? pauseMeta(details) : 'Pauses disabled',
        empty: !details.pauseRule?.enabled,
      },
      {
        key: 'cancellation',
        label: 'Cancellation notice',
        Icon: FileText,
        path: '/subscription/rules',
        meta: details.cancellationNotice?.value ? `${details.cancellationNotice.value} days notice` : cancellationLabel(details),
        empty: !details.cancellationNotice?.value,
      },
    ],
    settings: [
      { key: 'visibility', label: 'Visibility & access', Icon: Eye, path: '/subscription/visibility', meta: visibilityMeta(draft), empty: false },
      { key: 'forms', label: 'Forms & terms', Icon: FileText, path: '/subscription/forms', meta: formsMeta(draft), empty: !(draft.forms || []).length },
      { key: 'notifications', label: 'Member notifications', Icon: Bell, path: '/subscription/notifications', meta: notificationsMeta(draft), empty: !(draft.notifications || []).length },
      { key: 'settings', label: 'Subscription settings', Icon: Settings2, path: '/subscription/settings', meta: 'Booking access, payments, policies', empty: false },
    ],
  }), [details, draft, includedOffers.length]);

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate('/services')}
        rightAction={
          <button className="-mr-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" aria-label="More">
            <MoreHorizontal size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-2 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <button onClick={() => setSheet('name')} className="flex-1 min-w-0 text-left">
              <div className="text-[22px] leading-tight font-semibold tracking-tight truncate">
                {draft.name || meta.dashboardTitleFallback}
              </div>
              <div className="text-[13px] text-gray-400 mt-0.5 truncate">
                {draft.category || 'No category'} · {TYPE_LABELS[details.subscriptionType] || 'Subscription'}
              </div>
            </button>
            <button
              onClick={togglePublish}
              className={
                'px-3 py-1 rounded-full text-[12px] font-medium shrink-0 transition-colors ' +
                (draft.status === 'published'
                  ? 'bg-gray-900 text-white'
                  : readiness.canPublish
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400')
              }
            >
              {capitalise(draft.status)}
            </button>
          </div>
        </div>

        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' && (
          <>
            <ReadinessCard readiness={readiness} />
            <div className="px-5 pb-5 grid grid-cols-2 gap-3">
              <StatCard label="Monthly price" value={draft.price ? `£${draft.price}` : 'Missing'} onClick={() => setSheet('price')} />
              <StatCard label="Benefit" value={benefitMeta(details)} />
              <StatCard label="Included" value={details.subscriptionType === 'credit' ? creditValue(details) : `${includedOffers.length} offers`} />
              <StatCard label="Rules" value={rulesSnapshot(details)} />
            </div>
            <MembershipModel details={details} />
          </>
        )}

        {activeTab === 'benefits' && <RowList rows={rows.benefits} />}
        {activeTab === 'members' && <MembersPanel details={details} />}
        {activeTab === 'billing' && <RowList rows={rows.billing} />}
        {activeTab === 'settings' && <RowList rows={rows.settings} />}

        <div className="h-6" />
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/subscription/preview')}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={togglePublish}
          disabled={!readiness.canPublish && draft.status !== 'published'}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[15px] font-medium transition-colors"
        >
          {draft.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <NameSheet open={sheet === 'name'} onClose={() => setSheet(null)} />
      <PriceSheet open={sheet === 'price'} onClose={() => setSheet(null)} />
    </>
  );
}

function mergedSubscriptionDetails(draft) {
  const defaults = emptySubscriptionDetails();
  return {
    ...defaults,
    ...(draft.subscriptionDetails || {}),
    cooldown: { ...defaults.cooldown, ...(draft.subscriptionDetails?.cooldown || {}) },
    cancellationNotice: { ...defaults.cancellationNotice, ...(draft.subscriptionDetails?.cancellationNotice || {}) },
    pauseRule: { ...defaults.pauseRule, ...(draft.subscriptionDetails?.pauseRule || {}) },
    includedItemIds: draft.subscriptionDetails?.includedItemIds || draft.includedItemIds || [],
  };
}

function subscriptionReadiness(draft, details) {
  const issues = [];
  if (!draft.name?.trim()) issues.push('Add a subscription name');
  if (!draft.category) issues.push('Choose a category');
  if (!draft.price) issues.push('Set the billing price');
  if (!details.subscriptionType) issues.push('Choose a subscription type');
  if (!benefitReady(details)) issues.push('Set the included value or benefit');
  if (!details.billingPeriod) issues.push('Choose a billing period');
  return { canPublish: issues.length === 0, issues };
}

function benefitReady(details) {
  if (details.subscriptionType === 'credit') return Number(details.storeCreditAmount) > 0;
  if (details.subscriptionType === 'membership') {
    if (details.benefitType === 'access') return (details.includedItemIds || []).length > 0;
    return Number(details.memberDiscountPercent) > 0 || Number(details.productDiscountPercent) > 0;
  }
  return Boolean(details.unlimitedUsage || Number(details.includedSessions) > 0);
}

function benefitMeta(details) {
  if (details.subscriptionType === 'credit') return creditValue(details);
  if (details.subscriptionType === 'membership') {
    if (details.benefitType === 'access') return 'Member-only access';
    const parts = [];
    if (details.memberDiscountPercent) parts.push(`${details.memberDiscountPercent}% services`);
    if (details.productDiscountPercent) parts.push(`${details.productDiscountPercent}% products`);
    return parts.join(' · ') || 'Member discounts';
  }
  if (details.unlimitedUsage) return `Unlimited / ${details.frequencyPeriod || details.billingPeriod}`;
  return `${details.includedSessions || 0} redemption${Number(details.includedSessions) === 1 ? '' : 's'} / ${details.frequencyPeriod || details.billingPeriod}`;
}

function creditValue(details) {
  return details.storeCreditAmount ? `£${details.storeCreditAmount} credit` : 'Add store credit';
}

function redemptionMeta(details) {
  const parts = [];
  parts.push(benefitMeta(details));
  if (details.cooldown?.enabled && details.cooldown?.value) parts.push(`${details.cooldown.value}d cooldown`);
  if (details.rollover) parts.push('rollover on');
  return parts.join(' · ');
}

function pauseMeta(details) {
  const max = details.pauseRule?.maxDays ? `${details.pauseRule.maxDays} days max` : 'Allowed';
  const notice = details.pauseRule?.noticeDays ? `${details.pauseRule.noticeDays} days notice` : '';
  return [max, notice].filter(Boolean).join(' · ');
}

function cancellationLabel(details) {
  return details.cancellationRule === 'after_term' ? 'After minimum term' : 'Cancel anytime';
}

function rulesSnapshot(details) {
  const count = [
    details.cooldown?.enabled,
    details.rollover,
    details.pauseRule?.enabled,
    details.minimumTermMonths,
    details.cancellationNotice?.value,
  ].filter(Boolean).length;
  return count ? `${count} rule${count === 1 ? '' : 's'}` : 'Basic rules';
}

function visibilityMeta(draft) {
  return draft.advancedOptions?.visibility === 'private' ? 'Private invite link' : 'Public membership';
}

function formsMeta(draft) {
  const count = draft.forms?.length || 0;
  return count ? `${count} attached` : 'Terms, consent, sign-up questions';
}

function notificationsMeta(draft) {
  const count = draft.notifications?.length || 0;
  return count ? `${count} active` : 'Renewals, failures, member updates';
}

function MembershipModel({ details }) {
  const Icon = details.subscriptionType === 'credit'
    ? CreditCard
    : details.subscriptionType === 'membership'
      ? TicketPercent
      : Repeat;
  return (
    <div className="px-5 pb-5">
      <div className="rounded-3xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            {createElement(Icon, { size: 18, className: 'text-gray-700', strokeWidth: 1.75 })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-gray-900">{TYPE_LABELS[details.subscriptionType]}</div>
            <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
              {details.subscriptionType === 'credit'
                ? 'Members receive spendable credit each billing period.'
                : details.subscriptionType === 'membership'
                  ? 'Members receive discounts, perks, or restricted access.'
                  : 'Members redeem selected services at a fixed frequency.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersPanel({ details }) {
  const mockMembers = [
    { name: 'Amelia Hart', meta: details.subscriptionType === 'credit' ? '£22 credit left' : '1 redemption used' },
    { name: 'Priya Shah', meta: details.subscriptionType === 'membership' ? 'Member discount active' : 'Renews in 9 days' },
  ];
  return (
    <div className="px-5 pb-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Active members" value="24" />
        <StatCard label="This month" value="38 redemptions" />
      </div>
      <div className="rounded-3xl border border-gray-100 overflow-hidden">
        {mockMembers.map((member) => (
          <div key={member.name} className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 first:border-t-0">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Users size={17} className="text-gray-700" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] text-gray-900">{member.name}</div>
              <div className="text-[13px] text-gray-500 mt-0.5">{member.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessCard({ readiness }) {
  return (
    <div className="px-5 pb-5">
      <div className="rounded-3xl border border-gray-100 p-5 flex items-start gap-3">
        <div className={'w-9 h-9 rounded-full flex items-center justify-center shrink-0 ' + (readiness.canPublish ? 'bg-gray-900 text-white' : 'bg-amber-50 text-amber-700')}>
          {readiness.canPublish ? <Check size={17} strokeWidth={2.5} /> : <AlertCircle size={17} strokeWidth={1.75} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-gray-900">
            {readiness.canPublish ? 'Ready to publish' : 'Setup needs attention'}
          </div>
          <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
            {readiness.canPublish ? 'Subscription setup is complete.' : readiness.issues[0]}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="px-5 pb-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-gray-100 rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={
              'shrink-0 h-10 px-4 rounded-xl text-[13px] font-medium transition-colors ' +
              (active === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RowList({ rows }) {
  const navigate = useNavigate();
  return (
    <div className="mx-5 mb-5 rounded-3xl border border-gray-100 overflow-hidden">
      {rows.map(({ key, label, Icon, path, meta, empty }) => (
        <button
          key={key}
          onClick={() => navigate(path)}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            {createElement(Icon, { size: 18, className: 'text-gray-700', strokeWidth: 1.75 })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] text-gray-900">{label}</div>
            <div className={'text-[13px] truncate mt-0.5 ' + (empty ? 'text-gray-400' : 'text-gray-500')}>{meta}</div>
          </div>
          <ChevronRight size={18} className="text-gray-400 shrink-0" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className="rounded-2xl bg-gray-50 p-4 text-left">
      <div className="text-[12px] text-gray-500">{label}</div>
      <div className="text-[16px] font-semibold text-gray-900 mt-1 truncate">{value}</div>
    </Comp>
  );
}

function capitalise(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
