// Generic confirmation sheet for destructive or significant actions —
// keeps the user in context instead of a full-screen interstitial.
export default function ConfirmSheet({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  keepLabel = 'Keep it',
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl px-5 pt-5 pb-6">
        <div className="text-[17px] font-bold text-gray-900">{title}</div>
        <div className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{message}</div>
        <div className="space-y-2.5 mt-5">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full rounded-full py-3.5 text-[14px] font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full py-3.5 text-[14px] font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors"
          >
            {keepLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
