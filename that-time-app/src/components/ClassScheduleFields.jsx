import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import TextField from './TextField';
import { emptyClassDetails } from '../data/offerTypes';

// ─── data ────────────────────────────────────────────────────────────────────

const RECURRENCE_OPTIONS = [
  { key: 'never',    label: 'Never' },
  { key: 'daily',    label: 'Daily' },
  { key: 'weekly',   label: 'Weekly' },
  { key: 'biweekly', label: 'Every 2 weeks' },
  { key: 'monthly',  label: 'Monthly' },
  { key: 'yearly',   label: 'Yearly' },
  { key: 'custom',   label: 'Custom…' },
];

const END_OPTIONS = [
  { key: 'never',    label: 'Never' },
  { key: 'sessions', label: 'After sessions' },
  { key: 'date',     label: 'On date' },
];

const DAYS     = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ORDINALS = ['1st', '2nd', '3rd', '4th', 'Last'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const UNITS    = [{ key: 'day', label: 'Days' }, { key: 'week', label: 'Weeks' }, { key: 'month', label: 'Months' }];

function recurrenceLabel(key) {
  return RECURRENCE_OPTIONS.find((o) => o.key === key)?.label ?? 'Never';
}
function endLabel(key) {
  return END_OPTIONS.find((o) => o.key === key)?.label ?? 'Never';
}

// ─── shared selector row ─────────────────────────────────────────────────────

function SelectorRow({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center bg-gray-50 rounded-2xl px-4 py-4 text-left hover:bg-gray-100 transition-colors"
    >
      <span className="flex-1 text-[15px] font-medium text-gray-900">{label}</span>
      <span className="text-[15px] text-gray-500 mr-2">{value}</span>
      <ChevronRight size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ClassScheduleFields({ schedule, onChange }) {
  const s = { ...emptyClassDetails().schedule, ...schedule };
  const [repeatsOpen, setRepeatsOpen] = useState(false);
  const [endsOpen,    setEndsOpen]    = useState(false);

  const set = (patch) => onChange(patch);
  const isRecurring = s.recurrence !== 'never';

  const toggleDay = (day) => {
    const days = new Set(s.days || []);
    days.has(day) ? days.delete(day) : days.add(day);
    set({ days: DAYS.filter((d) => days.has(d)) });
  };

  return (
    <div className="space-y-3">

      {/* Date + Time — always visible */}
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={isRecurring ? 'First session' : 'Date'}
          type="date"
          value={s.date}
          onChange={(v) => set({ date: v })}
        />
        <TextField
          label="Start time"
          type="time"
          value={s.time}
          onChange={(v) => set({ time: v })}
        />
      </div>

      {/* Repeats selector row */}
      <SelectorRow
        label="Repeats"
        value={recurrenceLabel(s.recurrence)}
        onClick={() => setRepeatsOpen(true)}
      />

      {/* ── Inline details that appear after a recurrence is chosen ── */}

      {/* Weekly / Bi-weekly — day chips */}
      {(s.recurrence === 'weekly' || s.recurrence === 'biweekly') && (
        <div className="px-1">
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-2">
            {s.recurrence === 'biweekly' ? 'Repeats every other week on' : 'Repeats on'}
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = (s.days || []).includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={
                    'h-9 px-3 rounded-full text-[13px] font-medium transition-colors ' +
                    (active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly options */}
      {s.recurrence === 'monthly' && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1">
            {[
              { key: 'dayOfWeek', label: 'By weekday' },
              { key: 'dayOfMonth', label: 'By date' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set({ monthlyMode: key })}
                className={
                  'py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                  (s.monthlyMode === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')
                }
              >
                {label}
              </button>
            ))}
          </div>

          {s.monthlyMode === 'dayOfWeek' ? (
            <div className="space-y-2">
              <div className="text-[12px] text-gray-500">Ordinal</div>
              <div className="flex gap-1.5 flex-wrap">
                {ORDINALS.map((o) => (
                  <button
                    key={o}
                    onClick={() => set({ monthlyOrdinal: o })}
                    className={
                      'h-8 px-3 rounded-full text-[12px] font-medium transition-colors ' +
                      (s.monthlyOrdinal === o ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
              <div className="text-[12px] text-gray-500 mt-1">Weekday</div>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => set({ monthlyWeekday: day })}
                    className={
                      'h-8 px-3 rounded-full text-[12px] font-medium transition-colors ' +
                      (s.monthlyWeekday === day ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-gray-400">
                e.g. the {s.monthlyOrdinal} {s.monthlyWeekday} of each month
              </p>
            </div>
          ) : (
            <TextField
              label="Day of month"
              type="number"
              value={s.monthlyDayOfMonth}
              onChange={(v) => set({ monthlyDayOfMonth: v })}
              placeholder="15"
            />
          )}
        </div>
      )}

      {/* Custom interval */}
      {s.recurrence === 'custom' && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="text-[13px] font-medium text-gray-700">Repeat every</div>
          <div className="flex gap-2">
            <div className="w-20">
              <TextField
                label=""
                type="number"
                value={s.customInterval}
                onChange={(v) => set({ customInterval: v })}
                placeholder="2"
              />
            </div>
            <div className="flex gap-1.5 flex-1">
              {UNITS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => set({ customUnit: key })}
                  className={
                    'flex-1 h-11 rounded-xl text-[13px] font-medium transition-colors ' +
                    (s.customUnit === key ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {s.customUnit === 'week' && (
            <div>
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-2">On these days</div>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const active = (s.days || []).includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={
                        'h-8 px-3 rounded-full text-[12px] font-medium transition-colors ' +
                        (active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ends row — only shown when recurring */}
      {isRecurring && (
        <>
          <SelectorRow
            label="Ends"
            value={endLabel(s.endMode)}
            onClick={() => setEndsOpen(true)}
          />
          {s.endMode === 'sessions' && (
            <TextField
              label="Number of sessions"
              type="number"
              value={s.endSessions}
              onChange={(v) => set({ endSessions: v })}
              placeholder="10"
            />
          )}
          {s.endMode === 'date' && (
            <TextField
              label="End date"
              type="date"
              value={s.endDate}
              onChange={(v) => set({ endDate: v })}
            />
          )}
        </>
      )}

      {/* ── Repeats bottom sheet ── */}
      {repeatsOpen && (
        <>
          <div className="absolute inset-0 bg-black/30 z-20" onClick={() => setRepeatsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl pb-6">
            <div className="px-5 pt-5 pb-2">
              <div className="text-[17px] font-semibold">Repeats</div>
            </div>
            <div className="px-5">
              {RECURRENCE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { set({ recurrence: key }); setRepeatsOpen(false); }}
                  className="w-full flex items-center py-3.5 border-b border-gray-50 last:border-0"
                >
                  <span className="flex-1 text-[16px] text-left text-gray-900">{label}</span>
                  {s.recurrence === key && <Check size={17} className="text-gray-900" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Ends bottom sheet ── */}
      {endsOpen && (
        <>
          <div className="absolute inset-0 bg-black/30 z-20" onClick={() => setEndsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl pb-6">
            <div className="px-5 pt-5 pb-2">
              <div className="text-[17px] font-semibold">Ends</div>
            </div>
            <div className="px-5">
              {END_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { set({ endMode: key }); setEndsOpen(false); }}
                  className="w-full flex items-center py-3.5 border-b border-gray-50 last:border-0"
                >
                  <span className="flex-1 text-[16px] text-left text-gray-900">{label}</span>
                  {s.endMode === key && <Check size={17} className="text-gray-900" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
