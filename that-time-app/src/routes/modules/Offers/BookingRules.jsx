// Booking rules — class-level overrides on top of the business defaults.
// Each rule is independently overridable so an instructor can tighten just
// "cancel notice" without re-stating everything else. When no overrides are
// set, the business defaults apply silently.

import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';

const RULES = [
  {
    key: 'open',
    title: 'Booking opens',
    desc: 'How far ahead customers can start booking sessions.',
    units: [
      { key: 'days',  label: 'days' },
      { key: 'weeks', label: 'weeks' },
    ],
  },
  {
    key: 'close',
    title: 'Booking closes',
    desc: 'Cut-off before the session starts.',
    units: [
      { key: 'minutes', label: 'min' },
      { key: 'hours',   label: 'hours' },
      { key: 'days',    label: 'days' },
    ],
  },
  {
    key: 'cancel',
    title: 'Cancellation notice',
    desc: 'Customers can cancel up to this point before the session.',
    units: [
      { key: 'hours', label: 'hours' },
      { key: 'days',  label: 'days' },
    ],
  },
];

export default function BookingRules() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const rules = ao.bookingRules || emptyAdvancedOptions().bookingRules;

  const updateRule = (key, patch) =>
    updateDraft({
      advancedOptions: {
        ...ao,
        bookingRules: { ...rules, [key]: { ...rules[key], ...patch } },
      },
    });
  const updateLateFee = (patch) =>
    updateDraft({
      advancedOptions: {
        ...ao,
        bookingRules: { ...rules, lateFee: { ...rules.lateFee, ...patch } },
      },
    });

  return (
    <>
      <ScreenHeader title="Booking rules" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-4">
        <p className="text-[14px] text-gray-500 leading-snug">
          Override your business defaults for this class only. Untouched rules inherit silently.
        </p>

        {RULES.map(({ key, title, desc, units }) => {
          const rule = rules[key] || {};
          return (
            <div key={key} className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium">{title}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{desc}</div>
                </div>
                <Toggle
                  checked={Boolean(rule.override)}
                  onChange={(v) => updateRule(key, { override: v })}
                />
              </div>
              {rule.override && (
                <div className="border-t border-white px-4 py-3">
                  <div className="flex gap-2 items-end">
                    <div className="w-24">
                      <TextField
                        label="Value"
                        type="number"
                        value={rule.value}
                        onChange={(v) => updateRule(key, { value: v })}
                        placeholder="2"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-1">
                      {units.map((u) => (
                        <button
                          key={u.key}
                          onClick={() => updateRule(key, { unit: u.key })}
                          className={
                            'flex-1 h-11 rounded-xl text-[13px] font-medium transition-colors ' +
                            (rule.unit === u.key
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100')
                          }
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Late cancel fee */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium">Late cancel fee</div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                Charge customers who cancel after the cancellation notice window.
              </div>
            </div>
            <Toggle
              checked={Boolean(rules.lateFee?.enabled)}
              onChange={(v) => updateLateFee({ enabled: v })}
            />
          </div>
          {rules.lateFee?.enabled && (
            <div className="border-t border-white px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1">
                {[
                  { key: 'fixed',   label: 'Fixed amount' },
                  { key: 'percent', label: 'Percent of price' },
                ].map(({ key, label }) => {
                  const active = (rules.lateFee?.type || 'fixed') === key;
                  return (
                    <button
                      key={key}
                      onClick={() => updateLateFee({ type: key })}
                      className={
                        'h-9 rounded-lg text-[13px] font-medium transition-colors ' +
                        (active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <TextField
                label={rules.lateFee?.type === 'percent' ? 'Percent (%)' : 'Amount (£)'}
                type="number"
                value={rules.lateFee?.amount}
                onChange={(v) => updateLateFee({ amount: v })}
                placeholder={rules.lateFee?.type === 'percent' ? '50' : '15'}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}
