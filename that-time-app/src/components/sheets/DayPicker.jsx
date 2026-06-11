import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CURRENT_MONTH,
  monthName,
  daysInMonth,
  firstWeekdayOffset,
} from '../../data/bookingOptions';

// Full-month day picker used in the booking flows. The chevrons page through
// the months of 2026 so any date can be chosen.
export default function DayPicker({ selected, selectedMonth = CURRENT_MONTH, onSelect }) {
  const [viewMonth, setViewMonth] = useState(selectedMonth ?? CURRENT_MONTH);

  const cells = [
    ...Array(firstWeekdayOffset(viewMonth)).fill(null),
    ...Array.from({ length: daysInMonth(viewMonth) }, (_, i) => i + 1),
  ];

  return (
    <div className="border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth((m) => Math.max(0, m - 1))}
          disabled={viewMonth === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft size={15} className="text-gray-500" />
        </button>
        <div className="text-[14px] font-semibold text-gray-900">
          {monthName(viewMonth)} 2026
        </div>
        <button
          type="button"
          onClick={() => setViewMonth((m) => Math.min(11, m + 1))}
          disabled={viewMonth === 11}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight size={15} className="text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {cells.map((day, i) => {
          if (day === null) return <div key={`x${i}`} />;
          const isToday = day === 4 && viewMonth === CURRENT_MONTH;
          const isSelected = day === selected && viewMonth === selectedMonth;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(day, viewMonth)}
              className="py-0.5 flex justify-center"
            >
              <span
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] ' +
                  (isSelected
                    ? 'bg-gray-900 text-white font-semibold'
                    : isToday
                      ? 'border border-gray-300 text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100')
                }
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-gray-400 mt-2 text-center">Today is Wednesday 4 March</div>
    </div>
  );
}
