import { useState } from 'react';
import { Pencil, Plus, Check, ChevronDown } from 'lucide-react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from './SheetShell';
import DayPicker from './DayPicker';
import { bookableStaff, CURRENT_MONTH } from '../../data/bookingOptions';

// "Block Time" — Fresha-style: pick a blocked-time type (or create one), a
// slot with start/end times, who it applies to, and how often it repeats.

const DEFAULT_TYPES = [
  { id: 'custom', name: 'Custom', desc: 'New blocked time', minutes: 30, paid: true, custom: true },
  { id: 'lunch', emoji: '🥪', name: 'Lunch', minutes: 30, paid: false },
  { id: 'break', emoji: '☕', name: 'Break', minutes: 15, paid: true },
  { id: 'training', emoji: '📚', name: 'Training', minutes: 60, paid: true },
  { id: 'admin', emoji: '🧾', name: 'Admin', minutes: 30, paid: true },
];

const EMOJI_OPTIONS = [
  '☕', '🥪', '🍽️', '🍰', '🧋', '😍', '📚', '🎓',
  '🧾', '📦', '📞', '💻', '🧹', '🧽', '💇', '💅',
  '💆', '🧖', '✂️', '🧴', '🩺', '🦷', '🧘', '🏃',
  '🚗', '✈️', '🌴', '❤️', '🎉', '🎂', '🛠️', '🔒',
];

// 15 min → 9 hours in 5-minute steps.
const DURATION_CHOICES = (() => {
  const out = [];
  for (let m = 15; m <= 540; m += 5) out.push(m);
  return out;
})();

function durationChoiceLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return `${h} hour${h > 1 ? 's' : ''}${m ? ` ${m} min` : ''}`;
}

const FREQUENCIES = ["Doesn't repeat", 'Every day', 'Every week', 'Every month'];

const TIME_OPTIONS = (() => {
  const out = [];
  for (let h = 8; h < 19; h++) {
    for (const m of [0, 15, 30, 45]) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  out.push('19:00');
  return out;
})();

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

function durationLabel(mins) {
  if (mins <= 0) return 'Invalid times';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}h ` : ''}${m ? `${m} min ` : ''}duration`.trim();
}

