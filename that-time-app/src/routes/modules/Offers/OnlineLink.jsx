// Online class link — only relevant when Livestream is enabled. URL plus
// when to reveal it to attendees (immediately after booking, 24h before,
// 1h before, or a custom offset).

import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';

const TIMING = [
  { key: 'immediate', label: 'Immediately on booking' },
  { key: '24h',       label: '24 hours before' },
  { key: '1h',        label: '1 hour before' },
  { key: 'custom',    label: 'Custom offset' },
];

const UNITS = [
  { key: 'minutes', label: 'min' },
  { key: 'hours',   label: 'hours' },
  { key: 'days',    label: 'days' },
];

export default function OnlineLink() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const link = ao.onlineLink || emptyAdvancedOptions().onlineLink;
  const remoteEnabled = Boolean(draft.locations?.remote?.enabled);

  const update = (patch) =>
    updateDraft({ advancedOptions: { ...ao, onlineLink: { ...link, ...patch } } });

  return (
    <>
      <ScreenHeader title="Online class link" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        {!remoteEnabled && (
          <div className="px-4 py-3 rounded-xl bg-amber-50 text-[13px] text-amber-900 leading-snug">
            This class doesn’t have a livestream / online location enabled. Turn it on in
            Schedule &amp; Location to share an online link with attendees.
          </div>
        )}

        <TextField
          label="Meeting URL"
          value={link.url}
          onChange={(v) => update({ url: v })}
          placeholder="https://zoom.us/j/123456"
        />

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
            When to share with attendees
          </div>
          <div className="space-y-1.5">
            {TIMING.map(({ key, label }) => {
              const active = link.timing === key;
              return (
                <button
                  key={key}
                  onClick={() => update({ timing: key })}
                  className={
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[14px] transition-colors ' +
                    (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
                  }
                >
                  <div
                    className={
                      'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                      (active ? 'border-white' : 'border-gray-400')
                    }
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  {label}
                </button>
              );
            })}
          </div>

          {link.timing === 'custom' && (
            <div className="mt-3 bg-gray-50 rounded-2xl p-3 flex gap-2">
              <div className="w-24">
                <TextField
                  label=""
                  type="number"
                  value={link.customValue}
                  onChange={(v) => update({ customValue: v })}
                  placeholder="30"
                />
              </div>
              <div className="flex gap-1.5 flex-1">
                {UNITS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => update({ customUnit: key })}
                    className={
                      'flex-1 h-11 rounded-xl text-[13px] font-medium transition-colors ' +
                      (link.customUnit === key ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-400 leading-snug mt-2">
            Attendees only see the link after the timing window opens — keeps the link out of
            screenshots and shared bookings.
          </p>
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
