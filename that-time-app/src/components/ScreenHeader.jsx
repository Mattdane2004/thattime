import { ChevronLeft, X } from 'lucide-react';

export default function ScreenHeader({ title, onBack, onClose, rightAction, border = false }) {
  return (
    <div
      className={
        'flex items-center justify-between px-5 h-16 shrink-0 ' +
        (border ? 'border-b border-gray-100' : '')
      }
    >
      <div className="w-10 flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {onClose && !onBack && (
          <button
            onClick={onClose}
            className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className="text-[15px] font-semibold truncate">{title}</div>
      <div className="w-10 flex items-center justify-end text-sm text-gray-700">
        {rightAction}
      </div>
    </div>
  );
}
