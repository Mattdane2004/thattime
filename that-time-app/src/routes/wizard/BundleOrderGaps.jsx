import { createElement, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Clock, GripVertical, Link2, MoreVertical, Repeat, Scissors } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import ScreenHeader from '../../components/ScreenHeader';
import WizardFooter from '../../components/WizardFooter';
import ProductSelect from '../../components/ProductSelect';
import { demoServices } from '../../data/demoServices';
import { emptyBundleDetails, wizardTotalFor } from '../../data/offerTypes';
import { formatDuration } from '../../components/DurationPicker';
import { offerBasePath } from '../routeBase';

const availableServices = demoServices.filter((item) => item.type === 'service');

const GAP_OPTIONS = [
  { key: 'none', label: 'Back to back', meta: 'No time between services' },
  { key: 'gap', label: 'Add extra time', meta: 'Minutes, hours, days or weeks' },
  { key: 'overlap', label: 'Link with next service', meta: 'Services happen at the same time' },
  { key: 'separate', label: 'Separate visit', meta: 'Booked as another session' },
];

const GAP_UNITS = [
  { key: 'minutes', label: 'Minutes' },
  { key: 'hours', label: 'Hours' },
  { key: 'days', label: 'Days' },
  { key: 'weeks', label: 'Weeks' },
];

export default function BundleOrderGaps() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft } = useOutletContext();
  const details = draft.bundleDetails || emptyBundleDetails();
  const isWizard = location.pathname.startsWith('/new/');
  const isPack = (details.bundleKind || 'services') === 'pack';
  const isPackage = (details.bundleKind || 'services') === 'package';
  const returnPath = isWizard ? '/new/bundle-services' : offerBasePath(draft, location);
  const nextPath = isWizard ? '/new/bundle-pricing' : returnPath;

  useEffect(() => {
    if (isWizard && isPack) {
      navigate('/new/bundle-pricing', { replace: true });
    }
  }, [isWizard, isPack, navigate]);

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Order & gaps</div>
          <div className="text-[14px] text-gray-500 mt-1">
            {isPack
              ? 'Session packs are redeemed one booking at a time.'
              : isPackage
                ? 'Set the default order and timing for selected package services.'
                : 'Drag services into order and add breaks or overlaps between them.'}
          </div>
        </div>
        <div className="pb-6">
          <BundleOrderEditor />
        </div>
      </div>

      {isWizard ? (
        <WizardFooter
          step={3}
          total={wizardTotalFor(draft.type)}
          onBack={() => navigate('/new/bundle-services')}
          onNext={() => navigate(nextPath)}
          nextLabel="Next"
        />
      ) : (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => navigate(nextPath)}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}

