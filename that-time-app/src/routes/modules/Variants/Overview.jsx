import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Clock, User, CalendarClock, MapPin, Search, Plus, Layers } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import HelpTrigger from '../../../components/HelpTrigger';
import AddVariantSheet from '../../../components/AddVariantSheet';
import { staff as fallbackStaff } from '../../../data/staff';
import { businessLocations } from '../../../data/business';
import { formatDuration } from '../../../components/DurationPicker';
import { offerTypeMeta } from '../../../data/offerTypes';

const TYPE_META = {
  duration: { label: 'Duration', Icon: Clock },
  staff: { label: 'Staff', Icon: User },
  time: { label: 'Time & date', Icon: CalendarClock },
  location: { label: 'Location', Icon: MapPin },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'duration', label: 'Duration' },
  { key: 'staff', label: 'Staff' },
  { key: 'time', label: 'Time & date' },
  { key: 'location', label: 'Location' },
];

function formatDays(days) {
  if (!days || days.length === 0) return 'Any day';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every((d) => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && ['Sat', 'Sun'].every((d) => days.includes(d))) return 'Weekends';
  return days.join(', ');
}

function rowFor(variant, teamMembers = fallbackStaff) {
  if (variant.type === 'duration') {
    return {
      primary: variant.name || 'Untitled',
      secondary: `Duration · ${formatDuration(variant.durationMin || 0)}`,
      right: variant.price ? `£${variant.price}` : '—',
    };
  }
  if (variant.type === 'time') {
    const sign = (variant.priceDelta ?? 0) >= 0 ? '+' : '−';
    const abs = Math.abs(variant.priceDelta || 0);
    const priceStr = variant.priceMode === 'percent' ? `${sign}${abs}%` : `${sign}£${abs}`;
    return {
      primary: variant.name || 'Untitled',
      secondary: `Time & date · ${formatDays(variant.days)}`,
      right: priceStr,
    };
  }
  if (variant.type === 'staff') {
    const s = teamMembers.find((x) => x.id === variant.staffId);
    const priceStr = variant.priceMode === 'full'
      ? `£${variant.price || '—'}`
      : `${(variant.priceDelta ?? 0) >= 0 ? '+' : '−'}£${Math.abs(variant.priceDelta || 0)}`;
    return {
      primary: s?.name || 'Staff member',
      secondary: `Staff · ${s?.role || ''}`,
      right: priceStr,
    };
  }
  if (variant.type === 'location') {
    const l = businessLocations.find((x) => x.id === variant.locationId);
    const priceStr = variant.priceMode === 'full'
      ? `£${variant.price || '—'}`
      : `${(variant.priceDelta ?? 0) >= 0 ? '+' : '−'}£${Math.abs(variant.priceDelta || 0)}`;
    return {
      primary: l?.name || 'Location',
      secondary: `Location · ${l?.address || ''}`,
      right: priceStr,
    };
  }
  return { primary: '—', secondary: '', right: '' };
}

export default function VariantsOverview() {
  const navigate = useNavigate();
  const { draft, teamMembers = fallbackStaff } = useOutletContext();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = offerTypeMeta(draft.type);

  const variants = draft.variants || [];

  const q = query.trim().toLowerCase();
  const filtered = variants.filter((v) => {
    if (filter !== 'all' && v.type !== filter) return false;
    if (!q) return true;
    const r = rowFor(v, teamMembers);
    return r.primary.toLowerCase().includes(q) || r.secondary.toLowerCase().includes(q);
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? variants.length : variants.filter((v) => v.type === f.key).length;
    return acc;
  }, {});

  const handlePick = (type) => {
    setPickerOpen(false);
    if (type === 'staff' || type === 'location') {
      navigate(`/service/variants/${type}`);
    } else {
      navigate(`/service/variants/${type}/new`);
    }
  };

  const handleRowTap = (v) => {
    if (v.type === 'staff') {
      navigate(`/service/variants/staff?staffId=${v.staffId}`);
    } else if (v.type === 'location') {
      navigate(`/service/variants/location?locationId=${v.locationId}`);
    } else {
      navigate(`/service/variants/${v.type}/${v.id}`);
    }
  };

  return (
    <>
      <ScreenHeader title="Variants" onBack={() => navigate('/service')} rightAction={<HelpTrigger helpKey="variants" />} />

      <div className="flex-1 overflow-y-auto">
        {variants.length === 0 ? (
          <div className="px-5 pt-4 pb-6">
            <div className="flex flex-col items-center text-center pt-10">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Layers size={24} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="text-[18px] font-semibold text-gray-900 mb-1">No variants yet</div>
              <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
                Offer the same {meta.noun} in different ways — by duration, staff, time, or place.
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
              >
                Add variant
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search variants"
                  className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="px-5 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    'shrink-0 h-9 px-4 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5 ' +
                    (filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
                  }
                >
                  {f.label}
                  {counts[f.key] > 0 && (
                    <span className={'text-[11px] ' + (filter === f.key ? 'text-gray-300' : 'text-gray-500')}>
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="px-5 pb-6 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center text-[14px] text-gray-500 py-10">No matches.</div>
              ) : (
                filtered.map((v) => {
                  const r = rowFor(v, teamMembers);
                  const Icon = TYPE_META[v.type].Icon;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleRowTap(v)}
                      className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-gray-700" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-medium text-gray-900 truncate">{r.primary}</div>
                        <div className="text-[13px] text-gray-500 mt-0.5 truncate">{r.secondary}</div>
                      </div>
                      <div className="text-[14px] font-medium text-gray-900 shrink-0">{r.right}</div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {variants.length > 0 && (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} strokeWidth={2} />
            Add variant
          </button>
        </div>
      )}

      <AddVariantSheet open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handlePick} />
    </>
  );
}
