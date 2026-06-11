import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { formsCatalog } from '../../../data/demoFormsCatalog';
import { offerBasePath } from '../../routeBase';

export default function FormsSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');
  const attached = draft.forms || [];
  const [selected, setSelected] = useState(new Set(attached.map((f) => f.id)));
  const basePath = offerBasePath(draft, location);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const filtered = formsCatalog.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const save = () => {
    // preserve "required" flag for already-attached forms
    const existing = new Map(attached.map((a) => [a.id, a]));
    const next = Array.from(selected).map((id) => existing.get(id) || { id, required: false });
    updateDraft({ forms: next });
    navigate(`${basePath}/forms`);
  };

  return (
    <>
      <ScreenHeader title="Select forms" onBack={() => navigate(`${basePath}/forms`)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your forms"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((f) => {
            const isOn = selected.has(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900">{f.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{f.fieldCount} fields</div>
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
