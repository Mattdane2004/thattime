import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { resourcesCatalog, resourceTypeMeta } from '../data/demoResourcesCatalog';
import { businessLocations } from '../data/business';

const locationSummary = (resource) => {
  if (!resource?.locationIds || resource.locationIds.length === 0) return 'All locations';
  return resource.locationIds
    .map((id) => businessLocations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

export default function CatalogResources() {
  const navigate = useNavigate();

  const groups = ['space', 'equipment']
    .map((type) => ({ type, items: resourcesCatalog.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <ScreenHeader title="Resources" onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Your business-wide spaces and equipment. Attach them to services that need them.
        </p>

        {groups.map((g) => (
          <div key={g.type} className="mb-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {resourceTypeMeta[g.type].plural} · {g.items.length}
            </div>
            <div className="space-y-2">
              {g.items.map((r) => {
                const parent = r.parentId ? resourcesCatalog.find((c) => c.id === r.parentId) : null;
                return (
                  <div
                    key={r.id}
                    className="p-4 bg-white border border-gray-100 rounded-2xl"
                  >
                    <div className="text-[15px] font-medium text-gray-900">{r.name}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">
                      {r.type === 'space' && `Capacity ${r.capacity} · `}
                      {parent ? `in ${parent.name} · ` : ''}
                      {locationSummary(r)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add resource
        </button>
      </div>
    </>
  );
}
