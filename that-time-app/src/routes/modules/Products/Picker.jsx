import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { productsCatalog, productCategories } from '../../../data/demoProductsCatalog';

export default function ProductsPicker() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');

  const stagedKey = '__stagedProductPicker';
  const initialIds = (() => {
    try {
      const raw = sessionStorage.getItem(stagedKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  })();
  const [selected, setSelected] = useState(initialIds);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const filtered = productsCatalog.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const groups = productCategories
    .map((cat) => ({ cat, items: filtered.filter((p) => p.category === cat) }))
    .filter((g) => g.items.length > 0);

  const save = () => {
    sessionStorage.setItem(stagedKey, JSON.stringify(Array.from(selected)));
    navigate(-1);
  };

  return (
    <>
      <ScreenHeader title="Choose products" onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your product catalog"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>

        {groups.map((g) => (
          <div key={g.cat} className="mb-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {g.cat}
            </div>
            <div className="space-y-2">
              {g.items.map((p) => {
                const isOn = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-gray-900">{p.name}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">£{p.basePrice} catalog price</div>
                    </div>
                    <div
                      className={
                        'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
                        (isOn ? 'bg-gray-900' : 'bg-gray-100')
                      }
                    >
                      {isOn && <Check size={14} className="text-white" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done{selected.size > 0 ? ` · ${selected.size} selected` : ''}
        </button>
      </div>
    </>
  );
}
