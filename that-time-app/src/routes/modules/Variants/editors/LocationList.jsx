import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import ScreenHeader from '../../../../components/ScreenHeader';
import LocationPricingSheet from './LocationPricingSheet';
import { businessLocations } from '../../../../data/business';
import { offerTypeMeta } from '../../../../data/offerTypes';

const formatPriceStatus = (override) => {
  if (!override) return { text: 'Same as base', empty: true };
  if (override.priceMode === 'full') return { text: `£${override.price || '—'}`, empty: false };
  const sign = (override.priceDelta ?? 0) >= 0 ? '+' : '−';
  const abs = Math.abs(override.priceDelta || 0);
  return { text: `${sign}£${abs}`, empty: false };
};

export default function LocationList() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openLocationId, setOpenLocationId] = useState(null);
  const meta = offerTypeMeta(draft.type);

  useEffect(() => {
    const lid = searchParams.get('locationId');
    if (lid) {
      setOpenLocationId(lid);
      const next = new URLSearchParams(searchParams);
      next.delete('locationId');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inSalon = draft.locations?.inSalon || { enabled: false, locationIds: [] };
  const assignedLocations = inSalon.enabled
    ? (inSalon.locationIds.length > 0
        ? businessLocations.filter((l) => inSalon.locationIds.includes(l.id))
        : businessLocations)
    : [];

  const overrides = (draft.variants || []).filter((v) => v.type === 'location');
  const overrideFor = (lid) => overrides.find((v) => v.locationId === lid);

  if (assignedLocations.length === 0) {
    return (
      <>
        <ScreenHeader title="Location pricing" onBack={() => navigate('/service/variants')} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MapPin size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No in-salon locations</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
              Enable in-salon locations for this {meta.noun} first, then come back to set per-location pricing.
            </div>
            <button
              onClick={() => navigate('/service/locations')}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Set locations
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Location pricing" onBack={() => navigate('/service/variants')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-4 leading-snug">
          Tap a location to set its pricing for this {meta.noun}.
        </p>
        <div className="space-y-2">
          {assignedLocations.map((l) => {
            const status = formatPriceStatus(overrideFor(l.id));
            return (
              <button
                key={l.id}
                onClick={() => setOpenLocationId(l.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-gray-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900">{l.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5 truncate">{l.address}</div>
                </div>
                <div className={'text-[14px] font-medium shrink-0 ' + (status.empty ? 'text-gray-400' : 'text-gray-900')}>
                  {status.text}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <LocationPricingSheet
        open={!!openLocationId}
        locationId={openLocationId}
        onClose={() => setOpenLocationId(null)}
        draft={draft}
        updateDraft={updateDraft}
      />
    </>
  );
}
