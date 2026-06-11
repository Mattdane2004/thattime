import { useState, useEffect } from 'react';
import SettingSheet from '../SettingSheet';
import { businessDefaults } from '../../../../data/businessDefaults';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
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

export const depositSummary = (d) => {
  if (!d?.required) return 'No deposit';
  const amount = d.amount ? (d.unit === '%' ? `${d.amount}%` : `£${d.amount}`) : '—';
  return `${amount}, ${d.whenCharged === 'booking' ? 'at booking' : `${d.daysBefore}d before`}`;
};

export default function DepositSheet({ open, value, onClose, onSave }) {
  const [required, setRequired] = useState(false);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('£');
  const [whenCharged, setWhenCharged] = useState('booking');
  const [daysBefore, setDaysBefore] = useState('');

  useEffect(() => {
    if (!open) return;
    const src = value || businessDefaults.deposit;
    setRequired(!!src.required);
    setAmount(src.amount || '');
    setUnit(src.unit || '£');
    setWhenCharged(src.whenCharged || 'booking');
    setDaysBefore(src.daysBefore || '');
  }, [open, value]);

  const isOverride = !!value;
  const defSummary = depositSummary(businessDefaults.deposit);

  return (
    <SettingSheet
      open={open}
      onClose={onClose}
      title="Deposit"
      isOverride={isOverride}
      onReset={() => onSave(null)}
      onSave={() =>
        onSave({
          required,
          amount: required ? amount : '',
          unit,
          whenCharged,
          daysBefore: required && whenCharged === 'before' ? daysBefore : 0,
        })
      }
      disableSave={required && !amount}
    >
      <div className="space-y-4">
        <div className="text-[13px] text-gray-500 leading-snug">
          Business default: <span className="text-gray-900 font-medium">{defSummary}</span>.
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="flex-1 text-[14px] text-gray-900">Require deposit</div>
          <Toggle value={required} onChange={setRequired} />
        </div>

        {required && (
          <>
            <div>
              <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">Amount</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-3 py-2.5 flex-1">
                  <span className="text-[14px] text-gray-500">{unit === '%' ? '%' : '£'}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-[16px] font-medium bg-transparent outline-none min-w-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
                  {['£', '%'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ' +
                        (unit === u ? 'bg-white text-gray-900' : 'text-gray-500')
                      }
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">When charged</div>
              <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
                {[
                  { k: 'booking', label: 'At booking' },
                  { k: 'before', label: 'Days before' },
                ].map((w) => (
                  <button
                    key={w.k}
                    onClick={() => setWhenCharged(w.k)}
                    className={
                      'py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                      (whenCharged === w.k ? 'bg-white text-gray-900' : 'text-gray-500')
                    }
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              {whenCharged === 'before' && (
                <div className="flex items-center gap-2 mt-2 bg-gray-50 rounded-xl px-3 py-2.5">
                  <input
                    type="number"
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-[16px] font-medium bg-transparent outline-none min-w-0"
                  />
                  <span className="text-[13px] text-gray-500">days before appointment</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SettingSheet>
  );
}
