export default function Pill({ label, active, onClick, count, dotColor }) {
  return (
    <button
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors ' +
        (active
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
      }
    >
      {dotColor && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {label}
      {typeof count === 'number' && (
        <span className={active ? 'text-gray-300' : 'text-gray-500'}>{count}</span>
      )}
    </button>
  );
}
