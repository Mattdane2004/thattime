import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { marketingGroups } from '../data/hubMenu';

// Card variant for Marketing sub-items — icon, label, desc, chevron.
function MarketingCard({ icon: Icon, label, desc, to, full }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={
        'bg-white border border-gray-100 rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors ' +
        (full ? 'col-span-2' : '')
      }
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
        <Icon size={18} className="text-gray-800" strokeWidth={1.75} />
      </div>
      <div className="text-[15px] font-semibold text-gray-900 mt-3">{label}</div>
      <div className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{desc}</div>
    </button>
  );
}

function withLayout(items) {
  return items.map((item, i) => {
    const isLast = i === items.length - 1;
    const isOdd = items.length % 2 === 1;
    return { ...item, full: isLast && isOdd };
  });
}

export default function Marketing() {
  const navigate = useNavigate();

  return (
    <>
      <div className="shrink-0 flex items-center px-4 h-14 bg-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pb-8">
        <div className="pt-1 pb-6 px-1">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">Marketing</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Grow your business with campaigns, offers, and automations.
          </div>
        </div>

        <div className="space-y-6">
          {marketingGroups.map((g) => {
            const laid = withLayout(g.items);
            return (
              <div key={g.key}>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  {g.title}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {laid.map(({ key, ...rest }) => (
                    <MarketingCard key={key} {...rest} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
