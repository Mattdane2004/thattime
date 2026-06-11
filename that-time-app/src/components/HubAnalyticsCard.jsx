import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Mock data — will be wired to real analytics once that module lands.
const MOCK = {
  period: 'This month',
  revenue: '£2,140',
  bookings: 128,
};

export default function HubAnalyticsCard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/soon/analytics')}
      className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-4">
        {MOCK.period}
      </div>
      <div className="flex gap-10">
        <div>
          <div className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">
            {MOCK.revenue}
          </div>
          <div className="text-[12px] text-gray-500 mt-1.5">Revenue</div>
        </div>
        <div>
          <div className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">
            {MOCK.bookings}
          </div>
          <div className="text-[12px] text-gray-500 mt-1.5">Bookings</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end text-[13px] font-medium text-gray-700">
        View analytics <ChevronRight size={14} className="ml-1" strokeWidth={2} />
      </div>
    </button>
  );
}
