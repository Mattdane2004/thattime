import { createElement } from 'react';
import { Clock, User, CalendarClock, MapPin, ChevronRight } from 'lucide-react';
import BottomSheet from './BottomSheet';

const TYPES = [
  { key: 'duration', label: 'Duration', desc: 'Different lengths of the same service', Icon: Clock },
  { key: 'staff', label: 'Staff', desc: 'Priced per team member', Icon: User },
  { key: 'time', label: 'Time & date', desc: 'Weekend, evening, off-peak rates', Icon: CalendarClock },
  { key: 'location', label: 'Location', desc: 'Different price per site', Icon: MapPin },
];

export default function AddVariantSheet({ open, onClose, onPick }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="What kind of variant?">
      <div className="space-y-2 pb-2">
        {TYPES.map(({ key, label, desc, Icon }) => (
          <button
            key={key}
            onClick={() => onPick(key)}
            className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              {createElement(Icon, { size: 18, className: 'text-gray-700', strokeWidth: 1.75 })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-gray-900">{label}</div>
              <div className="text-[13px] text-gray-500 mt-0.5 truncate">{desc}</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
