import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Plus,
  CalendarCog,
  Calendar,
  Link2,
  Users,
} from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import MainTabBar from '../../components/MainTabBar';
import UpNextCard from '../../components/UpNextCard';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import BookingDetailsSheet from '../../components/sheets/BookingDetailsSheet';
import ClassDetailsSheet from '../../components/sheets/ClassDetailsSheet';
import BundleSheet from '../../components/sheets/BundleSheet';
import CalendarSettingsSheet from './CalendarSettingsSheet';
import { daysInMonth } from '../../data/bookingOptions';
import {
  DESIGNED_DAY,
  bookingFromBlock,
  bundleSessions,
  getDayLabel,
  getDayShort,
  parseTimeToMinutes,
  myDayTimeline,
  weekCalendar,
  teamColumns,
  bookingDetails,
  classSessions,
} from '../../data/scheduleData';

const VIEWS = [
  { key: 'myday', label: 'My Day' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'team', label: 'Team' },
];

// ----- Shared row pieces for My Day -------------------------------------------

function AppointmentRow({ start, end, client, service, isNew, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={
        'w-full bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left ' +
        (onClick ? 'hover:bg-gray-50 transition-colors' : '')
      }
    >
      <div className="w-10 shrink-0">
        <div className="text-[13px] font-bold text-gray-900">{start}</div>
        {end && <div className="text-[12px] text-gray-400">{end}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-gray-900">{client}</span>
          {isNew && (
            <span className="text-[10px] font-medium bg-gray-900 text-white rounded-full px-2 py-0.5">
              New
            </span>
          )}
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5">{service}</div>
      </div>
      {onClick && <ChevronRight size={16} className="text-gray-300 shrink-0" />}
    </Tag>
  );
}

function BreakRow({ time, label, duration }) {
  return (
    <div className="bg-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3">
      <span className="text-[13px] text-gray-400 w-10 shrink-0">{time}</span>
      <Coffee size={14} className="text-gray-400 shrink-0" strokeWidth={1.75} />
      <span className="flex-1 text-[13px] text-gray-500">{label}</span>
      <span className="text-[12px] text-gray-400">{duration}</span>
    </div>
  );
}

const endTimeFrom = (time, minutes) => {
  const total = parseTimeToMinutes(time) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

function addedRows(added) {
  return added.map((item) =>
    item.kind === 'block' ? (
      <BreakRow key={item.id} time={item.time} label={item.reason} duration={item.duration} />
    ) : (
      <AppointmentRow
        key={item.id}
        start={item.time}
        end={endTimeFrom(item.time, item.minutes)}
        client={item.client}
        service={`${item.service} · ${item.price}`}
        isNew
      />
    ),
  );
}

// Empty-day card — "Your day is wide open" variant from the Figma cards stack.
function EmptyDayCard({ onNewBooking, onShareLink }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mt-1">
      <div className="text-[15px] font-semibold text-gray-900">Your day is wide open</div>
      <div className="text-[12px] text-gray-400 mt-0.5 mb-3.5">
        Share your link or add a walk-in to get started
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onNewBooking}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 rounded-full py-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
        >
          <Calendar size={14} strokeWidth={1.75} />
          New booking
        </button>
        <button
          onClick={onShareLink}
          className="shrink-0 w-11 h-11 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Share booking link"
        >
          <Link2 size={15} className="text-gray-900" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

// ----- My Day -----------------------------------------------------------------

function MyDayView({ selectedDay, selectedMonth, added, onOpenBooking, onOpenClass }) {
  const { openAction, showToast } = useMainActions();

  if (selectedDay !== DESIGNED_DAY || selectedMonth !== 2) {
    return (
      <div className="px-4 pb-6 space-y-3">
        {added.length === 0 ? (
          <EmptyDayCard
            onNewBooking={() => openAction('appointment', { day: selectedDay, month: selectedMonth })}
            onShareLink={() => showToast('Booking link copied')}
          />
        ) : (
          addedRows(added)
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 space-y-3">
      {myDayTimeline.map((item) => {
        switch (item.kind) {
          case 'past':
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 shrink-0">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-gray-900">{item.client}</span>
                    <span className="text-[10px] font-medium bg-gray-100 rounded-full px-2 py-0.5 text-gray-500">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{item.service}</div>
                </div>
              </div>
            );
          case 'now':
            return (
              <div key={item.id} className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-[11px] font-medium text-gray-400">Now</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            );
          case 'break':
            return (
              <BreakRow key={item.id} time={item.time} label={item.label} duration={item.duration} />
            );
          case 'upNext':
            return <UpNextCard key={item.id} />;
          case 'appointment':
            return (
              <AppointmentRow
                key={item.id}
                start={item.start}
                end={item.end}
                client={item.client}
                service={item.service}
                onClick={() => onOpenBooking(item.bookingId)}
              />
            );
          case 'gap':
            return (
              <button
                key={item.id}
                onClick={() =>
                  openAction('appointment', { day: DESIGNED_DAY, time: item.time })
                }
                className="w-full border border-gray-200 border-dashed rounded-2xl px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] text-gray-400 w-10 shrink-0">{item.time}</span>
                <Plus size={14} className="text-gray-400 shrink-0" strokeWidth={1.75} />
                <span className="text-[13px] text-gray-400">{item.label}</span>
              </button>
            );
          case 'end':
            return (
              <div key={item.id} className="space-y-3">
                {addedRows(added)}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-[11px] text-gray-400">{item.label}</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </div>
            );
          case 'class': {
            const session = classSessions[item.classId];
            if (!session) return null;
            return (
              <button
                key={item.id}
                onClick={() => onOpenClass(item.classId)}
                className="w-full border-[1.5px] border-gray-900 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Users size={17} className="text-gray-900" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-900">{session.name}</span>
                    <span className="text-[9px] font-semibold border border-gray-900 rounded-full px-1.5 py-0.5">
                      Class
                    </span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    {session.time} · {session.attendees.length}/{session.capacity} booked · {session.location}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

// ----- Calendar (1 / 3 / 7 day grid) --------------------------------------------

const CAL_START_HOUR = 8;
const CAL_END_HOUR = 20;
const PX_PER_MIN = 0.9;

const BLOCK_TONES = {
  bundle: 'bg-gray-900 text-white border-l-4 border-gray-400',
  dark: 'bg-gray-900 text-white',
  mid: 'bg-gray-500 text-white',
  past: 'bg-gray-100 text-gray-400',
  break: 'bg-gray-50 border border-dashed border-gray-200 text-gray-400',
  // Classes are outlined so they read differently from 1:1 appointments.
  class: 'bg-white border-[1.5px] border-gray-900 text-gray-900',
};

function hourLabel(h) {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

const minutesToTime = (mins) => {
  const rounded = Math.max(0, Math.round(mins / 30) * 30);
  return `${String(Math.floor(rounded / 60)).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`;
};

function CalendarView({ selectedDay, selectedMonth, columnCount, added, onOpenBooking, onOpenClass, onOpenBundle, onOpenAdhoc, onCreateAt }) {
  const hours = [];
  for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) hours.push(h);
  const gridHeight = (CAL_END_HOUR - CAL_START_HOUR) * 60 * PX_PER_MIN;
  const compact = columnCount > 3;

  const days = [];
  for (let i = 0; i < columnCount; i++) {
    const day = selectedDay + i;
    if (day > daysInMonth(selectedMonth)) break;
    const addedBlocks = added
      .filter((b) => b.day === day && (b.month ?? 2) === selectedMonth)
      .map((b) => ({
        id: b.id,
        start: parseTimeToMinutes(b.time) - CAL_START_HOUR * 60,
        length: b.minutes,
        client: b.kind === 'block' ? b.reason : b.client,
        service: b.kind === 'block' ? b.duration : b.service,
        tone: b.kind === 'block' ? 'break' : 'dark',
      }));
    const designed = selectedMonth === 2 ? weekCalendar[day] || [] : [];
    days.push({ day, ...getDayShort(day, selectedMonth), blocks: [...designed, ...addedBlocks] });
  }

  return (
    <div className="pb-6">
      <div className="flex border-b border-gray-100 pb-2">
        <div className="w-12 shrink-0" />
        {days.map((col) => (
          <div key={col.day} className="flex-1 text-center">
            <div className="text-[11px] text-gray-400">{col.day}</div>
            <div className="text-[15px] font-bold text-gray-900">{col.date}</div>
          </div>
        ))}
      </div>
      <div className="flex relative">
        <div className="w-12 shrink-0 relative" style={{ height: gridHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute right-2 -translate-y-1/2 text-[10px] text-gray-400"
              style={{ top: (h - CAL_START_HOUR) * 60 * PX_PER_MIN }}
            >
              {hourLabel(h)}
            </div>
          ))}
        </div>
        {days.map((col) => (
          <div
            key={col.day}
            className="flex-1 relative border-l border-gray-50 cursor-pointer"
            style={{ height: gridHeight }}
            onClick={(e) => {
              // Tap empty calendar space → new appointment at that day/time.
              const rect = e.currentTarget.getBoundingClientRect();
              const mins = (e.clientY - rect.top) / PX_PER_MIN + CAL_START_HOUR * 60;
              onCreateAt(col.day, minutesToTime(mins));
            }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-gray-50"
                style={{ top: (h - CAL_START_HOUR) * 60 * PX_PER_MIN }}
              />
            ))}
            {col.blocks.map((block) => {
              const clickable = block.tone !== 'break';
              const Tag = clickable ? 'button' : 'div';
              return (
                <Tag
                  key={block.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (block.classId) onOpenClass(block.classId);
                    else if (block.bundleId) onOpenBundle(block.bundleId);
                    else if (block.bookingId) onOpenBooking(block.bookingId);
                    else onOpenAdhoc(block);
                  }}
                  className={
                    'absolute rounded-lg overflow-hidden text-left ' +
                    (compact ? 'left-0.5 right-0.5 px-1 py-1 ' : 'left-1 right-1 px-2 py-1.5 ') +
                    BLOCK_TONES[block.tone]
                  }
                  style={{
                    top: block.start * PX_PER_MIN + 1,
                    height: block.length * PX_PER_MIN - 2,
                  }}
                >
                  <div
                    className={
                      'font-semibold leading-tight truncate ' +
                      (compact ? 'text-[8px]' : 'text-[11px]')
                    }
                  >
                    {block.client}
                  </div>
                  {!compact && block.service && (
                    <div className="text-[10px] opacity-80 leading-tight truncate mt-0.5">
                      {block.service}
                    </div>
                  )}
                </Tag>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Team view ----------------------------------------------------------------

const TEAM_START_HOUR = 9;
const TEAM_END_HOUR = 20;
const TEAM_PX_PER_MIN = 1.1;
const NOW_MIN = 360; // 15:00, per the Figma frame

function TeamView({ selectedDay, selectedMonth, selectedStaff, statusFilters, added, onOpenBooking, onOpenClass, onOpenAdhoc, onCreateAt }) {
  const hours = [];
  for (let h = TEAM_START_HOUR; h <= TEAM_END_HOUR; h++) hours.push(h);
  const gridHeight = (TEAM_END_HOUR - TEAM_START_HOUR) * 60 * TEAM_PX_PER_MIN;

  const columns = teamColumns
    .filter((col) => selectedStaff.includes(col.id))
    .map((col) => {
      const designed = selectedDay === DESIGNED_DAY && selectedMonth === 2 ? col.blocks : [];
      const filtered = statusFilters.length
        ? designed.filter((b) => b.kind === 'break' || statusFilters.includes(b.status))
        : designed;
      const extra = added
        .filter((b) => b.day === selectedDay && (b.month ?? 2) === selectedMonth && b.staffId === col.id)
        .map((b) => ({
          id: b.id,
          start: parseTimeToMinutes(b.time) - TEAM_START_HOUR * 60,
          length: b.minutes,
          ...(b.kind === 'block'
            ? { kind: 'break', label: b.reason }
            : { time: b.time, status: 'New', client: b.client, service: b.service, meta: b.price }),
        }));
      return { ...col, blocks: [...filtered, ...extra] };
    });

  return (
    <div className="overflow-x-auto pb-6">
      <div style={{ minWidth: 48 + columns.length * 136 }}>
        <div className="flex border-b border-gray-100 pb-3">
          <div className="w-12 shrink-0 flex items-end justify-center text-[10px] text-gray-400 pb-1">
            Time
          </div>
          {columns.map((col) => (
            <div key={col.id} className="w-[136px] shrink-0 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500">
                {col.initials}
              </div>
              <div className="text-[13px] font-medium text-gray-900">{col.name}</div>
              <div className="text-[11px] text-gray-400">
                {selectedDay === DESIGNED_DAY && selectedMonth === 2 ? col.role : 'No bookings'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex relative">
          <div className="w-12 shrink-0 relative" style={{ height: gridHeight }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-gray-400"
                style={{ top: (h - TEAM_START_HOUR) * 60 * TEAM_PX_PER_MIN }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {columns.map((col) => (
            <div
              key={col.id}
              className="w-[136px] shrink-0 relative border-l border-gray-50 cursor-pointer"
              style={{ height: gridHeight }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mins = (e.clientY - rect.top) / TEAM_PX_PER_MIN + TEAM_START_HOUR * 60;
                onCreateAt(selectedDay, minutesToTime(mins));
              }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-gray-50"
                  style={{ top: (h - TEAM_START_HOUR) * 60 * TEAM_PX_PER_MIN }}
                />
              ))}
              {col.blocks.map((block) => {
                if (block.kind === 'class') {
                  return (
                    <button
                      key={block.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenClass(block.classId);
                      }}
                      className="absolute left-1 right-1 rounded-xl px-2.5 py-2 overflow-hidden text-left bg-white border-[1.5px] border-gray-900 text-gray-900"
                      style={{
                        top: block.start * TEAM_PX_PER_MIN + 1,
                        height: block.length * TEAM_PX_PER_MIN - 2,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold">{block.time}</span>
                        <span className="text-[9px] font-semibold border border-gray-900 rounded-full px-1.5 py-0.5">
                          Class
                        </span>
                      </div>
                      <div className="text-[12px] font-semibold leading-tight truncate mt-1">
                        {block.client}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate mt-0.5">{block.meta}</div>
                    </button>
                  );
                }
                if (block.kind === 'break') {
                  return (
                    <div
                      key={block.id}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-1 right-1 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-400"
                      style={{
                        top: block.start * TEAM_PX_PER_MIN + 1,
                        height: block.length * TEAM_PX_PER_MIN - 2,
                      }}
                    >
                      {block.label}
                    </div>
                  );
                }
                const muted = block.status === 'Done' || block.status === 'No-show';
                const clickable = true;
                const Tag = clickable ? 'button' : 'div';
                return (
                  <Tag
                    key={block.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (block.bookingId) onOpenBooking(block.bookingId);
                      else
                        onOpenAdhoc(
                          {
                            client: block.client,
                            service: block.service || '',
                            start: block.start + 60,
                            length: block.length,
                            tone: block.status === 'Done' ? 'past' : 'dark',
                            price: block.meta ? `£${block.meta.split('£')[1] || '85'}` : '£85',
                          },
                          col.name,
                        );
                    }}
                    className={
                      'absolute left-1 right-1 rounded-xl px-2.5 py-2 overflow-hidden text-left ' +
                      (muted ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white')
                    }
                    style={{
                      top: block.start * TEAM_PX_PER_MIN + 1,
                      height: block.length * TEAM_PX_PER_MIN - 2,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold">{block.time}</span>
                      <span
                        className={
                          'text-[9px] font-medium rounded-full px-1.5 py-0.5 ' +
                          (muted ? 'bg-white text-gray-500' : 'bg-white/15 text-gray-100')
                        }
                      >
                        {block.status}
                      </span>
                    </div>
                    <div className="text-[12px] font-semibold leading-tight truncate mt-1">
                      {block.client}
                    </div>
                    {block.service && (
                      <div className="text-[10px] opacity-80 truncate mt-0.5">{block.service}</div>
                    )}
                    {block.meta && (
                      <div className="text-[10px] opacity-60 truncate mt-0.5">{block.meta}</div>
                    )}
                  </Tag>
                );
              })}
            </div>
          ))}
          {selectedDay === DESIGNED_DAY && selectedMonth === 2 && (
            <div
              className="absolute left-12 right-0 pointer-events-none"
              style={{ top: NOW_MIN * TEAM_PX_PER_MIN }}
            >
              <div className="border-t-2 border-red-500 relative">
                <span className="absolute -left-1 -top-[5px] w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Screen -------------------------------------------------------------------

const VIEW_COLUMNS = { day: 1, '3day': 3, week: 7 };

export default function Schedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'myday';
  const bookingId = searchParams.get('booking');
  const classId = searchParams.get('class');
  const [adhocBooking, setAdhocBooking] = useState(null);
  const [bundleId, setBundleId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const fromUrl = Number(searchParams.get('date'));
    return fromUrl >= 1 && fromUrl <= 31 ? fromUrl : DESIGNED_DAY;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const raw = searchParams.get('month');
    if (raw === null) return 2;
    const fromUrl = Number(raw);
    return Number.isInteger(fromUrl) && fromUrl >= 0 && fromUrl <= 11 ? fromUrl : 2;
  });

  // Step the pager one day, rolling across month boundaries (within 2026).
  const stepDay = (dir) => {
    let day = selectedDay + dir;
    let month = selectedMonth;
    if (day < 1) {
      if (month === 0) return;
      month -= 1;
      day = daysInMonth(month);
    } else if (day > daysInMonth(month)) {
      if (month === 11) return;
      month += 1;
      day = 1;
    }
    setSelectedDay(day);
    setSelectedMonth(month);
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slotChooser, setSlotChooser] = useState(null); // { day, month, time }
  const [calendarView, setCalendarView] = useState('3day');
  const [selectedStaff, setSelectedStaff] = useState(['emma', 'alex', 'chris', 'sophie']);
  const [statusFilters, setStatusFilters] = useState([]);
  const { addedBookings, openAction } = useMainActions();

  const added = addedBookings
    .slice()
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  const dayAdded = added.filter(
    (b) => b.day === selectedDay && (b.month ?? 2) === selectedMonth,
  );

  const setView = (key) =>
    setSearchParams(key === 'myday' ? {} : { view: key }, { replace: true });
  const openBooking = (id) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('booking', id);
      return next;
    });
  const closeBooking = () => {
    setAdhocBooking(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('booking');
      return next;
    });
  };
  const openClass = (id) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('class', id);
      return next;
    });
  const closeClass = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('class');
      return next;
    });

  return (
    <>
      <MainHeader title="Schedule" />

      {/* View switcher + calendar settings */}
      <div className="shrink-0 bg-white px-4 pt-1 pb-3 flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full p-1 flex">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={
                'flex-1 py-2 rounded-full text-[13px] font-medium transition-colors ' +
                (view === v.key ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-500')
              }
            >
              {v.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Calendar settings"
        >
          <CalendarCog size={19} className="text-gray-700" strokeWidth={1.75} />
        </button>
      </div>

      {/* Date pager */}
      <div className="shrink-0 bg-white px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => stepDay(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Previous day"
        >
          <ChevronLeft size={17} className="text-gray-400" />
        </button>
        <button
          onClick={() => {
            setSelectedDay(DESIGNED_DAY);
            setSelectedMonth(2);
          }}
          className="text-[15px] font-bold text-gray-900"
        >
          {getDayLabel(selectedDay, selectedMonth)}
        </button>
        <button
          onClick={() => stepDay(1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Next day"
        >
          <ChevronRight size={17} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {view === 'myday' && (
          <MyDayView selectedDay={selectedDay} selectedMonth={selectedMonth} added={dayAdded} onOpenBooking={openBooking} onOpenClass={openClass} onOpenAdhoc={(b) => setAdhocBooking(b)} />
        )}
        {view === 'calendar' && (
          <CalendarView
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            columnCount={VIEW_COLUMNS[calendarView]}
            added={added}
            onOpenBooking={openBooking}
            onOpenClass={openClass}
            onOpenBundle={(id) => setBundleId(id)}
            onOpenAdhoc={(block) => setAdhocBooking(bookingFromBlock(block))}
            onCreateAt={(day, time) =>
              setSlotChooser({ day, time, month: selectedMonth })
            }
          />
        )}
        {view === 'team' && (
          <TeamView
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedStaff={selectedStaff}
            statusFilters={statusFilters}
            added={added}
            onOpenBooking={openBooking}
            onOpenClass={openClass}
            onOpenAdhoc={(block, staffName) => setAdhocBooking(bookingFromBlock(block, staffName))}
            onCreateAt={(day, time) =>
              setSlotChooser({ day, time, month: selectedMonth })
            }
          />
        )}
      </div>

      <MainTabBar />

      <CalendarSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        view={view}
        calendarView={calendarView}
        onChangeView={setCalendarView}
        selectedStaff={selectedStaff}
        onChangeStaff={setSelectedStaff}
        statusFilters={statusFilters}
        onChangeStatusFilters={setStatusFilters}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        onPickDate={(day, month) => {
          setSelectedDay(day);
          setSelectedMonth(month);
          setSettingsOpen(false);
        }}
      />
      {/* Tap-a-slot chooser — appointment or blocked time */}
      {slotChooser && (
        <div className="absolute inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSlotChooser(null)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl px-5 pt-5 pb-6">
            <div className="text-[17px] font-bold text-gray-900">
              {getDayLabel(slotChooser.day, slotChooser.month)} · {slotChooser.time}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5 mb-4">What's happening in this slot?</div>
            {[
              { label: 'New appointment', desc: 'Book a client in', type: 'appointment' },
              { label: 'Block time', desc: 'Lunch, training, admin…', type: 'block' },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  const prefill = slotChooser;
                  setSlotChooser(null);
                  openAction(opt.type, prefill);
                }}
                className="w-full flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3.5 mb-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-[12px] text-gray-500">{opt.desc}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      <BundleSheet
        key={bundleId || 'no-bundle'}
        bundle={bundleSessions[bundleId]}
        onClose={() => setBundleId(null)}
      />
      <BookingDetailsSheet
        key={bookingId || adhocBooking?.client || 'none'}
        booking={bookingDetails[bookingId] || adhocBooking}
        onClose={closeBooking}
      />
      <ClassDetailsSheet
        key={classId || 'no-class'}
        session={classSessions[classId]}
        onClose={closeClass}
      />
    </>
  );
}
