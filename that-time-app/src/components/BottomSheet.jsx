import { X } from 'lucide-react';

export default function BottomSheet({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-10">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl max-h-[88%] flex flex-col">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-5 h-12 shrink-0">
          <div className="text-[15px] font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="-mr-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">{children}</div>
        {footer && <div className="px-5 pb-5 pt-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
