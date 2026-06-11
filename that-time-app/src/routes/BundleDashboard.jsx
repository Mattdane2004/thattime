import { createElement, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Box,
  Check,
  ChevronRight,
  FileText,
  ImageIcon,
  ListChecks,
  MoreHorizontal,
  Percent,
  Repeat,
  Scissors,
  Settings2,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { demoServices } from '../data/demoServices';
import { emptyBundleDetails, offerTypeMeta } from '../data/offerTypes';
import NameSheet from './sheets/NameSheet';
import { BundleOrderEditor } from './wizard/BundleOrderGaps';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'advanced', label: 'Advanced' },
];

const sourceServices = demoServices.filter((item) => item.type === 'service');

export default function BundleDashboard() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [sheet, setSheet] = useState(null);
  const meta = offerTypeMeta('bundle');
  const details = mergedBundleDetails(draft);
  const included = details.includedServiceIds
    .map((id) => sourceServices.find((item) => item.id === id))
    .filter(Boolean);
  const readiness = bundleReadiness(draft, details);
  const bundleKind = details.bundleKind || 'services';
  const quantity = Math.max(1, Number(details.quantity) || 1);
  const minimumSelections = Math.max(1, Number(details.minimumSelections) || 3);
  const sourceTotal = bundleKind === 'pack'
    ? (Number(included[0]?.price) || 0) * quantity
    : included.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const togglePublish = () => {
    const goingLive = draft.status !== 'published';
    if (goingLive && !readiness.canPublish) return;
    updateDraft({ status: goingLive ? 'published' : 'draft' });
  };

  const rows = useMemo(() => ({
    overview: [
      {
        key: 'price',
        label: 'Price',
        Icon: Percent,
        meta: bundlePriceMeta(draft, details, sourceTotal),
        empty: !draft.price && !details.discountPercent,
        onClick: () => navigate('/bundle/pricing'),
      },
      {
        key: 'services',
        label: bundleKind === 'package' ? 'Eligible services' : bundleKind === 'pack' ? 'Session pack' : 'Included services',
        Icon: bundleKind === 'package' ? ListChecks : bundleKind === 'pack' ? Repeat : Scissors,
        meta: includedMeta(included, bundleKind, bundleKind === 'package' ? minimumSelections : quantity),
        empty: included.length === 0,
        onClick: () => navigate('/bundle/services'),
      },
    ],
    settings: [
      { key: 'forms', label: 'Forms inherited from services', Icon: FileText, path: '/bundle/forms', meta: inheritedMeta(included, 'forms'), empty: true },
      { key: 'resources', label: 'Resources inherited from services', Icon: Box, path: '/bundle/resources', meta: inheritedMeta(included, 'resources'), empty: true },
      { key: 'settings', label: 'Bundle settings', Icon: Settings2, path: '/bundle/settings', meta: 'Booking rules, payments, policies', empty: true },
    ],
  }), [bundleKind, details, draft, included, navigate, quantity, sourceTotal]);

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
                {draft.category || 'No category'} · Bundle
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
            {included.length > 0 && (
              <div className="px-5 pb-5">
                <div className="mb-3">
                  <div className="text-[15px] font-semibold text-gray-900">
                    {bundleKind === 'package' ? 'Default order & timing' : bundleKind === 'pack' ? 'Session pack' : 'Order & gaps'}
                  </div>
                  <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
                    {bundleKind === 'package'
                      ? 'Used after the customer chooses services from the package.'
                      : bundleKind === 'pack'
                        ? 'Clients redeem each session as a separate booking.'
                        : 'Drag services into order and tap between them to add a gap, overlap, or separate visit.'}
                  </div>
                </div>
                <BundleOrderEditor />
              </div>
            )}
            <CompatibilityWarnings included={included} bundleKind={bundleKind} />
          </>
        )}

        {activeTab === 'advanced' && <RowList rows={rows.settings} />}

        <div className="h-6" />
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/bundle/preview')}
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

function mergedBundleDetails(draft) {
  const defaults = emptyBundleDetails();
  return {
    ...defaults,
    ...(draft.bundleDetails || {}),
    includedServiceIds: draft.bundleDetails?.includedServiceIds || draft.includedServiceIds || [],
    discountPercent: draft.bundleDetails?.discountPercent || draft.discountPercent || '',
  };
}

