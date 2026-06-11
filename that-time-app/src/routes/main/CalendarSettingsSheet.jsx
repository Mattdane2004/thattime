import { useState } from 'react';
import { X, Calendar, SlidersHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { teamRoster, jumpToDateDots } from '../../data/scheduleData';
import { monthName, daysInMonth, firstWeekdayOffset } from '../../data/bookingOptions';

// "Calendar Settings" sheet — Figma frames 8978:25577 / 26316 / 26856.
// Sections are contextual: the view picker shows for the calendar view, the
// team multi-select for the team view. Everything in here actually applies.

const DOT = {
  green: 'bg-green-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
};

const STATUS_OPTIONS = ['Confirmed', 'Unconfirmed', 'Done', 'No-show'];

function JumpToDate({ selectedDay, selectedMonth, onPickDate }) {
  const [viewMonth, setViewMonth] = useState(selectedMonth ?? 2);
  const cells = [
    ...Array(firstWeekdayOffset(viewMonth)).fill(null),
    ...Array.from({ length: daysInMonth(viewMonth) }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-3">
        Jump to date
      </div>
      <div className="border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button
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
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center">
          {cells.map((day, i) => {
            if (day === null) return <div key={`x${i}`} />;
            // Availability dots only exist for the designed month (March).
            const dot = viewMonth === 2 ? jumpToDateDots[day - 1] : null;
            const isSelected = day === selectedDay && viewMonth === selectedMonth;
            return (
              <button
                key={day}
                onClick={() => onPickDate(day, viewMonth)}
                className="py-1 flex flex-col items-center gap-0.5"
              >
                <span
                  className={
                    'w-7 h-7 rounded-full flex items-center justify-center text-[12px] ' +
                    (isSelected ? 'bg-gray-900 text-white font-semibold' : 'text-gray-700')
                  }
                >
                  {day}
                </span>
                <span
                  className={
                    'w-1 h-1 rounded-full ' + (dot && dot !== 'none' ? DOT[dot] : 'bg-transparent')
                  }
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterRow({ statusFilters, onChangeStatusFilters }) {
  const [hours, setHours] = useState('12h');
  const [expanded, setExpanded] = useState(false);

  const toggleStatus = (status) =>
    onChangeStatusFilters(
      statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status],
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={
            'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
            (statusFilters.length ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700')
          }
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          {statusFilters.length ? `Filter · ${statusFilters.length}` : 'Filter'}
          {expanded ? <ChevronUp size={13} strokeWidth={1.75} /> : <ChevronDown size={13} strokeWidth={1.75} />}
        </button>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" strokeWidth={1.75} />
          <div className="bg-gray-100 rounded-lg p-0.5 flex text-[12px] font-medium">
            {['12h', '24h'].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={
                  'px-2.5 py-1 rounded-md transition-colors ' +
                  (hours === h ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400')
                }
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="flex flex-wrap gap-2 mt-3">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={
                'rounded-full px-3.5 py-2 text-[12px] font-medium border transition-colors ' +
                (statusFilters.includes(status)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50')
              }
            >
              {status}
            </button>
          ))}
          {statusFilters.length > 0 && (
            <button
              onClick={() => onChangeStatusFilters([])}
              className="rounded-full px-3.5 py-2 text-[12px] font-medium text-gray-400 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ViewPicker({ calendarView, onChangeView }) {
  const options = [
    { key: 'day', label: 'Day', n: '1' },
    { key: '3day', label: '3 Day', n: '3' },
    { key: 'week', label: 'Week', n: '7' },
  ];
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-3">
        Calendar view
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChangeView(opt.key)}
            className={
              'rounded-2xl py-4 flex flex-col items-center gap-2 border transition-colors ' +
              (calendarView === opt.key
                ? 'border-gray-900 border-[1.5px]'
                : 'border-gray-200 hover:bg-gray-50')
            }
          >
            <span className="relative">
              <Calendar size={22} className="text-gray-900" strokeWidth={1.5} />
              <span className="absolute inset-0 flex items-center justify-center pt-1 text-[8px] font-bold text-gray-900">
                {opt.n}
              </span>
            </span>
            <span className="text-[13px] font-medium text-gray-900">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamPicker({ selectedStaff, onChangeStaff }) {
  const toggle = (id) =>
    onChangeStaff(
      selectedStaff.includes(id)
        ? selectedStaff.filter((x) => x !== id)
        : [...selectedStaff, id],
    );

  return (
    <div>
      <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2">
        Team view
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-gray-400">
          {selectedStaff.length}/{teamRoster.length} selected
        </span>
        <button
          onClick={() => onChangeStaff(teamRoster.map((m) => m.id))}
          className="bg-gray-100 rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-200"
        >
          select all
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
        {teamRoster.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={
              'shrink-0 w-[104px] rounded-2xl py-4 flex flex-col items-center gap-1 border transition-colors ' +
              (selectedStaff.includes(m.id)
                ? 'border-gray-900 border-[1.5px]'
                : 'border-transparent bg-gray-50')
            }
          >
            <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600">
              {m.initials}
            </span>
            <span className="text-[13px] font-medium text-gray-900 mt-1">{m.name}</span>
            <span className="text-[11px] text-gray-400">{m.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CalendarSettingsSheet({
  open,
  onClose,
  view,
  calendarView,
  onChangeView,
  selectedStaff,
  onChangeStaff,
  statusFilters,
  onChangeStatusFilters,
  selectedDay,
  selectedMonth,
  onPickDate,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl px-5 pt-5 pb-6 max-h-[92%] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[18px] font-bold text-gray-900">Calendar Settings</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="space-y-5">
          {view === 'calendar' && (
            <ViewPicker calendarView={calendarView} onChangeView={onChangeView} />
          )}
          {view === 'team' && (
            <TeamPicker selectedStaff={selectedStaff} onChangeStaff={onChangeStaff} />
          )}
          <FilterRow statusFilters={statusFilters} onChangeStatusFilters={onChangeStatusFilters} />
          <JumpToDate selectedDay={selectedDay} selectedMonth={selectedMonth} onPickDate={onPickDate} />
        </div>
      </div>
    </div>
  );
}
