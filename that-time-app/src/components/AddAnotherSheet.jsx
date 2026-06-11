import { Check } from 'lucide-react';
import BottomSheet from './BottomSheet';

export default function AddAnotherSheet({ open, onAddAnother, onDone, label = 'item' }) {
  return (
    <BottomSheet open={open} onClose={onDone} title="Saved">
      <div className="flex flex-col items-center text-center pt-4 pb-2">
        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mb-4">
          <Check size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="text-[18px] font-semibold text-gray-900 mb-1">Saved</div>
        <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
          Want to add another {label}?
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <button
          onClick={onAddAnother}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Add another
        </button>
        <button
          onClick={onDone}
          className="w-full h-12 rounded-full text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Done
        </button>
      </div>
    </BottomSheet>
  );
}
