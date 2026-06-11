import { Search, Check } from 'lucide-react';
import TextField from '../../../../components/TextField';
import { demoRelatedServices, relatedServiceCategories } from '../../../../data/demoRelatedServices';

export default function BasicsForm({ name, onNameChange, serviceIds, onServiceIdsChange, query, onQueryChange }) {
  const toggle = (id) => {
    onServiceIdsChange(
      serviceIds.includes(id) ? serviceIds.filter((x) => x !== id) : [...serviceIds, id]
    );
  };

  const filtered = demoRelatedServices.filter((s) =>
    s.name.toLowerCase().includes((query || '').toLowerCase())
  );

  const groups = relatedServiceCategories
    .map((cat) => ({ cat, items: filtered.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <TextField
        label="Group name"
        value={name}
        onChange={onNameChange}
        placeholder="e.g. Hair add-ons"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-gray-700">Services in this group</div>
          {serviceIds.length > 0 && (
            <div className="text-[12px] text-gray-500">{serviceIds.length} selected</div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search your services"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>

        {groups.map((g) => (
          <div key={g.cat} className="mb-5">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {g.cat}
            </div>
            <div className="space-y-2">
              {g.items.map((s) => {
                const isOn = serviceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-gray-900">{s.name}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">{s.category}</div>
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
    </div>
  );
}
