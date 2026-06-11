import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function ProductSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  compact = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const fieldId = useId();
  const normalizedOptions = useMemo(
    () => options.map((option) => ({
      value: option.value ?? option.key,
      label: option.label,
      description: option.description ?? option.desc ?? option.meta,
      disabled: Boolean(option.disabled),
    })),
    [options],
  );
  const selectedIndex = normalizedOptions.findIndex((option) => option.value === value);
  const selected = normalizedOptions[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, selectedIndex]);

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (option) => {
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const moveActive = (direction) => {
    if (!normalizedOptions.length) return;
    let next = activeIndex;
    for (let i = 0; i < normalizedOptions.length; i += 1) {
      next = (next + direction + normalizedOptions.length) % normalizedOptions.length;
      if (!normalizedOptions[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleButtonKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openMenu();
      else moveActive(1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu();
      else moveActive(-1);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) openMenu();
      else choose(normalizedOptions[activeIndex]);
    }
  };

  const buttonSize = compact ? 'h-10 px-3 text-[13px]' : 'min-h-12 px-4 py-3 text-[15px]';
  const labelId = label ? `${fieldId}-label` : undefined;

  return (
    <div ref={rootRef} className={'relative ' + className}>
      {label && (
        <div id={labelId} className="text-[13px] font-medium text-gray-700 mb-2">
          {label}
        </div>
      )}
      <button
        type="button"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={handleButtonKeyDown}
        className={
          'w-full rounded-xl bg-gray-50 text-left text-gray-900 outline-none transition-colors flex items-center gap-3 ' +
          'hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50 disabled:pointer-events-none ' +
          buttonSize + ' ' + buttonClassName
        }
      >
        <span className={'flex-1 min-w-0 truncate ' + (!selected ? 'text-gray-400' : '')}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={'text-gray-400 shrink-0 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={
            'absolute z-50 mt-2 w-full min-w-[160px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/10 ' +
            menuClassName
          }
        >
          <div className="max-h-60 overflow-y-auto p-1">
            {normalizedOptions.map((option, index) => {
              const selectedOption = option.value === value;
              const active = index === activeIndex;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={selectedOption}
                  disabled={option.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={
                    'w-full rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors flex items-center gap-2 ' +
                    (selectedOption
                      ? 'bg-gray-900 text-white'
                      : active
                        ? 'bg-gray-50 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50') +
                    (option.disabled ? ' opacity-40 pointer-events-none' : '')
                  }
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className={'mt-0.5 block text-[12px] leading-snug ' + (selectedOption ? 'text-white/75' : 'text-gray-500')}>
                        {option.description}
                      </span>
                    )}
                  </span>
                  {selectedOption && <Check size={15} strokeWidth={2.4} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
