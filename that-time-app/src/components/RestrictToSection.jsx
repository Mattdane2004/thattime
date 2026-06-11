import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { staff as allStaff } from '../data/staff';
import { businessLocations } from '../data/business';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RestrictToSection({
  show = { staff: true, time: true, locations: true },
  staffOn, onStaffOn, staffIds, onStaffIds,
  timeOn, onTimeOn, days, onDays, from, onFrom, to, onTo,
  locationsOn, onLocationsOn, locationIds, onLocationIds,
}) {
  const anyShown = show.staff || show.time || show.locations;
  if (!anyShown) return null;

  return (
    <div>
      <div className="text-[13px] font-medium text-gray-700 mb-2">
        Only available when… <span className="font-normal text-gray-400">(optional)</span>
      </div>
      <div className="space-y-2">
        {show.staff && (
          <ExpandableRow
            label="Specific staff"
            summary={staffOn && staffIds.length > 0 ? `${staffIds.length} staff` : null}
            open={staffOn}
            onToggle={() => onStaffOn(!staffOn)}
          >
            <div className="space-y-1.5 pt-2">
              {allStaff.map((s) => {
                const on = staffIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => onStaffIds(on ? staffIds.filter((id) => id !== s.id) : [...staffIds, s.id])}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-gray-900">{s.name}</div>
                      <div className="text-[12px] text-gray-500">{s.role}</div>
                    </div>
                    <div className={'w-5 h-5 rounded flex items-center justify-center shrink-0 ' + (on ? 'bg-gray-900' : 'bg-gray-200')}>
                      {on && <Check size={12} className="text-white" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </ExpandableRow>
        )}

        {show.time && (
          <ExpandableRow
            label="Specific days or times"
            summary={timeOn && days.length > 0 ? `${days.length === 7 ? 'every day' : days.join(', ')}` : null}
            open={timeOn}
            onToggle={() => onTimeOn(!timeOn)}
          >
            <div className="pt-3 space-y-3">
              <div>
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Days</div>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d) => {
                    const on = days.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => onDays(on ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)))}
                        className={'h-9 px-3 rounded-full text-[12px] font-medium transition-colors ' + (on ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Time range</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={from} onChange={(e) => onFrom(e.target.value)} className="bg-white rounded-xl px-3 py-2.5 text-[14px] outline-none" />
                  <input type="time" value={to} onChange={(e) => onTo(e.target.value)} className="bg-white rounded-xl px-3 py-2.5 text-[14px] outline-none" />
                </div>
              </div>
            </div>
          </ExpandableRow>
        )}

        {show.locations && (
          <ExpandableRow
            label="Specific locations"
            summary={locationsOn && locationIds.length > 0 ? `${locationIds.length} location${locationIds.length === 1 ? '' : 's'}` : null}
            open={locationsOn}
            onToggle={() => onLocationsOn(!locationsOn)}
          >
            <div className="space-y-1.5 pt-2">
              {businessLocations.map((l) => {
                const on = locationIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => onLocationIds(on ? locationIds.filter((id) => id !== l.id) : [...locationIds, l.id])}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-gray-900">{l.name}</div>
                      <div className="text-[12px] text-gray-500 truncate">{l.address}</div>
                    </div>
                    <div className={'w-5 h-5 rounded flex items-center justify-center shrink-0 ' + (on ? 'bg-gray-900' : 'bg-gray-200')}>
                      {on && <Check size={12} className="text-white" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </ExpandableRow>
        )}
      </div>
    </div>
  );
}

function ExpandableRow({ label, summary, open, onToggle, children }) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-gray-900">{label}</div>
          {summary && <div className="text-[12px] text-gray-500 mt-0.5">{summary}</div>}
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" strokeWidth={2} />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" strokeWidth={2} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
