import { createElement, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Pause,
  Repeat,
  Search,
  Settings2,
  User,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { demoServices } from '../data/demoServices';
import { billingPeriodLabel, emptySubscriptionDetails, offerTypeMeta } from '../data/offerTypes';
import NameSheet from './sheets/NameSheet';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'settings', label: 'Settings' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'cancelling', label: 'Cancelling' },
];

const MOCK_SUBSCRIBERS = [
  { id: 'm1', name: 'Amelia Hart', status: 'active', used: 2, total: 4, renews: '12 Jun', joined: '4 Mar' },
  { id: 'm2', name: 'Priya Shah', status: 'active', used: 4, total: 4, renews: '18 Jun', joined: '18 Apr' },
  { id: 'm3', name: 'James O’Connor', status: 'active', used: 1, total: 4, renews: '24 Jun', joined: '24 Feb' },
  { id: 'm4', name: 'Sofia Reyes', status: 'paused', used: 0, total: 4, renews: 'Paused', joined: '8 Jan' },
  { id: 'm5', name: 'Marcus Lee', status: 'cancelling', used: 3, total: 4, renews: 'Ends 30 Jun', joined: '10 Nov' },
  { id: 'm6', name: 'Hannah Wright', status: 'active', used: 0, total: 4, renews: '2 Jul', joined: '2 May' },
];

const availableItems = demoServices.filter((item) => item.type === 'service' || item.type === 'class');

export default function FrequencyDashboard() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [sheet, setSheet] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const meta = offerTypeMeta('subscription');
  const details = mergedFrequencyDetails(draft);
  const readiness = frequencyReadiness(draft, details);
  const includedItems = availableItems.filter((item) => details.includedItemIds.includes(item.id));

  const togglePublish = () => {
    const goingLive = draft.status !== 'published';
    if (goingLive && !readiness.canPublish) return;
    updateDraft({ status: goingLive ? 'published' : 'draft' });
  };

  const rows = useMemo(() => ({
    overview: [
      {
        key: 'sessions',
        label: 'Included sessions',
        Icon: Repeat,
        meta: sessionsMeta(details, includedItems),
        empty: !details.unlimitedUsage && !Number(details.includedSessions),
        onClick: () => navigate('/subscription/frequency-sessions'),
      },
      {
        key: 'billing',
        label: 'Billing & rules',
        Icon: CreditCard,
        meta: billingMeta(draft, details),
        empty: !draft.price,
        onClick: () => navigate('/subscription/frequency-billing'),
      },
    ],
    settings: [
      { key: 'visibility', label: 'Visibility & access', Icon: Eye, path: '/subscription/visibility', meta: visibilityMeta(draft) },
      { key: 'forms', label: 'Forms & terms', Icon: FileText, path: '/subscription/forms', meta: formsMeta(draft), empty: !(draft.forms || []).length },
      { key: 'notifications', label: 'Member notifications', Icon: Bell, path: '/subscription/notifications', meta: notificationsMeta(draft), empty: !(draft.notifications || []).length },
      { key: 'settings', label: 'Subscription settings', Icon: Settings2, path: '/subscription/settings', meta: 'Booking access, payments, policies' },
    ],
  }), [details, draft, includedItems, navigate]);

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
                {draft.category || 'No category'} · Service frequency
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
            <RowList rows={rows.overview} />
          </>
        )}

        {activeTab === 'subscribers' && (
          <SubscribersPanel
            details={details}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
          />
        )}

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
    </>
  );
}

