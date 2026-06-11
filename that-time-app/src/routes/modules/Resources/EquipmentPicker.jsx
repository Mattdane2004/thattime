import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Check, Wrench, Info } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { resourcesCatalog } from '../../../data/demoResourcesCatalog';
import { businessLocations } from '../../../data/business';
import { offerBasePath } from '../../routeBase';

const locationSummary = (resource) => {
  if (!resource?.locationIds || resource.locationIds.length === 0) return 'All locations';
  return resource.locationIds
    .map((id) => businessLocations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

const normalize = (r) =>
  typeof r === 'string'
    ? { resourceId: r, note: '', setupMin: 0, cleanupMin: 0, autoIncluded: false }
    : { note: '', setupMin: 0, cleanupMin: 0, autoIncluded: false, ...r };

export default function EquipmentPicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');
  const basePath = offerBasePath(draft, location);

  const prevAttachments = (draft.resources || []).map(normalize);
  const prevEquipmentIds = prevAttachments
    .filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      return r?.type === 'equipment';
    })
    .map((a) => a.resourceId);

  const [selected, setSelected] = useState(new Set(prevEquipmentIds));

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const allEquipment = resourcesCatalog.filter((r) => r.type === 'equipment');
  const filtered = allEquipment.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  // Preview which parent rooms will be auto-attached
  const autoParents = new Set();
  selected.forEach((id) => {
    const r = resourcesCatalog.find((c) => c.id === id);
    if (r?.parentId) autoParents.add(r.parentId);
  });

  const save = () => {
    // Keep previous rooms + non-conflicting equipment
    const prevRoomIds = prevAttachments
      .filter((a) => resourcesCatalog.find((c) => c.id === a.resourceId)?.type === 'space')
      .map((a) => a.resourceId);

    const untouched = prevAttachments.filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      if (!r) return false;
      if (r.type === 'space') {
        // keep space unless this flow is about to auto-attach it AND it was previously auto-attached
        return true;
      }
      // drop previous equipment — we'll rebuild from the new selection
      return false;
    });

    const noteFor = (id) => prevAttachments.find((a) => a.resourceId === id)?.note || '';
    const setupFor = (id) => prevAttachments.find((a) => a.resourceId === id)?.setupMin || 0;
    const cleanupFor = (id) =>
      prevAttachments.find((a) => a.resourceId === id)?.cleanupMin || 0;

    const equipmentAttachments = Array.from(selected).map((id) => ({
      resourceId: id,
      note: noteFor(id),
      setupMin: setupFor(id),
      cleanupMin: cleanupFor(id),
      autoIncluded: false,
    }));

    // Auto-include parent rooms for equipment whose parents aren't already attached
    const existingRoomIds = new Set(
      untouched
        .filter((a) => resourcesCatalog.find((c) => c.id === a.resourceId)?.type === 'space')
        .map((a) => a.resourceId)
    );
    const autoRooms = Array.from(autoParents)
      .filter((pid) => !existingRoomIds.has(pid))
      .map((id) => ({
        resourceId: id,
        note: noteFor(id),
        setupMin: setupFor(id),
        cleanupMin: cleanupFor(id),
        autoIncluded: true,
      }));

    updateDraft({ resources: [...untouched, ...equipmentAttachments, ...autoRooms] });
    navigate(`${basePath}/resources`);
  };

  return (
    <>
      <ScreenHeader title="Add equipment" onBack={() => navigate(`${basePath}/resources`)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>

        {autoParents.size > 0 && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex gap-2">
            <Info size={14} className="text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-[12px] text-gray-600 leading-snug">
              Parent rooms will be attached automatically for equipment that lives inside them.
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((r) => {
            const isOn = selected.has(r.id);
            const parent = r.parentId ? resourcesCatalog.find((c) => c.id === r.parentId) : null;
            return (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                className={
                  'w-full flex items-center gap-3 p-4 text-left border rounded-2xl transition-colors ' +
                  (isOn
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-100 hover:bg-gray-50')
                }
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Wrench size={16} className="text-gray-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900">{r.name}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {parent ? `in ${parent.name} · ` : ''}
                    {locationSummary(r)}
                  </div>
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
          disabled={selected.size === 0}
          className={
            'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
            (selected.size === 0
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gray-900 hover:bg-gray-800 text-white')
          }
        >
          Save{selected.size > 0 ? ` · ${selected.size + autoParents.size} attached` : ''}
        </button>
      </div>
    </>
  );
}
