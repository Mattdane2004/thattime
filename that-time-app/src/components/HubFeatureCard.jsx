import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Large horizontal card for hubs-within-hubs. Icon on the left, label + desc,
 * chevron on the right. Used for Marketing on the Business tab.
 */
export default function HubFeatureCard({ icon: Icon, label, desc, to }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="w-full flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-semibold text-gray-900">{label}</div>
        {desc && <div className="text-[13px] text-gray-500 mt-0.5 truncate">{desc}</div>}
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
    </button>
  );
}
