import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';
import { isMultiSessionCourse } from '../../data/classFlow';

export default function ClassScheduleTimes() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isDashboardEdit = route.pathname === '/class/schedule-times';
  const details = draft.classDetails || emptyClassDetails();
  const course = isMultiSessionCourse(details) || (details.courseSessions || []).length > 1;
  const sessions = details.courseSessions || [];
  const single = details.singleSession || emptyClassDetails().singleSession;
  const repeatEnabled = ['repeats', 'repeating_intake'].includes(details.repeatSetting);
  const baseDate = single.date || single.firstDate;
  const firstScheduleDate = course ? sessions[0]?.date : baseDate;
  const legacyDefault = course ? sessions[0] || emptyClassDetails().defaultSessionTime : single;
  const defaultSessionTime = details.defaultSessionTime || {
    startTime: legacyDefault.startTime || '09:00',
    endTime: legacyDefault.endTime || '10:00',
  };
  const [repeatWeekOffset, setRepeatWeekOffset] = useState(0);
  const canContinue = course
    ? sessions.length > 0 && sessions.every((session) => session.date && session.startTime && session.endTime)
    : Boolean((single.date || single.firstDate) && single.startTime && single.endTime);
  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });

  const updateSession = (id, patch) => {
    updateClass({
      courseSessions: sessions.map((session) => (
        session.id === id ? { ...session, ...patch, timeOverride: true } : session
      )),
    });
  };

  const defaultStart = defaultSessionTime.startTime || single.startTime || '09:00';
  const defaultEnd = defaultSessionTime.endTime || single.endTime || '10:00';
  const defaultDuration = durationLabel(defaultStart, defaultEnd);
  const overrideCount = course
    ? sessions.filter((session) => isCustomTime(session, defaultStart, defaultEnd)).length + Object.values(details.sessionOverrides || {}).filter((override) => override?.timeOverride).length
    : Object.values(details.sessionOverrides || {}).filter((override) => override?.timeOverride).length;

  const updateOccurrenceOverride = (date, patch) => {
    if (!date) return;
    const existing = details.sessionOverrides?.[date] || {};
    updateClass({
      sessionOverrides: {
        ...(details.sessionOverrides || {}),
        [date]: {
          ...existing,
          date,
          startTime: existing.startTime || defaultStart,
          endTime: existing.endTime || defaultEnd,
          ...patch,
          timeOverride: true,
        },
      },
    });
  };

  const resetOccurrenceOverride = (date) => {
    if (!date) return;
    const next = { ...(details.sessionOverrides || {}) };
    delete next[date];
    updateClass({ sessionOverrides: next });
  };

  const applyDefaultTime = (patch) => {
    const nextStart = patch.startTime ?? defaultStart;
    const nextEnd = patch.endTime ?? defaultEnd;
    const nextDefault = { startTime: nextStart, endTime: nextEnd };
    if (!course) {
      updateClass({
        defaultSessionTime: nextDefault,
        singleSession: { ...single, startTime: nextStart, endTime: nextEnd },
      });
      return;
    }
    updateClass({
      defaultSessionTime: nextDefault,
      courseSessions: sessions.map((session) => (
        isCustomTime(session, defaultStart, defaultEnd)
          ? session
          : { ...session, startTime: nextStart, endTime: nextEnd, timeOverride: false }
      )),
    });
  };

  const resetSessionTime = (id) => {
    updateClass({
      courseSessions: sessions.map((session) => (
        session.id === id
          ? { ...session, startTime: defaultStart, endTime: defaultEnd, timeOverride: false }
          : session
      )),
    });
  };
  const displayedRows = course
    ? sessions.map((session) => occurrenceRowForSession(session, repeatWeekOffset, details.sessionOverrides, defaultStart, defaultEnd))
    : repeatEnabled && firstScheduleDate
      ? [occurrenceRowForSingle(single, repeatWeekOffset, details.sessionOverrides, defaultStart, defaultEnd)]
      : [];

  const updateDisplayRow = (row, patch) => {
    if (course && repeatWeekOffset === 0) {
      updateSession(row.sourceId, patch);
      return;
    }
    updateOccurrenceOverride(row.date, patch);
  };

  const resetDisplayRow = (row) => {
    if (course && repeatWeekOffset === 0) {
      resetSessionTime(row.sourceId);
      return;
    }
    resetOccurrenceOverride(row.date);
  };

  const jumpToRepeatWeek = (dateValue) => {
    const base = parseIso(firstScheduleDate);
    const target = parseIso(dateValue);
    if (!base || !target) return;
    const offset = Math.max(0, Math.round(daysBetween(startOfWeek(base), startOfWeek(target)) / 7));
    setRepeatWeekOffset(offset);
  };

  const continueNext = () => {
    const repeat = ['repeats', 'repeating_intake'].includes(details.repeatSetting);
    updateClass({
      classStructure: course ? 'multi_session' : 'single_session',
      repeatSetting: course ? (repeat ? 'repeating_intake' : 'one_intake') : (repeat ? 'repeats' : 'one_off'),
    });
    navigate(isDashboardEdit ? '/class' : '/new/class-location');
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class/schedule' : '/new/class-schedule')}
        rightAction={<HelpTrigger helpKey="schedule" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Set the times</div>
          <div className="text-[14px] text-gray-500 mt-1">
            {course
              ? 'Set the usual time once, then only adjust dates that run differently.'
              : 'Set the start and end time for this class.'}
          </div>
        </div>

        <div className="space-y-4 pb-6">
          {repeatEnabled && firstScheduleDate && (
            <RepeatWeekNavigator
              baseDate={firstScheduleDate}
              offset={repeatWeekOffset}
              onChange={setRepeatWeekOffset}
              onJump={jumpToRepeatWeek}
            />
          )}

          <section className={(course ? 'rounded-3xl bg-gray-50 p-4 ' : '') + 'space-y-4'}>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                {repeatEnabled && !course ? 'Default time' : course ? 'Default time' : 'Class time'}
              </div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">
                {course
                  ? 'Every selected date uses this time unless you override it below.'
                  : repeatEnabled
                    ? 'Repeating dates use this time unless you override a specific date above.'
                    : formatDate(single.date || single.firstDate)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PrimaryTimeField
                label="Starts"
                value={defaultStart}
                onChange={(startTime) => applyDefaultTime({ startTime })}
              />
              <PrimaryTimeField
                label="Ends"
                value={defaultEnd}
                onChange={(endTime) => applyDefaultTime({ endTime })}
              />
            </div>
            <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
              <span>Class duration</span>
              <span className="text-gray-900 font-medium">{defaultDuration}</span>
            </div>
          </section>

          {(course || (repeatEnabled && displayedRows.length > 0)) ? (
            <section className="space-y-3">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                  {course ? 'Course dates' : 'Class dates'}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  {repeatWeekOffset > 0
                    ? `Editing repeat week ${repeatWeekOffset + 1}. Changes only affect this week.`
                    : overrideCount
                      ? `${overrideCount} date${overrideCount === 1 ? '' : 's'} using a custom time.`
                      : 'All dates use the default time.'}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {displayedRows.map((session, index) => (
                  <TimeRow
                    key={session.id}
                    title={`Day ${index + 1}`}
                    subtitle={formatDate(session.date)}
                    values={session}
                    defaultStart={defaultStart}
                    defaultEnd={defaultEnd}
                    onChange={(patch) => updateDisplayRow(session, patch)}
                    onReset={() => resetDisplayRow(session)}
                  />
                ))}
              </div>
            </section>
          ) : (
            null
          )}
        </div>
      </div>

      <WizardFooter
        step={4}
        total={wizardTotalForDraft(draft)}
        onBack={() => navigate(isDashboardEdit ? '/class/schedule' : '/new/class-schedule')}
        onNext={continueNext}
        nextLabel={isDashboardEdit ? 'Done' : 'Next'}
        nextDisabled={!canContinue}
      />
    </>
  );
}

function PrimaryTimeField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-gray-700">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full h-14 rounded-2xl bg-white border border-gray-200 px-4 text-[18px] font-medium text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-colors"
      />
    </label>
  );
}

