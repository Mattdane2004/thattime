import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import BottomSheet from '../../components/BottomSheet';
import TextField from '../../components/TextField';
import ProductSelect from '../../components/ProductSelect';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';

const today = new Date(2026, 4, 21);
const newId = () => 'cs_' + Math.random().toString(36).slice(2, 9);
const DAYS = [
  { key: 'Mon', short: 'M', label: 'Monday' },
  { key: 'Tue', short: 'T', label: 'Tuesday' },
  { key: 'Wed', short: 'W', label: 'Wednesday' },
  { key: 'Thu', short: 'T', label: 'Thursday' },
  { key: 'Fri', short: 'F', label: 'Friday' },
  { key: 'Sat', short: 'S', label: 'Saturday' },
  { key: 'Sun', short: 'S', label: 'Sunday' },
];
const ORDINALS = ['1st', '2nd', '3rd', '4th', 'Last'];

export default function ClassScheduleDates() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isDashboardEdit = route.pathname === '/class/schedule';
  const details = draft.classDetails || emptyClassDetails();
  const [repeatSheetOpen, setRepeatSheetOpen] = useState(false);
  const sessions = details.courseSessions || [];
  const single = details.singleSession || emptyClassDetails().singleSession;
  const defaultSessionTime = details.defaultSessionTime || emptyClassDetails().defaultSessionTime;
  const selectedDates = sessions.length
    ? sessions.map((session) => session.date).filter(Boolean)
    : [single.date || single.firstDate].filter(Boolean);
  const [visibleMonth, setVisibleMonth] = useState(() => monthFromIso(selectedDates[0]) || today);
  const monthDays = calendarDays(visibleMonth);
  const isCourse = selectedDates.length > 1 || details.classStructure === 'multi_session';
  const dateMode = isCourse ? 'multi_session' : 'single_session';
  const canContinue = selectedDates.length > 0;

  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });

  const repeatEnabled = ['repeats', 'repeating_intake'].includes(details.repeatSetting);
  const repeatPattern = normaliseRepeatPattern(isCourse ? details.intakeRepeat?.pattern || 'weekly' : single.repeatPattern || 'weekly');
  const repeatEnd = isCourse ? details.intakeRepeat?.end || { mode: 'none', value: '' } : single.repeatEnd || { mode: 'none', value: '' };
  const schedule = { ...emptyClassDetails().schedule, ...(details.schedule || {}) };
  const baseDate = selectedDates[0] || single.date || single.firstDate;
  const weeklyDays = schedule.days?.length ? schedule.days : selectedDateDayKeys(selectedDates);
  const repeatPreviewDates = repeatDatesForMonth({
    selectedDates,
    visibleMonth,
    repeatEnabled,
    repeatPattern,
    details,
    isCourse,
  });

  const repeatSettingFor = (repeat = true) =>
    isCourse ? (repeat ? 'repeating_intake' : 'one_intake') : (repeat ? 'repeats' : 'one_off');

  const setDateMode = (mode) => {
    if (mode === dateMode) return;
    const firstDate = selectedDates[0] || '';
    const repeat = ['repeats', 'repeating_intake'].includes(details.repeatSetting);

    if (mode === 'single_session') {
      updateClass({
        classStructure: firstDate ? 'single_session' : '',
        repeatSetting: firstDate ? (repeat ? 'repeats' : 'one_off') : '',
        courseSessions: [],
        schedule: firstDate ? scheduleDefaultsFromDates([firstDate], schedule) : schedule,
        singleSession: {
          ...single,
          date: firstDate,
          firstDate,
          startTime: single.startTime || defaultSessionTime.startTime || '09:00',
          endTime: single.endTime || defaultSessionTime.endTime || '10:00',
        },
      });
      return;
    }

    updateClass({
      classStructure: 'multi_session',
      repeatSetting: repeat ? 'repeating_intake' : 'one_intake',
      singleSession: { ...single, date: '', firstDate: '' },
      schedule: firstDate ? scheduleDefaultsFromDates([firstDate], schedule) : schedule,
      courseSessions: firstDate
        ? [{
            id: newId(),
            date: firstDate,
            startTime: defaultSessionTime.startTime || single.startTime || '09:00',
            endTime: defaultSessionTime.endTime || single.endTime || '10:00',
            timeOverride: false,
            moduleName: '',
            status: 'scheduled',
            agendaItems: [],
          }]
        : [],
    });
  };

  const updateRepeatPattern = (pattern) => {
    const nextSchedule = {
      ...scheduleDefaultsFromDates(selectedDates, schedule),
      ...(pattern === 'weekday' ? { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } : {}),
      ...(pattern === 'custom' && !schedule.customUnit ? { customUnit: 'week' } : {}),
      ...(pattern === 'custom' && !schedule.customInterval ? { customInterval: '1' } : {}),
    };
    if (isCourse) {
      updateClass({
        repeatSetting: repeatSettingFor(true),
        intakeRepeat: { ...(details.intakeRepeat || {}), pattern: normaliseRepeatPattern(pattern) },
        schedule: nextSchedule,
      });
      return;
    }
    updateClass({
      repeatSetting: repeatSettingFor(true),
      singleSession: { ...single, repeatPattern: normaliseRepeatPattern(pattern) },
      schedule: nextSchedule,
    });
  };

  const updateRepeatEnd = (patch) => {
    if (isCourse) {
      updateClass({
        repeatSetting: repeatSettingFor(true),
        intakeRepeat: { ...(details.intakeRepeat || {}), end: { ...repeatEnd, ...patch } },
      });
      return;
    }
    updateClass({
      repeatSetting: repeatSettingFor(true),
      singleSession: { ...single, repeatEnd: { ...repeatEnd, ...patch } },
    });
  };

  const updateCustomRepeat = (patch) => {
    updateClass({
      repeatSetting: repeatSettingFor(true),
      schedule: { ...schedule, ...patch },
    });
  };

  const toggleWeeklyDay = (day) => {
    const selected = new Set(weeklyDays.filter(Boolean));
    selected.has(day) ? selected.delete(day) : selected.add(day);
    const nextDays = DAYS.map((item) => item.key).filter((item) => selected.has(item));
    updateCustomRepeat({ days: nextDays.length ? nextDays : [day] });
  };

  const clearRepeat = () => {
    updateClass({ repeatSetting: repeatSettingFor(false) });
  };

  const toggleDate = (date) => {
    const exists = selectedDates.includes(date);
    const nextDates = exists ? selectedDates.filter((item) => item !== date) : [...selectedDates, date];
    const sortedDates = nextDates.sort();
    const byDate = new Map(sessions.map((session) => [session.date, session]));

    if (dateMode === 'multi_session') {
      const repeat = ['repeats', 'repeating_intake'].includes(details.repeatSetting);
      updateClass({
        classStructure: 'multi_session',
        repeatSetting: sortedDates.length ? (repeat ? 'repeating_intake' : 'one_intake') : '',
        singleSession: { ...single, date: '', firstDate: '' },
        schedule: scheduleDefaultsFromDates(sortedDates, schedule),
        courseSessions: sortedDates.map((item) => byDate.get(item) || {
          id: newId(),
          date: item,
          startTime: defaultSessionTime.startTime || '09:00',
          endTime: defaultSessionTime.endTime || '10:00',
          timeOverride: false,
          moduleName: '',
          status: 'scheduled',
          agendaItems: [],
        }),
      });
      return;
    }

    const singleDate = exists ? '' : date;
    const repeat = ['repeats', 'repeating_intake'].includes(details.repeatSetting);
    const nextSchedule = singleDate ? scheduleDefaultsFromDates([singleDate], schedule) : schedule;
    updateClass({
      classStructure: singleDate ? 'single_session' : '',
      repeatSetting: singleDate ? (repeat ? 'repeats' : 'one_off') : '',
      courseSessions: [],
      schedule: nextSchedule,
      singleSession: {
        ...single,
        date: singleDate,
        firstDate: singleDate,
        startTime: single.startTime || defaultSessionTime.startTime || '09:00',
        endTime: single.endTime || defaultSessionTime.endTime || '10:00',
      },
    });
  };

  const changeMonth = (offset) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-participants')}
        rightAction={<HelpTrigger helpKey="schedule" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Select dates</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose whether clients book one class date or a full course made of multiple dates.
          </div>
        </div>

        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setDateMode('single_session')}
              className={
                'rounded-xl px-3 py-3 text-left transition-colors ' +
                (dateMode === 'single_session' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white')
              }
            >
              <div className="text-[13px] font-semibold">Single day</div>
              <div className={'text-[11px] leading-snug mt-0.5 ' + (dateMode === 'single_session' ? 'text-white/65' : 'text-gray-500')}>
                One date clients book into
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDateMode('multi_session')}
              className={
                'rounded-xl px-3 py-3 text-left transition-colors ' +
                (dateMode === 'multi_session' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white')
              }
            >
              <div className="text-[13px] font-semibold">Multi-day course</div>
              <div className={'text-[11px] leading-snug mt-0.5 ' + (dateMode === 'multi_session' ? 'text-white/65' : 'text-gray-500')}>
                Students book all dates together
              </div>
            </button>
          </div>

          <div className="text-[12px] leading-snug text-gray-500">
            {dateMode === 'multi_session'
              ? 'Select every date included in the course. If it repeats, the whole course intake repeats.'
              : 'Select one date. Use repeats for classes like every Monday at the same time.'}
          </div>

          <div className="rounded-3xl bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[16px] font-semibold text-gray-900">{formatMonth(visibleMonth)}</div>
                <div className="text-[12px] text-gray-500">{selectedDates.length || 'No'} date{selectedDates.length === 1 ? '' : 's'} selected</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={17} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={17} strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((item, index) => item ? (
                <button
                  key={item.iso}
                  onClick={() => toggleDate(item.iso)}
                  className={
                    'aspect-square rounded-xl text-[13px] font-medium flex flex-col items-center justify-center transition-colors border ' +
                    (selectedDates.includes(item.iso)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : repeatPreviewDates.has(item.iso)
                        ? 'bg-white text-gray-900 border-gray-300 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.12)]'
                        : 'bg-white text-gray-900 border-transparent hover:bg-gray-100')
                  }
                >
                  <span>{item.day}</span>
                  {repeatPreviewDates.has(item.iso) && !selectedDates.includes(item.iso) && (
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-500" />
                  )}
                </button>
              ) : <div key={`blank-${index}`} />)}
            </div>
            {repeatEnabled && repeatPreviewDates.size > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Repeat preview for this month
              </div>
            )}
          </div>

          <button
            onClick={() => setRepeatSheetOpen(true)}
            disabled={!canContinue}
            className={
              'w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors ' +
              (canContinue ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50 opacity-60')
            }
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Repeat size={17} className="text-gray-700" strokeWidth={1.75} />
            </div>
              <div className="flex-1">
              <div className="text-[15px] font-medium text-gray-900">
                {dateMode === 'multi_session' ? 'Repeat course intake' : 'Repeat class'}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                {repeatSummary({ repeatEnabled, repeatPattern, repeatEnd, isCourse, selectedDates, details })}
              </div>
            </div>
            <span className="text-[13px] font-medium text-gray-900">{repeatEnabled ? 'Edit' : 'Set'}</span>
          </button>
        </div>
      </div>

      <WizardFooter
        step={3}
        total={wizardTotalForDraft(draft)}
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-participants')}
        onNext={() => navigate(isDashboardEdit ? '/class' : '/new/class-schedule-times')}
        nextLabel={isDashboardEdit ? 'Edit times' : 'Set times'}
        nextDisabled={!canContinue}
      />

      <BottomSheet
        open={repeatSheetOpen}
        onClose={() => setRepeatSheetOpen(false)}
        title="Repeat settings"
        footer={
          <button
            onClick={() => setRepeatSheetOpen(false)}
            className="w-full h-12 rounded-full bg-gray-900 text-white text-[14px] font-medium"
          >
            Done
          </button>
        }
      >
        <div className="space-y-5">
          <section>
            <SelectField
              label="Frequency"
              value={repeatEnabled ? repeatPattern : 'never'}
              onChange={(value) => (value === 'never' ? clearRepeat() : updateRepeatPattern(value))}
              options={repeatFrequencyOptions()}
            />
          </section>

          {repeatEnabled && (
            <>
              {repeatPattern === 'custom' && (
                <section className="grid grid-cols-[1fr_1.25fr] gap-3">
                  <TextField
                    label="Repeat every"
                    type="number"
                    value={details.schedule?.customInterval || '1'}
                    onChange={(customInterval) => updateCustomRepeat({ customInterval })}
                    placeholder="1"
                  />
                  <SelectField
                    label="Unit"
                    value={details.schedule?.customUnit || 'week'}
                    onChange={(customUnit) => updateCustomRepeat({ customUnit })}
                    options={[
                      { key: 'day', label: 'Days' },
                      { key: 'week', label: 'Weeks' },
                      { key: 'month', label: 'Months' },
                      { key: 'year', label: 'Years' },
                    ]}
                  />
                </section>
              )}

              {(repeatPattern === 'weekly' || (repeatPattern === 'custom' && schedule.customUnit === 'week')) && (
                <section>
                  <div className="text-[13px] font-medium text-gray-700 mb-2">Repeats on</div>
                  <div className="flex gap-2">
                    {DAYS.map((day) => {
                      const active = weeklyDays.includes(day.key);
                      return (
                        <button
                          type="button"
                          key={day.key}
                          onClick={() => toggleWeeklyDay(day.key)}
                          aria-label={day.label}
                          className={
                            'w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium ' +
                            (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500')
                          }
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[12px] text-gray-500 mt-2">
                    {weeklyDays.map(dayLabel).join(', ')}
                  </div>
                </section>
              )}

              {repeatPattern === 'weekday' && (
                <section className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-[13px] font-medium text-gray-900">Monday to Friday</div>
                  <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                    The class repeats on every weekday.
                  </div>
                </section>
              )}

              {(repeatPattern === 'monthly' || (repeatPattern === 'custom' && schedule.customUnit === 'month')) && (
                <section className="space-y-3">
                  {selectedDates.length > 1 ? (
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="text-[13px] font-medium text-gray-900">Monthly dates</div>
                      <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                        Repeats on the {selectedDates.map((date) => ordinalDayLabel(dayOfMonth(date))).join(', ')} of each month.
                      </div>
                    </div>
                  ) : (
                      <SelectField
                      label="Monthly rule"
                      value={schedule.monthlyMode || 'dayOfWeek'}
                      onChange={(monthlyMode) => updateCustomRepeat({ monthlyMode })}
                      options={[
                        { key: 'dayOfWeek', label: `${ordinalForDate(baseDate)} ${dayLabel(dayKeyFromIso(baseDate))}` },
                        { key: 'dayOfMonth', label: `Day ${dayOfMonth(baseDate)}` },
                      ]}
                    />
                  )}

                  {selectedDates.length <= 1 && schedule.monthlyMode === 'dayOfMonth' && (
                    <TextField
                      label="Day of month"
                      type="number"
                      value={schedule.monthlyDayOfMonth || dayOfMonth(baseDate)}
                      onChange={(monthlyDayOfMonth) => updateCustomRepeat({ monthlyDayOfMonth })}
                      placeholder="25"
                    />
                  )}
                  {selectedDates.length <= 1 && schedule.monthlyMode !== 'dayOfMonth' && (
                    <div className="grid grid-cols-[1fr_1.2fr] gap-3">
                      <SelectField
                        label="Week"
                        value={schedule.monthlyOrdinal || ordinalForDate(baseDate)}
                        onChange={(monthlyOrdinal) => updateCustomRepeat({ monthlyOrdinal })}
                        options={ORDINALS.map((item) => ({ key: item, label: item }))}
                      />
                      <SelectField
                        label="Weekday"
                        value={schedule.monthlyWeekday || dayKeyFromIso(baseDate)}
                        onChange={(monthlyWeekday) => updateCustomRepeat({ monthlyWeekday })}
                        options={DAYS.map((item) => ({ key: item.key, label: item.label }))}
                      />
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-3">
                <SelectField
                  label="Ends"
                  value={repeatEnd.mode || 'none'}
                  onChange={(mode) => updateRepeatEnd({ mode, value: mode === 'none' ? '' : repeatEnd.value })}
                  options={[
                    { key: 'none', label: 'Never' },
                    { key: 'date', label: 'On a date' },
                    { key: 'count', label: 'After a number of repeats' },
                  ]}
                />
                {repeatEnd.mode === 'count' && (
                  <TextField
                    label="Number of repeats"
                    type="number"
                    value={repeatEnd.value}
                    onChange={(value) => updateRepeatEnd({ value })}
                    placeholder="12"
                  />
                )}
                {repeatEnd.mode === 'date' && (
                  <TextField
                    label="End date"
                    type="date"
                    value={repeatEnd.value}
                    onChange={(value) => updateRepeatEnd({ value })}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

function repeatFrequencyOptions() {
  return [
    { key: 'never', label: 'Does not repeat' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
    { key: 'weekday', label: 'Every weekday' },
    { key: 'custom', label: 'Custom' },
  ];
}

function SelectField({ label, value, options, onChange }) {
  return <ProductSelect label={label} value={value} options={options} onChange={onChange} />;
}

function repeatSummary({ repeatEnabled, repeatPattern, repeatEnd, selectedDates, details = {} }) {
  if (!selectedDates.length) return 'Select a date first, then add repeat rules if needed.';
  if (!repeatEnabled) return 'Does not repeat.';
  const schedule = { ...emptyClassDetails().schedule, ...(details.schedule || {}) };
  const patternLabels = {
    daily: 'Daily',
    weekly: `Weekly on ${(schedule.days?.length ? schedule.days : selectedDateDayKeys(selectedDates)).map(dayLabel).join(', ')}`,
    monthly: monthlyRuleLabel(schedule, selectedDates[0]),
    yearly: 'Yearly',
    weekday: 'Every weekday',
    custom: customRepeatLabel(schedule, selectedDates),
  };
  const end =
    repeatEnd.mode === 'count' && repeatEnd.value
      ? ` · stops after ${repeatEnd.value} repeats`
      : repeatEnd.mode === 'date' && repeatEnd.value
        ? ` · stops on ${repeatEnd.value}`
        : '';
  return `${patternLabels[repeatPattern] || 'Repeats'}${end}.`;
}

function normaliseRepeatPattern(pattern) {
  if (['daily', 'weekly', 'monthly', 'yearly', 'weekday', 'custom'].includes(pattern)) return pattern;
  if (pattern === 'quarterly') return 'monthly';
  return 'weekly';
}

function selectedDateDayKeys(values = []) {
  const selected = new Set(values.map(dayKeyFromIso).filter(Boolean));
  const ordered = DAYS.map((day) => day.key).filter((key) => selected.has(key));
  return ordered.length ? ordered : ['Mon'];
}

function scheduleDefaultsFromDates(values = [], schedule = {}) {
  const first = values.find(Boolean);
  if (!first) return schedule;
  return {
    ...schedule,
    days: selectedDateDayKeys(values),
    monthlyMode: schedule.monthlyMode || 'dayOfWeek',
    monthlyDayOfMonth: dayOfMonth(first),
    monthlyOrdinal: ordinalForDate(first),
    monthlyWeekday: dayKeyFromIso(first),
  };
}

function customRepeatLabel(schedule, selectedDates) {
  const interval = Math.max(Number(schedule.customInterval) || 1, 1);
  const unit = schedule.customUnit || 'week';
  const unitLabel = interval === 1 ? unit : `${unit}s`;
  if (unit === 'week') {
    const days = (schedule.days?.length ? schedule.days : selectedDateDayKeys(selectedDates)).map(dayLabel).join(', ');
    return `Every ${interval} ${unitLabel} on ${days}`;
  }
  if (unit === 'month') return `Every ${interval} ${unitLabel} ${monthlyTargetLabel(schedule, selectedDates[0])}`;
  return `Every ${interval} ${unitLabel}`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date);
}

function monthFromIso(value) {
  if (!value) return null;
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

function repeatDatesForMonth({ selectedDates, visibleMonth, repeatEnabled, repeatPattern, details }) {
  const preview = new Set();
  if (!repeatEnabled || selectedDates.length === 0) return preview;

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const selectedSet = new Set(selectedDates);

  const addIfVisible = (date) => {
    if (date < monthStart || date > monthEnd) return;
    const iso = toIso(date);
    if (!selectedSet.has(iso)) preview.add(iso);
  };

  const baseDate = parseIso(selectedDates[0]);
  if (!baseDate) return preview;
  const schedule = details.schedule || {};
  const selectedDateObjects = selectedDates.map(parseIso).filter(Boolean);

  if (repeatPattern === 'weekly' || repeatPattern === 'weekday') {
    const days = repeatPattern === 'weekday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      : (schedule.days?.length ? schedule.days : selectedDateDayKeys(selectedDates));
    eachDayOfMonth(visibleMonth).forEach((date) => {
      if (date <= baseDate) return;
      if (days.includes(dayKeyFromDate(date))) addIfVisible(date);
    });
    return preview;
  }

  if (repeatPattern === 'monthly') {
    if (selectedDates.length > 1) {
      const monthDiff = monthsBetween(baseDate, visibleMonth);
      if (monthDiff <= 0) return preview;
      selectedDateObjects.forEach((source) => {
        const targetDay = Math.min(source.getDate(), monthEnd.getDate());
        addIfVisible(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), targetDay));
      });
      return preview;
    }
    const occurrence = monthlyOccurrenceForMonth(visibleMonth, schedule, baseDate);
    if (occurrence && occurrence > baseDate) addIfVisible(occurrence);
    return preview;
  }

  if (repeatPattern === 'yearly') {
    const yearDiff = visibleMonth.getFullYear() - baseDate.getFullYear();
    if (yearDiff <= 0) return preview;
    selectedDateObjects.forEach((source) => {
      if (source.getMonth() !== visibleMonth.getMonth()) return;
      const targetDay = Math.min(source.getDate(), monthEnd.getDate());
      addIfVisible(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), targetDay));
    });
    return preview;
  }

  if (repeatPattern === 'custom' && (schedule.customUnit || 'week') === 'week') {
    const days = schedule.days?.length ? schedule.days : selectedDateDayKeys(selectedDates);
    const interval = Math.max(Number(schedule.customInterval) || 1, 1);
    eachDayOfMonth(visibleMonth).forEach((date) => {
      if (date <= baseDate) return;
      if (!days.includes(dayKeyFromDate(date))) return;
      const diffWeeks = Math.floor(daysBetween(startOfWeek(baseDate), startOfWeek(date)) / 7);
      if (diffWeeks % interval === 0) addIfVisible(date);
    });
    return preview;
  }

  if (repeatPattern === 'custom' && schedule.customUnit === 'month') {
    const interval = Math.max(Number(schedule.customInterval) || 1, 1);
    const monthDiff = monthsBetween(baseDate, visibleMonth);
    if (monthDiff > 0 && monthDiff % interval === 0) {
      if (selectedDates.length > 1) {
        selectedDateObjects.forEach((source) => {
          const targetDay = Math.min(source.getDate(), monthEnd.getDate());
          addIfVisible(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), targetDay));
        });
      } else {
        const occurrence = monthlyOccurrenceForMonth(visibleMonth, schedule, baseDate);
        if (occurrence && occurrence > baseDate) addIfVisible(occurrence);
      }
    }
    return preview;
  }

  if (repeatPattern === 'custom' && schedule.customUnit === 'year') {
    const interval = Math.max(Number(schedule.customInterval) || 1, 1);
    const yearDiff = visibleMonth.getFullYear() - baseDate.getFullYear();
    if (yearDiff > 0 && yearDiff % interval === 0) {
      selectedDateObjects.forEach((source) => {
        if (source.getMonth() !== visibleMonth.getMonth()) return;
        const targetDay = Math.min(source.getDate(), monthEnd.getDate());
        addIfVisible(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), targetDay));
      });
    }
    return preview;
  }

  const interval = classInterval(repeatPattern, details);
  for (let index = 1; index <= 400; index += 1) {
    const date = addInterval(baseDate, interval, index);
    if (date > monthEnd) break;
    addIfVisible(date);
  }
  return preview;
}

function classInterval(pattern, details) {
  if (pattern === 'daily') return { unit: 'day', amount: 1 };
  if (pattern === 'monthly') return { unit: 'month', amount: 1 };
  if (pattern === 'custom') {
    return {
      unit: details.schedule?.customUnit || 'week',
      amount: Math.max(Number(details.schedule?.customInterval) || 1, 1),
    };
  }
  return { unit: 'week', amount: 1 };
}

function addInterval(date, interval, multiple) {
  const amount = interval.amount * multiple;
  if (interval.unit === 'day') return addDays(date, amount);
  if (interval.unit === 'week') return addDays(date, amount * 7);
  if (interval.unit === 'year') return addMonths(date, amount * 12);
  return addMonths(date, amount);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date, months) {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + months;
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(date.getDate(), lastDay));
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

function dayOfMonth(value) {
  const date = parseIso(value);
  return date ? String(date.getDate()) : '1';
}

function ordinalForDate(value) {
  const date = parseIso(value);
  if (!date) return '1st';
  const day = date.getDate();
  const ordinal = Math.ceil(day / 7);
  const nextWeek = new Date(date.getFullYear(), date.getMonth(), day + 7);
  if (nextWeek.getMonth() !== date.getMonth()) return 'Last';
  return `${ordinal}${ordinal === 1 ? 'st' : ordinal === 2 ? 'nd' : ordinal === 3 ? 'rd' : 'th'}`;
}

function dayKeyFromIso(value) {
  const date = parseIso(value);
  return date ? dayKeyFromDate(date) : 'Mon';
}

function dayKeyFromDate(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function dayLabel(key) {
  return DAYS.find((day) => day.key === key)?.label || key;
}

function ordinalDayLabel(value) {
  const day = Number(value) || 1;
  const suffix = day % 10 === 1 && day % 100 !== 11
    ? 'st'
    : day % 10 === 2 && day % 100 !== 12
      ? 'nd'
      : day % 10 === 3 && day % 100 !== 13
        ? 'rd'
        : 'th';
  return `${day}${suffix}`;
}

function monthlyRuleLabel(schedule, baseDate) {
  return `Monthly ${monthlyTargetLabel(schedule, baseDate)}`;
}

function monthlyTargetLabel(schedule, baseDate) {
  if (schedule.monthlyMode === 'dayOfMonth') return `on day ${schedule.monthlyDayOfMonth || dayOfMonth(baseDate)}`;
  return `on the ${schedule.monthlyOrdinal || ordinalForDate(baseDate)} ${dayLabel(schedule.monthlyWeekday || dayKeyFromIso(baseDate))}`;
}

function monthlyOccurrenceForMonth(monthDate, schedule, baseDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  if (schedule.monthlyMode === 'dayOfMonth') {
    const targetDay = Math.min(Number(schedule.monthlyDayOfMonth) || baseDate.getDate(), new Date(year, month + 1, 0).getDate());
    return new Date(year, month, targetDay);
  }
  const ordinal = schedule.monthlyOrdinal || ordinalForDate(toIso(baseDate));
  const weekday = schedule.monthlyWeekday || dayKeyFromDate(baseDate);
  return nthWeekdayOfMonth(year, month, weekday, ordinal);
}

function nthWeekdayOfMonth(year, month, weekday, ordinal) {
  const targetIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  if (targetIndex < 0) return null;
  if (ordinal === 'Last') {
    const last = new Date(year, month + 1, 0);
    const offset = (last.getDay() - targetIndex + 7) % 7;
    return new Date(year, month, last.getDate() - offset);
  }
  const count = Number(String(ordinal).replace(/\D/g, '')) || 1;
  const first = new Date(year, month, 1);
  const offset = (targetIndex - first.getDay() + 7) % 7;
  const day = 1 + offset + (count - 1) * 7;
  const candidate = new Date(year, month, day);
  return candidate.getMonth() === month ? candidate : null;
}

function eachDayOfMonth(monthDate) {
  const days = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => new Date(monthDate.getFullYear(), monthDate.getMonth(), index + 1));
}

function startOfWeek(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function monthsBetween(a, b) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function calendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: startOffset }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, iso };
  });
  return [...blanks, ...days];
}
