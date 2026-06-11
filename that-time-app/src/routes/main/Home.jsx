import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  CalendarDays,
  Plane,
  Stethoscope,
  Check,
  MapPin,
  CalendarOff,
} from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import MainTabBar from '../../components/MainTabBar';
import UpNextCard from '../../components/UpNextCard';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from '../../components/sheets/SheetShell';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import {
  homeHeader,
  ownerStats,
  staffStats,
  upNext,
  needsAttention,
  teamToday,
  upcomingShifts,
  timeOff,
} from '../../data/homeToday';
import {
  businessLocations,
  allShifts,
  timeOffTypes,
  timeOffDates,
} from '../../data/bookingOptions';

function SectionLabel({ children }) {
  return <div className="text-[15px] font-semibold text-gray-900">{children}</div>;
}

function NeedsAttentionCard() {
  // "Match the Hub" interactivity: action buttons acknowledge inline.
  const [resolved, setResolved] = useState({});
  const navigate = useNavigate();

  const handle = (item) => {
    if (item.id === 'no-show') {
      navigate('/clients/michael-chen');
      return;
    }
    setResolved((r) => ({ ...r, [item.id]: true }));
  };

  return (
    <div className="space-y-3">
      {needsAttention.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-gray-900">{item.title}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{item.detail}</div>
          </div>
          <button
            onClick={() => handle(item)}
            disabled={resolved[item.id]}
            className={
              'shrink-0 text-[12px] font-medium rounded-full px-3.5 py-2 border transition-colors ' +
              (resolved[item.id]
                ? 'border-gray-100 bg-gray-50 text-gray-400'
                : 'border-gray-200 text-gray-900 hover:bg-gray-50')
            }
          >
            {resolved[item.id] ? item.done : item.action}
          </button>
        </div>
      ))}
    </div>
  );
}

function TeamTodayCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {teamToday.members.map((member, i) => (
        <div
          key={member.id}
          className={
            'flex items-center gap-3 px-4 py-3 ' + (i > 0 ? 'border-t border-gray-50' : '')
          }
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 shrink-0">
            {member.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-gray-900">{member.name}</div>
            <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
              <Clock size={11} strokeWidth={1.75} />
              {member.detail}
            </div>
          </div>
          <div className="text-[12px] text-gray-500 shrink-0">{member.status}</div>
        </div>
      ))}
      <button
        onClick={() => navigate('/team')}
        className="w-full flex items-center gap-2 bg-gray-50 px-4 py-3 text-[12px] text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <AlertTriangle size={13} strokeWidth={1.75} />
        {teamToday.warning}
      </button>
    </div>
  );
}

function ShiftRow({ shift }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <CalendarDays size={16} className="text-gray-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{shift.title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5">{shift.detail}</div>
      </div>
      {shift.badge && (
        <span className="shrink-0 text-[11px] font-medium bg-gray-900 text-white rounded-full px-2.5 py-1">
          {shift.badge}
        </span>
      )}
    </div>
  );
}

function ShiftsCard({ onViewAll }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <SectionLabel>Upcoming Shifts</SectionLabel>
        <button onClick={onViewAll} className="text-[12px] text-gray-500 hover:text-gray-900">
          View all
        </button>
      </div>
      {upcomingShifts.map((shift) => (
        <ShiftRow key={shift.id} shift={shift} />
      ))}
    </div>
  );
}

