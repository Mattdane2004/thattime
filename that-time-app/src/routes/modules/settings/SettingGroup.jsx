export default function SettingGroup({ title, footer, children }) {
  return (
    <div className="mb-8">
      {title && (
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
          {title}
        </div>
      )}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
      {footer && (
        <div className="text-[12px] text-gray-500 mt-2 px-4 leading-snug">{footer}</div>
      )}
    </div>
  );
}
