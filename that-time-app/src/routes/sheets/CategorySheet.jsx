// Bottom-sheet category picker. Replaces the inline pill cloud so the wizard
// scales beyond ~10 categories without pushing format/description below the
// fold. Search + scroll, single-select, plus a "New category" entry that
// hands off to the existing NewCategorySheet.

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Check, Plus } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';

export default function CategorySheet({ open, onClose, onCreate }) {
  const { draft, updateDraft, categories } = useOutletContext();
  const [query, setQuery] = useState('');

  const list = categories || [];
  const q = query.trim().toLowerCase();
  const visible = q
    ? list.filter((c) => c.name.toLowerCase().includes(q))
    : list;

  const pick = (name) => {
    updateDraft({ category: draft.category === name ? '' : name });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Category"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
        <Search size={16} className="text-gray-400" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          autoFocus
        />
      </div>

      {visible.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-gray-400">
          No categories match “{query}”.
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl overflow-hidden mb-3">
          {visible.map((c, i) => {
            const isOn = draft.category === c.name;
            return (
              <button
                key={c.name}
                onClick={() => pick(c.name)}
                className={
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ' +
                  (i > 0 ? 'border-t border-white' : '')
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: c.color || '#94a3b8' }}
                />
                <span className="flex-1 text-[15px] text-gray-900">{c.name}</span>
                {isOn && <Check size={17} className="text-gray-900" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}

      {onCreate && (
        <button
          onClick={() => {
            onClose();
            onCreate();
          }}
          className="w-full flex items-center gap-2 justify-center h-11 rounded-xl border border-dashed border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          New category
        </button>
      )}
    </BottomSheet>
  );
}
