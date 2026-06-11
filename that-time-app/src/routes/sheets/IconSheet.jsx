import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import Pill from '../../components/Pill';
import { serviceIcons, industryTags, serviceIconByName, ICON_WEIGHT } from '../../data/serviceIcons';

export default function IconSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('All');
  const [selected, setSelected] = useState(draft.iconKey?.name || null);

  useEffect(() => {
    if (!open) return;
    setSelected(draft.iconKey?.name || null);
    setQuery('');
    setTag(draft.category && industryTags.includes(draft.category) ? draft.category : 'All');
  }, [open, draft.iconKey, draft.category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return serviceIcons.filter((i) => {
      const matchesTag = tag === 'All' || i.tags.includes(tag);
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [query, tag]);

  const SelectedIcon = selected ? serviceIconByName[selected] : null;

  const handleSave = () => {
    if (selected) updateDraft({ iconKey: { name: selected } });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Icons"
      footer={
        <button
          onClick={handleSave}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors disabled:opacity-50"
          disabled={!selected}
        >
          Save
        </button>
      }
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          {SelectedIcon ? (
            <SelectedIcon size={28} weight={ICON_WEIGHT} className="text-gray-900" />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-200" />
          )}
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for icon"
          className="w-full h-12 pl-10 pr-4 rounded-2xl border border-gray-200 outline-none text-[15px] focus:border-gray-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 mb-3">
        {industryTags.map((t) => (
          <Pill key={t} label={t} active={tag === t} onClick={() => setTag(t)} />
        ))}
      </div>

      <div className="text-[13px] text-gray-500 mb-3">
        {filtered.length === 0 ? 'No icons match' : 'Choose an icon'}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {filtered.map(({ name, Icon }) => {
          const isActive = selected === name;
          return (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={
                'aspect-square rounded-2xl bg-gray-100 flex items-center justify-center transition ' +
                (isActive ? 'ring-2 ring-gray-900' : 'hover:bg-gray-200')
              }
              title={name}
            >
              <Icon size={22} weight={ICON_WEIGHT} className="text-gray-900" />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
