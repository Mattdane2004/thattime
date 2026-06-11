import { ChevronRight } from 'lucide-react';

export default function ListRow({ icon: Icon, label, sublabel, meta, onClick, showChevron = true }) {
  const Cmp = onClick ? 'button' : 'div';
  return (
    <Cmp
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
    >
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-gray-700" strokeWidth={1.75} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-gray-900 truncate">{label}</div>
        {sublabel && <div className="text-[13px] text-gray-500 truncate mt-0.5">{sublabel}</div>}
      </div>
      {meta && <div className="text-[13px] text-gray-500 shrink-0">{meta}</div>}
      {onClick && showChevron && <ChevronRight size={18} className="text-gray-400 shrink-0" strokeWidth={1.75} />}
    </Cmp>
  );
}
