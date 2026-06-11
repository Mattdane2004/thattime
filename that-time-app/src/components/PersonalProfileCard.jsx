import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Mock user — will come from real auth once that lands.
const USER = {
  name: 'Mathew Dane',
  initials: 'MD',
  role: 'Admin',
  plan: 'Pro plan',
};

export default function PersonalProfileCard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/soon/my-profile')}
      className="w-full flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 text-[16px] font-semibold">
        {USER.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-semibold text-gray-900 truncate">{USER.name}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 truncate">
          {USER.role} · {USER.plan}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
    </button>
  );
}
