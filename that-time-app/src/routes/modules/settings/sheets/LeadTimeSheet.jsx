import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { businessDefaults } from '../../../../data/businessDefaults';

export default function LeadTimeSheet({ open, value, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('hours');

  useEffect(() => {
    if (!open) return;
    setAmount(value?.value != null ? String(value.value) : '');
    setUnit(value?.unit || 'hours');
  }, [open, value]);

  const isOverride = !!value;
  const def = businessDefaults.leadTime;

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Lead time"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() => onSave(amount === '' ? null : { value: Number(amount), unit })}
      disableSave={amount === ''}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          How much notice a client needs before booking. Business default:{' '}
          <span className="text-gray-900 font-medium">
            {def.value} {def.unit}
          </span>
          .
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-[18px] font-medium outline-none focus:bg-gray-100 min-w-0"
          />
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
            {['hours', 'days'].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={
                  'px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                  (unit === u ? 'bg-white text-gray-900' : 'text-gray-500')
                }
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingSheet>
  );
}