// Native select dressed in the prototype's input style.
function TimeSelect({ label, value, onChange, options }) {
  return (
    <label className="block flex-1 min-w-0">
      <div className="text-[12px] font-medium text-gray-500 mb-1.5">{label}</div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-gray-900"
        >
          {options.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </label>
  );
}

export default function BlockTimeSheet({ open, onClose, prefill = {}, onAdd }) {
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [typeId, setTypeId] = useState('custom');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState('12:30');
  const [staff, setStaff] = useState(['emma']);
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [description, setDescription] = useState('');
  const [onlineBooking, setOnlineBooking] = useState(false);
  // Create-a-type subsheet
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeEmoji, setNewTypeEmoji] = useState('☕');
  const [newTypeDuration, setNewTypeDuration] = useState(60);
  const [newTypePaid, setNewTypePaid] = useState(true);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  if (!open) return null;

  // Calendar-slot prefill: tap a slot → day, month and start arrive ready.
  const effDay = day ?? prefill.day ?? 4;
  const effMonth = month ?? prefill.month ?? CURRENT_MONTH;
  const effStart = start ?? prefill.time ?? '12:00';
  const selectedType = types.find((t) => t.id === typeId);
  const minutes = toMinutes(end) - toMinutes(effStart);

  const reset = () => {
    setTypeId('custom');
    setTitle('');
    setDay(null);
    setMonth(null);
    setStart(null);
    setEnd('12:30');
    setStaff(['emma']);
    setFrequency(FREQUENCIES[0]);
    setDescription('');
    setOnlineBooking(false);
    setAddTypeOpen(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const pickType = (t) => {
    setTypeId(t.id);
    if (!t.custom) {
      setEnd(toTime(toMinutes(effStart) + t.minutes));
      setTitle(t.name);
    } else {
      setTitle('');
    }
  };

  const setStartKeepDuration = (next) => {
    const dur = minutes > 0 ? minutes : selectedType?.minutes || 30;
    setStart(next);
    setEnd(toTime(Math.min(toMinutes('19:00'), toMinutes(next) + dur)));
  };

  const toggleStaff = (id) =>
    setStaff((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const endOptions = TIME_OPTIONS.filter((t) => toMinutes(t) > toMinutes(effStart));

  const save = () => {
    const reason =
      (typeId === 'custom' ? title.trim() : selectedType.name) || 'Blocked time';
    onAdd({
      id: `blk_${Date.now().toString(36)}`,
      kind: 'block',
      day: effDay,
      month: effMonth,
      time: effStart,
      duration: durationLabel(minutes).replace(' duration', ''),
      minutes,
      reason: frequency === FREQUENCIES[0] ? reason : `${reason} · repeats`,
      staffIds: staff,
    });
    close();
  };

  return (
    <SheetShell
      open={open}
      onClose={close}
      title="Add blocked time"
      footer={
        <SheetCta disabled={minutes <= 0 || staff.length === 0} onClick={save}>
          Save
        </SheetCta>
      }
    >
      {/* Type presets */}
      <SheetSectionLabel>Block time type</SheetSectionLabel>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => pickType(t)}
            className={
              'shrink-0 w-[108px] rounded-2xl py-4 px-2 flex flex-col items-center gap-1.5 border text-center transition-colors ' +
              (typeId === t.id
                ? 'border-gray-900 border-[1.5px]'
                : 'border-gray-200 hover:bg-gray-50')
            }
          >
            {t.custom ? (
              <Pencil size={20} className="text-gray-900" strokeWidth={1.5} />
            ) : (
              <span className="text-[20px] leading-none">{t.emoji}</span>
            )}
            <span className="text-[13px] font-semibold text-gray-900 mt-1">{t.name}</span>
            <span className="text-[11px] text-gray-400 leading-tight">
              {t.custom ? t.desc : `${t.minutes} min · ${t.paid ? 'Paid' : 'Unpaid'}`}
            </span>
          </button>
        ))}
        <button
          onClick={() => setAddTypeOpen(true)}
          className="shrink-0 w-[108px] rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-1.5 border border-dashed border-gray-300 text-center hover:bg-gray-50 transition-colors"
        >
          <Plus size={20} className="text-gray-400" strokeWidth={1.5} />
          <span className="text-[12px] font-medium text-gray-500">New type</span>
        </button>
      </div>

      {/* Title — only when custom */}
      {typeId === 'custom' && (
        <label className="block mt-4">
          <div className="text-[12px] font-medium text-gray-500 mb-1.5">
            Title <span className="text-gray-300">(Optional)</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lunch meeting"
            className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
          />
        </label>
      )}

      <SheetSectionLabel>Date</SheetSectionLabel>
      <DayPicker
        selected={effDay}
        selectedMonth={effMonth}
        onSelect={(d, m) => {
          setDay(d);
          setMonth(m);
        }}
      />

      {/* Start / end */}
      <div className="flex gap-2.5 mt-5">
        <TimeSelect
          label="Start time"
          value={effStart}
          onChange={setStartKeepDuration}
          options={TIME_OPTIONS}
        />
        <TimeSelect label="End time" value={end} onChange={setEnd} options={endOptions} />
      </div>
      <div className="text-[12px] text-gray-400 mt-1.5 text-right">{durationLabel(minutes)}</div>

      <SheetSectionLabel>Team members</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {bookableStaff.map((m) => (
          <Chip key={m.id} selected={staff.includes(m.id)} onClick={() => toggleStaff(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <SheetSectionLabel>Frequency</SheetSectionLabel>
      <div className="relative">
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full appearance-none bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-gray-900"
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Description */}
      <div className="flex items-baseline justify-between mt-5 mb-2.5">
        <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Description <span className="normal-case tracking-normal text-gray-300">(Optional)</span>
        </span>
        <span className="text-[11px] text-gray-400">{description.length}/255</span>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 255))}
        placeholder="Add description or note"
        rows={3}
        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none resize-none focus:ring-1 focus:ring-gray-900"
      />

      {/* Online booking toggle */}
      <button
        onClick={() => setOnlineBooking((v) => !v)}
        className="flex items-center gap-3 mt-4 mb-2 text-left"
      >
        <span
          className={
            'w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ' +
            (onlineBooking ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white')
          }
        >
          {onlineBooking && <Check size={14} className="text-white" strokeWidth={2.5} />}
        </span>
        <span className="text-[13px] text-gray-900">
          Online booking allowed during blocked time
        </span>
      </button>

      {/* Create a new blocked-time type */}
      <SheetShell
        open={addTypeOpen}
        onClose={() => setAddTypeOpen(false)}
        title="Add a blocked time type"
        subtitle="Create a new blocked time type"
        footer={
          <SheetCta
            disabled={!newTypeName.trim()}
            onClick={() => {
              const t = {
                id: `type_${Date.now().toString(36)}`,
                emoji: newTypeEmoji,
                name: newTypeName.trim(),
                minutes: newTypeDuration,
                paid: newTypePaid,
              };
              setTypes((all) => [...all, t]);
              setAddTypeOpen(false);
              setNewTypeName('');
              pickType(t);
            }}
          >
            Save
          </SheetCta>
        }
      >
        <SheetSectionLabel>Type</SheetSectionLabel>
        <div className="flex gap-2.5">
          <button
            onClick={() => setEmojiPickerOpen(true)}
            className="shrink-0 w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-[20px] hover:bg-gray-50 transition-colors"
            aria-label="Choose icon"
          >
            {newTypeEmoji}
          </button>
          <input
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="e.g. Patch test"
            autoFocus
            className="flex-1 min-w-0 bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <SheetSectionLabel>Duration</SheetSectionLabel>
        <div className="relative">
          <select
            value={newTypeDuration}
            onChange={(e) => setNewTypeDuration(Number(e.target.value))}
            className="w-full appearance-none bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-gray-900"
          >
            {DURATION_CHOICES.map((m) => (
              <option key={m} value={m}>
                {durationChoiceLabel(m)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <SheetSectionLabel>Compensation</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Paid', value: true },
            { label: 'Unpaid', value: false },
          ].map((o) => (
            <Chip
              key={o.label}
              selected={newTypePaid === o.value}
              onClick={() => setNewTypePaid(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </SheetShell>

      {/* Emoji picker for the new type */}
      <SheetShell
        open={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        title="Choose an icon"
        subtitle={newTypeName.trim() || 'New blocked time type'}
      >
        <div className="grid grid-cols-6 gap-2 pb-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => {
                setNewTypeEmoji(e);
                setEmojiPickerOpen(false);
              }}
              className={
                'aspect-square rounded-xl border flex items-center justify-center text-[22px] transition-colors ' +
                (newTypeEmoji === e
                  ? 'border-gray-900 border-[1.5px] bg-gray-50'
                  : 'border-gray-100 hover:bg-gray-50')
              }
            >
              {e}
            </button>
          ))}
        </div>
      </SheetShell>
    </SheetShell>
  );
}
