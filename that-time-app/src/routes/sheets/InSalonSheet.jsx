import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, Store, Globe } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import { businessLocations } from '../../data/business';

export default function InSalonSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');

  const selected = new Set(draft.locations.inSalon.locationIds || []);
  const q = query.trim().toLowerCase();
  const visible = q
    ? businessLocations.filter((l) => (l.name + ' ' + l.address).toLowerCase().includes(q))
    : businessLocations;

  const setIds = (ids) =>
    updateDraft({
      locations: { ...draft.locations, inSalon: { ...draft.locations.inSalon, enabled: ids.length > 0, locationIds: ids } },
    });

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setIds(Array.from(next));
  };

  const allSelected = selected.size === businessLocations.length;
  const toggleAll = () => setIds(allSelected ? [] : businessLocations.map((l) => l.id));

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="In-salon locations"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save settings
        </button>
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
          <Search size={16} className="text-gray-400" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locations…"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>
        <button
          className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Filter"
        >
          <SlidersHorizontal size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* All locations shortcut */}
      <button
        onClick={toggleAll}
        className={
          'w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors mb-3 ' +
          (allSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100')
        }
      >
        <div
          className={
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' +
            (allSelected ? 'bg-white/15' : 'bg-white')
          }
        >
          <Globe size={18} strokeWidth={1.75} className={allSelected ? 'text-white' : 'text-gray-700'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">All locations</div>
          <div className={'text-[12px] mt-0.5 ' + (allSelected ? 'text-white/70' : 'text-gray-500')}>
            Available everywhere
          </div>
        </div>
        <Box checked={allSelected} inverted={allSelected} />
      </button>

      {/* Individual locations */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        {visible.map((l, i) => {
          const isOn = selected.has(l.id);
          return (
            <button
              key={l.id}
              onClick={() => toggle(l.id)}
              className={
                'w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-100 transition-colors ' +
                (i > 0 ? 'border-t border-white' : '')
              }
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Store size={16} className="text-gray-700" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px]">{l.name}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{l.address}</div>
              </div>
              <Box checked={isOn} />
            </button>
          );
        })}
      </div>

      <button className="w-full mt-4 text-[13px] text-gray-500 underline underline-offset-2 hover:text-gray-700">
        Don't see a location? Configure now
      </button>
    </BottomSheet>
  );
}

function Box({ checked, inverted = false }) {
  return (
    <div
      className={
        'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
        (checked
          ? inverted
            ? 'bg-white'
            : 'bg-gray-900'
          : 'bg-white border border-gray-300')
      }
    >
      {checked && <Check size={14} className={inverted ? 'text-gray-900' : 'text-white'} strokeWidth={2.5} />}
    </div>
  );
}
