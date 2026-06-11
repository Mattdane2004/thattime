import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import HelpTrigger from '../../../components/HelpTrigger';
import { offerBasePath } from '../../routeBase';

function subtitleFor(p) {
  const opts = p.options || [];
  const count = opts.length;
  const sel = p.selectionType === 'multi' ? 'Multi-select' : 'Single select';
  const priced = opts.filter((o) => o.priceMode === 'add' && o.priceAmount !== '');
  const prices = priced.map((o) => Number(o.priceAmount)).filter((n) => !isNaN(n));

  let pricing;
  if (priced.length === 0) pricing = 'Preference only';
  else if (prices.length === count) pricing = `from +£${Math.min(...prices)}`;
  else if (prices.length > 0) pricing = `from +£${Math.min(...prices)}`;
  else pricing = '';

  const parts = [
    `${count} option${count === 1 ? '' : 's'}`,
    sel,
    pricing,
  ].filter(Boolean);
  return parts.join(' · ');
}

export default function ProductsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft } = useOutletContext();
  const products = draft.products || [];
  const basePath = offerBasePath(draft, location);

  return (
    <>
      <ScreenHeader title="Products" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="products" />} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No products yet</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[240px]">
              Link products clients choose at booking — like which oil or treatment they'd prefer.
            </div>
            <button
              onClick={() => navigate(`${basePath}/products/new`)}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Add product question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`${basePath}/products/${p.id}`)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="text-[15px] font-medium text-gray-900">{p.question}</div>
                <div className="text-[13px] text-gray-500 mt-0.5">{subtitleFor(p)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {products.length > 0 && (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => navigate(`${basePath}/products/new`)}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} strokeWidth={2} />
            Add product question
          </button>
        </div>
      )}
    </>
  );
}
