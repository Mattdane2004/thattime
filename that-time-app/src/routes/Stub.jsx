import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Construction } from 'lucide-react';
import { findBySlug } from '../data/hubMenu';

const FALLBACK = {
  label: 'Coming soon',
  desc: 'This area is being built.',
  icon: Construction,
};

export default function Stub() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const item = findBySlug(slug) || FALLBACK;
  const Icon = item.icon || Construction;

  return (
    <>
      <div className="shrink-0 flex items-center px-4 h-14 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white flex items-start justify-center px-6 pt-14">
        <div className="flex flex-col items-center text-center max-w-[280px]">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
            <Icon size={24} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            In development
          </div>
          <div className="text-[22px] font-semibold text-gray-900 leading-tight">
            {item.label}
          </div>
          <div className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            {item.desc}. This area isn't built yet — it'll live here once we design and ship it.
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
          >
            Back to hub
          </button>
        </div>
      </div>
    </>
  );
}
