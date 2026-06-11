import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Grouped list card — multiple rows (icon + label + chevron) in one container.
 * Best for settings-like items: related, set-once, rarely touched individually.
 */
export default function HubListCard({ title, items }) {
  const navigate = useNavigate();

  return (
    <div>
      {title && (
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          {title}
        </div>
      )}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
        {items.map(({ key, label, icon: Icon, to }) => (
          <button
            key={key}
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-gray-800" strokeWidth={1.75} />
            </div>
            <div className="flex-1 text-[15px] text-gray-900 truncate">{label}</div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