function RepeatWeekNavigator({ baseDate, offset, onChange, onJump }) {
  const base = parseIso(baseDate);
  if (!base) return null;
  const weekStart = addDays(startOfWeek(base), offset * 7);
  const selectedDate = addDays(base, offset * 7);
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, offset - 1))}
        disabled={offset === 0}
        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-35"
        aria-label="Previous repeat week"
      >
        <ChevronLeft size={17} strokeWidth={1.8} />
      </button>
      <div className="text-center flex-1">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
          {offset === 0 ? 'Original week' : `Repeat week ${offset + 1}`}
        </div>
        <div className="text-[14px] font-medium text-gray-900 mt-0.5">{weekRangeLabel(weekStart)}</div>
        <label className="inline-flex items-center justify-center mt-1">
          <span className="sr-only">Jump to repeat date</span>
          <input
            type="date"
            value={toIso(selectedDate)}
            onChange={(event) => onJump(event.target.value)}
            className="bg-transparent text-[12px] text-gray-500 outline-none text-center"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => onChange(offset + 1)}
        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100"
        aria-label="Next repeat week"
      >
        <ChevronRight size={17} strokeWidth={1.8} />
      </button>
    </div>
  );
}

function TimeRow({ title, subtitle, values, defaultStart, defaultEnd, onChange, onReset }) {
  const custom = isCustomTime(values, defaultStart, defaultEnd);
  const [open, setOpen] = useState(false);
  const reset = () => {
    onReset();
    setOpen(false);
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <div className="text-[14px] font-medium text-gray-900">{title}</div>
          <div className="text-[12px] text-gray-500">
            {subtitle} · {values.startTime}-{values.endTime}
          </div>
        </div>
        <span className={'px-2.5 py-1 rounded-full text-[11px] font-medium ' + (custom ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500')}>
          {custom ? 'Custom' : 'Default'}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Starts" type="time" value={values.startTime} onChange={(startTime) => onChange({ startTime })} />
            <TextField label="Ends" type="time" value={values.endTime} onChange={(endTime) => onChange({ endTime })} />
          </div>
          {custom && (
            <button
              type="button"
              onClick={reset}
              className="w-full h-10 rounded-full bg-gray-50 text-[13px] font-medium text-gray-900"
            >
              Reset to default time
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Date not set';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`));
}

function shortDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`));
}

function durationLabel(start, end) {
  const startMin = minutesFromTime(start);
  const endMin = minutesFromTime(end);
  if (startMin === null || endMin === null || endMin <= startMin) return 'Check end time';
  const total = endMin - startMin;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function minutesFromTime(value) {
  if (!value || !value.includes(':')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function isCustomTime(values, defaultStart, defaultEnd) {
  return values.timeOverride === true || values.startTime !== defaultStart || values.endTime !== defaultEnd;
}

function occurrenceRowForSession(session, weekOffset, overrides = {}, defaultStart, defaultEnd) {
  if (weekOffset === 0) {
    return {
      ...session,
      sourceId: session.id,
    };
  }
  const sourceDate = parseIso(session.date);
  const date = sourceDate ? toIso(addDays(sourceDate, weekOffset * 7)) : session.date;
  const override = overrides[date] || {};
  return {
    ...session,
    id: `${session.id}:${weekOffset}`,
    sourceId: session.id,
    date,
    startTime: override.startTime || session.startTime || defaultStart,
    endTime: override.endTime || session.endTime || defaultEnd,
    timeOverride: Boolean(override.timeOverride),
  };
}

function occurrenceRowForSingle(single, weekOffset, overrides = {}, defaultStart, defaultEnd) {
  const sourceDate = parseIso(single.date || single.firstDate);
  const date = sourceDate ? toIso(addDays(sourceDate, weekOffset * 7)) : (single.date || single.firstDate);
  const override = overrides[date] || {};
  return {
    id: `single:${date}`,
    sourceId: 'single',
    date,
    startTime: override.startTime || single.startTime || defaultStart,
    endTime: override.endTime || single.endTime || defaultEnd,
    timeOverride: Boolean(override.timeOverride),
  };
}

function occurrenceDatesForWeek(details, baseDateValue, weekStart) {
  const baseDate = parseIso(baseDateValue);
  const schedule = details.schedule || {};
  const pattern = details.singleSession?.repeatPattern || 'weekly';
  const days = pattern === 'daily'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : pattern === 'weekday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      : schedule.days?.length
        ? schedule.days
        : [dayKeyFromDate(baseDate || weekStart)];

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const iso = toIso(date);
    return {
      iso,
      day: new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(date).slice(0, 3),
      date: date.getDate(),
      available: Boolean(baseDate && date >= baseDate && days.includes(dayKeyFromDate(date))),
    };
  });
}

function weekRangeLabel(start) {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(end);
  return `${startLabel} - ${endLabel}`;
}

function parseIso(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIso(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function dayKeyFromDate(date) {
  if (!date) return 'Mon';
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}
