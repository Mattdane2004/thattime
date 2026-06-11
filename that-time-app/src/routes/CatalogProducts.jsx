import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { productsCatalog, productCategories } from '../data/demoProductsCatalog';

export default function CatalogProducts() {
  const navigate = useNavigate();

  const groups = productCategories.map((cat) => ({
    cat,
    items: productsCatalog.filter((p) => p.category === cat),
  }));

  return (
    <>
      <ScreenHeader title="Products" onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Your business product catalog. Reuse these across services.
        </p>

        {groups.map((g) => (
          <div key={g.cat} className="mb-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {g.cat} · {g.items.length}
            </div>
            <div className="space-y-2">
              {g.items.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                  <div className="text-[15px] font-medium text-gray-900">{p.name}</div>
                  <div className="text-[14px] text-gray-700">£{p.basePrice}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} strokeWidth={2} />
          Add product
        </button>
      </div>
    </>
  );
}