export function BundleOrderEditor() {
  const { draft, updateDraft } = useOutletContext();
  const details = useMemo(() => {
    const defaults = emptyBundleDetails();
    const base = { ...defaults, ...(draft.bundleDetails || {}) };
    return {
      ...base,
      includedServiceIds: base.includedServiceIds?.length
        ? base.includedServiceIds
        : (draft.includedServiceIds || []),
    };
  }, [draft.bundleDetails, draft.includedServiceIds]);
  const isPack = (details.bundleKind || 'services') === 'pack';
  const [draggingId, setDraggingId] = useState(null);
  const [actionSheetId, setActionSheetId] = useState(null);

  const included = useMemo(() => (
    (details.includedServiceIds || [])
      .map((id) => availableServices.find((service) => service.id === id))
      .filter(Boolean)
  ), [details.includedServiceIds]);

  const totalDuration = useMemo(() => (
    calculateBundleDuration(included, details.serviceTimings)
  ), [included, details.serviceTimings]);

  const commit = (nextDetails) => {
    const nextIncluded = (nextDetails.includedServiceIds || [])
      .map((id) => availableServices.find((service) => service.id === id))
      .filter(Boolean);
    const nextDuration = calculateBundleDuration(nextIncluded, nextDetails.serviceTimings);
    const packDuration = Number(nextIncluded[0]?.durationMin) || draft.durationMin;
    const isPackNow = (nextDetails.bundleKind || 'services') === 'pack';
    updateDraft({
      durationMin: isPackNow ? packDuration : nextDuration,
      bundleDetails: {
        ...nextDetails,
        durationMode: 'custom',
        customDurationMin: isPackNow ? packDuration : nextDuration,
      },
    });
  };

  const moveService = (id, targetId) => {
    if (!id || !targetId || id === targetId) return;
    const ids = [...(details.includedServiceIds || [])];
    const from = ids.indexOf(id);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [item] = ids.splice(from, 1);
    ids.splice(to, 0, item);
    commit({ ...details, includedServiceIds: ids });
  };

  const moveByOffset = (id, offset) => {
    const ids = [...(details.includedServiceIds || [])];
    const from = ids.indexOf(id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const [item] = ids.splice(from, 1);
    ids.splice(to, 0, item);
    commit({ ...details, includedServiceIds: ids });
  };

  const saveGap = (id, nextTiming) => {
    commit({
      ...details,
      serviceTimings: {
        ...(details.serviceTimings || {}),
        [id]: nextTiming,
      },
    });
  };

  const quantity = Math.max(1, Number(details.quantity) || 1);

  if (isPack) {
    return <PackSummary service={included[0]} quantity={quantity} />;
  }

  if (included.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 px-4 py-6 text-center text-[14px] text-gray-500">
        Add services first to set their order and gaps.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl bg-gray-50 p-4 mb-4">
        <div className="text-[12px] text-gray-500">Estimated bundle timeline</div>
        <div className="text-[22px] font-semibold text-gray-900 mt-1">{formatBundleDuration(totalDuration)}</div>
      </div>

      <div className="space-y-2">
        {included.map((service, index) => (
          <div key={service.id}>
            <ServiceBlock
              service={service}
              timing={index < included.length - 1 ? details.serviceTimings?.[service.id] : null}
              previousTiming={index > 0 ? details.serviceTimings?.[included[index - 1]?.id] : null}
              linkedLabel={linkedGroupLabel(included, details.serviceTimings, index)}
              isLast={index === included.length - 1}
              dragging={draggingId === service.id}
              onDragStart={() => setDraggingId(service.id)}
              onDragEnd={() => setDraggingId(null)}
              onDrop={() => {
                moveService(draggingId, service.id);
                setDraggingId(null);
              }}
              onMenu={() => setActionSheetId(service.id)}
            />
          </div>
        ))}
      </div>

      <ServiceTimingSheet
        key={actionSheetId || 'timing'}
        open={Boolean(actionSheetId)}
        service={included.find((service) => service.id === actionSheetId)}
        nextService={included[included.findIndex((service) => service.id === actionSheetId) + 1]}
        canMoveUp={included.findIndex((service) => service.id === actionSheetId) > 0}
        canMoveDown={included.findIndex((service) => service.id === actionSheetId) >= 0 && included.findIndex((service) => service.id === actionSheetId) < included.length - 1}
        timing={details.serviceTimings?.[actionSheetId]}
        onClose={() => setActionSheetId(null)}
        onMoveUp={() => moveByOffset(actionSheetId, -1)}
        onMoveDown={() => moveByOffset(actionSheetId, 1)}
        onSave={(nextTiming) => {
          saveGap(actionSheetId, nextTiming);
          setActionSheetId(null);
        }}
      />
    </>
  );
}

function PackSummary({ service, quantity }) {
  return (
    <div className="rounded-3xl bg-gray-50 p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
        <Repeat size={18} className="text-gray-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-gray-900 truncate">{service?.name || 'Select a service'}</div>
        <div className="text-[13px] text-gray-500 mt-0.5">
          {quantity} separate booking{quantity === 1 ? '' : 's'}
          {service ? ` · ${formatDuration(service.durationMin)} each` : ''}
        </div>
      </div>
    </div>
  );
}

function ServiceBlock({ service, timing, previousTiming, linkedLabel, isLast, dragging, onDragStart, onDragEnd, onDrop, onMenu }) {
  const mode = gapMode(timing);
  const linkedFromPrevious = gapMode(previousTiming) === 'overlap';
  const linkedToNext = mode === 'overlap';
  const linkedGroupEnd = linkedFromPrevious && !linkedToNext;
  return (
    <div className={'transition-opacity ' + (dragging ? 'opacity-40' : 'opacity-100')}>
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="relative flex gap-4"
      >
        <TimelineRail
          linkedFromPrevious={linkedFromPrevious}
          linkedToNext={linkedToNext}
        />
        <div className="flex-1 min-w-0 rounded-3xl bg-gray-50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 cursor-grab">
            <GripVertical size={17} className="text-gray-400" strokeWidth={1.75} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Scissors size={17} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium text-gray-900 truncate">{service.name}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{formatDuration(service.durationMin)} · {service.price ? `£${service.price}` : 'Free'}</div>
          </div>
          <button
            onClick={onMenu}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shrink-0"
            aria-label={`Edit ${service.name}`}
          >
            <MoreVertical size={17} className="text-gray-500" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {linkedToNext && <LinkedConnector />}
      {linkedGroupEnd && <LinkedGroupEnd label={linkedLabel} />}
      {!linkedToNext && !isLast && <TimingConnector mode={mode} timing={timing} />}
    </div>
  );
}

function TimelineRail({ linkedFromPrevious, linkedToNext }) {
  const linked = linkedFromPrevious || linkedToNext;
  return (
    <div className="w-8 shrink-0 flex flex-col items-center">
      <div className={linkedFromPrevious ? 'w-1.5 h-3 bg-sky-300' : 'h-3'} />
      <div className={
        'w-1.5 h-16 rounded-full ' +
        (linked ? 'bg-sky-300' : 'bg-sky-200')
      } />
      <div className={linkedToNext ? 'w-1.5 h-4 bg-sky-300' : 'h-4'} />
    </div>
  );
}

function TimingConnector({ mode, timing }) {
  if (mode === 'separate') {
    return (
      <div className="flex items-center gap-3 py-5">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="shrink-0 rounded-full bg-white px-3 text-[11px] text-gray-400">
          {separateVisitLabel(timing)}
        </div>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    );
  }

  if (mode === 'gap') {
    return (
      <div className="flex gap-4 py-2">
        <div className="w-8 shrink-0 flex flex-col items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
        <div className="flex-1 flex items-center">
          <span className="text-[12px] text-gray-400">{formatGap(timing)} extra time</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 -mt-1 -mb-1">
      <div className="w-8 shrink-0 flex justify-center">
        <div className="w-1.5 h-4 bg-sky-100 rounded-full" />
      </div>
      <div className="flex-1" />
    </div>
  );
}

function LinkedConnector() {
  return (
    <div className="flex gap-4 -mt-4 -mb-5">
      <div className="w-8 shrink-0 flex justify-center">
        <div className="w-1.5 h-8 bg-sky-300" />
      </div>
      <div className="flex-1" />
    </div>
  );
}

function LinkedGroupEnd({ label }) {
  return (
    <div className="flex gap-4 -mt-3 pb-1">
      <div className="w-8 shrink-0 flex justify-center">
        <div className="w-1.5 h-8 bg-sky-300 rounded-b-full" />
      </div>
      <div className="flex-1 flex items-end pb-0.5">
        <span className="text-[12px] text-gray-400">{label || 'Same time'}</span>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 text-[14px] font-medium text-gray-900 flex items-center justify-center gap-2"
    >
      {createElement(icon, { size: 17, strokeWidth: 1.75 })}
      {label}
    </button>
  );
}

function ServiceTimingSheet({ open, service, nextService, canMoveUp, canMoveDown, timing, onClose, onMoveUp, onMoveDown, onSave }) {
  const initialMode = gapMode(timing);
  const initialDuration = gapDuration(timing) || 15;
  const initialUnit = gapUnit(timing);
  const linkedDefaultDuration = Math.max(Number(service?.durationMin) || 0, Number(nextService?.durationMin) || 0) || 15;
  const storedAmount = Number(timing?.gapValue) > 0 ? Number(timing.gapValue) : null;
  const [mode, setMode] = useState(initialMode);
  const [amount, setAmount] = useState(initialMode === 'overlap' ? (storedAmount || linkedDefaultDuration) : (gapAmount(timing) || initialDuration));
  const [unit, setUnit] = useState(initialUnit);

  const save = () => {
    if (mode === 'none') {
      onSave({ after: 'none' });
      return;
    }
    if (mode === 'separate') {
      onSave({ after: 'separate', gapValue: Math.max(1, Number(amount) || 1), gapUnit: unit === 'minutes' || unit === 'hours' ? 'days' : unit });
      return;
    }
    if (mode === 'overlap') {
      onSave({ after: 'overlap', gapValue: Math.max(1, Number(amount) || linkedDefaultDuration), gapUnit: unit === 'days' || unit === 'weeks' ? 'minutes' : unit });
      return;
    }
    onSave({ after: 'gap', gapValue: Math.max(1, Number(amount) || 1), gapUnit: unit });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={service ? service.name : 'Service options'}
      footer={
        <button
          onClick={save}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            icon={ArrowUp}
            label="Move up"
            disabled={!canMoveUp}
            onClick={onMoveUp}
          />
          <ActionButton
            icon={ArrowDown}
            label="Move down"
            disabled={!canMoveDown}
            onClick={onMoveDown}
          />
        </div>

        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Timing after this service</div>
          <div className="space-y-2">
            {GAP_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setMode(option.key);
                  if (option.key === 'separate' && (unit === 'minutes' || unit === 'hours')) {
                    setUnit('days');
                  }
                  if (option.key === 'overlap') {
                    setUnit('minutes');
                    setAmount(storedAmount || linkedDefaultDuration);
                  }
                }}
                disabled={option.key === 'overlap' && !nextService}
                className={
                  'w-full rounded-2xl px-4 py-3 text-left transition-colors flex items-center gap-3 disabled:opacity-40 ' +
                  (mode === option.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
                }
              >
                <div className={(mode === option.key ? 'bg-white/10' : 'bg-white') + ' w-9 h-9 rounded-xl flex items-center justify-center shrink-0'}>
                  {option.key === 'overlap'
                    ? <Link2 size={16} strokeWidth={1.75} />
                    : <Clock size={16} strokeWidth={1.75} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{option.label}</div>
                  <div className={(mode === option.key ? 'text-white/60' : 'text-gray-500') + ' text-[11px] leading-snug mt-1'}>
                    {option.meta}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {(mode === 'gap' || mode === 'separate' || mode === 'overlap') && (
          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">
              {mode === 'separate' ? 'Time between visits' : mode === 'overlap' ? 'Linked duration' : 'Extra time'}
            </div>
            <div className="h-14 rounded-2xl bg-gray-50 px-4 flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value) || 1)}
                className="flex-1 min-w-0 bg-transparent outline-none text-[18px] font-medium text-gray-900"
              />
              <ProductSelect
                value={mode === 'separate' && (unit === 'minutes' || unit === 'hours') ? 'days' : mode === 'overlap' && (unit === 'days' || unit === 'weeks') ? 'minutes' : unit}
                onChange={setUnit}
                options={(mode === 'separate'
                  ? GAP_UNITS.filter((item) => ['days', 'weeks'].includes(item.key))
                  : mode === 'overlap'
                    ? GAP_UNITS.filter((item) => ['minutes', 'hours'].includes(item.key))
                    : GAP_UNITS
                )}
                compact
                className="w-28"
                buttonClassName="bg-white h-10 min-h-0 px-3 py-0 text-[13px] font-medium"
              />
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function gapMode(timing = {}) {
  timing = timing || {};
  if (timing.after === 'separate') return 'separate';
  if (timing.after === 'overlap') return 'overlap';
  if (timing.after === 'gap') return 'gap';
  if (Number(timing.after) > 0) return 'gap';
  return 'none';
}

function gapDuration(timing = {}) {
  timing = timing || {};
  if (timing.after === 'gap' || timing.after === 'overlap' || timing.after === 'separate') {
    const amount = Math.max(0, Number(timing.gapValue) || 0);
    if (timing.gapUnit === 'weeks') return amount * 7 * 24 * 60;
    if (timing.gapUnit === 'days') return amount * 24 * 60;
    if (timing.gapUnit === 'hours') return amount * 60;
    return amount;
  }
  const value = Number(timing.after);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function gapAmount(timing = {}) {
  timing = timing || {};
  if (timing.after === 'gap' || timing.after === 'overlap' || timing.after === 'separate') return Number(timing.gapValue) || 1;
  const legacyMinutes = Number(timing.after);
  if (Number.isFinite(legacyMinutes) && legacyMinutes > 0) return legacyMinutes;
  return 1;
}

function gapUnit(timing = {}) {
  timing = timing || {};
  if (timing.after === 'separate') return timing.gapUnit || 'days';
  if (timing.after === 'gap' || timing.after === 'overlap') return timing.gapUnit || 'minutes';
  return 'minutes';
}

function separateVisitLabel(timing = {}) {
  timing = timing || {};
  if (Number(timing.gapValue) > 0) return `${formatGap(timing)} between visits`;
  return 'Set time between visits';
}

function calculateBundleDuration(services = [], timings = {}) {
  let total = 0;
  let index = 0;

  while (index < services.length) {
    let groupDuration = Number(services[index]?.durationMin) || 0;

    while (index < services.length - 1 && gapMode(timings?.[services[index]?.id]) === 'overlap') {
      groupDuration = Math.max(groupDuration, gapDuration(timings?.[services[index]?.id]));
      index += 1;
      groupDuration = Math.max(groupDuration, Number(services[index]?.durationMin) || 0);
    }

    total += groupDuration;

    const afterGroupTiming = timings?.[services[index]?.id];
    if (gapMode(afterGroupTiming) === 'gap') {
      total += gapDuration(afterGroupTiming);
    }

    index += 1;
  }

  return total;
}

function linkedGroupLabel(services = [], timings = {}, index) {
  if (index <= 0 || gapMode(timings?.[services[index - 1]?.id]) !== 'overlap') return '';
  if (gapMode(timings?.[services[index]?.id]) === 'overlap') return '';

  let start = index - 1;
  while (start > 0 && gapMode(timings?.[services[start - 1]?.id]) === 'overlap') {
    start -= 1;
  }

  const group = services.slice(start, index + 1);
  let duration = group.reduce((max, service) => Math.max(max, Number(service?.durationMin) || 0), 0);
  for (let cursor = start; cursor < index; cursor += 1) {
    duration = Math.max(duration, gapDuration(timings?.[services[cursor]?.id]));
  }
  return `Same time · ${formatDuration(duration)} total`;
}

function formatGap(timing = {}) {
  timing = timing || {};
  if (timing.after === 'gap' || timing.after === 'overlap' || timing.after === 'separate') {
    const amount = Math.max(1, Number(timing.gapValue) || 1);
    const unit = timing.gapUnit || (timing.after === 'separate' ? 'days' : 'minutes');
    const label = {
      minutes: 'minute',
      hours: 'hour',
      days: 'day',
      weeks: 'week',
    }[unit] || 'minute';
    return `${amount} ${label}${amount === 1 ? '' : 's'}`;
  }
  return formatDuration(gapDuration(timing));
}

function formatBundleDuration(minutes) {
  if (minutes >= 7 * 24 * 60) {
    const weeks = Math.floor(minutes / (7 * 24 * 60));
    const remainderDays = Math.floor((minutes % (7 * 24 * 60)) / (24 * 60));
    return `${weeks}w${remainderDays ? ` ${remainderDays}d` : ''}`;
  }
  if (minutes >= 24 * 60) {
    const days = Math.floor(minutes / (24 * 60));
    const remainderHours = Math.floor((minutes % (24 * 60)) / 60);
    return `${days}d${remainderHours ? ` ${remainderHours}h` : ''}`;
  }
  return formatDuration(minutes);
}
