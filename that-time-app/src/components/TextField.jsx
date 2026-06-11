export default function TextField({ label, value = '', onChange, placeholder, type = 'text', rows }) {
  const base =
    'mt-2 w-full bg-gray-50 rounded-xl px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:bg-gray-100 transition-colors';
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-gray-700">{label}</span>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={base + ' resize-none'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </label>
  );
}
