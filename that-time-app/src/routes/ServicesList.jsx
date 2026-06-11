import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Scissors, Users, Package, Repeat, ChevronRight } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Pill from '../components/Pill';
import {
  demoServices,
  statusFor,
  metaFor,
  SERVICE_TYPES,
  EMPTY_STATE_COPY,
} from '../data/demoServices';
import { emptyBundleDetails } from '../data/offerTypes';

const ICON_FOR_TYPE = {
  service: Scissors,
  class: Users,
  bundle: Package,
  subscription: Repeat,
};

export default function ServicesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDraft, updateDraft, resetDraft, savedOffers = [] } = useOutletContext();
  const initialType = new URLSearchParams(location.search).get('type');
  const [tab, setTab] = useState(SERVICE_TYPES.some((type) => type.key === initialType) ? initialType : 'service');
  const [category, setCategory] = useState('all');

  const switchTab = (t) => {
    setTab(t);
    setCategory('all'); // reset category when switching type
  };

  const handleNew = () => {
    resetDraft();
    navigate('/new');
  };

  const createByType = (type) => {
    resetDraft();
    updateDraft({ type });
    navigate(type === 'class' ? '/new/basics?type=class' : '/new/basics');
  };

  const openService = (service) => {
    setDraft(normalizeDraft(service));
    navigate({
      class: '/class',
      bundle: '/bundle',
      subscription: '/subscription',
    }[service.type] || '/service');
  };

  const offers = [...savedOffers, ...demoServices];
  const byType = offers.filter((s) => s.type === tab);
  const categories = useMemo(() => {
    const set = new Set(byType.map((s) => s.category).filter(Boolean));
    return Array.from(set);
  }, [byType]);

  const filtered = byType.filter(
    (s) => category === 'all' || s.category === category
  );

  const showCategoryPills = categories.length >= 2;
  const Icon = ICON_FOR_TYPE[tab] || Scissors;
  const typeMeta = SERVICE_TYPES.find((t) => t.key === tab);
  const emptyCopy = EMPTY_STATE_COPY[tab];

  return (
    <>
      <ScreenHeader
        title=""
        rightAction={
          <div className="flex items-center gap-2 -mr-2">
            <button
              onClick={() => navigate('/hub')}
              className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-[12px] font-semibold hover:bg-gray-800 transition-colors"
              aria-label="Hub"
            >
              SD
            </button>
            <button
              onClick={handleNew}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-900"
              aria-label="New service"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-2 pb-5">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">Services</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Manage your bookable services, classes, bundles, and memberships.
          </div>
        </div>

        {/* Underline tabs */}
        <div className="px-5 border-b border-gray-100">
          <div className="flex gap-6 -mb-px overflow-x-auto no-scrollbar">
            {SERVICE_TYPES.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={
                    'shrink-0 pb-3 text-[14px] font-medium border-b-2 transition-colors ' +
                    (active
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-700')
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter pills */}
        {showCategoryPills && (
          <div className="px-5 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
            <Pill
              label="All"
              count={byType.length}
              active={category === 'all'}
              onClick={() => setCategory('all')}
            />
            {categories.map((c) => (
              <Pill
                key={c}
                label={c}
                count={byType.filter((s) => s.category === c).length}
                active={category === c}
                onClick={() => setCategory(c)}
              />
            ))}
          </div>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-14 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Icon size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">
              No {typeMeta?.label.toLowerCase()} yet
            </div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[280px]">
              {emptyCopy?.body}
            </div>
            <button
              onClick={() => createByType(tab)}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Create {typeMeta?.singular}
            </button>
          </div>
        ) : (
          <div className="px-2 pt-2 pb-8">
            {filtered.map((s) => {
              const TypeIcon = ICON_FOR_TYPE[s.type] || Scissors;
              const status = statusFor(s);
              return (
                <button
                  key={s.id}
                  onClick={() => openService(s)}
                  className="w-full flex items-center gap-4 px-3 py-4 rounded-xl text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <TypeIcon size={18} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-gray-900 truncate">{s.name}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{metaFor(s)}</div>
                  </div>
                  <span
                    className={
                      'text-[12px] px-2 py-0.5 rounded-full shrink-0 ' +
                      (status === 'Active'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600')
                    }
                  >
                    {status}
                  </span>
                  <ChevronRight size={18} className="text-gray-400 shrink-0" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function normalizeDraft(service) {
  if (service.type !== 'bundle') return { ...service };
  const defaults = emptyBundleDetails();
  return {
    ...service,
    bundleDetails: {
      ...defaults,
      ...(service.bundleDetails || {}),
      includedServiceIds: service.bundleDetails?.includedServiceIds?.length
        ? service.bundleDetails.includedServiceIds
        : (service.includedServiceIds || []),
      discountPercent: service.bundleDetails?.discountPercent ?? service.discountPercent ?? '',
    },
  };
}
