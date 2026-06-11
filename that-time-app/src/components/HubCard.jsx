import { useNavigate } from 'react-router-dom';

/**
 * Square icon tile used for the Operations grid. Icon + label only —
 * descriptions are reserved for list cards and feature cards to keep the
 * grid clean and scan-able.
 */
export default function HubCard({ icon: Icon, label, desc, to, full }) {
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
      {desc && (
        <div className="text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2">{desc}</div>
      )}
    </button>
  );
}
