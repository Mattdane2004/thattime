import { ChevronRight } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className={
        'w-11 h-[26px] rounded-full relative shrink-0 transition-colors ' +
        (value ? 'bg-gray-900' : 'bg-gray-200')
      }
    >
      <div
        className={
          'absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ' +
          (value ? 'translate-x-[22px]' : 'translate-x-0.5')
        }
      />
    </button>
  );
}

/**
 * iOS-style setting row. Three modes:
 *  - toggle: boolean + switch
 *  - nav: label + value + chevron (opens sheet or route)
 *  - static: label + small subtitle (no interaction)
 *
 * `value` may be a string (e.g. "Anyone") or an object
 *   { text: 'Default', muted: true } to render in grey italic.
 */
export default function SettingRow({
  label,
  description,
  type = 'nav',
  value,
  onClick,
  toggleValue,
  onToggle,
}) {
  const isDefault =
    value && typeof value === 'object' && value.muted === true;
  const displayText = typeof value === 'string' ? value : value?.text;

  if (type === 'toggle') {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] text-gray-900">{label}</div>
          {description && (
            <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{description}</div>
          )}
        </div>
        <Toggle value={toggleValue} onChange={onToggle} />
      </div>
    );
  }

  if (type === 'static') {
    return (
      <div className="px-4 py-3">
        <div className="text-[15px] text-gray-900">{label}</div>
        {description && (
          <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{description}</div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-gray-900">{label}</div>
        {description && (
          <div className="text-[12px] text-gray-500 mt-0.5 leading-snug truncate">{description}</div>
        )}
      </div>
      {displayText && (
        <div
          className={
            'text-[14px] truncate max-w-[55%] ' +
            (isDefault ? 'text-gray-400 italic' : 'text-gray-600')
          }
        >
          {displayText}
        </div>
      )}
      <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
    </button>
  );
}