function mergedFrequencyDetails(draft) {
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

function frequencyReadiness(draft, details) {
  const issues = [];
  if (!draft.name?.trim()) issues.push('Add a subscription name');
  if (!draft.category) issues.push('Choose a category');
  if (!(details.includedItemIds || []).length) issues.push('Pick at least one included service');
  if (!details.unlimitedUsage && !Number(details.includedSessions)) issues.push('Set how many sessions per period');
  if (!draft.price) issues.push('Set the billing price');
  return { canPublish: issues.length === 0, issues };
}

function sessionsMeta(details, includedItems) {
  const period = billingPeriodLabel(details.billingPeriod);
  const count = details.unlimitedUsage
    ? `Unlimited / ${period}`
    : `${details.includedSessions || 0} / ${period}`;
  if (!includedItems.length) return `${count} · Add services`;
  const names = includedItems.slice(0, 2).map((item) => item.name).join(', ');
  const extra = includedItems.length > 2 ? ` +${includedItems.length - 2}` : '';
  return `${count} · ${names}${extra}`;
}

function billingMeta(draft, details) {
  if (!draft.price) return 'Set the billing price';
  const period = billingPeriodLabel(details.billingPeriod);
  const parts = [`£${draft.price} / ${period}`];
  if (details.minimumTermMonths) parts.push(`${details.minimumTermMonths} mo min`);
  if (details.cancellationRule === 'after_term') parts.push('cancel after term');
  else if (details.cancellationNotice?.value) parts.push(`${details.cancellationNotice.value}d notice`);
  return parts.join(' · ');
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

function SubscribersPanel({ details, statusFilter, onStatusChange, search, onSearchChange }) {
  const filtered = MOCK_SUBSCRIBERS.filter((member) => {
    if (statusFilter !== 'all' && member.status !== statusFilter) return false;
    if (search && !member.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = MOCK_SUBSCRIBERS.filter((m) => m.status === 'active').length;
  const paused = MOCK_SUBSCRIBERS.filter((m) => m.status === 'paused').length;
  const cancelling = MOCK_SUBSCRIBERS.filter((m) => m.status === 'cancelling').length;
  const usedThisPeriod = MOCK_SUBSCRIBERS.reduce((sum, m) => sum + m.used, 0);

  return (
    <div className="px-5 pb-5 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <SmallStat label="Active" value={active} />
        <SmallStat label="Paused" value={paused} muted />
        <SmallStat label="Cancelling" value={cancelling} muted />
      </div>

      <div className="rounded-2xl bg-gray-50 px-4 py-3 flex items-center gap-3">
        <Search size={16} className="text-gray-400 shrink-0" strokeWidth={2} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search subscribers"
          className="flex-1 bg-transparent outline-none text-[14px] text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onStatusChange(filter.key)}
            className={
              'shrink-0 h-8 px-3 rounded-full text-[12px] font-medium transition-colors ' +
              (statusFilter === filter.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="text-[12px] text-gray-500">
        {filtered.length} subscriber{filtered.length === 1 ? '' : 's'} · {usedThisPeriod} redemption{usedThisPeriod === 1 ? '' : 's'} this period
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <div className="text-[14px] text-gray-500">No subscribers match this filter.</div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 overflow-hidden">
          {filtered.map((member) => (
            <SubscriberRow key={member.id} member={member} details={details} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriberRow({ member, details }) {
  const unlimited = Boolean(details.unlimitedUsage);
  const usageLabel = unlimited
    ? `${member.used} redemption${member.used === 1 ? '' : 's'} this period`
    : `${member.used} of ${member.total} used`;
  const renewsLabel = member.status === 'paused'
    ? 'Paused'
    : member.status === 'cancelling'
      ? member.renews
      : `Renews ${member.renews}`;
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <User size={17} className="text-gray-600" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[15px] font-medium text-gray-900 truncate">{member.name}</div>
          <StatusBadge status={member.status} />
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5 truncate">
          {usageLabel} · {renewsLabel}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === 'paused') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
        <Pause size={10} strokeWidth={2.25} /> Paused
      </span>
    );
  }
  if (status === 'cancelling') {
    return (
      <span className="text-[11px] font-medium text-gray-700 bg-gray-100 rounded-full px-2 py-0.5">Cancelling</span>
    );
  }
  return null;
}

function SmallStat({ label, value, muted }) {
  return (
    <div className={'rounded-2xl p-3 text-left ' + (muted ? 'bg-gray-50' : 'bg-gray-900')}>
      <div className={'text-[11px] ' + (muted ? 'text-gray-500' : 'text-white/60')}>{label}</div>
      <div className={'text-[18px] font-semibold mt-0.5 ' + (muted ? 'text-gray-900' : 'text-white')}>{value}</div>
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
      <div className="flex bg-gray-100 rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={
              'flex-1 h-10 rounded-xl text-[13px] font-medium transition-colors ' +
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
      {rows.map(({ key, label, Icon, path, onClick, meta, empty }) => (
        <button
          key={key}
          onClick={onClick || (() => navigate(path))}
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

function capitalise(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
