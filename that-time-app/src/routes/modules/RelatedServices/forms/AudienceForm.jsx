const DIMENSIONS = [
  {
    key: 'genders',
    label: 'Gender',
    options: [
      { k: 'female', label: 'Female' },
      { k: 'male', label: 'Male' },
      { k: 'nonBinary', label: 'Non-binary' },
    ],
  },
  {
    key: 'histories',
    label: 'Client history',
    options: [
      { k: 'new', label: 'New' },
      { k: 'returning', label: 'Returning' },
      { k: 'vip', label: 'VIP' },
    ],
  },
  {
    key: 'engagements',
    label: 'Engagement',
    options: [
      { k: 'recent', label: 'Booked recently' },
      { k: 'winback', label: "Hasn't booked in 3m+" },
    ],
  },
];

export default function AudienceForm({ audience, onAudienceChange }) {
  const toggle = (dimKey, optionKey) => {
    const current = audience[dimKey] || [];
    const next = current.includes(optionKey)
      ? current.filter((x) => x !== optionKey)
      : [...current, optionKey];
    onAudienceChange({ ...audience, [dimKey]: next });
  };

  return (
    <div className="space-y-6">
      <div className="text-[13px] text-gray-500 leading-snug">
        Leave a dimension empty to show this group to everyone. Pick one or more to narrow the audience.
      </div>

      {DIMENSIONS.map((dim) => {
        const selected = audience[dim.key] || [];
        const anyActive = selected.length === 0;
        return (
          <div key={dim.key}>
            <div className="text-[13px] font-medium text-gray-700 mb-2">{dim.label}</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAudienceChange({ ...audience, [dim.key]: [] })}
                className={
                  'px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors ' +
                  (anyActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }
              >
                Anyone
              </button>
              {dim.options.map((opt) => {
                const active = selected.includes(opt.k);
                return (
                  <button
                    key={opt.k}
                    onClick={() => toggle(dim.key, opt.k)}
                    className={
                      'px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors ' +
                      (active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const audienceSummary = (audience) => {
  if (!audience) return 'Anyone';
  const parts = [];
  const labels = {
    genders: { female: 'Female', male: 'Male', nonBinary: 'Non-binary' },
    histories: { new: 'New', returning: 'Returning', vip: 'VIP' },
    engagements: { recent: 'Recent', winback: 'Win-back' },
  };
  DIMENSIONS.forEach((dim) => {
    const sel = audience[dim.key] || [];
    if (sel.length > 0) {
      parts.push(sel.map((k) => labels[dim.key][k] || k).join('/'));
    }
  });
  return parts.length === 0 ? 'Anyone' : parts.join(' · ');
};

export const emptyAudience = () => ({ genders: [], histories: [], engagements: [] });
