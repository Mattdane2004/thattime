import BottomSheet from '../../../components/BottomSheet';

/**
 * Wraps a BottomSheet with the consistent shape for a setting sheet:
 *  - title
 *  - body (caller-provided controls)
 *  - Optional "Using default — tap to override" hint when inherited
 *  - Footer: [Reset to default] [Save]
 * `isOverride` controls whether Reset to default is active.
 */
export default function SettingSheet({
  open,
  onClose,
  title,
  isOverride,
  onReset,
  onSave,
  disableSave,
  children,
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            disabled={!isOverride}
            className={
              'flex-1 h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (isOverride
                ? 'border border-gray-200 text-gray-900 hover:bg-gray-50'
                : 'border border-gray-100 text-gray-400')
            }
          >
            Reset to default
          </button>
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            disabled={disableSave}
            className={
              'flex-1 h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (disableSave
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-900 hover:bg-gray-800 text-white')
            }
          >
            Save
          </button>
        </div>
      }
    >
      {children}
    </BottomSheet>
  );
}
