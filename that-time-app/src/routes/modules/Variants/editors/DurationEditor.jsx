import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import ScreenHeader from '../../../../components/ScreenHeader';
import RestrictToSection from '../../../../components/RestrictToSection';

const blankTier = () => ({ id: crypto.randomUUID(), name: '', durationMin: 60, price: '' });

export default function DurationEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { draft, updateDraft } = useOutletContext();
  const isNew = id === 'new';
  const existing = isNew ? null : (draft.variants || []).find((v) => v.id === id);

  const [tiers, setTiers] = useState(
    existing
      ? [{ id: existing.id, name: existing.name || '', durationMin: existing.durationMin || 60, price: existing.price || '' }]
      : [blankTier()]
  );

  // Restriction state
  const [staffOn, setStaffOn] = useState((existing?.restrictedToStaff || []).length > 0);
  const [staffIds, setStaffIds] = useState(existing?.restrictedToStaff || []);
  const [timeOn, setTimeOn] = useState((existing?.restrictedToDays || []).length > 0);
  const [days, setDays] = useState(existing?.restrictedToDays || []);
  const [from, setFrom] = useState(existing?.restrictedToTimeFrom || '09:00');
  const [to, setTo] = useState(existing?.restrictedToTimeTo || '17:00');
  const [locationsOn, setLocationsOn] = useState((existing?.restrictedToLocations || []).length > 0);
  const [locationIds, setLocationIds] = useState(existing?.restrictedToLocations || []);

  const updateTier = (tierId, patch) =>
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, ...patch } : t)));
  const removeTier = (tierId) =>
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  const addTier = () => setTiers((prev) => [...prev, blankTier()]);

  const buildRestrictions = () => ({
    ...(staffOn && staffIds.length > 0 ? { restrictedToStaff: staffIds } : {}),
    ...(timeOn && days.length > 0 ? { restrictedToDays: days, restrictedToTimeFrom: from, restrictedToTimeTo: to } : {}),
    ...(locationsOn && locationIds.length > 0 ? { restrictedToLocations: locationIds } : {}),
  });

  const save = () => {
    const restrictions = buildRestrictions();
    const records = tiers
      .filter((t) => t.name.trim() || t.price !== '')
      .map((t) => ({
        id: t.id || crypto.randomUUID(),
        type: 'duration',
        name: t.name,
        durationMin: t.durationMin,
        price: t.price,
        ...restrictions,
      }));

    if (records.length === 0) return;

    if (isNew) {
      updateDraft({ variants: [...(draft.variants || []), ...records] });
    } else {
      updateDraft({
        variants: (draft.variants || []).map((v) => (v.id === id ? records[0] : v)),
      });
    }
    navigate('/service/variants');
  };

  const remove = () => {
    updateDraft({ variants: (draft.variants || []).filter((v) => v.id !== id) });
    navigate('/service/variants');
  };

  const validTiers = tiers.filter((t) => t.name.trim() && t.price !== '').length;
  const canSave = validTiers > 0;

  return (
    <>
      <ScreenHeader
        title={isNew ? 'New duration variants' : 'Edit duration variant'}
        onBack={() => navigate('/service/variants')}
      />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">

        {/* Tiers */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">
            {isNew ? 'Duration tiers' : 'Duration'}
          </div>
          <div className="space-y-2">
            {tiers.map((tier, i) => (
              <div key={tier.id} className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    placeholder={isNew ? `Tier ${i + 1} name` : 'Variant name'}
                    className="flex-1 bg-white rounded-xl px-3 py-2.5 text-[14px] font-medium outline-none placeholder:text-gray-300"
                  />
                  {tiers.length > 1 && (
                    <button onClick={() => removeTier(tier.id)} className="text-gray-400 hover:text-gray-600 p-1.5 -mr-1">
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] font-medium text-gray-500 mb-1.5">Duration</div>
                    <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-2.5">
                      <input
                        type="number"
                        value={tier.durationMin}
                        onChange={(e) => updateTier(tier.id, { durationMin: Number(e.target.value) || 0 })}
                        placeholder="0"
                        className="flex-1 min-w-0 text-[14px] font-medium bg-transparent outline-none"
                      />
                      <span className="text-[12px] text-gray-500">min</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-500 mb-1.5">Price</div>
                    <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-2.5">
                      <span className="text-[14px] text-gray-500">£</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, { price: e.target.value })}
                        placeholder="0"
                        className="flex-1 min-w-0 text-[14px] font-medium bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isNew && (
              <button
                onClick={addTier}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} strokeWidth={2} />
                Add another tier
              </button>
            )}
          </div>
        </div>

        {/* Restrict to */}
        <RestrictToSection
          show={{ staff: true, time: true, locations: true }}
          staffOn={staffOn} onStaffOn={setStaffOn} staffIds={staffIds} onStaffIds={setStaffIds}
          timeOn={timeOn} onTimeOn={setTimeOn} days={days} onDays={setDays} from={from} onFrom={setFrom} to={to} onTo={setTo}
          locationsOn={locationsOn} onLocationsOn={setLocationsOn} locationIds={locationIds} onLocationIds={setLocationIds}
        />

        {!isNew && (
          <button onClick={remove} className="w-full text-[14px] text-red-500 py-2 hover:text-red-600 transition-colors">
            Delete variant
          </button>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          disabled={!canSave}
          className={'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' + (canSave ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')}
        >
          {isNew && validTiers > 1 ? `Save ${validTiers} variants` : 'Save'}
        </button>
      </div>
    </>
  );
}
