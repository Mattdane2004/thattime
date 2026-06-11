import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { formsCatalog } from '../data/demoFormsCatalog';

export default function CatalogForms() {
  const navigate = useNavigate();

  return (
    <>
      <ScreenHeader title="Forms" onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Build intake forms once, attach them to any service.
        </p>

        <div className="space-y-2">
          {formsCatalog.map((f) => (
            <div key={f.id} className="p-4 bg-white border border-gray-100 rounded-2xl">
              <div className="text-[15px] font-medium text-gray-900">{f.name}</div>
              <div className="text-[13px] text-gray-500 mt-0.5">{f.fieldCount} fields</div>
              {f.description && (
                <div className="text-[13px] text-gray-500 mt-2 leading-snug">{f.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} strokeWidth={2} />
          Create form
        </button>
      </div>
    </>
  );
}
