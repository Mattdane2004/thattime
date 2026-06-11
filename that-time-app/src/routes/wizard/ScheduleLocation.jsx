// Class wizard, step 2: WHERE the class runs and WHEN. Merged because the
// two decisions constrain each other (a livestream needs a different schedule
// model than fixed in-person sessions, mobile classes don't have venues).
//
// Group classes use a list of recurring (day, time, duration) rows so an
// instructor can teach Mon 9am 60min + Wed 6pm 75min in one class.
// Private classes use availability windows (any open slot inside).
// Hybrid (in-person + livestream) exposes two capacities.

import { createElement, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X, Store, Video, Car, Info } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import ProductSelect from '../../components/ProductSelect';
import InSalonSheet from '../sheets/InSalonSheet';
import RemoteSheet from '../sheets/RemoteSheet';
import { businessLocations, defaultMobileProfile, remotePlatforms } from '../../data/business';
import { emptyClassDetails, wizardTotalFor } from '../../data/offerTypes';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATIONS = [30, 45, 60, 75, 90, 120];

const newId = () => 'r_' + Math.random().toString(36).slice(2, 9);

export default function ScheduleLocation() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const isPrivate = details.format === 'private';
  const [sheet, setSheet] = useState(null);

  const inSalon = draft.locations.inSalon;
  const remote  = draft.locations.remote;
  const mobile  = draft.locations.mobile;

  const setLocation = (key, patch) =>
    updateDraft({
      locations: {
        ...draft.locations,
        [key]: { ...draft.locations[key], ...patch },
      },
    });

  const updateClass = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const isHybrid = inSalon.enabled && remote.enabled;
  const hasLocation =
    inSalon.enabled || remote.enabled || mobile.enabled;

  const rows = details.scheduleRows || [];
  const windows = details.availabilityWindows || [];

  const canContinue =
    hasLocation &&
    (isPrivate ? windows.length > 0 : rows.length > 0);

  // ── Schedule row mutations (group) ────────────────────────────────────
  const addRow = () =>
    updateClass({
      scheduleRows: [
        ...rows,
        { id: newId(), day: 'Mon', time: '09:00', durationMin: 60 },
      ],
    });
  const updateRow = (id, patch) =>
    updateClass({
      scheduleRows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  const removeRow = (id) =>
    updateClass({ scheduleRows: rows.filter((r) => r.id !== id) });

  // ── Availability window mutations (private) ───────────────────────────
  const addWindow = () =>
    updateClass({
      availabilityWindows: [
        ...windows,
        { id: newId(), day: 'Mon', from: '09:00', to: '17:00' },
      ],
    });
  const updateWindow = (id, patch) =>
    updateClass({
      availabilityWindows: windows.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    });
  const removeWindow = (id) =>
    updateClass({ availabilityWindows: windows.filter((w) => w.id !== id) });

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate('/new/basics')}
        rightAction={<HelpTrigger helpKey="locations" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">
            Where & when
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            {isPrivate
              ? 'Where you deliver this private class and when you’re available.'
              : 'Pick the delivery modes and the recurring sessions.'}
          </div>
        </div>

        {/* ── Locations ─────────────────────────────────────────────── */}
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
          Location
        </div>

        <div className="space-y-3 pb-6">
          {/* In-person at venue */}
          <LocationCard
            Icon={Store}
            label="In-person at venue"
            desc="Studio, gym, or your business address"
            enabled={inSalon.enabled}
            onToggle={(v) =>
              setLocation('inSalon', { enabled: v })
            }
            summary={inSalonSummary(inSalon)}
            onEdit={() => setSheet('inSalon')}
          />

          {/* Livestream */}
          <LocationCard
            Icon={Video}
            label="Livestream / Online"
            desc="Customers join via video link"
            enabled={remote.enabled}
            onToggle={(v) => setLocation('remote', { enabled: v })}
            summary={remoteSummary(remote)}
            onEdit={() => setSheet('remote')}
          />

          {/* Mobile — relevant for Private (PT visits home) or opt-in Group
              (corporate yoga at offices). Travel time + fee inline. */}
          <MobileCard
            mobile={mobile}
            isPrivate={isPrivate}
            onToggle={(v) => setLocation('mobile', { enabled: v })}
            onChange={(patch) => setLocation('mobile', patch)}
          />

          {/* Hybrid notice + per-mode capacity */}
          {isHybrid && !isPrivate && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                <div className="text-[12px] text-gray-700 leading-snug">
                  This is a <span className="font-medium">hybrid session</span> — same time, both
                  in-person and streamed. Set seats per mode.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="In-person seats"
                  type="number"
                  value={details.hybridSeats?.inPerson ?? 12}
                  onChange={(v) =>
                    updateClass({
                      hybridSeats: {
                        ...(details.hybridSeats || {}),
                        inPerson: v,
                      },
                    })
                  }
                  placeholder="12"
                />
                <TextField
                  label="Stream seats"
                  type="number"
                  value={details.hybridSeats?.stream ?? 30}
                  onChange={(v) =>
                    updateClass({
                      hybridSeats: {
                        ...(details.hybridSeats || {}),
                        stream: v,
                      },
                    })
                  }
                  placeholder="30"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Schedule ──────────────────────────────────────────────── */}
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
            {isPrivate ? 'Availability' : 'Schedule'}
          </div>
          <div className="text-[12px] text-gray-400">
            {isPrivate ? 'Bookers grab any open slot' : 'Recurring weekly sessions'}
          </div>
        </div>

        <div className="space-y-3 pb-6">
          {isPrivate ? (
            <>
              {windows.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-5 text-center text-[13px] text-gray-500">
                  Add availability windows when you’re open to bookings.
                </div>
              ) : (
                windows.map((w) => (
                  <WindowRow
                    key={w.id}
                    row={w}
                    onChange={(patch) => updateWindow(w.id, patch)}
                    onRemove={() => removeWindow(w.id)}
                  />
                ))
              )}
              <button
                onClick={addWindow}
                className="w-full h-12 rounded-full border border-dashed border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={1.75} />
                Add availability window
              </button>
            </>
          ) : (
            <>
              {rows.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-5 text-center text-[13px] text-gray-500">
                  Add a recurring slot — pick day, start time, and duration.
                </div>
              ) : (
                rows.map((r) => (
                  <ScheduleRow
                    key={r.id}
                    row={r}
                    onChange={(patch) => updateRow(r.id, patch)}
                    onRemove={() => removeRow(r.id)}
                  />
                ))
              )}
              <button
                onClick={addRow}
                className="w-full h-12 rounded-full border border-dashed border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={1.75} />
                Add recurring slot
              </button>

              {/* End mode — applies to all rows together */}
              {rows.length > 0 && (
                <EndModeRow
                  end={details.scheduleEnd || { mode: 'never', sessions: '', date: '' }}
                  onChange={(patch) =>
                    updateClass({
                      scheduleEnd: { ...(details.scheduleEnd || {}), ...patch },
                    })
                  }
                />
              )}
            </>
          )}
        </div>
      </div>

      <WizardFooter
        step={2}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new/basics')}
        onNext={() => navigate('/new/class-staff')}
        nextDisabled={!canContinue}
      />

      <InSalonSheet open={sheet === 'inSalon'} onClose={() => setSheet(null)} />
      <RemoteSheet  open={sheet === 'remote'}  onClose={() => setSheet(null)} />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function LocationCard({ Icon, label, desc, enabled, onToggle, summary, onEdit }) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
          {createElement(Icon, { size: 18, className: 'text-gray-700', strokeWidth: 1.75 })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">{label}</div>
          <div className="text-[13px] text-gray-500 mt-0.5 truncate">{desc}</div>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div className="border-t border-white px-4 py-3 flex items-center gap-3">
          <div
            className={
              'flex-1 text-[13px] truncate ' +
              (summary ? 'text-gray-700' : 'text-gray-400')
            }
          >
            {summary || 'Not configured'}
          </div>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-full bg-white text-[12px] font-medium text-gray-900 hover:bg-gray-100"
          >
            Edit settings
          </button>
        </div>
      )}
    </div>
  );
}

