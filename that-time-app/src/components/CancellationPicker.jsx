const POLICIES = [
  { key: 'none', label: 'No policy' },
  { key: '24h', label: '24 hours' },
  { key: '48h', label: '48 hours' },
  { key: '1w', label: '1 week' },
];

export default function CancellationPicker({ value, onChange }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-gray-700 mb-2">Cancellation window</div>
      <div className="space-y-2">
        {POLICIES.map((p) => {
          const isOn = value === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onChange(p.key)}
              className={
                'w-full flex items-center justify-between p-4 rounded-xl text-left text-[15px] transition-colors ' +
                (isOn ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100')
              }
            >
              <span>{p.label}</span>
              <span
                className={
                  'w-5 h-5 rounded-full border-2 ' +
                  (isOn ? 'border-white bg-white' : 'border-gray-300')
                }
              />
            </button>
          );
        })}
      </div>
      <div className="text-[12px] text-gray-500 mt-3 leading-snug">
        Clients must cancel at least this far ahead to avoid charges.
      </div>
    </div>
  );
}
