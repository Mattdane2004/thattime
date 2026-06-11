import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { businessDefaults } from '../../../../data/businessDefaults';

export default function RescheduleLimitSheet({ open, value, onClose, onSave }) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!open) return;
    const v = value?.value;
    setAmount(v == null ? '' : String(v));
  }, [open, value]);

  const isOverride = !!value;
  const defText = businessDefaults.rescheduleLimit == null ? 'Unlimited' : `${businessDefaults.rescheduleLimit} times`;

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Reschedule limit"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() => onSave({ value: amount === '' ? null : Number(amount) })}
      disableSave={false}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          Max times a client can reschedule a single booking. Business default:{' '}
          <span className="text-gray-900 font-medium">{defText}</span>. Leave blank for unlimited.
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Unlimited"
            className="flex-1 text-[18px] font-medium bg-transparent outline-none min-w-0"
          />
          <span className="text-[13px] text-gray-500">times per booking</span>
        </div>
      </div>
    </SettingSheet>
  );
}
