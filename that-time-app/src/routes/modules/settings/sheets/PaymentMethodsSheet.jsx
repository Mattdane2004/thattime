import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { businessDefaults } from '../../../../data/businessDefaults';

const METHODS = [
  { k: 'card', label: 'Card', sub: 'Online, via the app' },
  { k: 'cash', label: 'Cash', sub: 'In person' },
  { k: 'transfer', label: 'Bank transfer', sub: 'Manual reconciliation' },
  { k: 'bnpl', label: 'Buy now pay later', sub: 'Depends on your payment provider' },
];

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={
        'w-11 h-[26px] rounded-full relative shrink-0 transition-colors ' +
        (value ? 'bg-gray-900' : 'bg-gray-200') +
        (disabled ? ' opacity-40' : '')
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

export const methodsSummary = (m) =>
  METHODS.filter((x) => m?.[x.k]).map((x) => x.label).join(', ') || 'None';

export default function PaymentMethodsSheet({ open, value, onClose, onSave }) {
  const [methods, setMethods] = useState({});

  useEffect(() => {
    if (!open) return;
    setMethods({ ...(value || businessDefaults.paymentMethods) });
  }, [open, value]);

  const isOverride = !!value;
  const onCount = METHODS.filter((m) => methods[m.k]).length;

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Payment methods"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() => onSave(methods)}
      disableSave={onCount === 0}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          Business default: <span className="text-gray-900 font-medium">{methodsSummary(businessDefaults.paymentMethods)}</span>. At least one method must remain on.
        </div>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const on = !!methods[m.k];
            const isOnlyOne = on && onCount === 1;
            return (
              <div
                key={m.k}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-900">{m.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{m.sub}</div>
                </div>
                <Toggle
                  value={on}
                  onChange={(v) => setMethods((prev) => ({ ...prev, [m.k]: v }))}
                  disabled={isOnlyOne}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SettingSheet>
  );
}
