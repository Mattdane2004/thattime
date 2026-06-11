// Pill-shaped chip used on the class staff step to indicate whether each
// team member is free for the chosen schedule.
//
// Three states:
//   available   — green
//   partial     — amber, label is "{N} conflicts"
//   unavailable — red

const TONE = {
  available:   { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  partial:     { dot: 'bg-amber-500',   text: 'text-amber-800',   bg: 'bg-amber-50'   },
  unavailable: { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50'    },
};

export default function AvailabilityChip({ status, label, onClick }) {
  const tone = TONE[status] || TONE.available;
  const interactive = Boolean(onClick) && status === 'partial';

  const className =
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ' +
    `${tone.bg} ${tone.text} ` +
    (interactive ? 'hover:brightness-95 cursor-pointer' : '');

  if (interactive) {
    return (
      <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={className}>
        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <span className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      <span>{label}</span>
    </span>
  );
}