function TimeOffCard({ extraTimeOff, onRequest }) {
  const rows = [...timeOff, ...extraTimeOff];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <SectionLabel>Time Off</SectionLabel>
        <button
          onClick={onRequest}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900"
        >
          <Clock size={12} strokeWidth={1.75} />
          Request
        </button>
      </div>
      {rows.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            {item.detail === 'Annual Leave' ? (
              <Plane size={16} className="text-gray-700" strokeWidth={1.75} />
            ) : item.detail === 'Doctors' || item.detail === 'Appointment' ? (
              <Stethoscope size={16} className="text-gray-700" strokeWidth={1.75} />
            ) : (
              <CalendarOff size={16} className="text-gray-700" strokeWidth={1.75} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-gray-900">{item.title}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{item.detail}</div>
          </div>
          <span
            className={
              'shrink-0 text-[11px] font-medium rounded-full px-2.5 py-1 ' +
              (item.badge === 'Approved'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-gray-50 text-gray-400 border border-gray-100')
            }
          >
            {item.badge}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    businessLocation,
    setBusinessLocation,
    showToast,
    extraTimeOff,
    addTimeOff,
    role,
  } = useMainActions();
  const homeStats = role === 'owner' ? ownerStats : staffStats;
  const [locationOpen, setLocationOpen] = useState(false);
  const [shiftsOpen, setShiftsOpen] = useState(false);
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [toType, setToType] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [toNote, setToNote] = useState('');

  return (
    <>
      <MainHeader title="Home" date={homeHeader.date} />

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-4 pb-8">
          {/* Location switcher */}
          <button
            onClick={() => setLocationOpen(true)}
            className="flex items-center gap-1 text-[12px] font-medium text-gray-400 pt-1"
          >
            {businessLocation}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>

          {/* Greeting */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-semibold text-gray-500 shrink-0">
              {homeHeader.userInitials}
            </div>
            <div>
              <div className="text-[20px] font-bold text-gray-900 leading-tight">
                {homeHeader.greeting}
              </div>
              <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
                <Clock size={12} strokeWidth={1.75} />
                {homeHeader.hours}
              </div>
            </div>
          </div>

          {/* Today stats */}
          <div className="bg-gray-50 rounded-2xl mt-4 px-2 py-4 grid grid-cols-3">
            {homeStats.map((stat, i) => (
              <div
                key={stat.label}
                className={'text-center ' + (i > 0 ? 'border-l border-gray-200' : '')}
              >
                <div className="text-[11px] text-gray-500">{stat.label}</div>
                <div className="text-[18px] font-bold text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Up next */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mt-5">
            <SectionLabel>Up Next</SectionLabel>
            <div className="text-[12px] text-gray-400 mt-0.5 mb-3">{upNext.context}</div>
            <UpNextCard />
            <button
              onClick={() => navigate('/schedule')}
              className="w-full flex items-center justify-between pt-3.5 mt-0.5 text-[13px]"
            >
              <span className="text-gray-500">See your Schedule</span>
              <span className="flex items-center gap-1 text-gray-500">
                {upNext.scheduleCount}
                <ChevronRight size={14} strokeWidth={1.75} />
              </span>
            </button>
          </div>

          {/* Needs attention — business operations, owner only */}
          {role === 'owner' && (
            <>
              <div className="flex items-center gap-1.5 mt-6 mb-3">
                <SectionLabel>Needs Attention</SectionLabel>
                <span className="text-[15px] font-semibold text-gray-300">
                  {needsAttention.length}
                </span>
              </div>
              <NeedsAttentionCard />
            </>
          )}

          {/* Team today */}
          <div className="flex items-center justify-between mt-6 mb-3">
            <div className="flex items-center gap-1.5">
              <SectionLabel>Team Today</SectionLabel>
              <span className="text-[15px] font-semibold text-gray-300">{teamToday.count}</span>
            </div>
            <button
              onClick={() => navigate('/team')}
              className="text-[12px] text-gray-500 hover:text-gray-900"
            >
              View all
            </button>
          </div>
          <TeamTodayCard />

          {/* Shifts */}
          <div className="mt-6 mb-3">
            <SectionLabel>Shifts</SectionLabel>
          </div>
          <div className="space-y-3">
            <ShiftsCard onViewAll={() => setShiftsOpen(true)} />
            <TimeOffCard extraTimeOff={extraTimeOff} onRequest={() => setTimeOffOpen(true)} />
          </div>
        </div>
      </div>

      <MainTabBar />

      {/* Location switcher */}
      <SheetShell open={locationOpen} onClose={() => setLocationOpen(false)} title="Location">
        {businessLocations.map((loc) => (
          <button
            key={loc}
            onClick={() => {
              setBusinessLocation(loc);
              setLocationOpen(false);
              showToast(`Showing ${loc}`);
            }}
            className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-gray-700" strokeWidth={1.75} />
            </div>
            <span className="flex-1 text-[14px] font-medium text-gray-900">{loc}</span>
            {businessLocation === loc && <Check size={16} className="text-gray-900" />}
          </button>
        ))}
      </SheetShell>

      {/* All shifts */}
      <SheetShell
        open={shiftsOpen}
        onClose={() => setShiftsOpen(false)}
        title="Upcoming Shifts"
        subtitle="Next two weeks"
      >
        <div className="-mx-4">
          {allShifts.map((shift) => (
            <ShiftRow key={shift.id} shift={shift} />
          ))}
        </div>
      </SheetShell>

      {/* Request time off */}
      <SheetShell
        open={timeOffOpen}
        onClose={() => setTimeOffOpen(false)}
        title="Request Time Off"
        subtitle="Your manager will review it"
        footer={
          <SheetCta
            disabled={!toType || !toDate}
            onClick={() => {
              addTimeOff({
                id: `to_${Date.now().toString(36)}`,
                title: toDate,
                detail: toType,
                badge: 'Pending',
              });
              setTimeOffOpen(false);
              setToType(null);
              setToDate(null);
              setToNote('');
              showToast('Time off requested');
            }}
          >
            Submit request
          </SheetCta>
        }
      >
        <SheetSectionLabel>Type</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {timeOffTypes.map((t) => (
            <Chip key={t} selected={toType === t} onClick={() => setToType(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <SheetSectionLabel>Dates</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {timeOffDates.map((d) => (
            <Chip key={d} selected={toDate === d} onClick={() => setToDate(d)}>
              {d}
            </Chip>
          ))}
        </div>
        <SheetSectionLabel>Note</SheetSectionLabel>
        <input
          value={toNote}
          onChange={(e) => setToNote(e.target.value)}
          placeholder="Optional — anything to add?"
          className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
        />
      </SheetShell>
    </>
  );
}
