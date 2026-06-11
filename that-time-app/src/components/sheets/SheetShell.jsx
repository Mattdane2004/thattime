import { X, ChevronLeft } from 'lucide-react';

// Shared bottom-sheet chrome for the main-screen flows. Sits above modals
// (z-40) so flows can be launched from the booking details sheet too.
export default function SheetShell({ open, onClose, onBack, title, subtitle, children, footer }) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl max-h-[92%] flex flex-col">
        <div className="flex justify-center pt-2.5 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
          <div className="flex items-center gap-1 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="-ml-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"
                aria-label="Back"
              >
                <ChevronLeft size={19} className="text-gray-700" />
              </button>
            )}
            <div className="min-w-0">
              <div className="text-[17px] font-bold text-gray-900 truncate">{title}</div>
              {subtitle && <div className="text-[12px] text-gray-400 mt-0.5 truncate">{subtitle}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"
            aria-label="Close"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="px-5 pb-6 pt-3 shrink-0 border-t border-gray-50">{footer}</div>}
      </div>
    </div>
  );
}

// Standard dark full-width CTA used in sheet footers.
export function SheetCta({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'w-full rounded-full py-4 text-[14px] font-semibold transition-colors ' +
        (disabled
          ? 'bg-gray-100 text-gray-400'
          : 'bg-gray-900 text-white hover:bg-gray-800')
      }
    >
      {children}
    </button>
  );
}

// Selectable pill chip used across the sheet flows.
export function Chip({ selected, onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'rounded-full px-3.5 py-2 text-[13px] font-medium border transition-colors ' +
        (disabled
          ? 'border-gray-100 text-gray-300 line-through'
          : selected
            ? 'bg-gray-900 text-white border-gray-900'
            : 'border-gray-200 text-gray-700 hover:bg-gray-50')
      }
    >
      {children}
    </button>
  );
}

export function SheetSectionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2.5 mt-5 first:mt-0">
      {children}
    </div>
  );
}
