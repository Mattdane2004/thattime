export default function EmptyState({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="px-5 pt-4 pb-6 text-center">
      {Icon && (
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <Icon size={24} className="text-gray-500" strokeWidth={1.5} />
        </div>
      )}
      <div className="text-[18px] font-semibold tracking-tight">{title}</div>
      {subtitle && (
        <div className="text-[14px] text-gray-500 mt-1.5 leading-snug max-w-[280px] mx-auto">
          {subtitle}
        </div>
      )}
      {children && <div className="mt-6 text-left">{children}</div>}
    </div>
  );
}
