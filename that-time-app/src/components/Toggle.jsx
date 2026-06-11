export default function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        'w-11 h-[26px] rounded-full relative shrink-0 transition-colors ' +
        (checked ? 'bg-gray-900' : 'bg-gray-200')
      }
    >
      <span
        className={
          'block w-[22px] h-[22px] rounded-full bg-white absolute top-0.5 transition-all ' +
          (checked ? 'left-[20px]' : 'left-0.5')
        }
      />
    </button>
  );
}