function MobileCard({ mobile, isPrivate, onToggle, onChange }) {
  // Inline editor — no sheet, since travel time/fee are short.
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
          <Car size={18} className="text-gray-700" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">Mobile (you travel)</div>
          <div className="text-[13px] text-gray-500 mt-0.5 truncate">
            {isPrivate
              ? 'Common for private — visit the customer’s home or workplace'
              : 'Optional — go to corporate or off-site groups'}
          </div>
        </div>
        <Toggle checked={mobile.enabled} onChange={onToggle} />
      </div>
      {mobile.enabled && (
        <div className="border-t border-white px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Radius (miles)"
              type="number"
              value={mobile.radiusMiles ?? defaultMobileProfile.radiusMiles}
              onChange={(v) => onChange({ radiusMiles: v })}
              placeholder="10"
            />
            <TextField
              label="Travel time (min)"
              type="number"
              value={mobile.travelBufferMin ?? defaultMobileProfile.travelBufferMin}
              onChange={(v) => onChange({ travelBufferMin: v })}
              placeholder="30"
            />
          </div>
          <div>
            <div className="text-[12px] font-medium text-gray-500 mb-1.5">Travel fee</div>
            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1 mb-2">
              {[
                { key: 'flat', label: 'Flat fee' },
                { key: 'perMile', label: 'Per mile' },
              ].map(({ key, label }) => {
                const active = (mobile.feeType || 'flat') === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChange({ feeType: key })}
                    className={
                      'h-9 rounded-lg text-[13px] font-medium transition-colors ' +
                      (active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <TextField
              label={mobile.feeType === 'perMile' ? 'Amount per mile (£)' : 'Flat fee amount (£)'}
              type="number"
              value={mobile.feeAmount ?? defaultMobileProfile.feeAmount}
              onChange={(v) => onChange({ feeAmount: v })}
              placeholder="15"
            />
          </div>
          <div className="text-[11px] text-gray-400 leading-snug">
            Defaults inherit from the staff member’s profile. Editing here overrides for this class.
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ row, onChange, onRemove }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <DayChips value={row.day} onChange={(day) => onChange({ day })} />
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0"
        >
          <X size={16} className="text-gray-500" strokeWidth={1.75} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <TextField
          label="Start"
          type="time"
          value={row.time}
          onChange={(v) => onChange({ time: v })}
        />
        <DurationSelect
          value={row.durationMin}
          onChange={(v) => onChange({ durationMin: Number(v) })}
        />
      </div>
    </div>
  );
}

function WindowRow({ row, onChange, onRemove }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <DayChips value={row.day} onChange={(day) => onChange({ day })} />
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0"
        >
          <X size={16} className="text-gray-500" strokeWidth={1.75} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <TextField
          label="From"
          type="time"
          value={row.from}
          onChange={(v) => onChange({ from: v })}
        />
        <TextField
          label="To"
          type="time"
          value={row.to}
          onChange={(v) => onChange({ to: v })}
        />
      </div>
    </div>
  );
}

function DayChips({ value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto flex-1">
      {DAYS.map((d) => {
        const active = value === d;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={
              'h-8 px-2.5 rounded-full text-[12px] font-medium shrink-0 transition-colors ' +
              (active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
            }
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function DurationSelect({ value, onChange }) {
  return (
    <div>
      <ProductSelect
        label="Duration"
        value={String(value)}
        onChange={onChange}
        options={DURATIONS.map((duration) => ({ value: String(duration), label: `${duration} min` }))}
        compact
        buttonClassName="bg-white border border-gray-200 h-11 min-h-0 px-3 py-0 text-[14px]"
      />
    </div>
  );
}

function EndModeRow({ end, onChange }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="text-[13px] font-medium text-gray-700 mb-2">Series ends</div>
      <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-1 mb-3">
        {[
          { key: 'never',    label: 'Never' },
          { key: 'sessions', label: 'After N' },
          { key: 'date',     label: 'On date' },
        ].map(({ key, label }) => {
          const active = end.mode === key;
          return (
            <button
              key={key}
              onClick={() => onChange({ mode: key })}
              className={
                'h-9 rounded-lg text-[13px] font-medium transition-colors ' +
                (active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      {end.mode === 'sessions' && (
        <TextField
          label="Number of sessions"
          type="number"
          value={end.sessions}
          onChange={(v) => onChange({ sessions: v })}
          placeholder="10"
        />
      )}
      {end.mode === 'date' && (
        <TextField
          label="End date"
          type="date"
          value={end.date}
          onChange={(v) => onChange({ date: v })}
        />
      )}
    </div>
  );
}

// ── Summaries (reuse existing demo-data shapes) ───────────────────────

function inSalonSummary(loc) {
  const ids = loc.locationIds || [];
  if (ids.length === 0) return null;
  if (ids.length === businessLocations.length) return 'All locations';
  if (ids.length <= 2) {
    return ids
      .map((id) => businessLocations.find((l) => l.id === id)?.name)
      .filter(Boolean)
      .join(' · ');
  }
  const first = businessLocations.find((l) => l.id === ids[0])?.name || '';
  return `${first} + ${ids.length - 1} more`;
}

function remoteSummary(loc) {
  const p = loc.platforms || [];
  if (p.length === 0) return null;
  if (p.length <= 2) {
    return p
      .map((k) => remotePlatforms.find((x) => x.key === k)?.label)
      .filter(Boolean)
      .join(' · ');
  }
  return `${p.length} platforms`;
}
