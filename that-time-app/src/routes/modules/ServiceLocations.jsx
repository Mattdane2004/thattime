import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import LocationCards from '../../components/LocationCards';
import InSalonSheet from '../sheets/InSalonSheet';
import MobileSheet from '../sheets/MobileSheet';
import RemoteSheet from '../sheets/RemoteSheet';
import { offerTypeMeta } from '../../data/offerTypes';

export default function ServiceLocations() {
  const navigate = useNavigate();
  const { draft } = useOutletContext();
  const [sheet, setSheet] = useState(null);
  const meta = offerTypeMeta(draft.type);

  return (
    <>
      <ScreenHeader title="Locations" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Choose where this {meta.noun} is offered.
        </p>
        <LocationCards onEdit={setSheet} />
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>

      <InSalonSheet open={sheet === 'inSalon'} onClose={() => setSheet(null)} />
      <MobileSheet open={sheet === 'mobile'} onClose={() => setSheet(null)} />
      <RemoteSheet open={sheet === 'remote'} onClose={() => setSheet(null)} />
    </>
  );
}
