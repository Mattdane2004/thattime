import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../../components/ScreenHeader';
import AddAnotherSheet from '../../../../components/AddAnotherSheet';
import RestrictToSection from '../../../../components/RestrictToSection';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const blank = () => ({
  name: '',
  days: [],
  from: '09:00',
  to: '17:00',
  allDay: true,
  priceMode: 'amount',
  priceDirection: 'plus',
  priceAmount: '',
});

export default function TimeEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { draft, updateDraft } = useOutletContext();
  const isNew = id === 'new';
  const existing = isNew ? null : (draft.variants || []).find((v) => v.id === id);

  const [form, setForm] = useState(existing
    ? {
        name: existing.name || '',
        days: existing.days || [],
        from: existing.from || '09:00',
        to: existing.to || '17:00',
        allDay: !existing.from && !existing.to,
        priceMode: existing.priceMode || 'amount',
        priceDirection: (existing.priceDelta ?? 0) >= 0 ? 'plus' : 'minus',
        priceAmount: existing.priceDelta != null ? Math.abs(existing.priceDelta) : '',
      }
    : blank()
  );
  const [showSaved, setShowSaved] = useState(false);

  // Cross-type restrictions
  const [staffOn, setStaffOn] = useState((existing?.restrictedToStaff || []).length > 0);
  const [staffIds, setStaffIds] = useState(existing?.restrictedToStaff || []);
  const [locationsOn, setLocationsOn] = useState((existing?.restrictedToLocations || []).length > 0);
  const [locationIds, setLocationIds] = useState(existing?.restrictedToLocations || []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleDay = (day) => {
    const next = form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day];
    const ordered = DAYS.filter((d) => next.includes(d));
    set({ days: ordered });
  };

  const save = () => {
    const sign = form.priceDirection === 'plus' ? 1 : -1;
    const priceDelta = form.priceAmount === '' ? 0 : sign * Number(form.priceAmount);
    const record = {
      id: existing?.id || crypto.randomUUID(),
      type: 'time',
      name: form.name,
      days: form.days,
      from: form.allDay ? null : form.from,
      to: form.allDay ? null : form.to,
      priceMode: form.priceMode,
      priceDelta,
      ...(staffOn && staffIds.length > 0 ? { restrictedToStaff: staffIds } : {}),
      ...(locationsOn && locationIds.length > 0 ? { restrictedToLocations: locationIds } : {}),
    };
    const list = existing
      ? (draft.variants || []).map((v) => (v.id === id ? record : v))
      : [...(draft.variants || []), record];
    updateDraft({ variants: list });
    if (isNew) {
      setShowSaved(true);
    } else {
      navigate('/service/variants');
    }
  };

  const remove = () => {
    updateDraft({ variants: (draft.variants || []).filter((v) => v.id !== id) });
    navigate('/service/variants');
  };

  const addAnother = () => {
    setForm(blank());
    setShowSaved(false);
  };

  const done = () => {
    setShowSaved(false);
    navigate('/service/variants');
  };

  const canSave = form.name.trim() && form.days.length > 0 && form.priceAmount !== '';

  return (
    <>
      <ScreenHeader title={isNew ? 'New time rule' : 'Edit time rule'} onBack={() => navigate('/service/variants')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">

        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Name</div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Weekend rate"
            className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-[15px] outline-none placeholder:text-gray-300"
          />
        </div>

        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Days</div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = form.days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={'h-10 px-4 rounded-full text-[13px] font-medium transition-colors ' + (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-medium text-gray-700">Time of day</div>
            <button
              onClick={() => set({ allDay: !form.allDay })}
              className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              {form.allDay ? 'Set time range' : 'All day'}
            </button>
          </div>
          {form.allDay ? (
            <div className="bg-gray-50 rounded-2xl px-4 py-3.5 text-[14px] text-gray-500">All day</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] text-gray-500 mb-1.5">From</div>
                <input
                  type="time"
                  value={form.from}
                  onChange={(e) => set({ from: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-3 py-3 text-[15px] outline-none"
                />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 mb-1.5">To</div>
                <input
                  type="time"
                  value={form.to}
                  onChange={(e) => set({ to: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-3 py-3 text-[15px] outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Price adjustment</div>
          <div className="flex gap-2 mb-2 bg-gray-50 rounded-2xl p-1">
            {[{ k: 'plus', label: 'Add' }, { k: 'minus', label: 'Discount' }].map((d) => (
              <button
                key={d.k}
                onClick={() => set({ priceDirection: d.k })}
                className={'flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ' + (form.priceDirection === d.k ? 'bg-white text-gray-900' : 'text-gray-500')}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
            <span className="text-[18px] text-gray-500">{form.priceMode === 'percent' ? '%' : '£'}</span>
            <input
              type="number"
              value={form.priceAmount}
              onChange={(e) => set({ priceAmount: e.target.value })}
              placeholder="0"
              className="flex-1 text-[18px] font-medium bg-transparent outline-none"
            />
            <button
              onClick={() => set({ priceMode: form.priceMode === 'percent' ? 'amount' : 'percent' })}
              className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors px-2 py-1"
            >
              Use {form.priceMode === 'percent' ? '£' : '%'}
            </button>
          </div>
        </div>

        <RestrictToSection
          show={{ staff: true, time: false, locations: true }}
          staffOn={staffOn} onStaffOn={setStaffOn} staffIds={staffIds} onStaffIds={setStaffIds}
          locationsOn={locationsOn} onLocationsOn={setLocationsOn} locationIds={locationIds} onLocationIds={setLocationIds}
        />

        {!isNew && (
          <button onClick={remove} className="w-full text-[14px] text-red-500 py-2 hover:text-red-600 transition-colors">
            Delete time rule
          </button>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          disabled={!canSave}
          className={'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' + (canSave ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')}
        >
          Save
        </button>
      </div>

      <AddAnotherSheet open={showSaved} onAddAnother={addAnother} onDone={done} label="time rule" />
    </>
  );
}
