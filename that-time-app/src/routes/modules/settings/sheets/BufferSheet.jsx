import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { businessDefaults } from '../../../../data/businessDefaults';

export default function BufferSheet({ open, value, onClose, onSave }) {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');

  useEffect(() => {
    if (!open) return;
    setBefore(value?.before != null ? String(value.before) : '');
    setAfter(value?.after != null ? String(value.after) : '');
  }, [open, value]);

  const isOverride = !!value;
  const def = businessDefaults.buffer;

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Buffer time"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() =>
        onSave({
          before: before === '' ? 0 : Number(before),
          after: after === '' ? 0 : Number(after),
        })
      }
      disableSave={false}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          Padding around each appointment. Business default:{' '}
          <span className="text-gray-900 font-medium">
            {def.before}m before · {def.after}m after
          </span>
          .
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">Before</div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <input
                type="number"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                placeholder="0"
                className="flex-1 text-[16px] font-medium bg-transparent outline-none min-w-0"
              />
              <span className="text-[12px] text-gray-500">min</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">After</div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <input
                type="number"
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                placeholder="0"
                className="flex-1 text-[16px] font-medium bg-transparent outline-none min-w-0"
              />
              <span className="text-[12px] text-gray-500">min</span>
            </div>
          </div>
        </div>
      </div>
    </SettingSheet>
  );
}
