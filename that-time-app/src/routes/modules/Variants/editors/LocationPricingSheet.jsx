import { useState, useEffect } from 'react';
import BottomSheet from '../../../../components/BottomSheet';
import RestrictToSection from '../../../../components/RestrictToSection';
import { businessLocations } from '../../../../data/business';

export default function LocationPricingSheet({ open, locationId, onClose, draft, updateDraft }) {
  const location = businessLocations.find((l) => l.id === locationId);
  const existing = (draft.variants || []).find((v) => v.type === 'location' && v.locationId === locationId);

  const [priceMode, setPriceMode] = useState('adjust');
  const [priceDirection, setPriceDirection] = useState('plus');
  const [priceAmount, setPriceAmount] = useState('');
  const [overrideDuration, setOverrideDuration] = useState(false);
  const [durationDelta, setDurationDelta] = useState('');
  const [staffOn, setStaffOn] = useState(false);
  const [staffIds, setStaffIds] = useState([]);
  const [timeOn, setTimeOn] = useState(false);
  const [days, setDays] = useState([]);
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('17:00');

  useEffect(() => {
    if (!open) return;
    setPriceMode(existing?.priceMode || 'adjust');
    setPriceDirection((existing?.priceDelta ?? 0) >= 0 ? 'plus' : 'minus');
    setPriceAmount(
      existing?.priceMode === 'full'
        ? existing.price || ''
        : existing?.priceDelta != null ? Math.abs(existing.priceDelta) : ''
    );
    setOverrideDuration(existing?.durationOverride != null);
    setDurationDelta(existing?.durationOverride ?? '');
    setStaffOn((existing?.restrictedToStaff || []).length > 0);
    setStaffIds(existing?.restrictedToStaff || []);
    setTimeOn((existing?.restrictedToDays || []).length > 0);
    setDays(existing?.restrictedToDays || []);
    setFrom(existing?.restrictedToTimeFrom || '09:00');
    setTo(existing?.restrictedToTimeTo || '17:00');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locationId]);

  const save = () => {
    if (priceAmount === '' && !overrideDuration) {
      clear();
      return;
    }
    const others = (draft.variants || []).filter((v) => !(v.type === 'location' && v.locationId === locationId));
    const record = {
      id: existing?.id || crypto.randomUUID(),
      type: 'location',
      locationId,
      priceMode,
      ...(priceMode === 'full'
        ? { price: priceAmount }
        : { priceDelta: priceDirection === 'plus' ? Number(priceAmount) : -Number(priceAmount) }),
      ...(overrideDuration ? { durationOverride: Number(durationDelta) } : {}),
      ...(staffOn && staffIds.length > 0 ? { restrictedToStaff: staffIds } : {}),
      ...(timeOn && days.length > 0 ? { restrictedToDays: days, restrictedToTimeFrom: from, restrictedToTimeTo: to } : {}),
    };
    updateDraft({ variants: [...others, record] });
    onClose();
  };

  const clear = () => {
    updateDraft({
      variants: (draft.variants || []).filter((v) => !(v.type === 'location' && v.locationId === locationId)),
    });
    onClose();
  };

  if (!location) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={location.name}
      footer={
        <div className="space-y-2">
          <button
            onClick={save}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Save
          </button>
          {existing && (
            <button
              onClick={clear}
              className="w-full h-10 text-[14px] text-red-500 hover:text-red-600 transition-colors"
            >
              Clear pricing
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="text-[13px] text-gray-500">{location.address}</div>

        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Price</div>
          <div className="grid grid-cols-2 gap-2 mb-2 bg-gray-50 rounded-2xl p-1">
            {[{ k: 'adjust', label: 'Adjustment' }, { k: 'full', label: 'Full price' }].map((m) => (
              <button
                key={m.k}
                onClick={() => setPriceMode(m.k)}
                className={'py-2.5 rounded-xl text-[13px] font-medium transition-colors ' + (priceMode === m.k ? 'bg-white text-gray-900' : 'text-gray-500')}
              >
                {m.label}
              </button>
            ))}
          </div>
          {priceMode === 'adjust' && (
            <div className="flex gap-2 mb-2 bg-gray-50 rounded-2xl p-1">
              {[{ k: 'plus', label: 'Add' }, { k: 'minus', label: 'Discount' }].map((d) => (
                <button
                  key={d.k}
                  onClick={() => setPriceDirection(d.k)}
                  className={'flex-1 py-2 rounded-xl text-[12px] font-medium transition-colors ' + (priceDirection === d.k ? 'bg-white text-gray-900' : 'text-gray-500')}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
            <span className="text-[18px] text-gray-500">£</span>
            <input
              type="number"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              placeholder={priceMode === 'full' ? 'Enter full price' : '0'}
              className="flex-1 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-medium text-gray-700">Duration</div>
            <button
              onClick={() => setOverrideDuration((v) => !v)}
              className={'w-10 rounded-full transition-colors shrink-0 ' + (overrideDuration ? 'bg-gray-900' : 'bg-gray-200')}
              style={{ height: '22px' }}
            >
              <div className={'w-4 h-4 rounded-full bg-white shadow-sm mx-0.5 transition-transform ' + (overrideDuration ? 'translate-x-5' : 'translate-x-0')} />
            </button>
          </div>
          {overrideDuration ? (
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
              <input
                type="number"
                value={durationDelta}
                onChange={(e) => setDurationDelta(e.target.value)}
                placeholder="0"
                className="flex-1 text-[15px] bg-transparent outline-none"
              />
              <span className="text-[13px] text-gray-500">min adjustment (+/-)</span>
            </div>
          ) : (
            <div className="text-[13px] text-gray-500">Same as base duration</div>
          )}
        </div>

        <RestrictToSection
          show={{ staff: true, time: true, locations: false }}
          staffOn={staffOn} onStaffOn={setStaffOn} staffIds={staffIds} onStaffIds={setStaffIds}
          timeOn={timeOn} onTimeOn={setTimeOn} days={days} onDays={setDays} from={from} onFrom={setFrom} to={to} onTo={setTo}
        />
      </div>
    </BottomSheet>
  );
}
