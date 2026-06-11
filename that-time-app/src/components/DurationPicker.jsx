const PRESETS = [15, 30, 45, 60, 90, 120];

export default function DurationPicker({ value = 0, onChange }) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  const setHours = (h) => onChange(clamp(h, 0, 24) * 60 + minutes);
  const setMinutes = (m) => onChange(hours * 60 + clamp(m, 0, 59));

  return (
    <div>
      <div className="text-[13px] font-medium text-gray-700 mb-2">Duration</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <UnitInput label="hours" value={hours} onChange={setHours} max={24} />
        <UnitInput label="min" value={minutes} onChange={setMinutes} max={59} step={5} />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={
              'px-3 py-1.5 rounded-full text-[12px] transition-colors ' +
              (value === m
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700')
            }
          >
            {formatDuration(m)}
          </button>
        ))}
      </div>
    </div>
  );
}

function UnitInput({ label, value, onChange, max, step = 1 }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-baseline gap-2">
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="flex-1 min-w-0 text-[18px] font-medium bg-transparent outline-none"
      />
      <span className="text-[12px] text-gray-500">{label}</span>
    </div>
  );
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function formatDuration(min) {
  if (!min) return '0m';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