function bundleReadiness(draft, details) {
  const issues = [];
  if (!draft.name?.trim()) issues.push('Add a bundle name');
  if (!draft.category) issues.push('Choose a category');
  if (!details.includedServiceIds.length) issues.push('Add at least one included service');
  if (details.bundleKind === 'package') {
    const tiers = normalisePackageTiers(details);
    if (!tiers.length || tiers.some((tier) => !isValidPackageTier(tier, details.includedServiceIds.length))) {
      issues.push('Set package discount tiers');
    }
  } else {
    if (details.priceMode === 'discount' && !details.discountPercent) issues.push('Set the discount');
    if (details.priceMode !== 'discount' && !draft.price) issues.push('Set the bundle price');
  }
  return { canPublish: issues.length === 0, issues };
}

function bundlePriceMeta(draft, details, sourceTotal) {
  if (details.bundleKind === 'package') {
    const tiers = normalisePackageTiers(details).filter((tier) => isValidPackageTier(tier, details.includedServiceIds?.length || 0));
    return tiers.length
      ? tiers.map((tier) => `${tier.minimumSelections}+ for ${tier.discountPercent}% off`).join(' · ')
      : 'Set package discount';
  }
  if (details.priceMode === 'discount') {
    return details.discountPercent
      ? `${details.discountPercent}% off · list value £${sourceTotal || 0}`
      : 'Add discount percent';
  }
  return draft.price ? `Fixed bundle price £${draft.price}` : 'Add fixed price';
}

function normalisePackageTiers(details = {}) {
  if (Array.isArray(details.packageTiers) && details.packageTiers.length) {
    return details.packageTiers.map((tier) => ({
      minimumSelections: tier.minimumSelections ?? '',
      discountPercent: tier.discountPercent ?? '',
    }));
  }
  return [{
    minimumSelections: details.minimumSelections || 3,
    discountPercent: details.packageDiscountPercent || '',
  }];
}

function isValidPackageTier(tier, eligibleCount) {
  const minimum = Number(tier.minimumSelections);
  return minimum > 0 && minimum <= eligibleCount && Boolean(tier.discountPercent);
}

function inheritedMeta(included, key) {
  if (!included.length) return 'Add services first';
  return `Review ${key} inherited from ${included.length} service${included.length === 1 ? '' : 's'}`;
}

function includedMeta(included, bundleKind, quantity) {
  if (!included.length) return 'Add services to this bundle';
  if (bundleKind === 'package') return `${included.length} eligible · choose ${quantityLabel(included, quantity)}`;
  if (bundleKind === 'pack') return `${quantity} x ${included[0].name}`;
  const names = included.slice(0, 2).map((item) => item.name).join(', ');
  const extra = included.length > 2 ? ` +${included.length - 2} more` : '';
  return `${included.length} selected · ${names}${extra}`;
}

function quantityLabel(included, quantity) {
  return `${Math.min(quantity || 3, included.length)}+`;
}

function CompatibilityWarnings({ included, bundleKind }) {
  if (bundleKind === 'pack' || included.length < 2) return null;
  const staffSets = included.map((item) => new Set(item.staff || []));
  const sharedStaff = [...staffSets[0]].filter((id) => staffSets.every((set) => set.has(id)));
  const locationSets = included.map((item) => new Set(item.locations?.inSalon?.locationIds || []));
  const sharedLocations = [...locationSets[0]].filter((id) => locationSets.every((set) => set.has(id)));
  if (sharedStaff.length > 0 && sharedLocations.length > 0) return null;
  return (
    <div className="px-5 pb-5">
      <div className="rounded-3xl bg-amber-50 border border-amber-100 p-4">
        <div className="flex gap-3">
          <AlertCircle size={17} className="text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <div className="text-[14px] font-medium text-amber-950">Compatibility warning</div>
            <div className="text-[13px] text-amber-800 mt-0.5 leading-snug">
              Some included services may not share the same staff or locations. Clients can still book, but review availability before publishing.
            </div>
          </div>
        </div>
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
            {readiness.canPublish ? 'Bundle setup is complete.' : readiness.issues[0]}
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
