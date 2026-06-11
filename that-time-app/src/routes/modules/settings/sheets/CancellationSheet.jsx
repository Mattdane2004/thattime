import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { Check } from 'lucide-react';
import { businessDefaults } from '../../../../data/businessDefaults';

const OPTIONS = [
  { k: 'flexible', label: 'Flexible', sub: 'Cancel anytime — full refund' },
  { k: 'moderate', label: 'Moderate', sub: 'Cancel 24h before' },
  { k: 'strict', label: 'Strict', sub: 'Cancel 48h before, no refund' },
  { k: 'custom', label: 'Custom', sub: 'Your own policy text' },
];

const labelFor = (c) => OPTIONS.find((o) => o.k === c?.type)?.label || 'Moderate';

export default function CancellationSheet({ open, value, onClose, onSave }) {
  const [type, setType] = useState('moderate');
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(value?.type || businessDefaults.cancellation.type);
    setCustomText(value?.customText || '');
  }, [open, value]);

  const isOverride = !!value;
  const defLabel = labelFor(businessDefaults.cancellation);

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Cancellation policy"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() => onSave({ type, customText: type === 'custom' ? customText : '' })}
      disableSave={type === 'custom' && !customText.trim()}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          Business default: <span className="text-gray-900 font-medium">{defLabel}</span>. Rescheduling
          uses the same notice window.
        </div>
        <div className="space-y-1.5">
          {OPTIONS.map((o) => {
            const active = type === o.k;
            return (
              <button
                key={o.k}
                onClick={() => setType(o.k)}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900">{o.label}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{o.sub}</div>
                </div>
                <div
                  className={
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ' +
                    (active ? 'bg-gray-900' : 'bg-white border border-gray-300')
                  }
                >
                  {active && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
        {type === 'custom' && (
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Your cancellation policy text…"
            className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:bg-gray-100 resize-none"
          />
        )}
        <div className="text-[12px] text-gray-500 leading-snug bg-gray-50 rounded-xl px-3 py-2">
          <span className="font-medium">Refunds:</span> full refund if cancelled within the window, none after.
        </div>
      </div>
    </SettingSheet>
  );
}

export const cancellationSummary = (c) =>
  c ? labelFor(c) : null;
